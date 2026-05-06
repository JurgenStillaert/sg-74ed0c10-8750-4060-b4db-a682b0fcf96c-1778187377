export interface UserGoals {
  startWeight: number;
  goalWeight: number;
  startBodyFat: number;
  goalBodyFat: number;
  endDate: string;
  createdAt: string;
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
    const existing = weighIns.findIndex((w) => w.date === weighIn.date);
    if (existing >= 0) {
      weighIns[existing] = weighIn;
    } else {
      weighIns.push(weighIn);
    }
    weighIns.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    localStorage.setItem(STORAGE_KEYS.WEIGH_INS, JSON.stringify(weighIns));
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
  },

  getSportEntries: (date?: string): SportEntry[] => {
    if (typeof window === "undefined") return [];
    const data = localStorage.getItem(STORAGE_KEYS.SPORT);
    const entries: SportEntry[] = data ? JSON.parse(data) : [];
    return date ? entries.filter((e) => e.date === date) : entries;
  },

  saveNutrition: (nutrition: NutritionEntry) => {
    if (typeof window === "undefined") return;
    const entries = db.getNutritionEntries();
    const existing = entries.findIndex((n) => n.date === nutrition.date);
    if (existing >= 0) {
      entries[existing] = nutrition;
    } else {
      entries.push(nutrition);
    }
    entries.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    localStorage.setItem(STORAGE_KEYS.NUTRITION, JSON.stringify(entries));
  },

  getNutritionEntries: (): NutritionEntry[] => {
    if (typeof window === "undefined") return [];
    const data = localStorage.getItem(STORAGE_KEYS.NUTRITION);
    return data ? JSON.parse(data) : [];
  },

  calculateDailyStats: (date: string): DailyCalculations | null => {
    const weighIn = db.getWeighIns().find((w) => w.date === date);
    const sportEntries = db.getSportEntries(date);
    const nutrition = db.getNutritionEntries().find((n) => n.date === date);

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
};