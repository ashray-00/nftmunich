# AGENTS.md — nft-munich (frontend)

Next.js 15/16 App Router site for NFT Munich e.V. This file exists so any coding agent (Claude, Codex, Cursor, etc.) picks up the real architecture before making changes — this repo's history has several abandoned directions, and repeating them wastes a session. This file is self-contained: don't assume you have access to the `nft-munich-server` repo it talks about below.

## Other repos in this project (may not be accessible to you)

- `nft-munich-server` — a separate, private FastAPI backend repo (Cloud Run). This is the system this file describes below from the frontend's point of view — if you don't have access to it, the summary here should be enough to work safely in this repo.
- `nft-munich-admin` — Strapi CMS (`nft-munich-strapi` on GitHub). Serves news/carousel content, and independently still runs an *older* pending → approve → token → email player-registration flow, unrelated to the system described below.

## The one rule that matters most

**This repo never talks to Google Apps Script directly.** Every route under `src/app/api/**` that touches registration, uploads, club settings, or the approved-player roster is a *thin proxy* to `nft-munich-server` (`SERVER_URL` env var, the only relevant env var for this subsystem). The backend is the only thing that holds the Apps Script URL/shared secret. If you're about to add `GOOGLE_SCRIPT_URL`/`GOOGLE_SCRIPT_SHARED_SECRET` back into this repo, stop — that reverts a deliberate migration. Add the capability to the backend instead, and proxy to it here.

Reference pattern for any new proxy route: `src/app/api/admin/admins/route.ts` — read `SERVER_URL`, forward method/body/headers, relay the backend's JSON+status, 502 on network failure. No business logic, no secrets, in these routes.

## What the backend actually does with those proxied calls

For context on what's happening on the other end of `SERVER_URL`, even if you can't see that repo's code:

- It owns a Google Apps Script web app (a script deployed at script.google.com, source mirrored in this repo at `google-apps-script/membership-registration.gs` — but **editing that file here does nothing in production**; Apps Script needs a manual redeploy by whoever has edit access to the actual script project). Apps Script web apps always return HTTP 200 even on internal errors, so the backend treats a body-level `status` field as the real outcome — not relevant to this repo directly, but explains why a "successful" network request can still represent a failure.
- It signs three kinds of short-lived JWTs with one shared session secret: the login session token, a "core access" token (proves an email is on the approved-player roster), and an "upload ref" token (binds an uploaded file to `{email, field, session}` so it can't be swapped for someone else's file at submit time). This repo only ever handles these as opaque strings — set them as cookies, forward them as headers — it never verifies or decodes them itself anymore.
- **Known, deliberate design point, not a bug:** the "core access" token is issued from a roster lookup alone — entering an approved email is enough, there's no email-ownership proof (no OTP/magic-link click-through) for that specific token. This was true in this frontend's own code before the backend migration (git history: commit `e5faaf7`, "Restore direct approved Core email access," deliberately restored this exact behavior) and was carried over unchanged. The actual backstop is that Apps Script independently re-checks roster approval before accepting a "player" registration. Don't silently "fix" this without a product conversation — it's intentional.

## Where registration/membership data actually lives

**A Google Sheet, not a database.** This is intentional — club staff who don't know SQL/Firestore can open a spreadsheet and see registrations directly. A Firestore database also exists (owned by the backend) but only for `players_2025` (tournament roster / login access) and `admins` (who can access `/admin`) — it is not used for registration/membership applications. If you see references anywhere to `registration_requests_2026`, `membership_registrations_2026`, or `members_2026`, those are dead — an abandoned earlier direction (Firestore-backed registration requests) that got replaced by the Sheet-based design.

## Auth model

- Magic-link login goes through `nft-munich-server` (`/api/v1/auth/*`).
- `/admin` page access is gated by **two independent things**: a client-side check in `src/lib/adminAuth.ts` (`OWNER_EMAIL`, currently hardcoded to one specific person's email — a real, deliberate-but-unusual choice; confirm before changing who it points to) and backend-side role-checked JWTs (`require_admin`/`require_super_admin`, which do real cryptographic signature verification). **The backend check is the actual security boundary** — the frontend check is UX only (avoids flashing the page to non-owners before the network round-trip resolves).
- "Core Member" (player) access to the registration form uses the "core access" token described above, delivered as the `nft_core_access` cookie via `/api/auth/check-core-access`.

## Deploy — be careful with `git push`

`.github/workflows/deploy.yml` triggers a **live Vercel production deploy on every push to `main`**. There's no staging gate. Before pushing:
- Run `npx next build` locally first — it catches real breakage `next dev`/`tsc` alone won't (e.g. this project is on Vercel's **Hobby plan**, which caps `maxDuration` at 60s on any route — a route declaring more than that builds fine locally but fails at actual deploy time).
- After committing, sanity-check `git diff --stat <old-ref>..HEAD` against what you intended to change — a `git add <dir>` that misses a sibling directory is an easy way to commit an inconsistent tree (this has happened before in this repo's history: a page got left behind after its imported component was deleted in the same commit, and only Vercel's build caught it — `git status` locally looked fine because the working tree was correct, only the staged/committed snapshot wasn't).
- Check the Actions tab after pushing to confirm the deploy actually went green, not just that `git push` succeeded.

## Known legacy/orphaned code, don't be surprised by it

- `src/app/player-registration/`, `src/components/RequestRegistrationForm.tsx` — an older Strapi-backed tournament registration flow, unlinked from the header nav, still technically live and independent of everything above.
- The old "Berlin tournament" registration page/form/API route were deleted (they were unreachable and silently discarded submissions due to a missing `action` field in the Apps Script payload). If you see references to `TournamentRegistrationForm`/`LoginGate`/`tournament-registration` in git history, that's why they're gone — don't recreate them without checking why they were removed.
