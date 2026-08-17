import { NextRequest, NextResponse } from "next/server";
import { ownerAuthorization } from "../../../../lib/adminAuth";

const SERVER_URL = process.env.SERVER_URL;

function missingConfig() {
  return NextResponse.json({ detail: "Server configuration error." }, { status: 500 });
}

export async function GET(req: NextRequest) {
  if (!SERVER_URL) return missingConfig();
  if (!ownerAuthorization(req).allowed) return NextResponse.json({ detail: "Forbidden." }, { status: 403 });

  const authorization = req.headers.get("authorization") ?? "";
  try {
    const res = await fetch(`${SERVER_URL}/api/v1/admin/club`, {
      headers: { "Content-Type": "application/json", authorization },
      cache: "no-store",
    });
    const data = await res.json().catch(() => ({}));
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
    const res = await fetch(`${SERVER_URL}/api/v1/admin/club`, {
      method: "POST",
      headers: { "Content-Type": "application/json", authorization },
      body: JSON.stringify(body),
      cache: "no-store",
    });
    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ detail: "Failed to contact server." }, { status: 502 });
  }
}
