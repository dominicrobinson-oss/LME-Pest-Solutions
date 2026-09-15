import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { absoluteUrl } from "@/lib/seo";
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
  metadataBase: new URL(absoluteUrl("/")),
  title: {
    default: "LME Pest Solutions | Pest Control Manchester & North West",
    template: "%s | LME Pest Solutions",
  },
  description:
    "Fast, discreet and effective pest control for homes and businesses across Manchester and North West England.",
  openGraph: {
    title: "LME Pest Solutions",
    description: "Professional pest control across Manchester and the North West.",
    url: absoluteUrl("/"),
    siteName: "LME Pest Solutions",
    type: "website",
    images: [{ url: absoluteUrl("/brand/lme-supplied-logo-full.png"), alt: "LME Pest Solutions logo" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "LME Pest Solutions",
    description: "Professional pest control across Manchester and the North West.",
    images: [absoluteUrl("/brand/lme-supplied-logo-full.png")],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-white focus:px-4 focus:py-2 focus:font-bold"
        >
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
