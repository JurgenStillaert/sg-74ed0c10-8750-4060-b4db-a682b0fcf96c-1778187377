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
    const today = new Date();
    const year = today.getFullYear();
    const months = [];

    for (let month = 0; month < 12; month++) {
      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);
      const daysInMonth = lastDay.getDate();
      const startDayOfWeek = firstDay.getDay();

      const days = [];
      
      for (let i = 0; i < startDayOfWeek; i++) {
        days.push(null);
      }

      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);
        const dateStr = date.toISOString().split("T")[0];
        const status = dayStatuses.find((s) => s.date === dateStr);
        const isPast = date <= today;
        
        days.push({
          day,
          date: dateStr,
          classification: status?.classification || null,
          isPast,
        });
      }

      months.push({
        name: firstDay.toLocaleDateString("nl-NL", { month: "long" }),
        days,
      });
    }

    return months;
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
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {calendarData.map((month, monthIndex) => (
            <div key={monthIndex} className="space-y-2">
              <h3 className="font-semibold text-center capitalize">{month.name}</h3>
              <div className="grid grid-cols-7 gap-1">
                {["Z", "M", "D", "W", "D", "V", "Z"].map((day, i) => (
                  <div key={i} className="text-center text-xs font-medium text-muted-foreground">
                    {day}
                  </div>
                ))}
                {month.days.map((day, dayIndex) => (
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
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}