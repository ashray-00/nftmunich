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

const VALID_TOURNAMENTS = ["berlin"];
const VALID_ROLES = [
  "Player",
  "Supporter / Guest",
  "Management",
  "Volunteer",
  "Other",
];
const VALID_FOOD = ["Veg", "Non-veg", "No food needed"];
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

    // ── Personal details ──────────────────────────────────────────
    const name = sanitizeString(formData.name, 150);
    const email = sanitizeString(formData.email, 254);
    const phone = sanitizeString(formData.phone, 50);
    const role = sanitizeString(formData.role, 50);

    if (!name) {
      return NextResponse.json(
        { message: "Full name is required." },
        { status: 400 }
      );
    }
    if (!email || !EMAIL_RE.test(email)) {
      return NextResponse.json(
        { message: "A valid email address is required." },
        { status: 400 }
      );
    }
    if (!phone) {
      return NextResponse.json(
        { message: "Phone / WhatsApp number is required." },
        { status: 400 }
      );
    }
    if (role && !VALID_ROLES.includes(role)) {
      return NextResponse.json(
        { message: "Invalid participation type." },
        { status: 400 }
      );
    }
    if (
      formData.food_pref &&
      !VALID_FOOD.includes(sanitizeString(formData.food_pref, 20))
    ) {
      return NextResponse.json(
        { message: "Invalid food preference." },
        { status: 400 }
      );
    }

    // ── Player information ────────────────────────────────────────
    const position = sanitizeString(formData.position, 50);
    const position_note = sanitizeString(formData.position_note, 300);
    const availability = sanitizeString(formData.availability, 50);
    const availability_note = sanitizeString(formData.availability_note, 300);
    const fitness = sanitizeString(formData.fitness, 10);
    const physical_prep = sanitizeString(formData.physical_prep, 500);

    // ── Jersey & equipment ────────────────────────────────────────
    const jersey_size = sanitizeString(formData.jersey_size, 10);
    const socks = sanitizeString(formData.socks, 100);
    const shin_guards = sanitizeString(formData.shin_guards, 100);
    const bibs = sanitizeString(formData.bibs, 100);
    const beanie_bag = sanitizeString(formData.beanie_bag, 100);
    const nft_tshirt = sanitizeString(formData.nft_tshirt, 50);
    const nft_tshirt_size = sanitizeString(formData.nft_tshirt_size, 10);

    // ── Football shoes ────────────────────────────────────────────
    const shoes_kunstrasen = sanitizeString(formData.shoes_kunstrasen, 100);
    const shoes_natural = sanitizeString(formData.shoes_natural, 100);

    // ── Documents ─────────────────────────────────────────────────
    const health_insurance = sanitizeString(formData.health_insurance, 10);
    const health_card = sanitizeString(formData.health_card, 10);
    const health_insurance_file_urls = sanitizeString(formData.health_insurance_file_urls, 1000);
    const residence_permit = sanitizeString(formData.residence_permit, 10);
    const residence_permit_bring = sanitizeString(formData.residence_permit_bring, 10);
    const id_file_urls = sanitizeString(formData.id_file_urls, 1000);
    const doc_confirmation = sanitizeString(formData.doc_confirmation, 500);

    // ── Goalkeeper ────────────────────────────────────────────────
    const goalkeeper_set = sanitizeString(formData.goalkeeper_set, 100);

    // ── Travel & accommodation ────────────────────────────────────
    const travel_availability = sanitizeString(formData.travel_availability, 150);
    const travel_saturday_reason = sanitizeString(formData.travel_saturday_reason, 500);
    const travel_other_explanation = sanitizeString(formData.travel_other_explanation, 500);
    const hotel_need = sanitizeString(formData.hotel_need, 50);

    // ── Food ──────────────────────────────────────────────────────
    const food_pref = sanitizeString(formData.food_pref, 20);
    const meal_boxes = sanitizeString(formData.meal_boxes, 20);
    const food_allergy = sanitizeString(formData.food_allergy, 500);

    // ── Confirmation checkboxes (pre-serialized as strings by the client) ──
    const player_confirmation = sanitizeString(formData.player_confirmation, 1000);
    const player_notes = sanitizeString(formData.player_notes, 1000);
    const general_confirmation = sanitizeString(formData.general_confirmation, 500);

    // ── Other ─────────────────────────────────────────────────────
    const special_info = sanitizeString(formData.special_info, 1000);
    const comments = sanitizeString(formData.comments, 1000);

    // ── Forward to Apps Script ────────────────────────────────────
    const scriptUrl = process.env.GOOGLE_SCRIPT_URL;

    if (!scriptUrl) {
      console.error("Missing GOOGLE_SCRIPT_URL env var.");
      return NextResponse.json(
        {
          message:
            "Server configuration error. Please contact the administrator.",
        },
        { status: 500 }
      );
    }

    const payload = {
      tournament,
      // Personal
      name,
      email,
      phone,
      role,
      // Player info
      position,
      position_note,
      availability,
      availability_note,
      fitness,
      physical_prep,
      // Equipment
      jersey_size,
      socks,
      shin_guards,
      bibs,
      beanie_bag,
      nft_tshirt,
      nft_tshirt_size,
      // Shoes
      shoes_kunstrasen,
      shoes_natural,
      // Documents
      health_insurance,
      health_card,
      health_insurance_file_urls,
      residence_permit,
      residence_permit_bring,
      id_file_urls,
      doc_confirmation,
      // Goalkeeper
      goalkeeper_set,
      // Travel
      travel_availability,
      travel_saturday_reason,
      travel_other_explanation,
      hotel_need,
      // Food
      food_pref,
      meal_boxes,
      food_allergy,
      // Confirmations
      player_confirmation,
      player_notes,
      general_confirmation,
      // Other
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
