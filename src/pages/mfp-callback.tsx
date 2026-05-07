"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { mfp } from "@/lib/myfitnesspal";
import { SEO } from "@/components/SEO";

export default function MfpCallbackPage() {
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("Token uitwisselen met MyFitnessPal...");

  useEffect(() => {
    if (!router.isReady) return;

    const { code, state, error, error_description } = router.query;

    if (error) {
      setStatus("error");
      setMessage(`Autorisatie geweigerd: ${error_description || error}`);
      return;
    }

    if (typeof code !== "string" || typeof state !== "string") {
      setStatus("error");
      setMessage("Geen code of state ontvangen van MyFitnessPal");
      return;
    }

    if (!mfp.validateState(state)) {
      setStatus("error");
      setMessage("State validatie mislukt — mogelijk CSRF poging of verlopen sessie");
      return;
    }

    mfp
      .exchangeCodeForToken(code)
      .then(() => {
        setStatus("success");
        setMessage("Verbonden met MyFitnessPal! Je wordt teruggestuurd naar Admin...");
        setTimeout(() => router.push("/admin"), 2000);
      })
      .catch((err) => {
        setStatus("error");
        setMessage(err?.message || "Token uitwisseling mislukt");
      });
  }, [router.isReady, router.query, router]);

  return (
    <>
      <SEO title="MyFitnessPal Callback" description="OAuth callback verwerking" />
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="border-2 max-w-lg w-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {status === "loading" && <Loader2 className="w-5 h-5 animate-spin text-primary" />}
              {status === "success" && <CheckCircle className="w-5 h-5 text-green-600" />}
              {status === "error" && <XCircle className="w-5 h-5 text-destructive" />}
              MyFitnessPal Verbinding
            </CardTitle>
            <CardDescription>{message}</CardDescription>
          </CardHeader>
          <CardContent>
            {status === "error" && (
              <Button onClick={() => router.push("/admin")} className="w-full">
                Terug naar Admin
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}