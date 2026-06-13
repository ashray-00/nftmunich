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

const ACCEPTED_MIME_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
];

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2 MB

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
    const fieldType = String(formData.get("fieldType") ?? "").slice(0, 20).replace(/[^a-z0-9_]/g, "");
    const fileIndexRaw = String(formData.get("fileIndex") ?? "0");
    const fileIndex = parseInt(fileIndexRaw, 10) || 0;
    const fullName = String(formData.get("fullName") ?? "").slice(0, 150);

    if (!file || file.size === 0) {
      return NextResponse.json({ message: "No file provided." }, { status: 400 });
    }

    if (!ACCEPTED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        { message: "Invalid file type. Only PDF, JPG, and PNG are accepted." },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { message: "File exceeds the 2 MB size limit." },
        { status: 400 }
      );
    }

    const sanitizedName = sanitizeFullName(fullName) || "player";
    const ext = getExtension(file.type);
    const filename =
      fileIndex > 0
        ? `${sanitizedName}_${fieldType}_${fileIndex}.${ext}`
        : `${sanitizedName}_${fieldType}.${ext}`;

    const arrayBuffer = await file.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString("base64");

    const scriptUrl = process.env.GOOGLE_SCRIPT_URL;
    if (!scriptUrl) {
      console.error("Missing GOOGLE_SCRIPT_URL env var.");
      return NextResponse.json(
        { message: "Server configuration error. Please contact the administrator." },
        { status: 500 }
      );
    }

    const scriptRes = await fetch(scriptUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "uploadFile",
        filename,
        base64,
        mimeType: file.type,
      }),
    });

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

    return NextResponse.json({ fileUrl });
  } catch (err) {
    console.error("Document upload error:", err);
    return NextResponse.json(
      { message: "Failed to upload document. Please try again." },
      { status: 500 }
    );
  }
}
