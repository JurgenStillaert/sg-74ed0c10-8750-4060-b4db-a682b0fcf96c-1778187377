"use client";

import { Button } from "@/components/ui/button";
import { Trophy, BarChart3 } from "lucide-react";

export type GameTab = "achievements" | "analysis";

interface GameTabsProps {
  currentTab: GameTab;
  onTabChange: (tab: GameTab) => void;
}

export function GameTabs({ currentTab, onTabChange }: GameTabsProps) {
  return (
    <div className="border-b-2 border-border/50">
      <div className="flex gap-2">
        <Button
          variant={currentTab === "achievements" ? "default" : "ghost"}
          onClick={() => onTabChange("achievements")}
          className="gap-2"
        >
          <Trophy className="w-4 h-4" />
          Verdiensten
        </Button>
        <Button
          variant={currentTab === "analysis" ? "default" : "ghost"}
          onClick={() => onTabChange("analysis")}
          className="gap-2"
        >
          <BarChart3 className="w-4 h-4" />
          Analyse
        </Button>
      </div>
    </div>
  );
}