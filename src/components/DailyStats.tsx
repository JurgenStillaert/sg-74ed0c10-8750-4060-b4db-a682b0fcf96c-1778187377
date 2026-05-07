"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { db } from "@/lib/db";
import { TrendingDown, TrendingUp, Flame, Target } from "lucide-react";

interface DailyStatsProps {
  selectedDate?: string;
}

export function DailyStats({ selectedDate }: DailyStatsProps) {
  const today = new Date().toISOString().split("T")[0];
  const stats = db.calculateDailyStats(today);

  if (!stats) {
    return null;
  }

  const deficitPositive = stats.deficit > 0;
  const proteinAdequate = stats.proteinPerKg >= 1.6;

  return (
    <Card className="border-2 bg-gradient-to-br from-primary/5 to-accent/5">
      <CardHeader>
        <CardTitle className="text-2xl flex items-center gap-2">
          <Flame className="w-6 h-6 text-primary" />
          Dagelijkse Berekeningen
        </CardTitle>
        <CardDescription>Vandaag&apos;s energie balans</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-card rounded-lg border">
              <div>
                <p className="text-sm text-muted-foreground">Verbruikt</p>
                <p className="text-2xl font-bold tabular-nums">{stats.totalExpenditure.toFixed(0)}</p>
                <p className="text-xs text-muted-foreground">kcal</p>
              </div>
              <Flame className="w-8 h-8 text-primary" />
            </div>

            <div className="flex items-center justify-between p-4 bg-card rounded-lg border">
              <div>
                <p className="text-sm text-muted-foreground">Gegeten</p>
                <p className="text-2xl font-bold tabular-nums">{stats.totalIntake.toFixed(0)}</p>
                <p className="text-xs text-muted-foreground">kcal</p>
              </div>
              <Apple className="w-8 h-8 text-accent" />
            </div>
          </div>

          <div className="space-y-4">
            <div className={`flex items-center justify-between p-4 rounded-lg border-2 ${deficitPositive ? "bg-accent/10 border-accent" : "bg-destructive/10 border-destructive"}`}>
              <div>
                <p className="text-sm text-muted-foreground">Deficit</p>
                <p className="text-2xl font-bold tabular-nums">{deficitPositive ? "+" : ""}{stats.deficit.toFixed(0)}</p>
                <p className="text-xs text-muted-foreground">kcal</p>
              </div>
              {deficitPositive ? (
                <TrendingDown className="w-8 h-8 text-accent" />
              ) : (
                <TrendingUp className="w-8 h-8 text-destructive" />
              )}
            </div>

            <div className={`flex items-center justify-between p-4 rounded-lg border-2 ${proteinAdequate ? "bg-accent/10 border-accent" : "bg-muted border-muted"}`}>
              <div>
                <p className="text-sm text-muted-foreground">Eiwit</p>
                <p className="text-2xl font-bold tabular-nums">{stats.proteinPerKg.toFixed(1)}</p>
                <p className="text-xs text-muted-foreground">g/kg</p>
              </div>
              <Target className={`w-8 h-8 ${proteinAdequate ? "text-accent" : "text-muted-foreground"}`} />
            </div>
          </div>

          <div className="md:col-span-2 p-4 bg-card rounded-lg border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Geschat vetverlies vandaag</p>
                <p className="text-3xl font-bold tabular-nums text-primary">
                  {Math.abs(stats.estimatedFatLoss).toFixed(3)} <span className="text-lg font-normal text-muted-foreground">kg</span>
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">7700 kcal = 1kg vet</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {deficitPositive ? "Op schema! 💪" : "Surplus - geen vetverbranding"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function Apple({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M12 20.94c1.5 0 2.75 1.06 4 1.06 3 0 6-8 6-12.22A4.91 4.91 0 0 0 17 5c-2.22 0-4 1.44-5 2-1-.56-2.78-2-5-2a4.9 4.9 0 0 0-5 4.78C2 14 5 22 8 22c1.25 0 2.5-1.06 4-1.06Z" />
      <path d="M10 2c1 .5 2 2 2 5" />
    </svg>
  );
}