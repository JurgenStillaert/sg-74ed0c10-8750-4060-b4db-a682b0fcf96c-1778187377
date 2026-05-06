---
title: Doel instellen & database schema
status: in_progress
priority: urgent
type: feature
tags: [setup, database, form]
created_by: agent
created_at: 2026-05-06
position: 1
---

## Notes
Database schema voor localStorage met gebruikersprofiel en dagelijkse entries. Goal-setting form voor initiële setup met gewicht, doelgewicht, vetpercentage, einddatum.

## Checklist
- [x] Design system setup (globals.css + tailwind.config.ts)
- [x] Database schema & utilities (src/lib/db.ts)
- [x] GoalSetup component met form fields
- [x] Validatie: einddatum in toekomst, doelgewicht < startgewicht
- [x] Data opslag in localStorage
- [x] Index.tsx update met GoalSetup form

## Acceptance
- Gebruiker kan startgewicht, doelgewicht, vetpercentage target, einddatum invoeren
- Data wordt opgeslagen in localStorage en blijft beschikbaar na refresh