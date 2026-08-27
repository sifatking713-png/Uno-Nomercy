import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "NO MERCY: CHAOS CARDS — Fast-Paced 4-Player Card Battler",
  description: "Experience the ruthless 168-card chaos battler. Stacking draw penalties, 0-pass, 7-swap, dynamic arena disruptions, and the instant 25-card Mercy Rule elimination!",
  icons: {
    icon: "/favicon.ico",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#09090b",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="bg-zinc-950 text-zinc-100 antialiased overflow-x-hidden">{children}</body>
    </html>
  );
}
