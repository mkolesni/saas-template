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

// Dynamic import of the Client Wrapper with ssr: false
const ClerkWrapper = dynamic(() => import('@/components/ClerkWrapper'), {
  ssr: false, // Now allowed because it's wrapping a Client Component
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-black text-white`}>
        <ClerkWrapper>
          <Navbar />
          {children}
        </ClerkWrapper>
      </body>
    </html>
  );
}