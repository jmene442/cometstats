# Conversation Summary — Data Model Confirmation
**Date:** April 18, 2026  
**Topic:** Core data model review and finalisation

---

## What Was Decided

- **Data model confirmed** as appropriate for a rec league scoresheet-based system with no instrumentation (no radar guns, no Statcast-type machinery).
- **Batting Lines finalised:** AB, H, 2B, 3B, HR, RBI, BB, HBP, SO, R, SB, CS
  - HBP added — required for correct OBP calculation.
  - CS added — natural companion to SB; enables SB%.
  - SAC explicitly excluded — inconsistently recorded in rec leagues, not worth the noise.
- **Pitching Lines finalised:** IP, H, ER, BB, SO, HBP, W/L/S, PC (pitch count, nullable)
  - HBP added to mirror batting side.
  - Pitch count kept as a nullable field — sometimes recorded, sometimes not.
- **Fielding Events deferred** — post-Phase 1. Requires a dedicated scorekeeper to be reliable. Incomplete fielding data is worse than no data.
- **Statcast-era fields explicitly out of scope:** pitch velocity, spin rate, pitch type, exit velocity, launch angle, sprint speed. None of these are capturable without hardware.

## Computed Stats Available from This Model

- **Batting:** AVG, OBP, SLG, OPS, TB, SB%
- **Pitching:** ERA, WHIP, K/9, BB/9, K/BB, H/9

## Files Updated

- `project_plan.md` updated to v0.2 — batting lines, pitching lines, and fielding events sections revised. Open decision on fielding resolved.

## Open Questions Carried Forward

- Does the rec league use a DH rule?
- What scoring conventions does the team use on paper scoresheets?
- What will the site be called / domain?

## Next Steps

- Write the SQL schema based on the confirmed data model.
