import { NextResponse } from "next/server";

export async function GET() {
  const scriptUrl = process.env.GOOGLE_SCRIPT_URL;
  if (!scriptUrl) return NextResponse.json({ message: "Club settings are not configured." }, { status: 503 });
  try {
    const response = await fetch(scriptUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "publicClubSettings",
        spreadsheetId: process.env.GOOGLE_MEMBERSHIP_SHEET_ID,
      }),
      cache: "no-store",
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok || result.status !== 200) throw new Error("Settings unavailable.");
    return NextResponse.json({ settings: result.settings });
  } catch {
    return NextResponse.json({ message: "Could not load club settings." }, { status: 502 });
  }
}
