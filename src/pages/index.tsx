"use client";

import { useState, useEffect } from "react";
import { SEO } from "@/components/SEO";
import { GoalSetup } from "@/components/GoalSetup";
import { db } from "@/lib/db";

export default function Home() {
  const [hasGoals, setHasGoals] = useState<boolean | null>(null);

  useEffect(() => {
    const goals = db.getGoals();
    setHasGoals(!!goals);
  }, []);

  const handleGoalsComplete = () => {
    setHasGoals(true);
  };

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
      <div className="min-h-screen bg-background p-8">
        <h1 className="text-4xl font-display mb-4">Dashboard (coming soon)</h1>
        <p className="text-muted-foreground">Je hebt je doelen ingesteld! Dashboard wordt nu gebouwd.</p>
      </div>
    </>
  );
}