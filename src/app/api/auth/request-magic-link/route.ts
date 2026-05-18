import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const SERVER_URL = process.env.SERVER_URL;
  if (!SERVER_URL) {
    return NextResponse.json({ message: "Server configuration error." }, { status: 500 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ message: "Invalid request body." }, { status: 400 });
  }

  if (
    !body ||
    typeof body !== "object" ||
    !("email" in body) ||
    typeof (body as Record<string, unknown>).email !== "string"
  ) {
    return NextResponse.json({ message: "Email is required." }, { status: 400 });
  }

  try {
    const backendRes = await fetch(`${SERVER_URL}/api/v1/auth/request-magic-link`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: (body as { email: string }).email }),
    });
    const data = await backendRes.json().catch(() => ({}));
    return NextResponse.json(data, { status: backendRes.status });
  } catch {
    return NextResponse.json({ message: "Failed to contact authentication server." }, { status: 502 });
  }
}
