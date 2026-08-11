import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 60;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const REGISTRATION_TYPES = new Set(["supporter", "player", "management-player"]);

function clean(value: unknown, max: number) {
  return String(value ?? "").replace(/[<>\u0000-\u001F]/g, "").trim().slice(0, max);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (clean(body.website, 100)) return NextResponse.json({ success: true });
    const name = clean(body.name, 150);
    const email = clean(body.email, 254).toLowerCase();
    const registrationType = clean(body.registrationType, 30);
    if (!name || !EMAIL_RE.test(email) || !REGISTRATION_TYPES.has(registrationType)) {
      return NextResponse.json({ message: "Valid name, email and registration type required." }, { status: 400 });
    }

    const scriptUrl = process.env.GOOGLE_SCRIPT_URL;
    if (!scriptUrl) return NextResponse.json({ message: "Email service is not configured." }, { status: 503 });
    const response = await fetch(scriptUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "registrationInterest", name, email, registrationType }),
      cache: "no-store",
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok || result.status !== 200) throw new Error(result.message || "Email service failed.");
    return NextResponse.json({ success: true, result: result.result === "pending" ? "pending" : "link-sent" });
  } catch (error) {
    console.error("Registration interest error:", error);
    return NextResponse.json({ message: "Could not send request." }, { status: 500 });
  }
}
