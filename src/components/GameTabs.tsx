"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, BarChart3 } from "lucide-react";

export type GameTab = "achievements" | "analysis";

interface GameTabsProps {
  currentTab: GameTab;
  onTabChange: (tab: GameTab) => void;
  achievementsContent: React.ReactNode;
  analysisContent: React.ReactNode;
}

export function GameTabs({ currentTab, onTabChange, achievementsContent, analysisContent }: GameTabsProps) {
  return (
    <Tabs value={currentTab} onValueChange={(value) => onTabChange(value as GameTab)} className="w-full">
      <TabsList className="grid w-full grid-cols-2 h-auto bg-background">
        <TabsTrigger value="achievements" className="gap-2 py-3">
          <Trophy className="w-4 h-4" />
          <span className="hidden sm:inline">Verdiensten</span>
        </TabsTrigger>
        <TabsTrigger value="analysis" className="gap-2 py-3">
          <BarChart3 className="w-4 h-4" />
          <span className="hidden sm:inline">Analyse</span>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="achievements" className="mt-6">
        {achievementsContent}
      </TabsContent>

      <TabsContent value="analysis" className="mt-6">
        {analysisContent}
      </TabsContent>
    </Tabs>
  );
}