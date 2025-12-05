import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { Geist, Geist_Mono } from "next/font/google";

import Navbar from "@/components/Navbar";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ListingToVideo.ai",
  description: "Turn any Zillow link into a viral listing Reel in 58 seconds",
};

// Dynamically import ClerkProvider so it NEVER runs during build/prerender
const ClerkProvider = dynamic(() => import("@clerk/nextjs").then(mod => ({ default: mod.ClerkProvider })), {
  ssr: false, // ← this disables it completely during static generation
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}>
      <html lang="en">
        <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-black text-white`}>
          <Navbar />
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}