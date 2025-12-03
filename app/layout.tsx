import type { Metadata } from 'next'

import { AuthProvider } from '@/components/providers/auth-provider'
import { ThemeProvider } from '@/components/theme-provider'
import './globals.css'
import { Analytics } from '@vercel/analytics/next'
import { Geist, Geist_Mono, Geist as V0_Font_Geist, Geist_Mono as V0_Font_Geist_Mono, Source_Serif_4 as V0_Font_Source_Serif_4 } from 'next/font/google'
import Script from 'next/script'

// Initialize fonts
const _geist = V0_Font_Geist({ subsets: ['latin'], weight: ["100","200","300","400","500","600","700","800","900"] })
const _geistMono = V0_Font_Geist_Mono({ subsets: ['latin'], weight: ["100","200","300","400","500","600","700","800","900"] })
const _sourceSerif_4 = V0_Font_Source_Serif_4({ subsets: ['latin'], weight: ["200","300","400","500","600","700","800","900"] })

const baseUrl = 'https://ikeatweedekans.com/'
const GA_TRACKING_ID = 'G-0HPH3HV4PL'

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: 'IKEA Tweede Kans Alerts',
    template: '%s | IKEA Tweede Kans Alerts',
  },
  description:
    'Track your favorite IKEA Tweedekansje (tweede kans) products and get notified instantly when they are available across stores in the Netherlands.',
  generator: '',
  keywords: [
    'ikea tweedekans',
    'ikea tweede kans',
    'ikea clearance deals',
    'ikea sale alerts',
  ],
  authors: [
    {
      name: 'IKEA Tweede kans',
      url: baseUrl,
    },
  ],
  openGraph: {
    title: 'IKEA Tweede kans',
    description:
      'Track your favorite IKEA Tweedekansje (tweede kans) products and get notified instantly when they restock in the Netherlands.',
    url: baseUrl,
    siteName: 'IKEA Tweede kans',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'IKEA Tweede kans',
    description:
      'Track your favorite IKEA Tweede kans products and get notified instantly.',
    site: '@IkeaTweedeKans',
  },
  icons: {
    icon: '/ikeaTweedeKans.png',
    apple: '/ikeaTweedeKans.png',
  },
  other: {
    'robots': 'index,follow',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`font-sans antialiased`}>
        <Script
          strategy="afterInteractive"
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`}
        />
        <Script
          id="ga-tracking"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${GA_TRACKING_ID}');
            `,
          }}
        />
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          <AuthProvider>
            {children}
            <Analytics />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
