import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { AppShell } from "@/components/layout/app-shell";
import { DetectionProvider } from "@/lib/detection-context";

const geist = Geist({ variable: "--font-geist", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "IntruAegis | Intelligent Network Defense",
  description: "Dashboard deteksi intrusi jaringan berbasis Random Forest",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id">
      <body className={`${geist.variable} antialiased`}>
        <DetectionProvider>
          <AppShell>{children}</AppShell>
        </DetectionProvider>
      </body>
    </html>
  );
}
