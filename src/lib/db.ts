export interface UserGoals {
  startWeight: number;
  goalWeight: number;
  startBodyFat: number;
  goalBodyFat: number;
  startDate: string;
  endDate: string;
  createdAt: string;
}

export type DayClassification = "green" | "red" | "joker";

export interface DayStatus {
  date: string;
  classification: DayClassification;
  deficit: number;
  totalExpenditure: number;
  totalIntake: number;
}

export interface DailyWeighIn {
  id: string;
  date: string;
  weight: number;
  bodyFat: number;
  bmr: number;
  muscleMass: number;
}

export interface SportEntry {
  id: string;
  date: string;
  time: string;
  calories: number;
}

export interface NutritionEntry {
  id: string;
  date: string;
  calories: number;
  fat: number;
  carbs: number;
  protein: number;
}

export interface DailyCalculations {
  date: string;
  totalExpenditure: number;
  totalIntake: number;
  deficit: number;
  proteinPerKg: number;
  estimatedFatLoss: number;
}

const STORAGE_KEYS = {
  GOALS: "afval_queeste_goals",
  WEIGH_INS: "afval_queeste_weigh_ins",
  SPORT: "afval_queeste_sport",
  NUTRITION: "afval_queeste_nutrition",
  DAY_STATUS: "afval_queeste_day_status",
};

export const db = {
  saveGoals: (goals: UserGoals) => {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(goals));
    }
  },

  getGoals: (): UserGoals | null => {
    if (typeof window === "undefined") return null;
    const data = localStorage.getItem(STORAGE_KEYS.GOALS);
    return data ? JSON.parse(data) : null;
  },

  saveWeighIn: (weighIn: DailyWeighIn) => {
    if (typeof window === "undefined") return;
    const weighIns = db.getWeighIns();
    const existing = weighIns.findIndex((w) => w.date.split("T")[0] === weighIn.date.split("T")[0]);
    if (existing >= 0) {
      weighIns[existing] = weighIn;
    } else {
      weighIns.push(weighIn);
    }
    weighIns.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    localStorage.setItem(STORAGE_KEYS.WEIGH_INS, JSON.stringify(weighIns));
    
    // Update DayStatus after saving weigh-in
    db.updateDayStatus(weighIn.date);
  },

  getWeighIns: (): DailyWeighIn[] => {
    if (typeof window === "undefined") return [];
    const data = localStorage.getItem(STORAGE_KEYS.WEIGH_INS);
    return data ? JSON.parse(data) : [];
  },

  saveSportEntry: (entry: SportEntry) => {
    if (typeof window === "undefined") return;
    const entries = db.getSportEntries();
    entries.push(entry);
    entries.sort((a, b) => {
      const dateCompare = new Date(a.date).getTime() - new Date(b.date).getTime();
      if (dateCompare !== 0) return dateCompare;
      return a.time.localeCompare(b.time);
    });
    localStorage.setItem(STORAGE_KEYS.SPORT, JSON.stringify(entries));
    
    // Update DayStatus after saving sport entry
    db.updateDayStatus(entry.date);
  },

  getSportEntries: (date?: string): SportEntry[] => {
    if (typeof window === "undefined") return [];
    const data = localStorage.getItem(STORAGE_KEYS.SPORT);
    const entries: SportEntry[] = data ? JSON.parse(data) : [];
    return date ? entries.filter((e) => e.date.split("T")[0] === date.split("T")[0]) : entries;
  },

  saveNutrition: (nutrition: NutritionEntry) => {
    if (typeof window === "undefined") return;
    const entries = db.getNutritionEntries();
    const existing = entries.findIndex((n) => n.date.split("T")[0] === nutrition.date.split("T")[0]);
    if (existing >= 0) {
      entries[existing] = nutrition;
    } else {
      entries.push(nutrition);
    }
    entries.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    localStorage.setItem(STORAGE_KEYS.NUTRITION, JSON.stringify(entries));
    
    // Update DayStatus after saving nutrition
    db.updateDayStatus(nutrition.date);
  },

  getNutritionEntries: (): NutritionEntry[] => {
    if (typeof window === "undefined") return [];
    const data = localStorage.getItem(STORAGE_KEYS.NUTRITION);
    return data ? JSON.parse(data) : [];
  },

  calculateDailyStats: (date: string): DailyCalculations | null => {
    const weighIn = db.getWeighIns().find((w) => w.date.split("T")[0] === date.split("T")[0]);
    const sportEntries = db.getSportEntries(date);
    const nutrition = db.getNutritionEntries().find((n) => n.date.split("T")[0] === date.split("T")[0]);

    if (!weighIn) return null;

    const sportCalories = sportEntries.reduce((sum, e) => sum + e.calories, 0);
    const totalExpenditure = weighIn.bmr * 1.25 + sportCalories;
    const totalIntake = nutrition?.calories || 0;
    const deficit = totalExpenditure - totalIntake;
    const proteinPerKg = nutrition ? nutrition.protein / weighIn.weight : 0;
    const estimatedFatLoss = deficit / 7700;

    return {
      date,
      totalExpenditure,
      totalIntake,
      deficit,
      proteinPerKg,
      estimatedFatLoss,
    };
  },

  getLast7DaysAverage: (): Partial<DailyWeighIn> | null => {
    const weighIns = db.getWeighIns();
    if (weighIns.length === 0) return null;

    const last7 = weighIns.slice(-7);
    const avg = {
      weight: last7.reduce((sum, w) => sum + w.weight, 0) / last7.length,
      bodyFat: last7.reduce((sum, w) => sum + w.bodyFat, 0) / last7.length,
      bmr: last7.reduce((sum, w) => sum + w.bmr, 0) / last7.length,
      muscleMass: last7.reduce((sum, w) => sum + w.muscleMass, 0) / last7.length,
    };

    return avg;
  },

  saveDayStatus: (status: DayStatus) => {
    if (typeof window === "undefined") return;
    const statuses = db.getDayStatuses();
    const existing = statuses.findIndex((s) => s.date.split("T")[0] === status.date.split("T")[0]);
    if (existing >= 0) {
      statuses[existing] = status;
    } else {
      statuses.push(status);
    }
    statuses.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    localStorage.setItem(STORAGE_KEYS.DAY_STATUS, JSON.stringify(statuses));
  },

  getDayStatuses: (): DayStatus[] => {
    if (typeof window === "undefined") return [];
    const data = localStorage.getItem(STORAGE_KEYS.DAY_STATUS);
    return data ? JSON.parse(data) : [];
  },

  getDayStatus: (date: string): DayStatus | null => {
    const statuses = db.getDayStatuses();
    return statuses.find((s) => s.date.split("T")[0] === date.split("T")[0]) || null;
  },

  getYearStats: () => {
    const statuses = db.getDayStatuses();
    const greenDays = statuses.filter((s) => s.classification === "green").length;
    const redDays = statuses.filter((s) => s.classification === "red").length;
    const jokersUsed = statuses.filter((s) => s.classification === "joker").length;

    const today = new Date();
    const startOfYear = new Date(today.getFullYear(), 0, 1);
    const endOfYear = new Date(today.getFullYear(), 11, 31);
    const totalDaysInYear = Math.ceil((endOfYear.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    const daysPassed = Math.ceil((today.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    const daysRemaining = totalDaysInYear - daysPassed;

    const allowedRedDays = Math.floor(totalDaysInYear * 0.2);
    const redDaysBudget = Math.max(0, allowedRedDays - redDays);

    return {
      greenDays,
      redDays,
      jokersUsed,
      daysPassed,
      daysRemaining,
      allowedRedDays,
      redDaysBudget,
      totalDaysInYear,
    };
  },

  getTotalDeficitNeeded: (): number | null => {
    const goals = db.getGoals();
    if (!goals) return null;
    
    // Calculate current fat mass
    const currentFatMass = Math.round((goals.startWeight * (goals.startBodyFat / 100)) * 100) / 100;
    
    // Calculate desired fat mass at START weight (not goal weight!)
    const desiredFatMass = Math.round((goals.startWeight * (goals.goalBodyFat / 100)) * 100) / 100;
    
    // Calculate fat to lose
    const fatToLose = Math.round((currentFatMass - desiredFatMass) * 100) / 100;
    
    // Total deficit needed (7700 kcal per kg fat)
    return fatToLose * 7700;
  },

  getTotalDeficitAchieved: (): number => {
    const statuses = db.getDayStatuses();
    return statuses.reduce((sum, s) => sum + Math.max(0, s.deficit), 0);
  },

  updateDayStatus: (date: string) => {
    if (typeof window === "undefined") return;
    
    const stats = db.calculateDailyStats(date);
    if (!stats) return; // No weigh-in for this day yet
    
    // Auto-classify the day based on deficit
    let classification: DayClassification = "green";
    if (stats.deficit < 0) {
      classification = "red";
    }
    
    const dayStatus: DayStatus = {
      date,
      classification,
      deficit: stats.deficit,
      totalExpenditure: stats.totalExpenditure,
      totalIntake: stats.totalIntake,
    };
    
    db.saveDayStatus(dayStatus);
  },
};