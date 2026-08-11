import { NextRequest, NextResponse } from "next/server";

const REGISTRATION_TYPES = new Set(["member", "player", "management"]);
const FEE_CATEGORIES = new Set(["student", "other", "hardship"]);
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function clean(value: unknown, maxLength = 500) {
  return String(value ?? "")
    .replace(/[<>\u0000-\u001F]/g, "")
    .trim()
    .slice(0, maxLength);
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const registrationType = clean(body.registrationType, 20);
    const feeCategory = clean(body.feeCategory, 20);
    const email = clean(body.email, 254).toLowerCase();

    if (!REGISTRATION_TYPES.has(registrationType) || !FEE_CATEGORIES.has(feeCategory)) {
      return NextResponse.json({ message: "Invalid registration category." }, { status: 400 });
    }
    if (!clean(body.firstName, 100) || !clean(body.lastName, 100) || !EMAIL_RE.test(email)) {
      return NextResponse.json({ message: "Name and a valid email address are required." }, { status: 400 });
    }
    if (body.truth !== "accepted" || body.statutes !== "accepted" || body.privacy !== "accepted") {
      return NextResponse.json({ message: "All declarations must be accepted." }, { status: 400 });
    }

    const membershipFee = feeCategory === "hardship" ? "" : 10;
    const playerFee = registrationType === "member" || feeCategory === "hardship"
      ? ""
      : feeCategory === "student" ? 55 : 100;

    const registration = {
      registrationType,
      language: clean(body.language, 2),
      firstName: clean(body.firstName, 100),
      lastName: clean(body.lastName, 100),
      birthDate: clean(body.birthDate, 20),
      street: clean(body.street, 200),
      postalCode: clean(body.postalCode, 20),
      city: clean(body.city, 100),
      email,
      phone: clean(body.phone, 50),
      feeCategory,
      membershipFee,
      playerFee,
      position: clean(body.position, 100),
      emergencyName: clean(body.emergencyName, 150),
      emergencyPhone: clean(body.emergencyPhone, 50),
      managementRole: clean(body.managementRole, 150),
      responsibility: clean(body.responsibility, 1000),
      photo: clean(body.photo, 1000),
      id: clean(body.id, 1000),
      insurance: clean(body.insurance, 1000),
      truth: "accepted",
      statutes: "accepted",
      privacy: "accepted",
    };

    if (!registration.photo || !registration.id || (registrationType !== "member" && !registration.insurance)) {
      return NextResponse.json({ message: "Required documents have not been uploaded." }, { status: 400 });
    }

    const scriptUrl = process.env.GOOGLE_SCRIPT_URL;
    if (!scriptUrl) {
      return NextResponse.json({ message: "Registration storage is not configured." }, { status: 503 });
    }

    const response = await fetch(scriptUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "membershipRegistration",
        spreadsheetId: process.env.GOOGLE_MEMBERSHIP_SHEET_ID || "1VpURRDCv_PRP82A8mOsvFwt7dXd94mPcT1oFTv5ibOs",
        registration,
      }),
      cache: "no-store",
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok || result.status !== 200) {
      throw new Error(result.message || "Registration storage rejected the request.");
    }

    return NextResponse.json({ success: true, applicationId: result.applicationId });
  } catch (error) {
    console.error("Membership registration error:", error);
    return NextResponse.json({ message: "Could not save the application." }, { status: 500 });
  }
}
