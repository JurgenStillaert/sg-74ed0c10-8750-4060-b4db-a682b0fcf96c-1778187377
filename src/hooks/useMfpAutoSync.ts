import { useEffect } from "react";
import { mfp } from "@/lib/myfitnesspal";

const FIFTEEN_MIN = 15 * 60 * 1000;

export function useMfpAutoSync() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const tick = async () => {
      if (!mfp.isConnected() || !mfp.getAutoSync()) return;
      try {
        await mfp.syncRecent(3);
      } catch {
        // silent fail — admin can see status
      }
    };

    tick();
    const id = setInterval(tick, FIFTEEN_MIN);
    return () => clearInterval(id);
  }, []);
}