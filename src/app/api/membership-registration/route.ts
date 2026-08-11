import { NextRequest, NextResponse } from "next/server";

const allowedTypes = new Set(["member", "player", "management"]);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body || !allowedTypes.has(body.registrationType) || !body.email || !body.firstName || !body.lastName) {
      return NextResponse.json({ message: "Missing or invalid registration details." }, { status: 400 });
    }

    const scriptUrl = process.env.GOOGLE_SCRIPT_URL;
    if (!scriptUrl) return NextResponse.json({ message: "Registration service is not configured." }, { status: 503 });

    const response = await fetch(scriptUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "membershipRegistration", registration: body }),
      cache: "no-store",
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok || (result.status && result.status >= 400)) {
      return NextResponse.json({ message: result.message || "Registration service rejected the request." }, { status: 502 });
    }
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ message: "Could not process registration." }, { status: 500 });
  }
}
