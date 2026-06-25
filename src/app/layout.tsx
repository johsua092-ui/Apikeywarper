import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Linkey — Unified AI API",
  description: "Akses model AI terbaik via satu API key. GPT, Claude, dan lainnya.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
