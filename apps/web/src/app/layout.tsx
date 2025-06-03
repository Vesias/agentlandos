import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import MainNavigation from '@/components/navigation/MainNavigation'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'AGENT_LAND_SAARLAND - Souveräne KI für das Saarland',
  description: 'KI-Plattform mit regionaler Expertise für Bürger, Unternehmen und Verwaltung im Saarland',
  keywords: 'Saarland, KI, Künstliche Intelligenz, Tourismus, Verwaltung, Wirtschaft',
  authors: [{ name: 'AGENT_LAND_SAARLAND Team' }],
  openGraph: {
    title: 'AGENT_LAND_SAARLAND',
    description: 'Souveräne KI-Technologie aus dem Saarland – für ein intelligentes Morgen',
    type: 'website',
    locale: 'de_DE',
    alternateLocale: ['fr_FR', 'en_US'],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="de">
      <body className={`${inter.className} bg-gray-50`}>
        <MainNavigation />
        <main className="min-h-screen">
          {children}
        </main>
      </body>
    </html>
  )
}