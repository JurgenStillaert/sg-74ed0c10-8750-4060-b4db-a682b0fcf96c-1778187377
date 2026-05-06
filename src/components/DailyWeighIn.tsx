"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { db, DailyWeighIn as WeighInData } from "@/lib/db";
import { Scale, Droplet, Flame, Dumbbell } from "lucide-react";

interface DailyWeighInProps {
  onComplete: () => void;
}

export function DailyWeighIn({ onComplete }: DailyWeighInProps) {
  const today = new Date().toISOString().split("T")[0];
  const [formData, setFormData] = useState({
    weight: "",
    bodyFat: "",
    bmr: "",
    muscleMass: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    const weight = parseFloat(formData.weight);
    const bodyFat = parseFloat(formData.bodyFat);
    const bmr = parseFloat(formData.bmr);
    const muscleMass = parseFloat(formData.muscleMass);

    if (!formData.weight || isNaN(weight) || weight <= 0) {
      newErrors.weight = "Vul een geldig gewicht in";
    }

    if (!formData.bodyFat || isNaN(bodyFat) || bodyFat <= 0 || bodyFat > 100) {
      newErrors.bodyFat = "Vul een geldig vetpercentage in (0-100)";
    }

    if (!formData.bmr || isNaN(bmr) || bmr <= 0) {
      newErrors.bmr = "Vul een geldige BMR in";
    }

    if (!formData.muscleMass || isNaN(muscleMass) || muscleMass <= 0) {
      newErrors.muscleMass = "Vul een geldige spiermassa in";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const weighIn: WeighInData = {
      id: `weighin_${Date.now()}`,
      date: today,
      weight: parseFloat(formData.weight),
      bodyFat: parseFloat(formData.bodyFat),
      bmr: parseFloat(formData.bmr),
      muscleMass: parseFloat(formData.muscleMass),
    };

    db.saveWeighIn(weighIn);
    onComplete();
  };

  return (
    <Card className="w-full max-w-2xl border-2 shadow-lg">
      <CardHeader className="text-center space-y-2">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Scale className="w-8 h-8 text-primary" />
          </div>
        </div>
        <CardTitle className="text-3xl">Ochtendweging</CardTitle>
        <CardDescription className="text-base">
          Voer je metingen van vandaag in
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="weight" className="flex items-center gap-2 text-base font-semibold">
                <Scale className="w-4 h-4 text-primary" />
                Gewicht (kg)
              </Label>
              <Input
                id="weight"
                type="number"
                step="0.01"
                placeholder="75.50"
                value={formData.weight}
                onChange={(e) => handleChange("weight", e.target.value)}
                className={errors.weight ? "border-destructive" : ""}
              />
              {errors.weight && (
                <p className="text-sm text-destructive">{errors.weight}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="bodyFat" className="flex items-center gap-2 text-base font-semibold">
                <Droplet className="w-4 h-4 text-accent" />
                Vetpercentage (%)
              </Label>
              <Input
                id="bodyFat"
                type="number"
                step="0.1"
                placeholder="22.5"
                value={formData.bodyFat}
                onChange={(e) => handleChange("bodyFat", e.target.value)}
                className={errors.bodyFat ? "border-destructive" : ""}
              />
              {errors.bodyFat && (
                <p className="text-sm text-destructive">{errors.bodyFat}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="bmr" className="flex items-center gap-2 text-base font-semibold">
                <Flame className="w-4 h-4 text-primary" />
                BMR (kcal)
              </Label>
              <Input
                id="bmr"
                type="number"
                step="1"
                placeholder="1800"
                value={formData.bmr}
                onChange={(e) => handleChange("bmr", e.target.value)}
                className={errors.bmr ? "border-destructive" : ""}
              />
              {errors.bmr && (
                <p className="text-sm text-destructive">{errors.bmr}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="muscleMass" className="flex items-center gap-2 text-base font-semibold">
                <Dumbbell className="w-4 h-4 text-accent" />
                Spiermassa (kg)
              </Label>
              <Input
                id="muscleMass"
                type="number"
                step="0.1"
                placeholder="55.0"
                value={formData.muscleMass}
                onChange={(e) => handleChange("muscleMass", e.target.value)}
                className={errors.muscleMass ? "border-destructive" : ""}
              />
              {errors.muscleMass && (
                <p className="text-sm text-destructive">{errors.muscleMass}</p>
              )}
            </div>
          </div>

          <Button type="submit" className="w-full h-12 text-lg font-semibold">
            Opslaan
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}