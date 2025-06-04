import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import MainNavigation from '@/components/navigation/MainNavigation'
import MobileFeatures from '@/components/MobileFeatures'
import MobileTestSuite from '@/components/MobileTestSuite'
import RealAnalyticsTracker from '@/components/RealAnalyticsTracker'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  metadataBase: new URL('https://agentland.saarland'),
  title: 'AGENTLAND.SAARLAND - Souveräne KI für das Saarland',
  description: 'KI-Plattform mit regionaler Expertise für Bürger, Unternehmen und Verwaltung im Saarland',
  keywords: 'Saarland, KI, Künstliche Intelligenz, Tourismus, Verwaltung, Wirtschaft',
  authors: [{ name: 'AGENTLAND.SAARLAND Team' }],
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.ico',
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
    userScalable: true,
  },
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#003399' },
    { media: '(prefers-color-scheme: dark)', color: '#009FE3' },
  ],
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'AGENTLAND.SAARLAND',
    startupImage: [
      {
        url: '/pwa/apple-splash-2048-2732.jpg',
        media: '(device-width: 1024px) and (device-height: 1366px) and (-webkit-device-pixel-ratio: 2)',
      },
      {
        url: '/pwa/apple-splash-1668-2388.jpg', 
        media: '(device-width: 834px) and (device-height: 1194px) and (-webkit-device-pixel-ratio: 2)',
      },
      {
        url: '/pwa/apple-splash-1536-2048.jpg',
        media: '(device-width: 768px) and (device-height: 1024px) and (-webkit-device-pixel-ratio: 2)',
      },
      {
        url: '/pwa/apple-splash-1125-2436.jpg',
        media: '(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3)',
      },
    ],
  },
  manifest: '/manifest.json',
  openGraph: {
    title: 'AGENTLAND.SAARLAND',
    description: 'Souveräne KI-Technologie aus dem Saarland – für ein intelligentes Morgen',
    type: 'website',
    locale: 'de_DE',
    alternateLocale: ['fr_FR', 'en_US'],
    siteName: 'AGENTLAND.SAARLAND',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'AGENTLAND.SAARLAND - KI für das Saarland',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AGENTLAND.SAARLAND',
    description: 'Souveräne KI-Technologie aus dem Saarland – für ein intelligentes Morgen',
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="de">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://vercel.app" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="AGENTLAND" />
        <meta name="format-detection" content="telephone=yes" />
        <meta name="msapplication-TileColor" content="#003399" />
        <meta name="msapplication-tap-highlight" content="no" />
      </head>
      <body className={`${inter.className} bg-gray-50 safe-area`}>
        <RealAnalyticsTracker />
        <MainNavigation />
        <main className="min-h-screen-safe">
          {children}
        </main>
        <MobileFeatures />
        <MobileTestSuite />
      </body>
    </html>
  )
}