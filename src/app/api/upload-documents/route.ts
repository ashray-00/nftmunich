/**
 * POST /api/upload-documents
 *
 * Thin multipart pass-through to nft-munich-server, which handles validation,
 * Apps Script/Drive upload, and mints the signed file reference. This route
 * never sees the Apps Script URL or secret.
 */

import { NextRequest, NextResponse } from "next/server";
import { ensureUploadSession } from "../../../lib/uploadSession";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const SERVER_URL = process.env.SERVER_URL;
  if (!SERVER_URL) {
    return NextResponse.json({ message: "Server configuration error." }, { status: 500 });
  }

  let incoming: FormData;
  try {
    incoming = await req.formData();
  } catch {
    return NextResponse.json({ message: "Invalid upload." }, { status: 400 });
  }

  const file = incoming.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ message: "No file provided." }, { status: 400 });
  }

  const coreAccessToken = req.cookies.get("nft_core_access")?.value ?? "";

  const placeholder = NextResponse.json({ ready: true });
  const session = ensureUploadSession(req, placeholder);

  const outgoing = new FormData();
  outgoing.set("file", file);
  outgoing.set("fieldType", String(incoming.get("fieldType") ?? ""));
  outgoing.set("fullName", String(incoming.get("fullName") ?? ""));
  outgoing.set("email", String(incoming.get("email") ?? ""));
  outgoing.set("registrationType", String(incoming.get("registrationType") ?? "member"));

  try {
    const scriptRes = await fetch(`${SERVER_URL}/api/v1/membership/upload-document`, {
      method: "POST",
      headers: {
        "x-core-access-token": coreAccessToken,
        "x-upload-session": session,
      },
      body: outgoing,
    });
    const data = await scriptRes.json().catch(() => ({}));
    const response = NextResponse.json(data, { status: scriptRes.status });
    for (const cookie of placeholder.cookies.getAll()) {
      response.cookies.set(cookie);
    }
    return response;
  } catch (err) {
    console.error("Document upload proxy error:", err);
    return NextResponse.json(
      { message: "The document could not be saved. Please select it again. If the problem continues, contact NFT Munich." },
      { status: 502 }
    );
  }
}
