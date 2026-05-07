"use client";

import { useState } from "react";
import { SEO } from "@/components/SEO";
import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { db } from "@/lib/db";
import { Download, Upload, RotateCcw } from "lucide-react";
import { useRouter } from "next/router";

export default function AdminPage() {
  const router = useRouter();
  const [exportStatus, setExportStatus] = useState<string>("");
  const [importStatus, setImportStatus] = useState<string>("");

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