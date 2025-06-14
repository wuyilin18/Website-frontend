"use client";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { Dock } from "@/components/Home/naver";
import { Footer } from "@/components/Footer/Footer";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { AlgoliaProvider } from "@/components/Search/AlgoliaProvider";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <AlgoliaProvider>
      <Dock />
      <main className="min-h-screen">{children}</main>
      <Footer />
      <Analytics />
      <SpeedInsights />
      </AlgoliaProvider>
    </ThemeProvider>
  );
}
