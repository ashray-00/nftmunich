/**
 * POST /api/tournament-registration
 *
 * Sanitizes and forwards registration data to a Google Apps Script web app,
 * which appends a row to the correct tab (Frankfurt / Berlin) in a Google Sheet.
 *
 * ── Required environment variable (add to .env.local) ─────────────────────
 * GOOGLE_SCRIPT_URL   The web app URL from your Apps Script deployment.
 *                     Example: https://script.google.com/macros/s/ABC.../exec
 * ──────────────────────────────────────────────────────────────────────────
 */

import { NextRequest, NextResponse } from "next/server";

const VALID_TOURNAMENTS = ["frankfurt", "berlin"];
const VALID_ROLES = ["Player", "Supporter", "Other"];
const VALID_FOOD = ["Veg", "Non-Veg"];
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Strip HTML tags and control characters, then trim whitespace. */
function sanitizeString(value: unknown, maxLength = 300): string {
  if (value === null || value === undefined) return "";
  const str = String(value)
    .replace(/<[^>]*>/g, "")
    .replace(/[<>"'`]/g, "")
    .trim();
  return str.slice(0, maxLength);
}

/** Return a non-negative integer string, or empty string if invalid. */
function sanitizeNumber(value: unknown): string {
  const n = Number(value);
  if (!Number.isFinite(n) || n < 0) return "";
  return String(Math.floor(n));
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { tournament, ...formData } = body as Record<string, unknown>;

    // ── Validate tournament ───────────────────────────────────────
    if (
      !tournament ||
      typeof tournament !== "string" ||
      !VALID_TOURNAMENTS.includes(tournament)
    ) {
      return NextResponse.json(
        { message: "Invalid tournament specified." },
        { status: 400 }
      );
    }

    // ── Sanitize and validate each field ─────────────────────────
    const name      = sanitizeString(formData.name, 150);
    const phone     = sanitizeString(formData.phone, 30);
    const email     = sanitizeString(formData.email, 254);
    const role      = sanitizeString(formData.role, 50);
    const travel    = sanitizeString(formData.travel, 500);
    const food_pref = sanitizeString(formData.food_pref, 20);
    const special_info = sanitizeString(formData.special_info, 1000);
    const comments  = sanitizeString(formData.comments, 1000);
    const accompanying = sanitizeNumber(formData.accompanying);
    const meal_boxes   = sanitizeNumber(formData.meal_boxes);

    if (!name) {
      return NextResponse.json({ message: "Full name is required." }, { status: 400 });
    }
    if (!email || !EMAIL_RE.test(email)) {
      return NextResponse.json({ message: "A valid email address is required." }, { status: 400 });
    }
    if (!phone) {
      return NextResponse.json({ message: "Contact number is required." }, { status: 400 });
    }
    if (role && !VALID_ROLES.includes(role)) {
      return NextResponse.json({ message: "Invalid participation type." }, { status: 400 });
    }
    if (food_pref && !VALID_FOOD.includes(food_pref)) {
      return NextResponse.json({ message: "Invalid food preference." }, { status: 400 });
    }

    // ── Sanitize checklist ────────────────────────────────────────
    const ALLOWED_CHECKLIST = [
      "socks", "shin guards", "bibs", "nft t-shirt",
      "football shoes for kunstrasen", "football shoes for natural turf",
    ];
    const checklistData = formData.checklist as Record<string, unknown> | undefined;
    const checkedItems = checklistData
      ? Object.entries(checklistData)
          .filter(([key, value]) => {
            const k = key.toLowerCase();
            return Boolean(value) && ALLOWED_CHECKLIST.some((a) => k.includes(a.split(" ")[0]));
          })
          .map(([item]) => sanitizeString(item, 60))
          .join(", ")
      : "";

    // ── Forward to Apps Script ────────────────────────────────────
    const scriptUrl = process.env.GOOGLE_SCRIPT_URL;

    if (!scriptUrl) {
      console.error("Missing GOOGLE_SCRIPT_URL env var.");
      return NextResponse.json(
        { message: "Server configuration error. Please contact the administrator." },
        { status: 500 }
      );
    }

    const payload = {
      tournament,
      name,
      phone,
      email,
      role,
      accompanying,
      travel,
      food_pref,
      meal_boxes,
      checklist: checkedItems,
      special_info,
      comments,
    };

    const scriptRes = await fetch(scriptUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!scriptRes.ok) {
      throw new Error(`Apps Script responded with status ${scriptRes.status}`);
    }

    return NextResponse.json({ message: "Registration submitted successfully." });
  } catch (err) {
    console.error("Tournament registration error:", err);
    return NextResponse.json(
      { message: "Failed to submit registration. Please try again." },
      { status: 500 }
    );
  }
}
