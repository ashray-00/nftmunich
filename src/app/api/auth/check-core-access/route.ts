import { NextRequest, NextResponse } from "next/server";

const SERVER_URL = process.env.SERVER_URL;
const CORE_ACCESS_COOKIE = "nft_core_access";
const CORE_ACCESS_MAX_AGE = 30 * 60;

export async function POST(request: NextRequest) {
  if (!SERVER_URL) {
    return NextResponse.json({ approved: false }, { status: 500 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ approved: false }, { status: 400 });
  }

  try {
    const res = await fetch(`${SERVER_URL}/api/v1/membership/check-core-access`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      cache: "no-store",
    });
    const data = await res.json().catch(() => ({}));
    const response = NextResponse.json({ approved: res.ok && data.approved === true }, { status: res.status });
    if (res.ok && data.approved && data.core_access_token) {
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
    return NextResponse.json({ approved: false }, { status: 502 });
  }
}
