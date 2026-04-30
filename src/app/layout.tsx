import type { Metadata } from "next";
import "./globals.css";
import SmoothScroll from "@/components/layout/SmoothScroll";
import CustomCursor from "@/components/ui/CustomCursor";
import AnchorInterceptor from "@/components/layout/AnchorInterceptor";

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
    images: [],
  },
  twitter: {
    card: "summary_large_image",
    title: "Studio\u2014E \u2014 Brand Studio",
    description:
      "Studio\u2014E is a multi-disciplinary brand studio for founders who have outgrown \u201cgood enough.\u201d Strategy, identity, and digital infrastructure\u2014delivered as one seamless engagement.",
  },
  metadataBase: new URL("https://studioe.agency"),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="antialiased">
      <body className="min-h-dvh bg-cream text-ink font-sans">
        <SmoothScroll>
          <CustomCursor />
          <AnchorInterceptor />
          {/* Header slot */}
          <main>{children}</main>
          {/* Footer slot */}
        </SmoothScroll>
      </body>
    </html>
  );
}
