import { NextRequest, NextResponse } from "next/server";
import { createCoreAccessCookie } from "../../../../lib/coreAccess";

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
    if (backendRes.ok && typeof data.session_token === "string") {
      try {
        const payload = data.session_token.split(".")[1];
        const decoded = payload ? JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) : null;
        const cookie = decoded?.email ? createCoreAccessCookie(String(decoded.email)) : null;
        if (cookie) response.cookies.set(cookie.name, cookie.value, cookie.options);
      } catch {
        // The backend response remains authoritative; an invalid token simply receives no Core cookie.
      }
    }
    return response;
  } catch {
    return NextResponse.json({ detail: "Failed to contact authentication server." }, { status: 502 });
  }
}
