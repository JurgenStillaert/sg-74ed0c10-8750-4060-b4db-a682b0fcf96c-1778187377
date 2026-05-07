"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { db, SportEntry } from "@/lib/db";
import { Activity, Plus, Trash2 } from "lucide-react";

interface SportLoggerProps {
  selectedDate: string;
  onUpdate: () => void;
}

export function SportLogger({ selectedDate, onUpdate }: SportLoggerProps) {
  const [formData, setFormData] = useState({
    time: "",
    calories: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [todaySports, setTodaySports] = useState<SportEntry[]>(db.getSportEntries(selectedDate));

  // Update when selectedDate changes
  useEffect(() => {
    setTodaySports(db.getSportEntries(selectedDate));
  }, [selectedDate]);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.time) {
      newErrors.time = "Vul een tijd in";
    }

    const calories = parseFloat(formData.calories);
    if (!formData.calories || isNaN(calories) || calories <= 0) {
      newErrors.calories = "Vul geldige calorieën in";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const entry: SportEntry = {
      id: `sport_${Date.now()}`,
      date: selectedDate,
      time: formData.time,
      calories: parseFloat(formData.calories),
    };

    db.saveSportEntry(entry);
    setTodaySports(db.getSportEntries(selectedDate));
    setFormData({ time: "", calories: "" });
    onUpdate();
  };

  const handleDelete = (id: string) => {
    if (typeof window === "undefined") return;
    const allEntries = db.getSportEntries();
    const updated = allEntries.filter((e) => e.id !== id);
    localStorage.setItem("afval_queeste_sport", JSON.stringify(updated));
    setTodaySports(db.getSportEntries(selectedDate));
    onUpdate();
  };

  const totalCalories = todaySports.reduce((sum, s) => sum + s.calories, 0);

  return (
    <Card className="border-2">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Activity className="w-6 h-6 text-primary" />
          </div>
          <div>
            <CardTitle className="text-2xl">Sport & Activiteit</CardTitle>
            <CardDescription>Netto calorieën verbruikt vandaag</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="time" className="text-sm font-semibold">Tijd</Label>
              <Input
                id="time"
                type="time"
                value={formData.time}
                onChange={(e) => handleChange("time", e.target.value)}
                className={errors.time ? "border-destructive" : ""}
              />
              {errors.time && <p className="text-sm text-destructive">{errors.time}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="calories" className="text-sm font-semibold">Calorieën (kcal)</Label>
              <Input
                id="calories"
                type="number"
                step="1"
                placeholder="350"
                value={formData.calories}
                onChange={(e) => handleChange("calories", e.target.value)}
                className={errors.calories ? "border-destructive" : ""}
              />
              {errors.calories && <p className="text-sm text-destructive">{errors.calories}</p>}
            </div>
          </div>

          <Button type="submit" className="gap-2">
            <Plus className="w-4 h-4" />
            Toevoegen
          </Button>
        </form>

        {todaySports.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b pb-2">
              <h4 className="font-semibold">Vandaag</h4>
              <p className="text-lg font-bold tabular-nums text-accent">
                {totalCalories} <span className="text-sm font-normal text-muted-foreground">kcal</span>
              </p>
            </div>
            <div className="space-y-2">
              {todaySports.map((sport) => (
                <div key={sport.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium">{sport.time}</p>
                    <p className="text-lg font-bold tabular-nums">{sport.calories} kcal</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(sport.id)}
                    className="h-9 w-9 hover:bg-destructive/10 hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}