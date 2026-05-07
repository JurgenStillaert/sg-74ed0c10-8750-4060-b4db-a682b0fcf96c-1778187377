"use client";

import { useEffect, useState } from "react";
import { SEO } from "@/components/SEO";
import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { db } from "@/lib/db";
import { mfp, MfpConfig, MfpSyncResult } from "@/lib/myfitnesspal";
import { Download, Upload, RotateCcw, CheckCircle, XCircle, Loader2, Activity, AlertTriangle, RefreshCw, Unplug } from "lucide-react";
import { useRouter } from "next/router";

export default function AdminPage() {
  const router = useRouter();
  const [exportStatus, setExportStatus] = useState<string>("");
  const [importStatus, setImportStatus] = useState<string>("");

  const [mfpConnected, setMfpConnected] = useState(false);
  const [mfpConfig, setMfpConfig] = useState<MfpConfig>({
    clientId: "",
    clientSecret: "",
    redirectUri: "",
    apiBaseUrl: "",
    proxyPrefix: "",
  });
  const [mfpAutoSync, setMfpAutoSyncState] = useState(false);
  const [mfpLastSync, setMfpLastSync] = useState<string | null>(null);
  const [mfpSyncing, setMfpSyncing] = useState(false);
  const [mfpResults, setMfpResults] = useState<MfpSyncResult[]>([]);
  const [mfpError, setMfpError] = useState<string>("");
  const [syncDays, setSyncDays] = useState(7);

  useEffect(() => {
    const existing = mfp.getConfig();
    setMfpConfig({
      clientId: existing?.clientId || "",
      clientSecret: existing?.clientSecret || "",
      redirectUri: existing?.redirectUri || mfp.defaultRedirectUri(),
      apiBaseUrl: existing?.apiBaseUrl || mfp.defaultApiBaseUrl(),
      proxyPrefix: existing?.proxyPrefix || "",
    });
    setMfpConnected(mfp.isConnected());
    setMfpAutoSyncState(mfp.getAutoSync());
    setMfpLastSync(mfp.getLastSync());
  }, []);

  const handleExport = () => {
    const data = {
      goals: db.getGoals(),
      weighIns: db.getWeighIns(),
      sport: db.getSportEntries(),
      nutrition: db.getNutritionEntries(),
      dayStatuses: db.getDayStatuses(),
      exportDate: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `afval-queeste-backup-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setExportStatus("Data succesvol geëxporteerd!");
    setTimeout(() => setExportStatus(""), 3000);
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        if (data.goals) db.saveGoals(data.goals);
        if (data.weighIns) data.weighIns.forEach((w: any) => db.saveWeighIn(w));
        if (data.sport) data.sport.forEach((s: any) => db.saveSportEntry(s));
        if (data.nutrition) data.nutrition.forEach((n: any) => db.saveNutrition(n));
        if (data.dayStatuses) data.dayStatuses.forEach((d: any) => db.saveDayStatus(d));
        setImportStatus("Data succesvol geïmporteerd!");
        setTimeout(() => {
          setImportStatus("");
          window.location.reload();
        }, 2000);
      } catch {
        setImportStatus("Fout bij importeren. Controleer het bestand.");
        setTimeout(() => setImportStatus(""), 3000);
      }
    };
    reader.readAsText(file);
  };

  const handleNewGame = () => {
    if (confirm("Weet je zeker dat je een nieuw spel wilt beginnen? Alle huidige data wordt verwijderd!")) {
      localStorage.clear();
      window.location.href = "/";
    }
  };

  const handleMfpSaveConfig = () => {
    if (!mfpConfig.clientId || !mfpConfig.clientSecret || !mfpConfig.redirectUri) {
      setMfpError("Vul Client ID, Client Secret en Redirect URI in");
      return;
    }
    mfp.saveConfig({
      ...mfpConfig,
      apiBaseUrl: mfpConfig.apiBaseUrl || mfp.defaultApiBaseUrl(),
    });
    setMfpError("");
  };

  const handleMfpConnect = () => {
    handleMfpSaveConfig();
    if (!mfp.getConfig()) return;
    try {
      mfp.startAuthFlow();
    } catch (err: any) {
      setMfpError(err?.message || "Kon authorisatie niet starten");
    }
  };

  const handleMfpDisconnect = () => {
    if (!confirm("MyFitnessPal verbinding verwijderen?")) return;
    mfp.clearConfig();
    setMfpConnected(false);
    setMfpAutoSyncState(false);
    setMfpLastSync(null);
    setMfpConfig({
      clientId: "",
      clientSecret: "",
      redirectUri: mfp.defaultRedirectUri(),
      apiBaseUrl: mfp.defaultApiBaseUrl(),
      proxyPrefix: "",
    });
  };

  const handleMfpSyncNow = async () => {
    setMfpSyncing(true);
    setMfpError("");
    setMfpResults([]);
    try {
      const results = await mfp.syncRecent(syncDays);
      setMfpResults(results);
      setMfpLastSync(mfp.getLastSync());
    } catch (err: any) {
      setMfpError(err?.message || "Sync mislukt");
    } finally {
      setMfpSyncing(false);
    }
  };

  const handleMfpAutoSyncToggle = (enabled: boolean) => {
    mfp.setAutoSync(enabled);
    setMfpAutoSyncState(enabled);
  };

  return (
    <>
      <SEO title="Admin - Afval-Queeste" description="Beheer je data en instellingen" />
      <Navigation currentTab="admin" onTabChange={(tab) => router.push(tab === "admin" ? "/admin" : "/")} />

      <div className="min-h-screen bg-background p-4 md:p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <h1 className="text-4xl font-display text-primary">Admin</h1>

          <Card className="border-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary" />
                MyFitnessPal Integratie
                {mfpConnected && (
                  <span className="ml-auto inline-flex items-center gap-1 text-sm font-normal text-green-600">
                    <CheckCircle className="w-4 h-4" /> Verbonden
                  </span>
                )}
              </CardTitle>
              <CardDescription>
                Importeer dagelijks calorieën en macro&apos;s uit MyFitnessPal. Handmatige aanpassingen blijven behouden.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <AlertTriangle className="w-4 h-4" />
                <AlertDescription className="text-xs">
                  Vereist Partner credentials van MyFitnessPal. CORS kan blokkeren — start je browser met
                  <code className="mx-1 px-1 bg-muted rounded">--disable-web-security --user-data-dir=/tmp/chrome-cors</code>
                  of vul een proxy URL in. Tokens worden lokaal in je browser opgeslagen.
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <Label htmlFor="mfp-client-id">Client ID</Label>
                <Input
                  id="mfp-client-id"
                  type="text"
                  value={mfpConfig.clientId}
                  onChange={(e) => setMfpConfig({ ...mfpConfig, clientId: e.target.value })}
                  placeholder="MyFitnessPal Partner Client ID"
                  disabled={mfpConnected}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="mfp-client-secret">Client Secret</Label>
                <Input
                  id="mfp-client-secret"
                  type="password"
                  value={mfpConfig.clientSecret}
                  onChange={(e) => setMfpConfig({ ...mfpConfig, clientSecret: e.target.value })}
                  placeholder="••••••••"
                  disabled={mfpConnected}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="mfp-redirect">Redirect URI</Label>
                <Input
                  id="mfp-redirect"
                  type="text"
                  value={mfpConfig.redirectUri}
                  onChange={(e) => setMfpConfig({ ...mfpConfig, redirectUri: e.target.value })}
                  placeholder="https://your-app.com/mfp-callback"
                  disabled={mfpConnected}
                />
                <p className="text-xs text-muted-foreground">
                  Registreer deze URL exact in je MyFitnessPal partner instellingen.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="mfp-api-base">API Base URL (optioneel)</Label>
                <Input
                  id="mfp-api-base"
                  type="text"
                  value={mfpConfig.apiBaseUrl}
                  onChange={(e) => setMfpConfig({ ...mfpConfig, apiBaseUrl: e.target.value })}
                  placeholder={mfp.defaultApiBaseUrl()}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="mfp-proxy">CORS Proxy Prefix (optioneel)</Label>
                <Input
                  id="mfp-proxy"
                  type="text"
                  value={mfpConfig.proxyPrefix}
                  onChange={(e) => setMfpConfig({ ...mfpConfig, proxyPrefix: e.target.value })}
                  placeholder="https://my-proxy.local/proxy"
                />
                <p className="text-xs text-muted-foreground">
                  Bv. lokaal draaiend: <code className="px-1 bg-muted rounded">https://localhost:8080/proxy</code>. Wordt vooraan geplakt aan API calls.
                </p>
              </div>

              {mfpError && (
                <Alert variant="destructive">
                  <XCircle className="w-4 h-4" />
                  <AlertDescription>{mfpError}</AlertDescription>
                </Alert>
              )}

              {!mfpConnected ? (
                <Button onClick={handleMfpConnect} className="w-full gap-2">
                  <Activity className="w-4 h-4" />
                  Verbinden met MyFitnessPal
                </Button>
              ) : (
                <>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-semibold text-sm">Auto-sync (elke 15 minuten)</p>
                      <p className="text-xs text-muted-foreground">
                        Synchroniseert automatisch de laatste 3 dagen
                      </p>
                    </div>
                    <Switch checked={mfpAutoSync} onCheckedChange={handleMfpAutoSyncToggle} />
                  </div>

                  <div className="flex gap-2 items-end">
                    <div className="flex-1 space-y-2">
                      <Label htmlFor="sync-days">Sync laatste N dagen</Label>
                      <Input
                        id="sync-days"
                        type="number"
                        min="1"
                        max="90"
                        value={syncDays}
                        onChange={(e) => setSyncDays(parseInt(e.target.value) || 7)}
                      />
                    </div>
                    <Button onClick={handleMfpSyncNow} disabled={mfpSyncing} className="gap-2">
                      {mfpSyncing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                      Sync nu
                    </Button>
                  </div>

                  {mfpLastSync && (
                    <p className="text-xs text-muted-foreground">
                      Laatste sync: {new Date(mfpLastSync).toLocaleString("nl-NL")}
                    </p>
                  )}

                  {mfpResults.length > 0 && (
                    <div className="border rounded-lg max-h-60 overflow-y-auto">
                      {mfpResults.map((r) => (
                        <div
                          key={r.date}
                          className="flex items-center justify-between px-3 py-2 border-b last:border-b-0 text-sm"
                        >
                          <span className="font-mono">{r.date}</span>
                          <span
                            className={
                              r.skipped
                                ? "text-muted-foreground"
                                : r.success
                                ? "text-green-600"
                                : "text-destructive"
                            }
                          >
                            {r.skipped ? "↷ " : r.success ? "✓ " : "✗ "}
                            {r.message}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  <Button onClick={handleMfpDisconnect} variant="outline" className="w-full gap-2">
                    <Unplug className="w-4 h-4" />
                    Verbinding verwijderen
                  </Button>
                </>
              )}
            </CardContent>
          </Card>

          <Card className="border-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="w-5 h-5 text-primary" />
                Data Exporteren
              </CardTitle>
              <CardDescription>Download al je data als backup bestand</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button onClick={handleExport} className="w-full gap-2">
                <Download className="w-4 h-4" />
                Exporteer Data
              </Button>
              {exportStatus && <p className="text-sm text-green-600 font-semibold">{exportStatus}</p>}
            </CardContent>
          </Card>

          <Card className="border-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="w-5 h-5 text-primary" />
                Data Importeren
              </CardTitle>
              <CardDescription>Herstel je data van een backup bestand</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="import-file">Selecteer backup bestand</Label>
                <Input id="import-file" type="file" accept=".json" onChange={handleImport} />
              </div>
              {importStatus && (
                <p
                  className={`text-sm font-semibold ${
                    importStatus.includes("Fout") ? "text-destructive" : "text-green-600"
                  }`}
                >
                  {importStatus}
                </p>
              )}
            </CardContent>
          </Card>

          <Card className="border-2 border-destructive">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <RotateCcw className="w-5 h-5" />
                Nieuw Spel Beginnen
              </CardTitle>
              <CardDescription>Start opnieuw met nieuwe doelen (verwijdert alle huidige data)</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="destructive" onClick={handleNewGame} className="w-full gap-2">
                <RotateCcw className="w-4 h-4" />
                Nieuw Spel Starten
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}