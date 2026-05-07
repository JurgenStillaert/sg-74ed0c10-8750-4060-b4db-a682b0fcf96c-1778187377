"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Scale, Activity, Utensils, TrendingUp } from "lucide-react";

interface DayTabsProps {
  date: string;
  weighInContent: React.ReactNode;
  sportContent: React.ReactNode;
  nutritionContent: React.ReactNode;
  statsContent: React.ReactNode;
  hasWeighIn: boolean;
}

export function DayTabs({ 
  date, 
  weighInContent, 
  sportContent, 
  nutritionContent, 
  statsContent,
  hasWeighIn 
}: DayTabsProps) {
  return (
    <Tabs defaultValue="weigh-in" className="w-full">
      <TabsList className="grid w-full grid-cols-4 h-auto relative z-10">
        <TabsTrigger value="weigh-in" className="gap-2 py-3">
          <Scale className="w-4 h-4" />
          <span className="hidden sm:inline">Weging</span>
        </TabsTrigger>
        <TabsTrigger value="sport" className="gap-2 py-3" disabled={!hasWeighIn}>
          <Activity className="w-4 h-4" />
          <span className="hidden sm:inline">Sport</span>
        </TabsTrigger>
        <TabsTrigger value="nutrition" className="gap-2 py-3" disabled={!hasWeighIn}>
          <Utensils className="w-4 h-4" />
          <span className="hidden sm:inline">Voeding</span>
        </TabsTrigger>
        <TabsTrigger value="stats" className="gap-2 py-3" disabled={!hasWeighIn}>
          <TrendingUp className="w-4 h-4" />
          <span className="hidden sm:inline">Statistieken</span>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="weigh-in" className="mt-6">
        {weighInContent}
      </TabsContent>

      <TabsContent value="sport" className="mt-6">
        {sportContent}
      </TabsContent>

      <TabsContent value="nutrition" className="mt-6">
        {nutritionContent}
      </TabsContent>

      <TabsContent value="stats" className="mt-6">
        {statsContent}
      </TabsContent>
    </Tabs>
  );
}