import { NextRequest, NextResponse } from "next/server";
import { ownerAuthorization } from "../../../../lib/adminAuth";

const SERVER_URL = process.env.SERVER_URL;

async function syncApprovedPlayers(players: unknown[]) {
  const scriptUrl = process.env.GOOGLE_SCRIPT_URL;
  if (!scriptUrl) return;
  await fetch(scriptUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      action: "syncApprovedPlayers",
      sharedSecret: process.env.GOOGLE_SCRIPT_SHARED_SECRET,
      spreadsheetId: process.env.GOOGLE_MEMBERSHIP_SHEET_ID,
      players,
    }),
    cache: "no-store",
  });
}

function missingConfig() {
  return NextResponse.json({ detail: "Server configuration error." }, { status: 500 });
}

export async function GET(req: NextRequest) {
  if (!SERVER_URL) return missingConfig();
  if (!ownerAuthorization(req).allowed) return NextResponse.json({ detail: "Forbidden." }, { status: 403 });

  const authorization = req.headers.get("authorization") ?? "";
  try {
    const res = await fetch(`${SERVER_URL}/api/v1/admin/players`, {
      headers: { "Content-Type": "application/json", authorization },
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok && Array.isArray(data.players)) {
      await syncApprovedPlayers(data.players).catch(() => undefined);
    }
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ detail: "Failed to contact server." }, { status: 502 });
  }
}

export async function POST(req: NextRequest) {
  if (!SERVER_URL) return missingConfig();
  if (!ownerAuthorization(req).allowed) return NextResponse.json({ detail: "Forbidden." }, { status: 403 });

  const authorization = req.headers.get("authorization") ?? "";
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ detail: "Invalid request body." }, { status: 400 });
  }

  try {
    const res = await fetch(`${SERVER_URL}/api/v1/admin/players`, {
      method: "POST",
      headers: { "Content-Type": "application/json", authorization },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok) {
      const submitted = body && typeof body === "object" ? body as Record<string, unknown> : {};
      await syncApprovedPlayers([{ name: submitted.name, email: submitted.email }]).catch(() => undefined);
    }
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ detail: "Failed to contact server." }, { status: 502 });
  }
}
