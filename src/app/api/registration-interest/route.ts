import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 30;

const SERVER_URL = process.env.SERVER_URL;

export async function POST(request: NextRequest) {
  if (!SERVER_URL) {
    return NextResponse.json({ message: "Server configuration error." }, { status: 500 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Invalid request body." }, { status: 400 });
  }

  const forwardedFor = request.headers.get("x-forwarded-for") ?? request.headers.get("x-vercel-forwarded-for") ?? "";

  try {
    const res = await fetch(`${SERVER_URL}/api/v1/membership/registration-interest`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-forwarded-for": forwardedFor },
      body: JSON.stringify(body),
      cache: "no-store",
    });
    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error("Registration interest proxy error:", error);
    return NextResponse.json({ message: "Could not send request." }, { status: 502 });
  }
}
