"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { db, NutritionEntry } from "@/lib/db";
import { Apple, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface NutritionLoggerProps {
  selectedDate: string;
  onUpdate: () => void;
}

export function NutritionLogger({ selectedDate, onUpdate }: NutritionLoggerProps) {
  const [formData, setFormData] = useState({
    calories: "",
    fat: "",
    carbs: "",
    protein: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const existing = db.getNutritionEntries().find((n) => n.date === selectedDate);
    if (existing) {
      setFormData({
        calories: existing.calories.toString(),
        fat: existing.fat.toString(),
        carbs: existing.carbs.toString(),
        protein: existing.protein.toString(),
      });
      setSaved(true);
    } else {
      setFormData({
        calories: "",
        fat: "",
        carbs: "",
        protein: "",
      });
      setSaved(false);
    }
  }, [selectedDate]);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setSaved(false);
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    const calories = parseFloat(formData.calories);
    const fat = parseFloat(formData.fat);
    const carbs = parseFloat(formData.carbs);
    const protein = parseFloat(formData.protein);

    if (!formData.calories || isNaN(calories) || calories <= 0) {
      newErrors.calories = "Vul geldige calorieën in";
    }

    if (!formData.fat || isNaN(fat) || fat < 0) {
      newErrors.fat = "Vul geldig vet in";
    }

    if (!formData.carbs || isNaN(carbs) || carbs < 0) {
      newErrors.carbs = "Vul geldige koolhydraten in";
    }

    if (!formData.protein || isNaN(protein) || protein < 0) {
      newErrors.protein = "Vul geldige eiwitten in";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const entry: NutritionEntry = {
      id: `nutrition_${Date.now()}`,
      date: selectedDate,
      calories: parseFloat(formData.calories),
      fat: parseFloat(formData.fat),
      carbs: parseFloat(formData.carbs),
      protein: parseFloat(formData.protein),
    };

    db.saveNutrition(entry);
    setSaved(true);
    onUpdate();
  };

  const weighIn = db.getWeighIns().find((w) => w.date === selectedDate);
  const protein = parseFloat(formData.protein);
  const proteinPerKg = weighIn && protein > 0 ? protein / weighIn.weight : 0;
  const proteinWarning = weighIn && proteinPerKg > 0 && proteinPerKg < 1.6;

  return (
    <Card className="border-2">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
            <Apple className="w-6 h-6 text-accent" />
          </div>
          <div>
            <CardTitle className="text-2xl">Voeding</CardTitle>
            <CardDescription>Dagelijkse intake macro&apos;s</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="calories" className="text-sm font-semibold">Calorieën (kcal)</Label>
              <Input
                id="calories"
                type="number"
                step="1"
                placeholder="2000"
                value={formData.calories}
                onChange={(e) => handleChange("calories", e.target.value)}
                className={errors.calories ? "border-destructive" : ""}
              />
              {errors.calories && <p className="text-sm text-destructive">{errors.calories}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="protein" className="text-sm font-semibold">Eiwitten (g)</Label>
              <Input
                id="protein"
                type="number"
                step="0.1"
                placeholder="120"
                value={formData.protein}
                onChange={(e) => handleChange("protein", e.target.value)}
                className={errors.protein ? "border-destructive" : ""}
              />
              {errors.protein && <p className="text-sm text-destructive">{errors.protein}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="fat" className="text-sm font-semibold">Vet (g)</Label>
              <Input
                id="fat"
                type="number"
                step="0.1"
                placeholder="60"
                value={formData.fat}
                onChange={(e) => handleChange("fat", e.target.value)}
                className={errors.fat ? "border-destructive" : ""}
              />
              {errors.fat && <p className="text-sm text-destructive">{errors.fat}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="carbs" className="text-sm font-semibold">Koolhydraten (g)</Label>
              <Input
                id="carbs"
                type="number"
                step="0.1"
                placeholder="200"
                value={formData.carbs}
                onChange={(e) => handleChange("carbs", e.target.value)}
                className={errors.carbs ? "border-destructive" : ""}
              />
              {errors.carbs && <p className="text-sm text-destructive">{errors.carbs}</p>}
            </div>
          </div>

          {proteinWarning && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Let op: je eet {proteinPerKg.toFixed(1)}g/kg eiwit. Minimaal 1.6g/kg aanbevolen voor spierbehoud tijdens afvallen.
              </AlertDescription>
            </Alert>
          )}

          <Button type="submit" className="w-full" disabled={saved}>
            {saved ? "✓ Opgeslagen" : "Opslaan"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}