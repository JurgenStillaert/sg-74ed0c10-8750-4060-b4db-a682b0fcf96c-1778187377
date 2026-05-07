import { db, NutritionEntry } from "./db";

const STORAGE_KEYS = {
  CONFIG: "afval_queeste_mfp_config",
  TOKENS: "afval_queeste_mfp_tokens",
  PENDING_AUTH: "afval_queeste_mfp_pending",
  LAST_SYNC: "afval_queeste_mfp_last_sync",
  AUTO_SYNC: "afval_queeste_mfp_auto_sync",
};

export interface MfpConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  apiBaseUrl: string;
  proxyPrefix: string;
}

export interface MfpTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  scope: string;
}

export interface MfpSyncResult {
  date: string;
  success: boolean;
  message: string;
  skipped?: boolean;
}

const DEFAULT_API = "https://api.myfitnesspalapi.com";

export const mfp = {
  getConfig(): MfpConfig | null {
    if (typeof window === "undefined") return null;
    const data = localStorage.getItem(STORAGE_KEYS.CONFIG);
    return data ? JSON.parse(data) : null;
  },

  saveConfig(config: MfpConfig) {
    if (typeof window === "undefined") return;
    localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(config));
  },

  clearConfig() {
    if (typeof window === "undefined") return;
    localStorage.removeItem(STORAGE_KEYS.CONFIG);
    localStorage.removeItem(STORAGE_KEYS.TOKENS);
    localStorage.removeItem(STORAGE_KEYS.LAST_SYNC);
    localStorage.removeItem(STORAGE_KEYS.AUTO_SYNC);
  },

  getTokens(): MfpTokens | null {
    if (typeof window === "undefined") return null;
    const data = localStorage.getItem(STORAGE_KEYS.TOKENS);
    return data ? JSON.parse(data) : null;
  },

  saveTokens(tokens: MfpTokens) {
    if (typeof window === "undefined") return;
    localStorage.setItem(STORAGE_KEYS.TOKENS, JSON.stringify(tokens));
  },

  isConnected(): boolean {
    return mfp.getTokens() !== null;
  },

  getLastSync(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(STORAGE_KEYS.LAST_SYNC);
  },

  setLastSync(iso: string) {
    if (typeof window === "undefined") return;
    localStorage.setItem(STORAGE_KEYS.LAST_SYNC, iso);
  },

  getAutoSync(): boolean {
    if (typeof window === "undefined") return false;
    return localStorage.getItem(STORAGE_KEYS.AUTO_SYNC) === "true";
  },

  setAutoSync(enabled: boolean) {
    if (typeof window === "undefined") return;
    localStorage.setItem(STORAGE_KEYS.AUTO_SYNC, enabled ? "true" : "false");
  },

  buildAuthUrl(state: string): string {
    const config = mfp.getConfig();
    if (!config) throw new Error("MyFitnessPal niet geconfigureerd");
    const base = (config.apiBaseUrl || DEFAULT_API).replace(/\/$/, "");
    const params = new URLSearchParams({
      client_id: config.clientId,
      response_type: "code",
      redirect_uri: config.redirectUri,
      scope: "diary",
      state,
    });
    return `${base}/oauth2/auth?${params.toString()}`;
  },

  startAuthFlow() {
    const state = Math.random().toString(36).slice(2);
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEYS.PENDING_AUTH, state);
    }
    const url = mfp.buildAuthUrl(state);
    window.location.href = url;
  },

  validateState(state: string): boolean {
    if (typeof window === "undefined") return false;
    const expected = localStorage.getItem(STORAGE_KEYS.PENDING_AUTH);
    localStorage.removeItem(STORAGE_KEYS.PENDING_AUTH);
    return expected === state;
  },

  proxyUrl(url: string): string {
    const config = mfp.getConfig();
    if (!config?.proxyPrefix) return url;
    return `${config.proxyPrefix.replace(/\/$/, "")}/${url}`;
  },

  async exchangeCodeForToken(code: string): Promise<MfpTokens> {
    const config = mfp.getConfig();
    if (!config) throw new Error("MyFitnessPal niet geconfigureerd");
    const base = (config.apiBaseUrl || DEFAULT_API).replace(/\/$/, "");
    const url = mfp.proxyUrl(`${base}/oauth2/token`);

    const body = new URLSearchParams({
      grant_type: "authorization_code",
      code,
      client_id: config.clientId,
      client_secret: config.clientSecret,
      redirect_uri: config.redirectUri,
    });

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body.toString(),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`Token exchange mislukt (${res.status}): ${text}`);
    }

    const data = await res.json();
    const tokens: MfpTokens = {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresAt: Date.now() + (data.expires_in || 3600) * 1000,
      scope: data.scope || "diary",
    };
    mfp.saveTokens(tokens);
    return tokens;
  },

  async refreshAccessToken(): Promise<MfpTokens> {
    const config = mfp.getConfig();
    const tokens = mfp.getTokens();
    if (!config || !tokens) throw new Error("Niet verbonden met MyFitnessPal");
    const base = (config.apiBaseUrl || DEFAULT_API).replace(/\/$/, "");
    const url = mfp.proxyUrl(`${base}/oauth2/token`);

    const body = new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: tokens.refreshToken,
      client_id: config.clientId,
      client_secret: config.clientSecret,
    });

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body.toString(),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`Token refresh mislukt (${res.status}): ${text}`);
    }

    const data = await res.json();
    const newTokens: MfpTokens = {
      accessToken: data.access_token,
      refreshToken: data.refresh_token || tokens.refreshToken,
      expiresAt: Date.now() + (data.expires_in || 3600) * 1000,
      scope: data.scope || tokens.scope,
    };
    mfp.saveTokens(newTokens);
    return newTokens;
  },

  async getValidAccessToken(): Promise<string> {
    let tokens = mfp.getTokens();
    if (!tokens) throw new Error("Niet verbonden met MyFitnessPal");
    if (Date.now() >= tokens.expiresAt - 60_000) {
      tokens = await mfp.refreshAccessToken();
    }
    return tokens.accessToken;
  },

  async fetchDiary(date: string): Promise<{ calories: number; fat: number; carbs: number; protein: number } | null> {
    const config = mfp.getConfig();
    if (!config) throw new Error("MyFitnessPal niet geconfigureerd");
    const accessToken = await mfp.getValidAccessToken();
    const base = (config.apiBaseUrl || DEFAULT_API).replace(/\/$/, "");
    const url = mfp.proxyUrl(`${base}/diary/?date=${date}`);

    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${accessToken}`, Accept: "application/json" },
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`Diary fetch mislukt (${res.status}): ${text}`);
    }

    const data = await res.json();
    return mfp.parseDiaryResponse(data, date);
  },

  parseDiaryResponse(data: any, date: string): { calories: number; fat: number; carbs: number; protein: number } | null {
    const entry = Array.isArray(data?.items)
      ? data.items.find((i: any) => i.date === date) || data.items[0]
      : data?.diary || data;

    if (!entry) return null;

    const totals = entry.totals || entry.total || entry.summary || {};
    let calories = Number(totals.calories ?? totals.energy ?? 0);
    let fat = Number(totals.fat ?? totals.fats ?? 0);
    let carbs = Number(totals.carbohydrates ?? totals.carbs ?? 0);
    let protein = Number(totals.protein ?? totals.proteins ?? 0);

    if (!calories && Array.isArray(entry.meals)) {
      for (const meal of entry.meals) {
        const t = meal.totals || {};
        calories += Number(t.calories ?? 0);
        fat += Number(t.fat ?? 0);
        carbs += Number(t.carbohydrates ?? t.carbs ?? 0);
        protein += Number(t.protein ?? 0);
      }
    }

    if (!calories && !fat && !carbs && !protein) return null;

    return {
      calories: Math.round(calories),
      fat: Math.round(fat * 10) / 10,
      carbs: Math.round(carbs * 10) / 10,
      protein: Math.round(protein * 10) / 10,
    };
  },

  async syncDate(date: string, overrideManual = false): Promise<MfpSyncResult> {
    try {
      const existing = db.getNutritionEntries().find((n) => n.date === date);
      if (existing && existing.source === "manual" && !overrideManual) {
        return { date, success: true, skipped: true, message: "Handmatig bewerkt — overgeslagen" };
      }

      const data = await mfp.fetchDiary(date);
      if (!data) return { date, success: false, message: "Geen data gevonden" };

      const entry: NutritionEntry = {
        id: existing?.id || `nutrition_${Date.now()}_${date}`,
        date,
        calories: data.calories,
        fat: data.fat,
        carbs: data.carbs,
        protein: data.protein,
        source: "myfitnesspal",
        syncedAt: new Date().toISOString(),
      };
      db.saveNutrition(entry);
      return { date, success: true, message: `${data.calories} kcal gesynchroniseerd` };
    } catch (err: any) {
      return { date, success: false, message: err?.message || "Onbekende fout" };
    }
  },

  async syncRecent(days = 7): Promise<MfpSyncResult[]> {
    const results: MfpSyncResult[] = [];
    const today = new Date();
    for (let i = 0; i < days; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      results.push(await mfp.syncDate(dateStr));
    }
    mfp.setLastSync(new Date().toISOString());
    return results;
  },

  async syncRange(startDate: string, endDate: string): Promise<MfpSyncResult[]> {
    const results: MfpSyncResult[] = [];
    const start = new Date(startDate);
    const end = new Date(endDate);
    const cur = new Date(start);
    while (cur <= end) {
      results.push(await mfp.syncDate(cur.toISOString().split("T")[0]));
      cur.setDate(cur.getDate() + 1);
    }
    mfp.setLastSync(new Date().toISOString());
    return results;
  },

  defaultRedirectUri(): string {
    if (typeof window === "undefined") return "";
    return `${window.location.origin}/mfp-callback`;
  },

  defaultApiBaseUrl(): string {
    return DEFAULT_API;
  },
};