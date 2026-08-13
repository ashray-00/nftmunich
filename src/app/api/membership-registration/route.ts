import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 60;

const REGISTRATION_TYPES = new Set(["member", "player", "management"]);
const PLAYER_FEE_CATEGORIES = new Set(["student", "other", "hardship"]);
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

    const validFeeCategory = registrationType === "member"
      ? feeCategory === "standard"
      : PLAYER_FEE_CATEGORIES.has(feeCategory);
    if (!REGISTRATION_TYPES.has(registrationType) || !validFeeCategory) {
      return NextResponse.json({ message: "Invalid registration category." }, { status: 400 });
    }
    const requiredPersonalFields = ["firstName", "lastName", "birthDate", "street", "postalCode", "city", "phone"];
    if (requiredPersonalFields.some((field) => !clean(body[field], 200)) || !EMAIL_RE.test(email)) {
      return NextResponse.json({ message: "All personal details and a valid email address are required." }, { status: 400 });
    }
    if (registrationType !== "member" && ["position", "emergencyName", "emergencyPhone"].some((field) => !clean(body[field], 200))) {
      return NextResponse.json({ message: "All player details are required." }, { status: 400 });
    }
    if (registrationType === "management" && ["managementRole", "responsibility"].some((field) => !clean(body[field], 1000))) {
      return NextResponse.json({ message: "All management details are required." }, { status: 400 });
    }
    if (body.truth !== "accepted" || body.statutes !== "accepted" || body.privacy !== "accepted") {
      return NextResponse.json({ message: "All declarations must be accepted." }, { status: 400 });
    }

    const scriptUrl = process.env.GOOGLE_SCRIPT_URL;
    if (!scriptUrl) {
      return NextResponse.json({ message: "Registration storage is not configured." }, { status: 503 });
    }
    const spreadsheetId = process.env.GOOGLE_MEMBERSHIP_SHEET_ID || "1VpURRDCv_PRP82A8mOsvFwt7dXd94mPcT1oFTv5ibOs";
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
      position: clean(body.position, 100),
      emergencyName: clean(body.emergencyName, 150),
      emergencyPhone: clean(body.emergencyPhone, 50),
      managementRole: clean(body.managementRole, 150),
      responsibility: clean(body.responsibility, 1000),
      photo: clean(body.photo, 1000),
      idFront: clean(body.idFront, 1000),
      idBack: clean(body.idBack, 1000),
      insuranceFront: clean(body.insuranceFront, 1000),
      insuranceBack: clean(body.insuranceBack, 1000),
      truth: "accepted",
      statutes: "accepted",
      privacy: "accepted",
    };

    if (!registration.photo || !registration.idFront || !registration.idBack ||
      (registrationType !== "member" && (!registration.insuranceFront || !registration.insuranceBack))) {
      return NextResponse.json({ message: "Required documents have not been uploaded." }, { status: 400 });
    }

    const response = await fetch(scriptUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "membershipRegistration",
        sharedSecret: process.env.GOOGLE_SCRIPT_SHARED_SECRET,
        spreadsheetId,
        registration,
      }),
      cache: "no-store",
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok || result.status !== 200) {
      throw new Error(result.message || "Registration storage rejected the request.");
    }

    return NextResponse.json({ success: true, applicationId: result.applicationId, totalFee: result.totalFee, emailSent: result.emailSent !== false });
  } catch (error) {
    console.error("Membership registration error:", error);
    return NextResponse.json({ message: "Could not save the application." }, { status: 500 });
  }
}
