"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { db } from "@/lib/db";
import { Target, Utensils, Dumbbell } from "lucide-react";

interface RingProps {
  value: number;
  max: number;
  color: string;
  label: string;
  icon: typeof Target;
}

function ProgressRing({ value, max, color, label, icon: Icon }: RingProps) {
  const percentage = Math.min((value / max) * 100, 100);
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  const isComplete = percentage >= 100;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-32 h-32">
        <svg className="w-32 h-32 -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            className="text-muted/30"
          />
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className={`${color} transition-all duration-500 ${isComplete ? "animate-pulse" : ""}`}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <Icon className={`w-6 h-6 mx-auto mb-1 ${color}`} />
            <p className="text-sm font-bold tabular-nums">{percentage.toFixed(0)}%</p>
          </div>
        </div>
      </div>
      <div className="text-center">
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-muted-foreground tabular-nums">
          {value.toFixed(0)} / {max.toFixed(0)}
        </p>
      </div>
      {isComplete && (
        <div className="text-xs font-semibold text-accent">Doel behaald! ✓</div>
      )}
    </div>
  );
}

export function ProgressRings() {
  const today = new Date().toISOString().split("T")[0];
  const goals = db.getGoals();
  const stats = db.calculateDailyStats(today);

  if (!goals || !stats) {
    return null;
  }

  const proteinGoal = 1.6;
  const deficitGoal = 500;

  return (
    <Card className="border-2 border-primary/20">
      <CardHeader>
        <CardTitle className="text-2xl flex items-center gap-2">
          <Target className="w-6 h-6 text-primary" />
          Dagelijkse Doelen
        </CardTitle>
        <CardDescription>Vandaag&apos;s voortgang naar je doelen</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-6">
          <ProgressRing
            value={stats.proteinPerKg}
            max={proteinGoal}
            color="text-accent"
            label="Eiwit"
            icon={Utensils}
          />
          <ProgressRing
            value={stats.deficit}
            max={deficitGoal}
            color="text-primary"
            label="Deficit"
            icon={Target}
          />
          <ProgressRing
            value={stats.totalExpenditure - stats.totalIntake}
            max={deficitGoal}
            color="text-accent"
            label="Sport"
            icon={Dumbbell}
          />
        </div>
      </CardContent>
    </Card>
  );
}