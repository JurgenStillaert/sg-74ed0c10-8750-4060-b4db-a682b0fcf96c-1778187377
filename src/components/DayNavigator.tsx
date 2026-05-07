"use client";

import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface DayNavigatorProps {
  currentDate: string;
  onDateChange: (date: string) => void;
}

export function DayNavigator({ currentDate, onDateChange }: DayNavigatorProps) {
  const handlePrevDay = () => {
    const date = new Date(currentDate);
    date.setDate(date.getDate() - 1);
    onDateChange(date.toISOString().split("T")[0]);
  };

  const handleNextDay = () => {
    const date = new Date(currentDate);
    date.setDate(date.getDate() + 1);
    const today = new Date().toISOString().split("T")[0];
    if (date.toISOString().split("T")[0] <= today) {
      onDateChange(date.toISOString().split("T")[0]);
    }
  };

  const handleToday = () => {
    onDateChange(new Date().toISOString().split("T")[0]);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("nl-NL", { 
      weekday: "long", 
      year: "numeric", 
      month: "long", 
      day: "numeric" 
    });
  };

  const isToday = currentDate === new Date().toISOString().split("T")[0];

  return (
    <div className="flex items-center justify-between gap-4 p-4 bg-card border-2 rounded-lg">
      <Button onClick={handlePrevDay} variant="outline" size="icon">
        <ChevronLeft className="w-5 h-5" />
      </Button>
      
      <div className="flex-1 text-center">
        <h2 className="text-2xl font-display capitalize">
          {formatDate(currentDate)}
        </h2>
      </div>

      <div className="flex gap-2">
        {!isToday && (
          <Button onClick={handleToday} variant="outline">
            Vandaag
          </Button>
        )}
        <Button 
          onClick={handleNextDay} 
          variant="outline" 
          size="icon"
          disabled={isToday}
        >
          <ChevronRight className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
}