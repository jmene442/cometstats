# Session 2 Summary — Data Entry Approach
**Date:** April 2026

---

## What Was Decided

### Data Entry: Two-Route System

The admin data entry flow will support two paths, both feeding into the same review UI:

**Route 1 — Photo Upload (Primary)**
- Admin photographs the paper scoresheet after each game (phone camera; scanning app recommended for quality consistency)
- Image is uploaded to Supabase Storage
- OCR extracts stat values using zone-based extraction — since the printed scoresheet book has an identical layout on every page, field positions are fixed coordinates. The system reads handwritten values at known regions rather than parsing the document structure
- Focus is on the batting totals columns (right side of sheet) and fielding columns (left side) — not the inning-by-inning diamond grid, which is not needed
- OCR output pre-fills the review form

**Route 2 — Manual Entry (Fallback)**
- Admin enters game metadata first: date, opponent, home/away, season
- Then enters stats player by player, one row at a time
- Used when OCR is unavailable or a photo can't be taken

**Shared Review UI**
- Both routes land on the same editable form — OCR pre-fills it, manual entry starts blank
- Admin reviews all values, corrects any errors, then confirms to commit to the database
- No auto-commit from OCR; human approval always required
- Admin corrections are stored as labeled data, enabling future fine-tuning of the OCR model on the team's specific scoresheet and handwriting style

---

## Scoresheet Format

- Printed scoresheet book — every page is structurally identical, filled in by pen
- Two scoresheets per game (one per team)
- Your team's sheet is the primary data source; opponent data is optional beyond the final score

---

## OCR Strategy Notes

- Zone-based extraction is more reliable than general-purpose document OCR for this use case because the template never changes
- Handwriting is the primary risk — manual override mitigates this
- A feedback loop is built in: every correction the admin makes is a labeled training example. After ~50 corrected scoresheets, fine-tuning the model on your team's style becomes feasible
- Modern vision LLMs (GPT-4V, Gemini Vision, Claude) already understand baseball scoring notation and can serve as the initial OCR engine without custom training

---

## Open Items Carried Forward

- DH rule — does your rec league use one?
- Scoring conventions — document your scorer's shorthand before building the entry form
- Domain / branding
- Player onboarding (Phase 4)
