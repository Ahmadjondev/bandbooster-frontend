import type { Metadata } from "next";
import { Inter, Geist_Mono } from "next/font/google";
import { Providers } from "@/lib/providers";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Bandbooster AI | Real CD-Style IELTS Preparation",
  description: "Master IELTS with AI-powered practice tests that mirror the real exam. Get personalized feedback and boost your band score with Bandbooster AI.",
  keywords: ["IELTS", "IELTS preparation", "band score", "IELTS practice", "AI tutor", "IELTS test"],
  authors: [{ name: "Bandbooster AI" }],
  openGraph: {
    title: "Bandbooster AI | Real CD-Style IELTS Preparation",
    description: "Master IELTS with AI-powered practice tests that mirror the real exam.",
    type: "website",
  },
};

// Script to prevent flash of incorrect theme
const themeScript = `
  (function() {
    function getTheme() {
      const stored = localStorage.getItem('bandbooster-theme');
      if (stored === 'light' || stored === 'dark') return stored;
      if (stored === 'system' || !stored) {
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      }
      return 'light';
    }
    const theme = getTheme();
    document.documentElement.classList.add(theme);
    document.documentElement.style.colorScheme = theme;
  })();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body
        className={`${inter.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
