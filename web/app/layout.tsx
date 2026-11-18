import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";
import Header from "@/components/Header";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AgentPoll — One Agent ID, one vote",
  description:
    "Sybil-resistant voting for Binance Agent ID holders. Agent IDs are non-transferable and one per user, so every poll is one person, one vote.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen bg-zinc-950 text-zinc-50 antialiased`}
      >
        <Providers>
          <Header />
          <main className="mx-auto max-w-4xl px-4 py-8">{children}</main>
          <footer className="mx-auto max-w-4xl px-4 pb-8 text-center text-xs text-zinc-600">
            AgentPoll — built for the Binance Agent ID Hackathon. Votes are
            on-chain on BNB Chain; the contract holds no funds and has no
            owner.
          </footer>
        </Providers>
      </body>
    </html>
  );
}
