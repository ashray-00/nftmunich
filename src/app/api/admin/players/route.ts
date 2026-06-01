import { NextRequest, NextResponse } from "next/server";

const SERVER_URL = process.env.SERVER_URL;

function missingConfig() {
  return NextResponse.json({ detail: "Server configuration error." }, { status: 500 });
}

export async function GET(req: NextRequest) {
  if (!SERVER_URL) return missingConfig();

  const authorization = req.headers.get("authorization") ?? "";
  try {
    const res = await fetch(`${SERVER_URL}/api/v1/admin/players`, {
      headers: { "Content-Type": "application/json", authorization },
    });
    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ detail: "Failed to contact server." }, { status: 502 });
  }
}

export async function POST(req: NextRequest) {
  if (!SERVER_URL) return missingConfig();

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
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ detail: "Failed to contact server." }, { status: 502 });
  }
}
