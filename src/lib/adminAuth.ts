import { NextRequest } from "next/server";

export const OWNER_EMAIL = "evrcolgy@gmail.com";

function decodeEmail(token: string) {
  try {
    const payload = token.split(".")[1];
    if (!payload) return "";
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    return String(JSON.parse(Buffer.from(normalized, "base64").toString("utf8")).email || "").toLowerCase();
  } catch {
    return "";
  }
}

export function ownerAuthorization(request: NextRequest) {
  const authorization = request.headers.get("authorization") || "";
  const token = authorization.replace(/^Bearer\s+/i, "").trim();
  return { authorization, allowed: Boolean(token) && decodeEmail(token) === OWNER_EMAIL };
}

export async function verifyOwnerWithBackend(request: NextRequest) {
  const owner = ownerAuthorization(request);
  if (!owner.allowed) return false;
  const serverUrl = process.env.SERVER_URL;
  if (!serverUrl) return false;
  try {
    const response = await fetch(`${serverUrl}/api/v1/admin/players`, {
      headers: { authorization: owner.authorization },
      cache: "no-store",
    });
    return response.ok;
  } catch {
    return false;
  }
}
