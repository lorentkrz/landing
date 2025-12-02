import type { Metadata } from "next";
import { Manrope, Chakra_Petch } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const display = Chakra_Petch({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-display" });
const body = Manrope({ subsets: ["latin"], variable: "--font-body" });

const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || "G-XXXXXXX";

export const metadata: Metadata = {
  title: "Nataa | Social nightlife, live now",
  description:
    "Nataa is the nightlife OS: live check-ins, real-time presence maps, and venue intel. Check who is inside before you go.",
  metadataBase: new URL("https://nataa.app"),
  openGraph: {
    title: "Nataa | Social nightlife, live now",
    description:
      "See who is inside, scan to check in, and unlock the room. Live maps, live presence, real venues.",
    url: "https://nataa.app",
    siteName: "Nataa",
    type: "website"
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <body className="relative overflow-x-hidden">
        <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
        <Script
          id="ga-init"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${GA_ID}', { anonymize_ip: true });
            `
          }}
        />
        {children}
      </body>
    </html>
  );
}
