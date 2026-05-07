import { Toaster } from "@/components/ui/toaster";
import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { useMfpAutoSync } from "@/hooks/useMfpAutoSync";

export default function App({ Component, pageProps }: AppProps) {
  useMfpAutoSync();
  return (
    <>
      <Component {...pageProps} />
      <Toaster />
    </>
  );
}
