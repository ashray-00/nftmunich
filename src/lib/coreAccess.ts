import { createHmac, timingSafeEqual } from "crypto";
import { NextRequest } from "next/server";

const COOKIE_NAME = "nft_core_access";
const MAX_AGE_SECONDS = 30 * 60;

function secret() {
  return process.env.GOOGLE_SCRIPT_SHARED_SECRET || "";
}

function signature(payload: string) {
  return createHmac("sha256", secret()).update(payload).digest("base64url");
}

export function createCoreAccessCookie(email: string) {
  if (!secret()) return null;
  const payload = Buffer.from(JSON.stringify({
    email: email.trim().toLowerCase(),
    exp: Math.floor(Date.now() / 1000) + MAX_AGE_SECONDS,
  })).toString("base64url");
  return {
    name: COOKIE_NAME,
    value: `${payload}.${signature(payload)}`,
    options: { httpOnly: true, secure: true, sameSite: "lax" as const, path: "/", maxAge: MAX_AGE_SECONDS },
  };
}

export function verifiedCoreEmail(request: NextRequest) {
  const value = request.cookies.get(COOKIE_NAME)?.value || "";
  const [payload, suppliedSignature] = value.split(".");
  if (!payload || !suppliedSignature || !secret()) return "";
  const expected = signature(payload);
  const suppliedBuffer = Buffer.from(suppliedSignature);
  const expectedBuffer = Buffer.from(expected);
  if (suppliedBuffer.length !== expectedBuffer.length || !timingSafeEqual(suppliedBuffer, expectedBuffer)) return "";
  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    if (!data.email || !data.exp || data.exp <= Math.floor(Date.now() / 1000)) return "";
    return String(data.email).trim().toLowerCase();
  } catch {
    return "";
  }
}
