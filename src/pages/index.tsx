"use client";

import { useState, useEffect } from "react";
import { SEO } from "@/components/SEO";
import { GoalSetup } from "@/components/GoalSetup";
import { DailyWeighIn } from "@/components/DailyWeighIn";
import { WeighInHistory } from "@/components/WeighInHistory";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function Home() {
  const [hasGoals, setHasGoals] = useState<boolean | null>(null);
  const [showWeighInForm, setShowWeighInForm] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const goals = db.getGoals();
    setHasGoals(!!goals);
  }, []);

  const handleGoalsComplete = () => {
    setHasGoals(true);
  };

  const handleWeighInComplete = () => {
    setShowWeighInForm(false);
    setRefreshKey((prev) => prev + 1);
  };

  const today = new Date().toISOString().split("T")[0];
  const todayWeighIn = db.getWeighIns().find((w) => w.date === today);

  if (hasGoals === null) {
    return null;
  }

  if (!hasGoals) {
    return (
      <>
        <SEO
          title="Afval-Queeste - Jouw gewichtsverlies journey"
          description="Track je voortgang, behaal je doelen en vier je successen"
        />
        <GoalSetup onComplete={handleGoalsComplete} />
      </>
    );
  }

  return (
    <>
      <SEO
        title="Dashboard - Afval-Queeste"
        description="Volg je dagelijkse voortgang en behaal je doelen"
      />
      <div className="min-h-screen bg-background p-4 md:p-8">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="flex items-center justify-between">
            <h1 className="text-4xl md:text-5xl font-display text-primary">Afval-Queeste</h1>
            {!todayWeighIn && !showWeighInForm && (
              <Button
                onClick={() => setShowWeighInForm(true)}
                size="lg"
                className="gap-2"
              >
                <Plus className="w-5 h-5" />
                Nieuwe weging
              </Button>
            )}
          </div>

          {showWeighInForm && (
            <div className="flex justify-center">
              <DailyWeighIn onComplete={handleWeighInComplete} />
            </div>
          )}

          {todayWeighIn && (
            <div className="bg-accent/10 border-2 border-accent rounded-lg p-6 text-center">
              <p className="text-lg font-semibold text-accent-foreground">
                ✓ Je hebt vandaag al gewogen!
              </p>
            </div>
          )}

          <div key={refreshKey}>
            <WeighInHistory />
          </div>
        </div>
      </div>
    </>
  );
}