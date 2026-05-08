---
title: Berekening Totaal Deficit is fout
status: todo
priority: urgent
type: bug
created_by: human
created_at: '2026-05-08T06:21:05.350506'
position: 5
---

## Notes
De berekening moet als volgt zijn:
- Vetmassa = =AFRONDEN(Gewicht*Vetpercentage/100;2)
- Vet te verliezen = AFRONDEN(Vetmassa-Gewicht*Gewenste vetpercentage;2)
- Totaal gewenste deficit = =Vet te verliezen*7700

## Checklist
- [x] - Pas de berekoning aan voor totaal deficit
- [x] Maak een unit tests om deze berekening te controleren
