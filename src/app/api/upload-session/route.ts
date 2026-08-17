import { NextRequest, NextResponse } from "next/server";
import { ensureUploadSession } from "../../../lib/uploadSession";

export async function POST(request: NextRequest) {
  const response = NextResponse.json({ ready: true });
  ensureUploadSession(request, response);
  return response;
}
