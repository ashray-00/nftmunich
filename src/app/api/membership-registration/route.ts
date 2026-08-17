import { NextRequest, NextResponse } from "next/server";

const SERVER_URL = process.env.SERVER_URL;

export async function POST(request: NextRequest) {
  if (!SERVER_URL) return NextResponse.json({ message: "Server configuration error." }, { status: 500 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Invalid request body." }, { status: 400 });
  }

  const coreAccessToken = request.cookies.get("nft_core_access")?.value ?? "";
  const uploadSession = request.cookies.get("nft_upload_session")?.value ?? "";
  const forwardedFor = request.headers.get("x-forwarded-for") ?? request.headers.get("x-vercel-forwarded-for") ?? "";

  try {
    const response = await fetch(`${SERVER_URL}/api/v1/membership/membership-registration`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-core-access-token": coreAccessToken,
        "x-upload-session": uploadSession,
        "x-forwarded-for": forwardedFor,
      },
      body: JSON.stringify(body),
      cache: "no-store",
    });
    const data = await response.json().catch(() => ({}));
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Membership registration proxy error:", error);
    return NextResponse.json({ message: "Could not save the application." }, { status: 502 });
  }
}
