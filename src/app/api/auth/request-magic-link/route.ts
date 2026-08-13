import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const SERVER_URL = process.env.SERVER_URL;
  if (!SERVER_URL) {
    return NextResponse.json({ message: "Server configuration error." }, { status: 500 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ message: "Invalid request body." }, { status: 400 });
  }

  if (
    !body ||
    typeof body !== "object" ||
    !("email" in body) ||
    typeof (body as Record<string, unknown>).email !== "string"
  ) {
    return NextResponse.json({ message: "Email is required." }, { status: 400 });
  }

  try {
    const submitted = body as { email: string; purpose?: string };
    if (submitted.purpose === "core-member") {
      const scriptUrl = process.env.GOOGLE_SCRIPT_URL;
      if (!scriptUrl) {
        return NextResponse.json({ message: "Registration service configuration error." }, { status: 500 });
      }
      const approvalRes = await fetch(scriptUrl, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify({ action: "checkApprovedPlayerEmail", email: submitted.email }),
        cache: "no-store",
      });
      const approval = await approvalRes.json().catch(() => ({}));
      if (!approvalRes.ok || approval.status !== 200 || approval.approved !== true) {
        return NextResponse.json({ message: "Email is not registered." }, { status: 403 });
      }
    }
    const backendRes = await fetch(`${SERVER_URL}/api/v1/auth/request-magic-link`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: (body as { email: string }).email }),
    });
    const data = await backendRes.json().catch(() => ({}));
    return NextResponse.json(data, { status: backendRes.status });
  } catch {
    return NextResponse.json({ message: "Failed to contact authentication server." }, { status: 502 });
  }
}
