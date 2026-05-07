"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { GamepadIcon, Calendar, Settings } from "lucide-react";

export type NavigationTab = "game" | "calendar" | "admin";

interface NavigationProps {
  currentTab: NavigationTab;
  onTabChange: (tab: NavigationTab) => void;
}

export function Navigation({ currentTab, onTabChange }: NavigationProps) {
  return (
    <div className="border-b-2 border-border bg-card">
      <div className="max-w-6xl mx-auto">
        <nav className="flex gap-2 p-4">
          <Button
            variant={currentTab === "game" ? "default" : "ghost"}
            onClick={() => onTabChange("game")}
            className="gap-2"
            size="lg"
          >
            <GamepadIcon className="w-5 h-5" />
            Het Spel
          </Button>
          <Button
            variant={currentTab === "calendar" ? "default" : "ghost"}
            onClick={() => onTabChange("calendar")}
            className="gap-2"
            size="lg"
          >
            <Calendar className="w-5 h-5" />
            Kalender Overzicht
          </Button>
          <Button
            variant={currentTab === "admin" ? "default" : "ghost"}
            onClick={() => onTabChange("admin")}
            className="gap-2"
            size="lg"
          >
            <Settings className="w-5 h-5" />
            Admin
          </Button>
        </nav>
      </div>
    </div>
  );
}