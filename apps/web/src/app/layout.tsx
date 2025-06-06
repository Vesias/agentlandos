import type { Metadata, Viewport } from 'next'
import { Inter, Manrope, Source_Serif_4 } from 'next/font/google'
import './globals.css'
import Providers from './providers'
import GlobalTutorial from '@/components/GlobalTutorial'
import MainNavigation from '@/components/navigation/MainNavigation'
import { AnalyticsProvider } from '@/components/AnalyticsProvider'

// Professional German/French optimized fonts
const inter = Inter({ 
  subsets: ['latin', 'latin-ext'],
  variable: '--font-inter',
  display: 'swap',
  weight: ['400', '500', '600', '700', '800']
})

// Enterprise-grade geometric sans-serif - excellent for German umlauts and French accents
const manrope = Manrope({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-professional',
  display: 'swap',
  weight: ['400', '500', '600', '700', '800']
})

// Sophisticated serif for body text - optimized for readability in multiple languages
const sourceSerif = Source_Serif_4({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-serif',
  display: 'swap',
  weight: ['400', '500', '600', '700']
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
        url: '/og-image-professional.svg',
        width: 1200,
        height: 630,
        alt: 'AGENTLAND.SAARLAND - Digitale Exzellenz für Unternehmen'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AGENTLAND.SAARLAND - KI-Agentur für das Saarland',
    description: 'Die erste KI-Agentur im Saarland mit real-time services und AI-powered assistance.',
    images: ['/og-image-professional.svg']
  },
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon-professional.svg',
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
      className={`${inter.variable} ${manrope.variable} ${sourceSerif.variable}`}
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
              /* Professional Business Colors - Enterprise Grade */
              --color-primary-blue: #1e40af;      /* Professional blue */
              --color-primary-blue-light: #3b82f6; /* Hover states */
              --color-primary-blue-dark: #1e3a8a;  /* Active states */
              
              --color-saarland-accent: #059669;    /* Regional identity */
              --color-saarland-light: #10b981;     /* Success states */
              
              --color-neutral-50: #f8fafc;         /* Background light */
              --color-neutral-100: #f1f5f9;        /* Background cards */
              --color-neutral-200: #e2e8f0;        /* Borders light */
              --color-neutral-300: #cbd5e1;        /* Borders */
              --color-neutral-400: #94a3b8;        /* Text muted */
              --color-neutral-500: #64748b;        /* Text secondary */
              --color-neutral-600: #475569;        /* Text primary light */
              --color-neutral-700: #334155;        /* Text primary */
              --color-neutral-800: #1e293b;        /* Text headings */
              --color-neutral-900: #0f172a;        /* Text strong */
              
              /* Semantic Colors */
              --color-success: #059669;
              --color-warning: #d97706;
              --color-danger: #dc2626;
              --color-info: #0284c7;
              
              /* Professional Typography Scale */
              --font-size-xs: 0.75rem;     /* 12px */
              --font-size-sm: 0.875rem;    /* 14px */
              --font-size-base: 1rem;      /* 16px */
              --font-size-lg: 1.125rem;    /* 18px */
              --font-size-xl: 1.25rem;     /* 20px */
              --font-size-2xl: 1.5rem;     /* 24px */
              --font-size-3xl: 1.875rem;   /* 30px */
              --font-size-4xl: 2.25rem;    /* 36px */
              
              /* Professional Spacing - 4px Grid System */
              --space-1: 0.25rem;   /* 4px */
              --space-2: 0.5rem;    /* 8px */
              --space-3: 0.75rem;   /* 12px */
              --space-4: 1rem;      /* 16px */
              --space-5: 1.25rem;   /* 20px */
              --space-6: 1.5rem;    /* 24px */
              --space-8: 2rem;      /* 32px */
              --space-10: 2.5rem;   /* 40px */
              --space-12: 3rem;     /* 48px */
              
              /* Professional Animation */
              --duration-fast: 150ms;
              --duration-normal: 300ms;
              --duration-slow: 500ms;
              --ease-out: cubic-bezier(0.0, 0.0, 0.2, 1);
              --ease-in: cubic-bezier(0.4, 0.0, 1, 1);
              --ease-in-out: cubic-bezier(0.4, 0.0, 0.2, 1);
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
      <body className="font-serif text-slate-700 bg-white antialiased">
        <Providers>
          <AnalyticsProvider>
            <MainNavigation />
            <main>
              {children}
            </main>
            <GlobalTutorial />
          </AnalyticsProvider>
        </Providers>
      </body>
    </html>
  )
}