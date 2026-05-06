---
title: Dagelijkse ochtendweging formulier
status: done
priority: high
type: feature
tags: [daily-tracking, form]
created_by: agent
created_at: 2026-05-06
position: 2
---

## Notes
Formulier voor dagelijkse ochtendweging met 4 velden: gewicht (2 decimalen), vetpercentage, BMR, spiermassa. Toon laatse weging + 7-daags gemiddelde wanneer beschikbaar.

## Checklist
- [x] DailyWeighIn component met 4 input velden
- [x] Validatie: positieve getallen, vetpercentage 0-100
- [x] WeighInHistory component voor laatste weging + trend
- [x] 7-daags gemiddelde berekening en weergave
- [x] Voorkom dubbele weging op zelfde dag
- [x] Index.tsx update met weging flow

## Acceptance
- Gebruiker kan dagelijkse weging invoeren met alle 4 metingen
- Laatste weging wordt getoond met verandering vs vorige dag
- 7-daags gemiddelde verschijnt na 7 dagen data