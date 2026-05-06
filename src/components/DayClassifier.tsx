"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { db, DayClassification } from "@/lib/db";
import { CheckCircle, XCircle, Zap } from "lucide-react";
import { useState, useEffect } from "react";

interface DayClassifierProps {
  date: string;
  onClassify: () => void;
}

export function DayClassifier({ date, onClassify }: DayClassifierProps) {
  const [currentClassification, setCurrentClassification] = useState<DayClassification | null>(null);

  useEffect(() => {
    const status = db.getDayStatus(date);
    setCurrentClassification(status?.classification || null);
  }, [date]);

  const handleClassify = (classification: DayClassification) => {
    const stats = db.calculateDailyStats(date);
    if (!stats) return;

    db.saveDayStatus({
      date,
      classification,
      deficit: stats.deficit,
      totalExpenditure: stats.totalExpenditure,
      totalIntake: stats.totalIntake,
    });

    setCurrentClassification(classification);
    onClassify();
  };

  const stats = db.calculateDailyStats(date);
  if (!stats) return null;

  const isGreen = stats.deficit > 0;

  return (
    <Card className="border-2">
      <CardHeader>
        <CardTitle className="text-xl">Classificeer deze dag</CardTitle>
        <CardDescription>
          Deficit: {stats.deficit.toFixed(0)} kcal
          {isGreen ? " ✅ Positief" : " ❌ Negatief"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-3">
          <Button
            variant={currentClassification === "green" ? "default" : "outline"}
            className={`flex flex-col gap-2 h-auto py-4 ${
              currentClassification === "green" ? "bg-green-600 hover:bg-green-700" : ""
            }`}
            onClick={() => handleClassify("green")}
          >
            <CheckCircle className="w-6 h-6" />
            <span className="text-sm font-semibold">Groen</span>
            <span className="text-xs">Deficit behaald</span>
          </Button>

          <Button
            variant={currentClassification === "red" ? "default" : "outline"}
            className={`flex flex-col gap-2 h-auto py-4 ${
              currentClassification === "red" ? "bg-red-600 hover:bg-red-700" : ""
            }`}
            onClick={() => handleClassify("red")}
          >
            <XCircle className="w-6 h-6" />
            <span className="text-sm font-semibold">Rood</span>
            <span className="text-xs">Geen deficit</span>
          </Button>

          <Button
            variant={currentClassification === "joker" ? "default" : "outline"}
            className={`flex flex-col gap-2 h-auto py-4 ${
              currentClassification === "joker" ? "bg-amber-600 hover:bg-amber-700" : ""
            }`}
            onClick={() => handleClassify("joker")}
          >
            <Zap className="w-6 h-6" />
            <span className="text-sm font-semibold">Joker</span>
            <span className="text-xs">Carb load</span>
          </Button>
        </div>

        {!isGreen && currentClassification === "green" && (
          <p className="text-sm text-destructive mt-4">
            ⚠️ Je hebt geen positief deficit maar markeert deze dag als groen
          </p>
        )}
      </CardContent>
    </Card>
  );
}