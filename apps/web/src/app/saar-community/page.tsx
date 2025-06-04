import React from 'react'
import { Metadata } from 'next'
import SaarCommunityDashboard from '@/components/SaarCommunityDashboard'

export const metadata: Metadata = {
  title: 'Saarland Community | agentland.saarland',
  description: 'Die digitale Heimat des Saarlandes - News, Fußball, Community. Bleib verbunden mit deiner Region!',
  keywords: [
    'Saarland Community',
    'Saar-Fußball',
    'Saarnews',
    'FC Saarbrücken',
    'SV Elversberg',
    'Saarland News',
    'Regional Community',
    'Saarländer',
    'Lokale Nachrichten'
  ].join(', '),
  openGraph: {
    title: 'Saarland Community - Dein digitaler Heimat-Hub',
    description: 'Entdecke die lebendige Saarland Community mit aktuellen News, Fußball-Updates und lokalen Events.',
    url: 'https://agentland.saarland/saar-community',
    type: 'website',
    images: [
      {
        url: '/api/placeholder/1200/630?text=Saarland+Community+Hub',
        width: 1200,
        height: 630,
        alt: 'Saarland Community Dashboard'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Saarland Community Hub',
    description: 'Deine digitale Heimat für News, Fußball und Community im Saarland',
    images: ['/api/placeholder/1200/630?text=Saarland+Community']
  }
}

export default function SaarCommunityPage() {
  return (
    <>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebApplication',
            name: 'Saarland Community Hub',
            description: 'Digitale Community-Plattform für das Saarland mit News, Fußball und lokalen Services',
            url: 'https://agentland.saarland/saar-community',
            applicationCategory: 'CommunityApplication',
            operatingSystem: 'Web',
            offers: {
              '@type': 'Offer',
              price: '0',
              priceCurrency: 'EUR'
            },
            featureList: [
              'Saarland News Aggregation',
              'Saar-Fußball Live Updates',
              'Community Gamification',
              'Premium Services',
              'Local Event Calendar',
              'User Profiles & Badges'
            ],
            inLanguage: 'de-DE',
            audience: {
              '@type': 'Audience',
              geographicArea: {
                '@type': 'AdministrativeArea',
                name: 'Saarland, Deutschland'
              }
            }
          })
        }}
      />

      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
        <SaarCommunityDashboard />
      </div>
    </>
  )
}