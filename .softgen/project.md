# Afval-Queeste: Gewichtsverlies Tracker met Gamification

## Vision
Een motiverende gewichtsverlies tracking app voor Nederlandse gebruikers die dagelijkse metingen, sportactiviteiten en voedingsinname bijhoudt. Gamification door visuele voortgang en achievement moments.

## Design
- `--primary: 16 82% 45%` (burnt orange/terracotta)
- `--accent: 35 91% 56%` (amber/goud)
- `--background: 32 25% 96%` (warm cream)
- `--foreground: 25 15% 25%` (warm charcoal)
- `--muted: 32 15% 88%` (muted cream)
- Display: Archivo Black
- Body: Rubik
- Style: Fitness Coach Energy — bold headings, warm achievement colors, generous spacing, motiverende UI

## Features
- Gebruikersprofiel: gewicht, doelgewicht, vetpercentage target, einddatum
- Dagelijkse weging: gewicht (2 decimalen), vetpercentage, BMR, spiermassa
- Sport logging: meerdere sessies per dag, netto calorieën verbruikt
- Voeding logging: calorieën, vet, koolhydraten, eiwitten
- Berekeningen: dagelijks verbruik (BMR * 0.25 + sport), verschil (verbruikt - gegeten), vetverlies (7700kcal = 1kg vet)
- Validatie: >1.6g/kg lichaamsgewicht aan eiwitten
- Grafieken: ideale vs werkelijke voortgang, 7-daags gemiddelde, geschatte einddatum, vet/spierpercentage
- Database: localStorage browser-based