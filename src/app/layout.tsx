import type { Metadata } from "next";
import { Inter, Cormorant_Garamond } from "next/font/google";
import "./globals.css";
import SmoothScroll from "@/components/layout/SmoothScroll";
import CustomCursor from "@/components/ui/CustomCursor";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Studio\u2014E \u2014 Brand Studio",
  description:
    "Studio\u2014E is a multi-disciplinary brand studio for founders who have outgrown \u201cgood enough.\u201d Strategy, identity, and digital infrastructure\u2014delivered as one seamless engagement.",
  openGraph: {
    title: "Studio\u2014E \u2014 Brand Studio",
    description:
      "Studio\u2014E is a multi-disciplinary brand studio for founders who have outgrown \u201cgood enough.\u201d Strategy, identity, and digital infrastructure\u2014delivered as one seamless engagement.",
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
    title: "Studio\u2014E \u2014 Brand Studio",
    description:
      "Studio\u2014E is a multi-disciplinary brand studio for founders who have outgrown \u201cgood enough.\u201d Strategy, identity, and digital infrastructure\u2014delivered as one seamless engagement.",
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
    <html lang="en" className={`${inter.variable} ${cormorant.variable} antialiased`}>
      <body className="min-h-dvh bg-cream text-ink font-sans">
        <SmoothScroll>
          <CustomCursor />
          {/* Header slot */}
          <main>{children}</main>
          {/* Footer slot */}
        </SmoothScroll>
      </body>
    </html>
  );
}
