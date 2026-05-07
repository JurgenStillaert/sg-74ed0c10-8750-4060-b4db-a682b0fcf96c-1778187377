"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { db, DayClassification } from "@/lib/db";
import { useMemo } from "react";
import { Calendar as CalendarIcon } from "lucide-react";

interface YearCalendarProps {
  onUpdate?: () => void;
}

export function YearCalendar({ onUpdate }: YearCalendarProps) {
  const [refreshKey, setRefreshKey] = useState(0);
  const dayStatuses = db.getDayStatuses();

  const handleDayClick = (dateStr: string) => {
    const currentStatus = db.getDayStatus(dateStr);
    let newClassification: DayClassification | null = null;

    // Cycle through: null -> green -> red -> joker -> null
    if (!currentStatus || currentStatus.classification === null) {
      newClassification = "green";
    } else if (currentStatus.classification === "green") {
      newClassification = "red";
    } else if (currentStatus.classification === "red") {
      newClassification = "joker";
    } else {
      // joker -> remove (back to null)
      newClassification = null;
    }

    if (newClassification === null) {
      // Remove the status
      const statuses = db.getDayStatuses().filter((s) => s.date !== dateStr);
      if (typeof window !== "undefined") {
        localStorage.setItem("afval_queeste_day_status", JSON.stringify(statuses));
      }
    } else {
      // Save the new classification (with default values for deficit data)
      const stats = db.calculateDailyStats(dateStr);
      db.saveDayStatus({
        date: dateStr,
        classification: newClassification,
        deficit: stats?.deficit || 0,
        totalExpenditure: stats?.totalExpenditure || 0,
        totalIntake: stats?.totalIntake || 0,
      });
    }

    // Trigger local re-render
    setRefreshKey(prev => prev + 1);
    // Notify parent if callback provided
    if (onUpdate) {
      onUpdate();
    }
  };

  const calendarData = useMemo(() => {
    const now = new Date();
    const currentYear = now.getFullYear();
    
    const getWeekNumber = (date: Date): number => {
      const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
      const dayNum = d.getUTCDay() || 7;
      d.setUTCDate(d.getUTCDate() + 4 - dayNum);
      const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
      return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
    };

    const generateCalendar = () => {
      const monthsData = [];
      
      for (let month = 0; month < 12; month++) {
        const firstDay = new Date(currentYear, month, 1);
        const lastDay = new Date(currentYear, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        
        // Get day of week (0=Sunday, 1=Monday, ..., 6=Saturday)
        // Adjust so Monday=0, Sunday=6
        let firstDayOfWeek = firstDay.getDay() - 1;
        if (firstDayOfWeek < 0) firstDayOfWeek = 6;
        
        const weeks: Array<{ weekNumber: number; days: Array<{ date: string; day: number; classification: DayClassification | null; isPast: boolean } | null> }> = [];
        let currentWeek: Array<{ date: string; day: number; classification: DayClassification | null; isPast: boolean } | null> = [];
        let currentWeekNumber = 0;
        
        // Fill in empty days before month starts
        for (let i = 0; i < firstDayOfWeek; i++) {
          currentWeek.push(null);
        }
        
        // Fill in the days of the month
        for (let day = 1; day <= daysInMonth; day++) {
          const date = new Date(currentYear, month, day);
          const dateStr = date.toISOString().split("T")[0];
          const isPast = date <= now;
          const status = dayStatuses.find((s) => s.date === dateStr);
          
          if (currentWeek.length === 0) {
            currentWeekNumber = getWeekNumber(date);
          }
          
          currentWeek.push({
            date: dateStr,
            day,
            classification: status?.classification || null,
            isPast,
          });
          
          // If week is complete (7 days), start new week
          if (currentWeek.length === 7) {
            weeks.push({ weekNumber: currentWeekNumber, days: [...currentWeek] });
            currentWeek = [];
          }
        }
        
        // Fill in remaining days of last week
        if (currentWeek.length > 0) {
          while (currentWeek.length < 7) {
            currentWeek.push(null);
          }
          weeks.push({ weekNumber: currentWeekNumber, days: currentWeek });
        }
        
        monthsData.push({
          name: new Date(currentYear, month).toLocaleDateString("nl-NL", { month: "long" }),
          weeks,
        });
      }
      
      return monthsData;
    };

    return generateCalendar();
  }, [dayStatuses, refreshKey]);

  const getColorClass = (classification: DayClassification | null, isPast: boolean): string => {
    if (!classification) {
      return isPast ? "bg-muted/50 text-muted-foreground" : "bg-background border border-border";
    }
    switch (classification) {
      case "green":
        return "bg-green-500 text-white font-semibold";
      case "red":
        return "bg-red-500 text-white font-semibold";
      case "joker":
        return "bg-amber-500 text-white font-semibold";
      default:
        return "bg-muted";
    }
  };

  return (
    <Card className="border-2">
      <CardHeader>
        <CardTitle className="text-2xl flex items-center gap-2">
          <CalendarIcon className="w-6 h-6 text-primary" />
          Jaaroverzicht {new Date().getFullYear()}
        </CardTitle>
        <CardDescription>
          <span className="inline-flex items-center gap-4">
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 bg-green-500 rounded"></span>
              Groen (deficit)
            </span>
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 bg-red-500 rounded"></span>
              Rood (geen deficit)
            </span>
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 bg-amber-500 rounded"></span>
              Joker (carb load)
            </span>
          </span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {calendarData.map((month, monthIndex) => (
            <div key={monthIndex} className="space-y-2">
              <h3 className="font-semibold text-sm capitalize text-center">{month.name}</h3>
              <div className="border rounded-lg p-2">
                <div className="grid grid-cols-8 gap-1 mb-2">
                  <div className="text-xs font-medium text-center text-muted-foreground">W</div>
                  <div className="text-xs font-medium text-center">Ma</div>
                  <div className="text-xs font-medium text-center">Di</div>
                  <div className="text-xs font-medium text-center">Wo</div>
                  <div className="text-xs font-medium text-center">Do</div>
                  <div className="text-xs font-medium text-center">Vr</div>
                  <div className="text-xs font-medium text-center">Za</div>
                  <div className="text-xs font-medium text-center">Zo</div>
                </div>
                {month.weeks.map((week, weekIndex) => (
                  <div key={weekIndex} className="grid grid-cols-8 gap-1">
                    <div className="text-xs font-medium text-center text-muted-foreground flex items-center justify-center">
                      {week.weekNumber}
                    </div>
                    {week.days.map((day, dayIndex) => (
                      <div
                        key={dayIndex}
                        className={`aspect-square flex items-center justify-center text-xs rounded transition-colors ${
                          day
                            ? `${getColorClass(day.classification, day.isPast)} ${day.isPast ? "cursor-pointer hover:ring-2 hover:ring-primary" : ""}`
                            : ""
                        }`}
                        onClick={() => day?.isPast && handleDayClick(day.date)}
                      >
                        {day?.day || ""}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}