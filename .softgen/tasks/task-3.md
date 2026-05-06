---
title: Sport & voeding logging
status: todo
priority: high
type: feature
tags: [daily-entry, form]
created_by: agent
created_at: 2026-05-06
position: 3
---

## Notes
Formulieren voor sport (meerdere sessies per dag) en voeding (dagelijkse totalen). Berekeningen voor dagelijks verbruik en deficit.

## Checklist
- [ ] SportEntry component (meerdere entries per dag mogelijk)
- [ ] NutritionEntry component (calorieën, vet g, koolhydraten g, eiwitten g)
- [ ] Berekening dagelijks verbruik: BMR * 0.25 + sport
- [ ] Berekening verschil: verbruikt - gegeten
- [ ] Validatie eiwitinname: >1.6g/kg lichaamsgewicht
- [ ] Warning indien onvoldoende eiwitten

## Acceptance
- Sport sessies kunnen toegevoegd worden met calorie verbruik
- Voeding kan ingevoerd worden met macro's
- App toont dagelijks calorie deficit/surplus
- Waarschuwing bij te lage eiwitinname