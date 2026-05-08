---
title: Aantal joker dagen opgeven bij het spel heeft geen zin
status: done
priority: high
type: bug
created_by: human
created_at: '2026-05-08T06:30:27.558734'
position: 8
---

## Notes
Joker dagen zijn geen budget waaruit je kan kiezen. Dus verwijder dit uit het spel.

Verwijder ook "1 van 12 gebruikt" uit kaartje van carb load dagen.

## Checklist
- [x] Verwijder totalJokers veld uit GoalSetup formulier
- [x] Update db.ts interface om totalJokers te verwijderen
- [x] Verwijder "X van Y gebruikt" tekst uit YearStats
- [x] Behoud carb load dagen counter zonder budget tracking
