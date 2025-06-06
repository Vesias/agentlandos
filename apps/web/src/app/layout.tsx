import type { Metadata, Viewport } from 'next'
import { Inter, Work_Sans, Crimson_Text } from 'next/font/google'
import './globals.css'
import Providers from './providers'
import GlobalTutorial from '@/components/GlobalTutorial'
import MainNavigation from '@/components/navigation/MainNavigation'

// Brandbook-compliant fonts using Google Fonts
const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap'
})

// Quantum Sans replacement - Work Sans has similar geometric characteristics
const quantumSans = Work_Sans({
  subsets: ['latin'],
  variable: '--font-quantum',
  display: 'swap',
  weight: ['400', '500', '600', '700']
})

// Nova Text replacement - Crimson Text has similar serif characteristics
const novaText = Crimson_Text({
  subsets: ['latin'],
  variable: '--font-nova',
  display: 'swap',
  weight: ['400', '600']
})

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#003399',
  colorScheme: 'light'
}

export const metadata: Metadata = {
  title: 'AGENTLAND.SAARLAND - KI-Agentur für das Saarland',
  description: 'Die erste KI-Agentur im Saarland. Real-time Services, AI-powered document assistance, und enhanced PLZ-based service discovery.',
  keywords: ['Saarland', 'KI', 'AI', 'Agentland', 'Services', 'Real-time', 'AGENTNET'],
  authors: [{ name: 'AGENTLAND.SAARLAND Team' }],
  creator: 'AGENTLAND.SAARLAND',
  publisher: 'AGENTLAND.SAARLAND',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    locale: 'de_DE',
    url: 'https://agentland.saarland',
    title: 'AGENTLAND.SAARLAND - KI-Agentur für das Saarland',
    description: 'Die erste KI-Agentur im Saarland mit real-time services und AI-powered assistance.',
    siteName: 'AGENTLAND.SAARLAND',
    images: [
      {
        url: '/og-image.svg',
        width: 1200,
        height: 630,
        alt: 'AGENTLAND.SAARLAND'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AGENTLAND.SAARLAND - KI-Agentur für das Saarland',
    description: 'Die erste KI-Agentur im Saarland mit real-time services und AI-powered assistance.',
    images: ['/og-image.svg']
  },
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.svg',
    apple: '/pwa/icon-192x192.svg'
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html 
      lang="de" 
      className={`${inter.variable} ${quantumSans.variable} ${novaText.variable}`}
    >
      <head>
        {/* Performance optimization */}
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.googleapis.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://agentland.saarland" />
        
        {/* Brandbook CSS Variables */}
        <style dangerouslySetInnerHTML={{
          __html: `
            :root {
              /* Primary Brand Colors - Brandbook Compliant */
              --color-saarland-blue: #003399;
              --color-innovation-cyan: #009FE3;
              --color-warm-gold: #FDB913;
              --color-technical-silver: #E6E6EB;
              
              /* Tertiary Colors */
              --color-success-green: #43B049;
              --color-alert-red: #E31E2D;
              --color-neutral-gray: #929497;
              
              /* Typography Scale - 8px Grid System */
              --font-size-xs: 0.75rem;   /* 12px */
              --font-size-sm: 0.875rem;  /* 14px */
              --font-size-md: 1rem;      /* 16px */
              --font-size-lg: 1.25rem;   /* 20px */
              --font-size-xl: 1.5rem;    /* 24px */
              --font-size-2xl: 2rem;     /* 32px */
              
              /* Spacing System - 8px Grid */
              --space-1: 0.25rem;  /* 4px */
              --space-2: 0.5rem;   /* 8px */
              --space-3: 1rem;     /* 16px */
              --space-4: 1.5rem;   /* 24px */
              --space-5: 2rem;     /* 32px */
              --space-6: 3rem;     /* 48px */
              --space-7: 4rem;     /* 64px */
              
              /* Animation Timing */
              --duration-quick: 150ms;
              --duration-normal: 300ms;
              --ease-standard: cubic-bezier(0.4, 0.0, 0.2, 1);
            }
            
            /* Network Pattern for AGENTNET branding */
            .network-pattern {
              background-image: 
                radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0);
              background-size: 20px 20px;
            }
            
            /* Agent Active Animation */
            .agent-active {
              animation: pulse-agent 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
            }
            
            @keyframes pulse-agent {
              0%, 100% {
                opacity: 1;
                transform: scale(1);
              }
              50% {
                opacity: .8;
                transform: scale(1.05);
              }
            }
          `
        }} />
      </head>
      <body className="font-nova text-neutral-gray bg-white antialiased">
        <Providers>
          <MainNavigation />
          <main>
            {children}
          </main>
          <GlobalTutorial />
        </Providers>
      </body>
    </html>
  )
}