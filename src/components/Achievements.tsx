"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { db } from "@/lib/db";
import { Trophy, Flame, Target, TrendingDown, Award, Star } from "lucide-react";

interface Milestone {
  id: string;
  title: string;
  description: string;
  achieved: boolean;
  icon: typeof Trophy;
  message: string;
}

export function Achievements() {
  const [streak, setStreak] = useState(0);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [recentAchievement, setRecentAchievement] = useState<Milestone | null>(null);

  useEffect(() => {
    const goals = db.getGoals();
    const weighIns = db.getWeighIns();

    if (!goals || weighIns.length === 0) return;

    const currentStreak = calculateStreak(weighIns);
    setStreak(currentStreak);

    const totalLoss = goals.startWeight - weighIns[weighIns.length - 1].weight;
    const totalGoal = goals.startWeight - goals.goalWeight;
    const percentLost = (totalLoss / totalGoal) * 100;

    const achievedMilestones: Milestone[] = [
      {
        id: "first_weigh",
        title: "De Reis Begint",
        description: "Eerste weging gedaan",
        achieved: weighIns.length >= 1,
        icon: Star,
        message: "Je hebt de eerste stap gezet! 🎯",
      },
      {
        id: "streak_3",
        title: "Momentum Builder",
        description: "3 dagen streak",
        achieved: currentStreak >= 3,
        icon: Flame,
        message: "3 dagen op rij! Het wordt een gewoonte 🔥",
      },
      {
        id: "streak_7",
        title: "Week Warrior",
        description: "7 dagen streak",
        achieved: currentStreak >= 7,
        icon: Flame,
        message: "Een volle week! Onwijs goed bezig! 💪",
      },
      {
        id: "loss_5",
        title: "5% Bereikt",
        description: "5% gewichtsverlies",
        achieved: percentLost >= 5,
        icon: TrendingDown,
        message: "5% lichter! De resultaten zijn zichtbaar! 🌟",
      },
      {
        id: "loss_10",
        title: "10% Club",
        description: "10% gewichtsverlies",
        achieved: percentLost >= 10,
        icon: TrendingDown,
        message: "10% verloren! Jij bent een machine! 🚀",
      },
      {
        id: "halfway",
        title: "Halftime Hero",
        description: "Halverwege je doel",
        achieved: percentLost >= 50,
        icon: Target,
        message: "Halverwege! De finish is in zicht! 🎊",
      },
      {
        id: "loss_75",
        title: "Bijna Daar",
        description: "75% van je doel",
        achieved: percentLost >= 75,
        icon: Trophy,
        message: "75% bereikt! De laatste loodjes wegen het zwaarst! 💎",
      },
      {
        id: "goal_reached",
        title: "KAMPIOEN!",
        description: "Doelgewicht bereikt",
        achieved: percentLost >= 100,
        icon: Award,
        message: "JE HEBT HET GEDAAN! Doelgewicht bereikt! 🏆👑",
      },
    ];

    setMilestones(achievedMilestones);

    const latestAchieved = achievedMilestones
      .filter((m) => m.achieved)
      .pop();
    if (latestAchieved && weighIns.length <= 3) {
      setRecentAchievement(latestAchieved);
    }
  }, []);

  const calculateStreak = (weighIns: typeof db.getWeighIns extends () => infer R ? R : never): number => {
    if (weighIns.length === 0) return 0;

    const sortedDates = weighIns.map((w) => new Date(w.date)).sort((a, b) => b.getTime() - a.getTime());
    let streak = 1;
    let currentDate = sortedDates[0];

    for (let i = 1; i < sortedDates.length; i++) {
      const prevDate = sortedDates[i];
      const daysDiff = Math.floor((currentDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));

      if (daysDiff === 1) {
        streak++;
        currentDate = prevDate;
      } else {
        break;
      }
    }

    return streak;
  };

  const streakColor = streak >= 7 ? "text-accent" : streak >= 3 ? "text-primary" : "text-muted-foreground";

  return (
    <div className="space-y-6">
      {recentAchievement && (
        <div className="relative overflow-hidden bg-gradient-to-r from-primary via-accent to-primary bg-[length:200%_100%] animate-[shimmer_3s_ease-in-out_infinite] p-[2px] rounded-lg">
          <div className="bg-background rounded-lg p-6 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent/20 mb-4 animate-pulse">
              <recentAchievement.icon className="w-8 h-8 text-accent" />
            </div>
            <h3 className="text-2xl font-display text-primary mb-2">{recentAchievement.title}</h3>
            <p className="text-lg text-accent-foreground">{recentAchievement.message}</p>
          </div>
        </div>
      )}

      <Card className="border-2 border-primary/20">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <Flame className={`w-6 h-6 ${streakColor} ${streak >= 3 ? "animate-pulse" : ""}`} />
            Huidige Streak
          </CardTitle>
          <CardDescription>Aaneengesloten dagen met metingen</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center">
            <p className={`text-6xl font-display ${streakColor} tabular-nums`}>{streak}</p>
            <p className="text-muted-foreground mt-2">dagen 🔥</p>
            {streak >= 7 && (
              <Badge variant="default" className="mt-4 bg-accent text-accent-foreground">
                Week Warrior! Keep it up! 💪
              </Badge>
            )}
            {streak >= 3 && streak < 7 && (
              <Badge variant="default" className="mt-4">
                Lekker bezig! Ga zo door! 🚀
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="border-2 border-accent/20">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <Trophy className="w-6 h-6 text-accent" />
            Achievements
          </CardTitle>
          <CardDescription>Jouw behaalde mijlpalen</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3">
            {milestones.map((milestone) => {
              const Icon = milestone.icon;
              return (
                <div
                  key={milestone.id}
                  className={`flex items-center gap-4 p-4 rounded-lg border-2 transition-all ${
                    milestone.achieved
                      ? "bg-accent/10 border-accent shadow-lg shadow-accent/20"
                      : "bg-muted/30 border-muted opacity-50"
                  }`}
                >
                  <div className={`flex items-center justify-center w-12 h-12 rounded-full ${milestone.achieved ? "bg-accent/20" : "bg-muted"}`}>
                    <Icon className={`w-6 h-6 ${milestone.achieved ? "text-accent" : "text-muted-foreground"}`} />
                  </div>
                  <div className="flex-1">
                    <h4 className={`font-semibold ${milestone.achieved ? "text-foreground" : "text-muted-foreground"}`}>
                      {milestone.title}
                    </h4>
                    <p className="text-sm text-muted-foreground">{milestone.description}</p>
                  </div>
                  {milestone.achieved && (
                    <Badge variant="default" className="bg-accent text-accent-foreground">
                      Behaald! ✓
                    </Badge>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}