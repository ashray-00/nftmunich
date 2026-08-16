/**
 * POST /api/upload-documents
 *
 * Receives a single document file (PDF, JPG, or PNG), validates it,
 * base64-encodes it, and forwards it to the Google Apps Script web app
 * which saves the file to Google Drive and returns a shareable URL.
 *
 * FormData fields expected:
 *   file       – the File object
 *   fieldType  – "insurance" | "id" (used for Drive filename)
 *   fileIndex  – "0" for single file, "1"/"2" for two-file uploads
 *   fullName   – player's full name (used for Drive filename)
 */

import { NextRequest, NextResponse } from "next/server";
import { createHash } from "crypto";
import { verifiedCoreEmail } from "../../../lib/coreAccess";
import { abuseKey } from "../../../lib/abuseKey";
import { createUploadRef, ensureUploadSession } from "../../../lib/uploadRef";

export const maxDuration = 60;

const ACCEPTED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "application/pdf",
];

const MAX_FILE_SIZE = 12 * 1024 * 1024; // 12 MB
const ALLOWED_FIELD_TYPES = new Set(["photo", "idFront", "idBack", "insuranceFront", "insuranceBack"]);
const ALLOWED_REGISTRATION_TYPES = new Set(["member", "player"]);

function sanitizeFullName(name: string): string {
  return name
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/[^a-z0-9_]/g, "")
    .slice(0, 50);
}

function getExtension(mimeType: string): string {
  switch (mimeType) {
    case "application/pdf":
      return "pdf";
    case "image/jpeg":
      return "jpg";
    case "image/png":
      return "png";
    default:
      return "bin";
  }
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    const file = formData.get("file") as File | null;
    // Keep the exact camelCase field name. The strict allowlist below provides
    // validation; stripping capitals would turn `idFront` into `idront`.
    const fieldType = String(formData.get("fieldType") ?? "").slice(0, 20);
    const fullName = String(formData.get("fullName") ?? "").slice(0, 150);
    const email = String(formData.get("email") ?? "").trim().toLowerCase().slice(0, 254);
    const registrationType = String(formData.get("registrationType") ?? "member").slice(0, 20);

    if (registrationType === "player" && verifiedCoreEmail(req) !== email) {
      return NextResponse.json({ message: "Core Member authentication required." }, { status: 403 });
    }

    if (!ALLOWED_FIELD_TYPES.has(fieldType) || !ALLOWED_REGISTRATION_TYPES.has(registrationType)) {
      return NextResponse.json({ message: "Invalid upload category." }, { status: 400 });
    }

    if (!fullName.trim() || !/^\S+@\S+\.\S+$/.test(email)) {
      return NextResponse.json({ message: "Complete your name and enter a valid email before uploading." }, { status: 400 });
    }

    if (!file || file.size === 0) {
      return NextResponse.json({ message: "No file provided." }, { status: 400 });
    }

    if (!ACCEPTED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        { message: "Invalid file type. Only JPG, JPEG, PNG and PDF are accepted." },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { message: "File exceeds the 12 MB size limit." },
        { status: 400 }
      );
    }

    const sanitizedName = sanitizeFullName(fullName) || "player";
    const ext = getExtension(file.type);
    const arrayBuffer = await file.arrayBuffer();
    const fileBuffer = Buffer.from(arrayBuffer);
    const isJpeg = fileBuffer.length >= 3 && fileBuffer[0] === 0xff && fileBuffer[1] === 0xd8 && fileBuffer[2] === 0xff;
    const isPng = fileBuffer.length >= 8 && fileBuffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
    const isPdf = fileBuffer.length >= 5 && fileBuffer.subarray(0, 5).toString("ascii") === "%PDF-";
    if ((file.type === "image/jpeg" && !isJpeg) || (file.type === "image/png" && !isPng) || (file.type === "application/pdf" && !isPdf)) {
      return NextResponse.json({ message: "The uploaded file content does not match its declared type." }, { status: 400 });
    }
    const base64 = fileBuffer.toString("base64");
    const contentHash = createHash("sha256").update(fileBuffer).digest("hex").slice(0, 16);
    const durableFilename = `${sanitizedName}_${fieldType}_${contentHash}.${ext}`;

    const scriptUrl = process.env.GOOGLE_SCRIPT_URL;
    if (!scriptUrl) {
      console.error("Missing GOOGLE_SCRIPT_URL env var.");
      return NextResponse.json(
        { message: "Server configuration error. Please contact the administrator." },
        { status: 500 }
      );
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 50000);
    const scriptRes = await fetch(scriptUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({
        action: "uploadFile",
        sharedSecret: process.env.GOOGLE_SCRIPT_SHARED_SECRET,
        filename: durableFilename,
        base64,
        mimeType: file.type,
        fullName,
        email,
        registrationType,
        abuseKey: abuseKey(req),
      }),
    }).finally(() => clearTimeout(timeout));

    if (!scriptRes.ok) {
      throw new Error(`Apps Script responded with status ${scriptRes.status}`);
    }

    const scriptJson = await scriptRes.json().catch(() => ({}));

    // Apps Script always returns HTTP 200 even on internal errors.
    // A missing fileUrl means the script ran but failed — surface that error.
    if (scriptJson.status && scriptJson.status !== 200) {
      console.error("Apps Script upload error:", scriptJson.message);
      throw new Error(
        scriptJson.message || "Apps Script failed to save the file."
      );
    }

    const fileUrl: string = scriptJson.fileUrl ?? "";
    if (!fileUrl) {
      console.error("Apps Script returned no fileUrl. Response:", scriptJson);
      throw new Error("Apps Script did not return a file URL. Check that the script is redeployed and Drive permissions are granted.");
    }

    const response = NextResponse.json({ uploaded: true });
    const session = ensureUploadSession(req, response);
    const fileRef = createUploadRef(fileUrl, email, fieldType, session);
    if (!fileRef) return NextResponse.json({ message: "Upload security is not configured." }, { status: 500 });
    const securedResponse = NextResponse.json({ uploaded: true, fileRef });
    const existingSession = req.cookies.get("nft_upload_session")?.value;
    if (!existingSession) securedResponse.cookies.set("nft_upload_session", session, { httpOnly: true, secure: true, sameSite: "lax", path: "/", maxAge: 2 * 60 * 60 });
    return securedResponse;
  } catch (err) {
    console.error("Document upload error:", err);
    const timedOut = err instanceof Error && err.name === "AbortError";
    return NextResponse.json(
      { message: timedOut ? "The upload timed out. Please check your connection and select the file again." : "The document could not be saved. Please select it again. If the problem continues, contact NFT Munich." },
      { status: timedOut ? 504 : 502 }
    );
  }
}
