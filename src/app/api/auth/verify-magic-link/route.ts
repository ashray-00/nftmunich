import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const SERVER_URL = process.env.SERVER_URL;
  if (!SERVER_URL) {
    return NextResponse.json({ detail: "Server configuration error." }, { status: 500 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ detail: "Invalid request body." }, { status: 400 });
  }

  if (
    !body ||
    typeof body !== "object" ||
    !("token" in body) ||
    typeof (body as Record<string, unknown>).token !== "string" ||
    !(body as { token: string }).token.trim()
  ) {
    return NextResponse.json({ detail: "Token is required." }, { status: 400 });
  }

  try {
    const backendRes = await fetch(`${SERVER_URL}/api/v1/auth/verify-magic-link`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: (body as { token: string }).token.trim() }),
    });
    const data = await backendRes.json().catch(() => ({}));
    return NextResponse.json(data, { status: backendRes.status });
  } catch {
    return NextResponse.json({ detail: "Failed to contact authentication server." }, { status: 502 });
  }
}
