---
title: Sport & voeding logging
status: done
priority: high
type: feature
tags: [daily-tracking, calculations]
created_by: agent
created_at: 2026-05-06
position: 3
---

## Notes
Formulieren voor sport (meerdere per dag) en voeding (dagelijks totaal). Berekeningen: dagelijks verbruik (BMR * 0.25 + sport), deficit, eiwitcontrole (≥1.6g/kg), vetverlies schatting.

## Checklist
- [x] SportLogger component: meerdere sessies per dag
- [x] NutritionLogger component: macro tracking
- [x] DailyStats component met berekeningen
- [x] Validatie: >1.6g/kg eiwit waarschuwing
- [x] Deficit berekening (verbruikt - gegeten)
- [x] Vetverlies schatting (7700kcal = 1kg)
- [x] Index.tsx update met loggers

## Acceptance
- Gebruiker kan meerdere sportactiviteiten per dag loggen
- Voeding kan worden ingevoerd met macro's
- App toont dagelijks calorie deficit/surplus
- Waarschuwing bij te lage eiwitinname