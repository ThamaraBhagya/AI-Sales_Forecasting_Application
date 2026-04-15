import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

import AppShell from "@/components/layout/AppShell";


const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SalesForecast | ML Dashboard",
  description: "Production-grade Machine Learning API and dashboard for retail sales forecasting.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className={`${inter.className} flex h-full bg-slate-50 dark:bg-slate-900 overflow-hidden text-slate-900 dark:text-slate-100`}>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}