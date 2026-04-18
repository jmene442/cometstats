# Conversation Summary — Project Kickoff
**Date:** April 18, 2026  
**Topic:** Initial project scoping and planning

---

## What Was Decided

- **Project:** A baseball stats web app — one team to start, potentially one rec league later.
- **Audience:** Players (public read-only). Admin (data entry, private). Coaches and player logins deferred to later phases.
- **Stack confirmed:** Next.js on Vercel (frontend), FastAPI Python (backend), PostgreSQL via Supabase (database + auth + file storage).
- **Data model approach:** Relational. Store raw event data (batting lines, pitching lines per game); compute aggregates dynamically.
- **Data entry:** Paper scoresheets are the source. Exact ingestion method TBD — likely a manual form first (Phase 1), then OCR + edit UI (Phase 3). Key insight: design the manual form with OCR correction in mind from day one to avoid building two separate tools.
- **Four-phase roadmap established:** Foundation → Public Views → Scoresheet Ingestion → Expansion.
- **Project plan written** to `project_plan.md` and `Baseball_Stats_App_Project_Plan.docx`.

## Open Questions Carried Forward

- Will fielding stats be tracked from Phase 1 or deferred?
- Does the rec league use a DH rule?
- What scoring conventions does the team use on paper scoresheets?
- What will the site be called / domain?

## Next Steps

- Open separate focused conversations to explore individual topics in depth.
- Each conversation should be summarised and saved to `summaries/` with a dated filename.
- Summaries will later be collated into a full project document covering minimum requirements.
- After that: a formal list of user stories and technical requirements.

**Suggested conversation topics to branch into:**
- Data model deep-dive (schema design, stat definitions, fielding scope)
- UI/UX — views, layouts, player card design
- Data entry & scoresheet ingestion (form design, OCR approach)
- Auth & user roles (admin now, players later)
- Tech setup & repo structure (monorepo, CI/CD, environments)

**Context files to attach to each new chat:**
- Always attach `project_plan.md`
- Attach any relevant prior summary files for that topic

## Key Risks Noted

- Schema design is the highest-leverage early decision — changing it after data exists is expensive.
- Scoresheet legibility is variable; OCR alone won't be sufficient without a human review step.
- Must avoid hard-coding single-team assumptions so Phase 4 expansion isn't a full rewrite.
