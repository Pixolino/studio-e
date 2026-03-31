import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Studio E — Digital Agency",
  description:
    "Studio E is a South Florida digital agency for founders who want their presence to feel as intentional as their work.",
  openGraph: {
    title: "Studio E — Digital Agency",
    description:
      "Studio E is a South Florida digital agency for founders who want their presence to feel as intentional as their work.",
    url: "https://studioe.agency",
    siteName: "Studio E",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Studio E — Digital Agency",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Studio E — Digital Agency",
    description:
      "Studio E is a South Florida digital agency for founders who want their presence to feel as intentional as their work.",
    images: ["/og-image.png"],
  },
  metadataBase: new URL("https://studioe.agency"),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} antialiased`}>
      <body className="min-h-dvh bg-cream text-ink font-sans">
        {/* Header slot */}
        <main>{children}</main>
        {/* Footer slot */}
      </body>
    </html>
  );
}
