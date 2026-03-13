import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import { BottomNav } from "@/components/BottomNav";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Property Bank",
  description: "Manage your properties with clarity.",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Property Bank",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${outfit.variable} antialiased min-h-[100dvh] bg-slate-50 flex flex-col font-sans`}
      >
        <main className="flex-1 w-full max-w-md mx-auto md:shadow-2xl md:border-x md:border-slate-200 bg-white min-h-[100dvh] relative overflow-x-hidden">
          {children}
          <BottomNav />
        </main>
      </body>
    </html>
  );
}
