# Conversation Summary — Tech Stack Confirmation
**Date:** April 18, 2026  
**Topic:** Verifying the tech stack, understanding free tier limitations, OCR intent, and backend language decision

---

## What Was Decided

- **Full stack confirmed as free/open-source for this scale.** Every technology either has no cost (open-source) or a free tier that comfortably covers a small rec league app.
- **Backend switched from Python · FastAPI to Node.js · Hono.** Rationale: keeps the stack to a single language (JS/TS) end-to-end, Hono runs natively on Vercel serverless (no separate host required), and Node is fully capable of all required stat computation including custom date range comparisons and side-by-side player views.
- **OCR intent clarified.** Phase 3 OCR (Google Vision API) is intended to read a photo of a physical paper scoresheet and pre-fill the data entry form. Admin still reviews and corrects before saving — no auto-commit. Google Vision preferred over AWS Textract due to its ongoing free tier (1,000 units/month vs. Textract's 3-month trial only).
- **Data entry conversation deferred** to a separate thread.

## Key Findings Per Technology

- **Next.js / Hono** — fully open-source, no limitations.
- **Vercel (Hobby tier)** — free. Fluid Compute available on all plans; charges only for active CPU time (negligible for stat queries). Python backend no longer needed, so no awkward serverless packaging required.
- **Supabase (Free tier)** — 500MB DB, 1GB storage, 50K MAU. Projects pause after 7 days of inactivity (no API requests). Data is safe when paused; unpause is one click. Workaround: a simple scheduled ping (e.g. GitHub Actions cron) keeps it alive during the season. Off-season pause is harmless.
- **Google Vision API** — 1,000 free units/month ongoing. A rec league season (~30–50 games) will likely never exceed this.

## Open Questions Carried Forward

- Will the FastAPI → Hono change be reflected when the monorepo is scaffolded? (Yes — update repo setup notes accordingly.)
- Supabase ping: set up from day one, or revisit when approaching first off-season?

## Project Plan Changes Made

- Tech stack table updated: Python · FastAPI → Node.js · Hono (v0.2).
- Phase 2 stat computation note updated to reference Hono.
- Revision history updated.
