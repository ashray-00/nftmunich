import { NextRequest, NextResponse } from "next/server";
import { verifiedCoreEmail } from "../../../../lib/coreAccess";

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ approved: false }, { status: 400 });
  }

  const email = body && typeof body === "object" && "email" in body
    ? String((body as { email: unknown }).email || "").trim().toLowerCase()
    : "";
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ approved: false }, { status: 400 });
  }
  if (verifiedCoreEmail(request) !== email) {
    return NextResponse.json({ approved: false }, { status: 403 });
  }

  const scriptUrl = process.env.GOOGLE_SCRIPT_URL;
  if (!scriptUrl) return NextResponse.json({ approved: false }, { status: 500 });

  try {
    const response = await fetch(scriptUrl, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({
        action: "checkApprovedPlayerEmail",
        email,
        sharedSecret: process.env.GOOGLE_SCRIPT_SHARED_SECRET,
        spreadsheetId: process.env.GOOGLE_MEMBERSHIP_SHEET_ID,
      }),
      cache: "no-store",
    });
    const result = await response.json().catch(() => ({}));
    const approved = response.ok && result.status === 200 && result.approved === true;
    return NextResponse.json({ approved }, { status: approved ? 200 : 403 });
  } catch {
    return NextResponse.json({ approved: false }, { status: 502 });
  }
}
