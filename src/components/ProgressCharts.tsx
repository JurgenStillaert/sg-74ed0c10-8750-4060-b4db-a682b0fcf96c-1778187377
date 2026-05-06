"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { db } from "@/lib/db";
import { useMemo } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from "recharts";
import { TrendingDown, Calendar, Target } from "lucide-react";

export function ProgressCharts() {
  const goals = db.getGoals();
  const weighIns = db.getWeighIns();

  const chartData = useMemo(() => {
    if (!goals || weighIns.length === 0) return null;

    const startDate = new Date(weighIns[0].date);
    const endDate = new Date(goals.endDate);
    const today = new Date();

    const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const weightToLose = goals.startWeight - goals.goalWeight;
    const dailyWeightLoss = weightToLose / totalDays;

    const data = [];
    const latestWeighIn = weighIns[weighIns.length - 1];
    const latestDate = new Date(latestWeighIn.date);

    for (let i = 0; i <= totalDays; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(currentDate.getDate() + i);
      const dateStr = currentDate.toISOString().split("T")[0];

      const idealWeight = goals.startWeight - (dailyWeightLoss * i);
      const actualWeighIn = weighIns.find((w) => w.date === dateStr);

      if (currentDate <= latestDate) {
        data.push({
          date: dateStr,
          dateDisplay: currentDate.toLocaleDateString("nl-NL", { day: "2-digit", month: "short" }),
          ideal: parseFloat(idealWeight.toFixed(2)),
          actual: actualWeighIn?.weight || null,
          bodyFat: actualWeighIn?.bodyFat || null,
        });
      } else if (currentDate <= endDate) {
        data.push({
          date: dateStr,
          dateDisplay: currentDate.toLocaleDateString("nl-NL", { day: "2-digit", month: "short" }),
          ideal: parseFloat(idealWeight.toFixed(2)),
          actual: null,
          bodyFat: null,
        });
      }
    }

    return data;
  }, [goals, weighIns]);

  const estimatedEndDate = useMemo(() => {
    if (!goals || weighIns.length < 7) return null;

    const last7 = weighIns.slice(-7);
    const avgWeightLoss = (last7[0].weight - last7[last7.length - 1].weight) / 7;

    if (avgWeightLoss <= 0) return null;

    const latestWeight = weighIns[weighIns.length - 1].weight;
    const remainingWeight = latestWeight - goals.goalWeight;
    const daysRemaining = Math.ceil(remainingWeight / avgWeightLoss);

    const estimated = new Date(weighIns[weighIns.length - 1].date);
    estimated.setDate(estimated.getDate() + daysRemaining);

    return estimated;
  }, [goals, weighIns]);

  const bodyComposition = useMemo(() => {
    if (weighIns.length === 0) return null;

    const latest = weighIns[weighIns.length - 1];
    const fatMass = (latest.weight * latest.bodyFat) / 100;
    const muscleMass = latest.muscleMass;
    const otherMass = latest.weight - fatMass - muscleMass;

    return {
      fat: parseFloat(fatMass.toFixed(2)),
      fatPct: latest.bodyFat,
      muscle: parseFloat(muscleMass.toFixed(2)),
      musclePct: parseFloat(((muscleMass / latest.weight) * 100).toFixed(1)),
      other: parseFloat(otherMass.toFixed(2)),
      otherPct: parseFloat(((otherMass / latest.weight) * 100).toFixed(1)),
    };
  }, [weighIns]);

  if (!goals || !chartData) {
    return null;
  }

  const targetDate = new Date(goals.endDate);
  const daysToTarget = Math.ceil((targetDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

  const totalDeficitNeeded = db.getTotalDeficitNeeded();
  const totalDeficitAchieved = db.getTotalDeficitAchieved();
  
  const deficitChartData = useMemo(() => {
    const dayStatuses = db.getDayStatuses();
    if (dayStatuses.length === 0) return [];

    let accumulated = 0;
    return dayStatuses.map((status) => {
      accumulated += Math.max(0, status.deficit);
      const date = new Date(status.date);
      return {
        date: status.date,
        dateDisplay: date.toLocaleDateString("nl-NL", { day: "2-digit", month: "short" }),
        deficit: Math.round(accumulated),
        classification: status.classification,
      };
    });
  }, []);

  return (
    <div className="space-y-6">
      {deficitChartData.length > 0 && (
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <TrendingDown className="w-6 h-6 text-primary" />
              Cumulatief Calorie Deficit
            </CardTitle>
            <CardDescription>
              Je totale opgebouwde deficit sinds start
              {totalDeficitNeeded && (
                <span className="ml-2 font-semibold">
                  ({totalDeficitAchieved.toFixed(0)} / {totalDeficitNeeded.toFixed(0)} kcal)
                </span>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={deficitChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="dateDisplay"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickLine={false}
                />
                <YAxis
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickLine={false}
                  label={{ value: "kcal", angle: -90, position: "insideLeft" }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "0.5rem",
                  }}
                  formatter={(value: number) => [`${value.toFixed(0)} kcal`, "Cumulatief Deficit"]}
                />
                <Area
                  type="monotone"
                  dataKey="deficit"
                  name="Cumulatief Deficit"
                  stroke="hsl(var(--primary))"
                  fill="hsl(var(--primary) / 0.2)"
                  strokeWidth={3}
                />
              </AreaChart>
            </ResponsiveContainer>
            {totalDeficitNeeded && (
              <div className="mt-4 p-4 bg-accent/10 border-2 border-accent rounded-lg">
                <p className="text-sm font-semibold">
                  Voortgang: {((totalDeficitAchieved / totalDeficitNeeded) * 100).toFixed(1)}% van totaal doel bereikt
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Card className="border-2">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <TrendingDown className="w-6 h-6 text-primary" />
            Voortgang Grafiek
          </CardTitle>
          <CardDescription>Ideaal vs werkelijk gewicht</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis
                dataKey="dateDisplay"
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
              />
              <YAxis
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                domain={["dataMin - 2", "dataMax + 2"]}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "0.5rem",
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="ideal"
                name="Ideaal"
                stroke="hsl(var(--muted-foreground))"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="actual"
                name="Werkelijk"
                stroke="hsl(var(--primary))"
                strokeWidth={3}
                dot={{ fill: "hsl(var(--primary))", r: 4 }}
                connectNulls={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <Calendar className="w-5 h-5 text-accent" />
              Geschatte Einddatum
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-muted/30 rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Doel datum</p>
                <p className="text-xl font-bold">
                  {targetDate.toLocaleDateString("nl-NL", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {daysToTarget > 0 ? `Nog ${daysToTarget} dagen` : "Deadline bereikt"}
                </p>
              </div>

              {estimatedEndDate && (
                <div className="p-4 bg-accent/10 border-2 border-accent rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Geschatte einddatum (o.b.v. 7-daags gemiddelde)</p>
                  <p className="text-xl font-bold text-accent-foreground">
                    {estimatedEndDate.toLocaleDateString("nl-NL", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
                  </p>
                  {estimatedEndDate < targetDate && (
                    <p className="text-sm text-accent font-semibold mt-2">
                      🎯 Je ligt voor op schema!
                    </p>
                  )}
                  {estimatedEndDate > targetDate && (
                    <p className="text-sm text-destructive font-semibold mt-2">
                      ⚠️ Je ligt achter op schema
                    </p>
                  )}
                </div>
              )}

              {!estimatedEndDate && weighIns.length < 7 && (
                <div className="p-4 bg-muted/30 rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    Nog geen schatting mogelijk - minimaal 7 dagen data nodig
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {bodyComposition && (
          <Card className="border-2">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <Target className="w-5 h-5 text-primary" />
                Lichaamssamenstelling
              </CardTitle>
              <CardDescription>Huidige verdeling</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Vet</span>
                    <span className="text-sm font-bold tabular-nums">{bodyComposition.fat} kg ({bodyComposition.fatPct}%)</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-3">
                    <div
                      className="bg-destructive h-3 rounded-full"
                      style={{ width: `${bodyComposition.fatPct}%` }}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Spieren</span>
                    <span className="text-sm font-bold tabular-nums">{bodyComposition.muscle} kg ({bodyComposition.musclePct}%)</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-3">
                    <div
                      className="bg-accent h-3 rounded-full"
                      style={{ width: `${bodyComposition.musclePct}%` }}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Overig (botten, organen, water)</span>
                    <span className="text-sm font-bold tabular-nums">{bodyComposition.other} kg ({bodyComposition.otherPct}%)</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-3">
                    <div
                      className="bg-primary h-3 rounded-full"
                      style={{ width: `${bodyComposition.otherPct}%` }}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {weighIns.length >= 7 && (
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="text-xl">Vetpercentage Trend</CardTitle>
            <CardDescription>Afgelopen 30 dagen</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={chartData.slice(-30)}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="dateDisplay"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickLine={false}
                />
                <YAxis
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "0.5rem",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="bodyFat"
                  name="Vetpercentage"
                  stroke="hsl(var(--accent))"
                  fill="hsl(var(--accent) / 0.2)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
}