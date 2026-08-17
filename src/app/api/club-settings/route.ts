import { NextResponse } from "next/server";

const SERVER_URL = process.env.SERVER_URL;

export async function GET() {
  if (!SERVER_URL) return NextResponse.json({ message: "Server configuration error." }, { status: 500 });
  try {
    const res = await fetch(`${SERVER_URL}/api/v1/membership/public-club-settings`, { cache: "no-store" });
    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ message: "Could not load club settings." }, { status: 502 });
  }
}
