"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { db, DailyWeighIn } from "@/lib/db";
import { TrendingDown, TrendingUp, Minus, Pencil, Trash2 } from "lucide-react";
import { useMemo } from "react";

export function WeighInHistory() {
  const [weighIns, setWeighIns] = useState<DailyWeighIn[]>(db.getWeighIns());
  const [editingId, setEditingId] = useState<string | null>(null);
  const avg7Days = db.getLast7DaysAverage();

  const latestChange = useMemo(() => {
    if (weighIns.length < 2) return null;
    const latest = weighIns[weighIns.length - 1];
    const previous = weighIns[weighIns.length - 2];
    const weightDiff = latest.weight - previous.weight;
    const fatDiff = latest.bodyFat - previous.bodyFat;
    return { weightDiff, fatDiff };
  }, [weighIns]);

  const handleDelete = (id: string) => {
    if (confirm("Weet je zeker dat je deze weging wilt verwijderen?")) {
      const updated = weighIns.filter((w) => w.id !== id);
      if (typeof window !== "undefined") {
        localStorage.setItem("afval_queeste_weigh_ins", JSON.stringify(updated));
      }
      setWeighIns(updated);
      window.location.reload();
    }
  };

  const handleEdit = (weighIn: DailyWeighIn) => {
    setEditingId(weighIn.id);
  };

  if (weighIns.length === 0) {
    return null;
  }

  const latest = weighIns[weighIns.length - 1];

  const getTrendIcon = (diff: number) => {
    if (diff < -0.1) return <TrendingDown className="w-5 h-5 text-accent" />;
    if (diff > 0.1) return <TrendingUp className="w-5 h-5 text-destructive" />;
    return <Minus className="w-5 h-5 text-muted-foreground" />;
  };

  return (
    <div className="space-y-6">
      <Card className="border-2">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">Laatste weging</CardTitle>
              <CardDescription>{new Date(latest.date).toLocaleDateString("nl-NL", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleEdit(latest)}
                className="h-9 w-9"
              >
                <Pencil className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleDelete(latest.id)}
                className="h-9 w-9 hover:bg-destructive/10 hover:text-destructive"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Gewicht</p>
              <div className="flex items-center gap-2">
                <p className="text-2xl font-bold tabular-nums">{latest.weight.toFixed(2)}</p>
                <span className="text-sm text-muted-foreground">kg</span>
                {latestChange && getTrendIcon(latestChange.weightDiff)}
              </div>
              {latestChange && (
                <p className="text-xs text-muted-foreground tabular-nums">
                  {latestChange.weightDiff > 0 ? "+" : ""}{latestChange.weightDiff.toFixed(2)} kg
                </p>
              )}
            </div>

            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Vetpercentage</p>
              <div className="flex items-center gap-2">
                <p className="text-2xl font-bold tabular-nums">{latest.bodyFat.toFixed(1)}</p>
                <span className="text-sm text-muted-foreground">%</span>
                {latestChange && getTrendIcon(latestChange.fatDiff)}
              </div>
              {latestChange && (
                <p className="text-xs text-muted-foreground tabular-nums">
                  {latestChange.fatDiff > 0 ? "+" : ""}{latestChange.fatDiff.toFixed(1)}%
                </p>
              )}
            </div>

            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">BMR</p>
              <div className="flex items-center gap-2">
                <p className="text-2xl font-bold tabular-nums">{latest.bmr}</p>
                <span className="text-sm text-muted-foreground">kcal</span>
              </div>
            </div>

            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Spiermassa</p>
              <div className="flex items-center gap-2">
                <p className="text-2xl font-bold tabular-nums">{latest.muscleMass.toFixed(1)}</p>
                <span className="text-sm text-muted-foreground">kg</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {avg7Days && weighIns.length >= 7 && (
        <Card className="border-2 bg-muted/30">
          <CardHeader>
            <CardTitle className="text-xl">7-daags gemiddelde</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Gewicht</p>
                <p className="text-xl font-bold tabular-nums">{avg7Days.weight?.toFixed(2)} <span className="text-sm font-normal">kg</span></p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Vetpercentage</p>
                <p className="text-xl font-bold tabular-nums">{avg7Days.bodyFat?.toFixed(1)} <span className="text-sm font-normal">%</span></p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">BMR</p>
                <p className="text-xl font-bold tabular-nums">{avg7Days.bmr?.toFixed(0)} <span className="text-sm font-normal">kcal</span></p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Spiermassa</p>
                <p className="text-xl font-bold tabular-nums">{avg7Days.muscleMass?.toFixed(1)} <span className="text-sm font-normal">kg</span></p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {editingId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={() => setEditingId(null)}>
          <div className="bg-background p-6 rounded-lg max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-bold mb-4">Weging bewerken</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Om een weging te corrigeren, verwijder deze en voer een nieuwe in met de juiste waarden.
            </p>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setEditingId(null)} className="flex-1">
                Annuleren
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  handleDelete(editingId);
                  setEditingId(null);
                }}
                className="flex-1"
              >
                Verwijderen
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}