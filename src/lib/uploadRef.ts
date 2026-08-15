import { createHmac, randomUUID, timingSafeEqual } from "crypto";
import { NextRequest, NextResponse } from "next/server";

const SESSION_COOKIE = "nft_upload_session";

function secret() { return process.env.GOOGLE_SCRIPT_SHARED_SECRET || ""; }
function sign(payload: string) { return createHmac("sha256", secret()).update(payload).digest("base64url"); }

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

export function createUploadRef(url: string, email: string, field: string, session: string) {
  if (!secret() || !session) return "";
  const payload = Buffer.from(JSON.stringify({ url, email, field, session, exp: Math.floor(Date.now() / 1000) + 2 * 60 * 60 })).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

export function verifyUploadRef(ref: string, email: string, field: string, session: string) {
  const [payload, supplied] = ref.split(".");
  if (!payload || !supplied || !secret() || !session) return "";
  const expected = sign(payload);
  const a = Buffer.from(supplied); const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return "";
  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    if (data.exp <= Math.floor(Date.now() / 1000) || data.session !== session || data.email !== email || data.field !== field) return "";
    return typeof data.url === "string" ? data.url : "";
  } catch { return ""; }
}
