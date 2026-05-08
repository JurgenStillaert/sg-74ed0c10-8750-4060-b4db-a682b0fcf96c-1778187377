import { describe, it, expect, beforeEach } from "@jest/globals";
import { db, UserGoals } from "../db";

// Mock localStorage for tests
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(global, "localStorage", {
  value: localStorageMock,
});

describe("db.getTotalDeficitNeeded", () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  it("should return null when no goals are set", () => {
    const result = db.getTotalDeficitNeeded();
    expect(result).toBeNull();
  });

  it("should calculate total deficit correctly based on fat mass difference", () => {
    // Example: 100kg at 25% body fat, goal 80kg at 15% body fat
    const goals: UserGoals = {
      startWeight: 100,
      goalWeight: 80,
      startBodyFat: 25,
      goalBodyFat: 15,
      endDate: "2026-12-31",
      createdAt: "2026-01-01",
      totalJokers: 10,
    };

    db.saveGoals(goals);

    const result = db.getTotalDeficitNeeded();

    // Current fat mass: 100 * 0.25 = 25kg
    // Desired fat mass: 80 * 0.15 = 12kg
    // Fat to lose: 25 - 12 = 13kg
    // Total deficit: 13 * 7700 = 100,100 kcal
    expect(result).toBe(100100);
  });

  it("should handle decimal body fat percentages correctly", () => {
    const goals: UserGoals = {
      startWeight: 90,
      goalWeight: 75,
      startBodyFat: 22.5,
      goalBodyFat: 12.5,
      endDate: "2026-12-31",
      createdAt: "2026-01-01",
      totalJokers: 10,
    };

    db.saveGoals(goals);

    const result = db.getTotalDeficitNeeded();

    // Current fat mass: 90 * 0.225 = 20.25kg
    // Desired fat mass: 75 * 0.125 = 9.375kg → rounded to 9.38kg
    // Fat to lose: 20.25 - 9.38 = 10.87kg
    // Total deficit: 10.87 * 7700 = 83,699 kcal
    expect(result).toBe(83699);
  });

  it("should round intermediate calculations to 2 decimals", () => {
    const goals: UserGoals = {
      startWeight: 85.5,
      goalWeight: 70.3,
      startBodyFat: 24.7,
      goalBodyFat: 14.2,
      endDate: "2026-12-31",
      createdAt: "2026-01-01",
      totalJokers: 10,
    };

    db.saveGoals(goals);

    const result = db.getTotalDeficitNeeded();

    // Current fat mass: 85.5 * 0.247 = 21.1185 → rounded to 21.12kg
    // Desired fat mass: 70.3 * 0.142 = 9.9826 → rounded to 9.98kg
    // Fat to lose: 21.12 - 9.98 = 11.14kg
    // Total deficit: 11.14 * 7700 = 85,778 kcal
    expect(result).toBe(85778);
  });
});