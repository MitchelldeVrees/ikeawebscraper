import type { Metadata } from "next";
import { Fraunces, Outfit } from "next/font/google";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/next";

import { AuthProvider } from "@/components/providers/auth-provider";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

const baseUrl = "https://ikeatweedekans.com";
const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_TRACKING_ID;
const HOTJAR_ID = process.env.NEXT_PUBLIC_HOTJAR_ID;
const ENABLE_ANALYTICS = process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === "true";

const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-fraunces",
});

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-outfit",
});

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: "Tweede Kans Slim & Circulair - Realtime email als jouw product in de uitverkoop gaat",
    template: "%s | Tweede Kans Slim & Circulair",
  },
  description:
    "Realtime e-mailalerts zodra jouw favoriete IKEA product in de Tweede Kanshoek verschijnt in Nederlandse winkels.",
  generator: "",
  keywords: [
    "ikea tweedekans",
    "ikea tweede kans",
    "ikea tweede kanshoek",
    "ikea kortingsmeubels",
    "ikea voorraadalerts",
  ],
  authors: [
    {
      name: "Tweede Kans Slim & Circulair",
      url: baseUrl,
    },
  ],
  openGraph: {
    title: "Tweede Kans Slim & Circulair",
    description:
      "Realtime e-mailalerts voor IKEA Tweede Kans aanbiedingen in Nederland.",
    url: baseUrl,
    siteName: "Tweede Kans Slim & Circulair",
    locale: "nl_NL",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Tweede Kans Slim & Circulair",
    description:
      "Realtime e-mailalerts voor IKEA Tweede Kans aanbiedingen in Nederland.",
    site: "@IkeaTweedeKans",
  },
  icons: {
    icon: "/ikeaTweedeKans.png",
    apple: "/ikeaTweedeKans.png",
  },
  other: {
    robots: "index,follow",
    "content-language": "nl-NL",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="nl" suppressHydrationWarning>
      <body className={`${fraunces.variable} ${outfit.variable} font-sans antialiased`}>
        {ENABLE_ANALYTICS && GA_TRACKING_ID && (
          <>
            <Script
              strategy="lazyOnload"
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`}
            />
            <Script
              id="ga-tracking"
              strategy="lazyOnload"
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${GA_TRACKING_ID}');
                `,
              }}
            />
          </>
        )}
        {ENABLE_ANALYTICS && HOTJAR_ID && (
          <Script
            id="hotjar-tracking"
            strategy="lazyOnload"
            dangerouslySetInnerHTML={{
              __html: `
                (function(h,o,t,j,a,r){
                  h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
                  h._hjSettings={hjid:${HOTJAR_ID},hjsv:6};
                  a=o.getElementsByTagName('head')[0];
                  r=o.createElement('script');r.async=1;
                  r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
                  a.appendChild(r);
                })(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');
              `,
            }}
          />
        )}
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          <AuthProvider>
            {children}
            {ENABLE_ANALYTICS && <Analytics />}
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
