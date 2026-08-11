import { NextRequest, NextResponse } from "next/server";
import { verifyOwnerWithBackend } from "../../../../lib/adminAuth";

export const maxDuration = 60;

async function callScript(payload: Record<string, unknown>) {
  const scriptUrl = process.env.GOOGLE_SCRIPT_URL;
  if (!scriptUrl) throw new Error("Club storage is not configured.");
  const response = await fetch(scriptUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      spreadsheetId: process.env.GOOGLE_MEMBERSHIP_SHEET_ID,
      sharedSecret: process.env.GOOGLE_SCRIPT_SHARED_SECRET,
      ...payload,
    }),
    cache: "no-store",
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok || result.status !== 200) throw new Error(result.message || "Club storage rejected the request.");
  return result;
}

export async function GET(request: NextRequest) {
  if (!(await verifyOwnerWithBackend(request))) return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  try {
    return NextResponse.json(await callScript({ action: "adminDashboard" }));
  } catch (error) {
    return NextResponse.json({ message: error instanceof Error ? error.message : "Could not load dashboard." }, { status: 502 });
  }
}

export async function POST(request: NextRequest) {
  if (!(await verifyOwnerWithBackend(request))) return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  try {
    const settings = await request.json();
    return NextResponse.json(await callScript({ action: "updateClubSettings", settings }));
  } catch (error) {
    return NextResponse.json({ message: error instanceof Error ? error.message : "Could not save settings." }, { status: 502 });
  }
}
