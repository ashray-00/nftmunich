import { NextRequest, NextResponse } from "next/server";

const CORE_ACCESS_COOKIE = "nft_core_access";
const CORE_ACCESS_MAX_AGE = 30 * 60;

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
    const response = NextResponse.json(data, { status: backendRes.status });
    if (backendRes.ok && typeof data.core_access_token === "string") {
      response.cookies.set(CORE_ACCESS_COOKIE, data.core_access_token, {
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        path: "/",
        maxAge: CORE_ACCESS_MAX_AGE,
      });
    }
    return response;
  } catch {
    return NextResponse.json({ detail: "Failed to contact authentication server." }, { status: 502 });
  }
}
