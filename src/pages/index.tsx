"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { SEO } from "@/components/SEO";
import { Navigation, NavigationTab } from "@/components/Navigation";
import { GameTabs, GameTab } from "@/components/GameTabs";
import { DayNavigator } from "@/components/DayNavigator";
import { DayTabs } from "@/components/DayTabs";
import { GoalSetup } from "@/components/GoalSetup";
import { DailyWeighIn } from "@/components/DailyWeighIn";
import { WeighInHistory } from "@/components/WeighInHistory";
import { SportLogger } from "@/components/SportLogger";
import { NutritionLogger } from "@/components/NutritionLogger";
import { DailyStats } from "@/components/DailyStats";
import { ProgressCharts } from "@/components/ProgressCharts";
import { Achievements } from "@/components/Achievements";
import { ProgressRings } from "@/components/ProgressRings";
import { YearCalendar } from "@/components/YearCalendar";
import { YearStats } from "@/components/YearStats";
import { db } from "@/lib/db";

export default function Home() {
  const router = useRouter();
  const [hasGoals, setHasGoals] = useState<boolean | null>(null);
  const [currentTab, setCurrentTab] = useState<NavigationTab>("game");
  const [gameTab, setGameTab] = useState<GameTab>("achievements");
  const [currentDate, setCurrentDate] = useState(new Date().toISOString().split("T")[0]);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const goals = db.getGoals();
    setHasGoals(!!goals);
  }, []);

  const handleGoalsComplete = () => {
    setHasGoals(true);
  };

  const handleDataChange = () => {
    setRefreshKey((prev) => prev + 1);
  };

  const handleTabChange = (tab: NavigationTab) => {
    if (tab === "admin") {
      router.push("/admin");
    } else {
      setCurrentTab(tab);
    }
  };

  const weighIn = db.getWeighIns().find((w) => w.date.split("T")[0] === currentDate);

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
        title="Afval-Queeste - Dashboard"
        description="Volg je dagelijkse voortgang en behaal je doelen"
      />
      
      <Navigation currentTab={currentTab} onTabChange={handleTabChange} />

      <div className="min-h-screen bg-background">
        {currentTab === "game" && (
          <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-8" key={refreshKey}>
            <h1 className="text-4xl md:text-5xl font-display text-primary">Afval-Queeste</h1>
            
            <DayNavigator currentDate={currentDate} onDateChange={setCurrentDate} />

            <GameTabs 
              currentTab={gameTab} 
              onTabChange={setGameTab}
              achievementsContent={
                <>
                  <DayTabs
                    date={currentDate}
                    hasWeighIn={!!weighIn}
                    weighInContent={
                      <div className="space-y-6">
                        {weighIn ? (
                          <div className="bg-accent/10 border-2 border-accent rounded-lg p-6">
                            <h3 className="text-lg font-semibold mb-2">Weging van {currentDate}</h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              <div>
                                <p className="text-muted-foreground">Gewicht</p>
                                <p className="text-xl font-semibold">{weighIn.weight.toFixed(2)} kg</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Vetpercentage</p>
                                <p className="text-xl font-semibold">{weighIn.bodyFat.toFixed(1)}%</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">BMR</p>
                                <p className="text-xl font-semibold">{weighIn.bmr.toFixed(0)} kcal</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Spiermassa</p>
                                <p className="text-xl font-semibold">{weighIn.muscleMass.toFixed(1)} kg</p>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <DailyWeighIn onComplete={handleDataChange} selectedDate={currentDate} />
                        )}
                        <WeighInHistory />
                      </div>
                    }
                    sportContent={
                      <SportLogger selectedDate={currentDate} onUpdate={handleDataChange} />
                    }
                    nutritionContent={
                      <NutritionLogger selectedDate={currentDate} onUpdate={handleDataChange} />
                    }
                    statsContent={
                      <div className="space-y-6">
                        <ProgressRings selectedDate={currentDate} />
                        <DailyStats selectedDate={currentDate} />
                      </div>
                    }
                  />
                  <Achievements />
                </>
              }
              analysisContent={
                <ProgressCharts />
              }
            />
          </div>
        )}

        {currentTab === "calendar" && (
          <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-6">
            <h1 className="text-4xl font-display text-primary">Kalender Overzicht</h1>
            <YearStats />
            <YearCalendar onUpdate={() => setRefreshKey((prev) => prev + 1)} />
          </div>
        )}
      </div>
    </>
  );
}