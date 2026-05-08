"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { db } from "@/lib/db";
import { CheckCircle, XCircle, TrendingUp, Zap } from "lucide-react";

export function YearStats() {
  const stats = db.getYearStats();
  const totalDeficitNeeded = db.getTotalDeficitNeeded();
  const totalDeficitAchieved = db.getTotalDeficitAchieved();

  const deficitProgress = totalDeficitNeeded && totalDeficitAchieved
    ? (totalDeficitAchieved / totalDeficitNeeded) * 100
    : 0;

  return (
    <div className="space-y-6">
      <Card className="border-2 border-primary/20">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-primary" />
            Totaal Deficit Voortgang
          </CardTitle>
          <CardDescription>
            Je totale calorie deficit sinds start
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="font-medium">Behaald</span>
                <span className="font-bold tabular-nums">
                  {totalDeficitAchieved.toFixed(0)} / {totalDeficitNeeded?.toFixed(0) || 0} kcal
                </span>
              </div>
              <Progress value={deficitProgress} className="h-4" />
              <p className="text-xs text-muted-foreground mt-2">
                {deficitProgress.toFixed(1)}% van je totale doel bereikt
              </p>
            </div>
            
            {totalDeficitNeeded && (
              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Nog nodig</p>
                  <p className="text-2xl font-bold tabular-nums">
                    {(totalDeficitNeeded - totalDeficitAchieved).toFixed(0)}
                  </p>
                  <p className="text-xs text-muted-foreground">kcal deficit</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Gemiddeld per dag</p>
                  <p className="text-2xl font-bold tabular-nums">
                    {stats.daysRemaining > 0
                      ? ((totalDeficitNeeded - totalDeficitAchieved) / stats.daysRemaining).toFixed(0)
                      : 0}
                  </p>
                  <p className="text-xs text-muted-foreground">kcal/dag nodig</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="border-2 border-green-500/20">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              Groene Dagen
            </CardTitle>
            <CardDescription>Deficit behaald</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-green-600 tabular-nums">{stats.greenDays}</p>
            <p className="text-sm text-muted-foreground mt-2">
              {stats.daysPassed > 0 ? ((stats.greenDays / stats.daysPassed) * 100).toFixed(1) : 0}% van dit jaar
            </p>
          </CardContent>
        </Card>

        <Card className="border-2 border-red-500/20">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <XCircle className="w-5 h-5 text-red-600" />
              Rode Dagen
            </CardTitle>
            <CardDescription>Geen deficit</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-red-600 tabular-nums">{stats.redDays}</p>
            <p className="text-sm text-muted-foreground mt-2">
              Budget: {stats.redDaysBudget} van {stats.allowedRedDays} dagen over (80/20 regel)
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-2 border-amber-500/20">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-600" />
            Carb Load Dagen
          </CardTitle>
          <CardDescription>Jouw carb loading dagen voor wedstrijden</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-4xl font-bold text-amber-600 tabular-nums">
            {stats.jokersUsed}
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Dagen gebruikt dit jaar
          </p>
        </CardContent>
      </Card>
    </div>
  );
}