import { createHmac } from "crypto";
import { NextRequest } from "next/server";

export function abuseKey(request: NextRequest) {
  const secret = process.env.GOOGLE_SCRIPT_SHARED_SECRET || "nft-public-form";
  const forwarded = (request.headers.get("x-vercel-forwarded-for") || request.headers.get("x-forwarded-for") || "unknown")
    .split(",")[0].trim();
  return createHmac("sha256", secret).update(forwarded).digest("hex").slice(0, 24);
}
