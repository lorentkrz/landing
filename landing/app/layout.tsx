import type { Metadata } from "next";
import Script from "next/script";
import { Space_Mono, Syne } from "next/font/google";
import "./globals.css";

const syne = Syne({
  subsets: ["latin"],
  weight: ["700", "800"],
  variable: "--font-syne",
  display: "swap",
});

const spaceMono = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-space-mono",
  display: "swap",
});

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;
const PIXEL_ID = process.env.NEXT_PUBLIC_PIXEL_ID;

export const metadata: Metadata = {
  metadataBase: new URL("https://nataa.app"),
  title: "Nataa | The night has eyes",
  description:
    "We are building the live radar for nightlife. Kosovo first, then worldwide. See the vibe. Scan the crowd. Connect before the timer dies.",
  icons: {
    icon: "/nataa-logo.png",
    shortcut: "/nataa-logo.png",
    apple: "/nataa-logo.png",
  },
  openGraph: {
    title: "Nataa | The night has eyes",
    description:
      "Blade Runner meets Boiler Room. Live radar for nightlife. Kosovo first, then worldwide.",
    url: "https://nataa.app",
    siteName: "Nataa",
    images: [
      {
        url: "/og-nataa.png",
        width: 1200,
        height: 630,
        alt: "Nataa | The night has eyes",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Nataa | The night has eyes",
    description:
      "Join the drop. Live radar for nightlife. Kosovo first, then worldwide.",
    site: "@Nataa.app",
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
        className={`${syne.variable} ${spaceMono.variable} antialiased bg-[#050505] text-white`}
      >
        {GA_ID ? (
          <>
            <Script
              strategy="afterInteractive"
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
            />
            <Script id="ga-init" strategy="afterInteractive">
              {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${GA_ID}');`}
            </Script>
          </>
        ) : null}

        {PIXEL_ID ? (
          <>
            <Script id="fb-pixel" strategy="afterInteractive">
              {`!(function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)})(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '${PIXEL_ID}');
fbq('track', 'PageView');`}
            </Script>
            <noscript
              dangerouslySetInnerHTML={{
                __html: `<img height="1" width="1" style="display:none" src="https://www.facebook.com/tr?id=${PIXEL_ID}&ev=PageView&noscript=1" />`,
              }}
            />
          </>
        ) : null}

        {children}
      </body>
    </html>
  );
}
