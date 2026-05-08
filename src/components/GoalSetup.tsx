"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { db, UserGoals } from "@/lib/db";
import { Target, TrendingDown, Calendar } from "lucide-react";

interface GoalSetupProps {
  onComplete: () => void;
}

export function GoalSetup({ onComplete }: GoalSetupProps) {
  const [formData, setFormData] = useState({
    startWeight: "",
    goalWeight: "",
    startBodyFat: "",
    goalBodyFat: "",
    startDate: "",
    endDate: "",
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

    const startWeight = parseFloat(formData.startWeight);
    const goalWeight = parseFloat(formData.goalWeight);
    const startBodyFat = parseFloat(formData.startBodyFat);
    const goalBodyFat = parseFloat(formData.goalBodyFat);

    if (!formData.startWeight || isNaN(startWeight) || startWeight <= 0) {
      newErrors.startWeight = "Vul een geldig startgewicht in";
    }

    if (!formData.goalWeight || isNaN(goalWeight) || goalWeight <= 0) {
      newErrors.goalWeight = "Vul een geldig doelgewicht in";
    } else if (goalWeight >= startWeight) {
      newErrors.goalWeight = "Doelgewicht moet lager zijn dan startgewicht";
    }

    if (!formData.startBodyFat || isNaN(startBodyFat) || startBodyFat <= 0 || startBodyFat > 100) {
      newErrors.startBodyFat = "Vul een geldig vetpercentage in (0-100)";
    }

    if (!formData.goalBodyFat || isNaN(goalBodyFat) || goalBodyFat <= 0 || goalBodyFat > 100) {
      newErrors.goalBodyFat = "Vul een geldig doel vetpercentage in (0-100)";
    } else if (goalBodyFat >= startBodyFat) {
      newErrors.goalBodyFat = "Doel vetpercentage moet lager zijn dan start";
    }

    if (!formData.endDate) {
      newErrors.endDate = "Selecteer een einddatum";
    } else {
      const selectedDate = new Date(formData.endDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate <= today) {
        newErrors.endDate = "Einddatum moet in de toekomst liggen";
      }
    }

    if (!formData.startDate) {
      newErrors.startDate = "Selecteer een begindatum";
    } else if (formData.endDate && formData.startDate) {
      const startDate = new Date(formData.startDate);
      const endDate = new Date(formData.endDate);
      if (startDate >= endDate) {
        newErrors.startDate = "Begindatum moet vóór einddatum zijn";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const goals: UserGoals = {
      startWeight: parseFloat(formData.startWeight),
      goalWeight: parseFloat(formData.goalWeight),
      startBodyFat: parseFloat(formData.startBodyFat),
      goalBodyFat: parseFloat(formData.goalBodyFat),
      startDate: formData.startDate,
      endDate: formData.endDate,
      createdAt: new Date().toISOString(),
    };

    db.saveGoals(goals);
    onComplete();
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl border-2 shadow-lg">
        <CardHeader className="text-center space-y-2">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Target className="w-8 h-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-4xl">Stel je doel in</CardTitle>
          <CardDescription className="text-base">
            Begin je transformatie door je startpunt en einddoel in te voeren
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="startWeight" className="flex items-center gap-2 text-base font-semibold">
                  <TrendingDown className="w-4 h-4 text-primary" />
                  Startgewicht (kg)
                </Label>
                <Input
                  id="startWeight"
                  type="number"
                  step="0.01"
                  placeholder="75.50"
                  value={formData.startWeight}
                  onChange={(e) => handleChange("startWeight", e.target.value)}
                  className={errors.startWeight ? "border-destructive" : ""}
                />
                {errors.startWeight && (
                  <p className="text-sm text-destructive">{errors.startWeight}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="goalWeight" className="flex items-center gap-2 text-base font-semibold">
                  <Target className="w-4 h-4 text-accent" />
                  Doelgewicht (kg)
                </Label>
                <Input
                  id="goalWeight"
                  type="number"
                  step="0.01"
                  placeholder="70.00"
                  value={formData.goalWeight}
                  onChange={(e) => handleChange("goalWeight", e.target.value)}
                  className={errors.goalWeight ? "border-destructive" : ""}
                />
                {errors.goalWeight && (
                  <p className="text-sm text-destructive">{errors.goalWeight}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="startBodyFat" className="text-base font-semibold">
                  Start vetpercentage (%)
                </Label>
                <Input
                  id="startBodyFat"
                  type="number"
                  step="0.1"
                  placeholder="25.0"
                  value={formData.startBodyFat}
                  onChange={(e) => handleChange("startBodyFat", e.target.value)}
                  className={errors.startBodyFat ? "border-destructive" : ""}
                />
                {errors.startBodyFat && (
                  <p className="text-sm text-destructive">{errors.startBodyFat}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="goalBodyFat" className="text-base font-semibold">
                  Doel vetpercentage (%)
                </Label>
                <Input
                  id="goalBodyFat"
                  type="number"
                  step="0.1"
                  placeholder="15.0"
                  value={formData.goalBodyFat}
                  onChange={(e) => handleChange("goalBodyFat", e.target.value)}
                  className={errors.goalBodyFat ? "border-destructive" : ""}
                />
                {errors.goalBodyFat && (
                  <p className="text-sm text-destructive">{errors.goalBodyFat}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="startDate" className="flex items-center gap-2 text-base font-semibold">
                <Calendar className="w-4 h-4 text-accent" />
                Begindatum
              </Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => handleChange("startDate", e.target.value)}
                className={errors.startDate ? "border-destructive" : ""}
              />
              {errors.startDate && (
                <p className="text-sm text-destructive">{errors.startDate}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate" className="flex items-center gap-2 text-base font-semibold">
                <Calendar className="w-4 h-4 text-primary" />
                Einddatum
              </Label>
              <Input
                id="endDate"
                type="date"
                value={formData.endDate}
                onChange={(e) => handleChange("endDate", e.target.value)}
                className={errors.endDate ? "border-destructive" : ""}
              />
              {errors.endDate && (
                <p className="text-sm text-destructive">{errors.endDate}</p>
              )}
            </div>

            <Button type="submit" className="w-full h-12 text-lg font-semibold">
              Start je transformatie
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}