import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";

const SESSION_COOKIE = "nft_upload_session";

export function uploadSession(request: NextRequest) {
  return request.cookies.get(SESSION_COOKIE)?.value || "";
}

export function ensureUploadSession(request: NextRequest, response: NextResponse) {
  const existing = uploadSession(request);
  if (existing) return existing;
  const session = randomUUID();
  response.cookies.set(SESSION_COOKIE, session, { httpOnly: true, secure: true, sameSite: "lax", path: "/", maxAge: 2 * 60 * 60 });
  return session;
}
