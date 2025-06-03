'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight, Bot, Shield, Users, Sparkles, Globe, Database } from 'lucide-react'
import RealTimeUserCounter from '@/components/RealTimeUserCounter'

export default function HomePage() {
  return (
    <div style={{ position: 'relative', minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      {/* Hero Section */}
      <section style={{ position: 'relative', minHeight: '90vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        {/* Background Gradient */}
        <div style={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: '800px',
          height: '800px',
          background: 'radial-gradient(circle, rgba(0,51,153,0.1) 0%, rgba(0,159,227,0.1) 100%)',
          filter: 'blur(100px)',
          transform: 'translate(50%, -50%)',
        }} />

        <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 10 }}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* Logo */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, duration: 0.6, type: "spring" }}
              style={{ marginBottom: '2rem' }}
            >
              <div style={{
                width: '128px',
                height: '128px',
                margin: '0 auto',
                background: 'linear-gradient(135deg, #003399 0%, #009FE3 100%)',
                borderRadius: '24px',
                padding: '2px',
                boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)'
              }}>
                <div style={{
                  width: '100%',
                  height: '100%',
                  backgroundColor: 'white',
                  borderRadius: '22px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Bot size={64} color="#003399" />
                </div>
              </div>
            </motion.div>

            {/* Title */}
            <h1 style={{
              fontSize: 'clamp(3rem, 8vw, 6rem)',
              fontWeight: 900,
              marginBottom: '1.5rem',
              lineHeight: 1.1
            }}>
              <span style={{
                background: 'linear-gradient(to right, #003399, #009FE3)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>
                AGENTLAND
              </span>
              <span style={{ color: '#111827' }}>.SAARLAND</span>
            </h1>

            <p style={{
              fontSize: 'clamp(1.25rem, 3vw, 2rem)',
              color: '#4b5563',
              maxWidth: '800px',
              margin: '0 auto 3rem',
              fontWeight: 300
            }}>
              Souveräne KI-Technologie aus dem Saarland – 
              <span style={{ color: '#003399', fontWeight: 500 }}> für ein intelligentes Morgen</span>
            </p>

            {/* Real-Time User Counter */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              style={{ marginBottom: '3rem' }}
            >
              <RealTimeUserCounter showDetails={false} />
            </motion.div>

            {/* CTA Buttons */}
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/chat" style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '1rem 2rem',
                fontSize: '1.125rem',
                fontWeight: 500,
                color: 'white',
                background: 'linear-gradient(to right, #003399, #009FE3)',
                borderRadius: '9999px',
                textDecoration: 'none',
                boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)',
                transition: 'all 0.3s',
              }}>
                KI-Agenten erkunden
                <ArrowRight size={20} style={{ marginLeft: '0.5rem' }} />
              </Link>
              
              <button style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '1rem 2rem',
                fontSize: '1.125rem',
                fontWeight: 500,
                color: '#003399',
                backgroundColor: 'white',
                border: '2px solid rgba(0,51,153,0.2)',
                borderRadius: '9999px',
                cursor: 'pointer',
                boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)',
                transition: 'all 0.3s',
              }}>
                Über das Projekt
                <Sparkles size={20} color="#FDB913" style={{ marginLeft: '0.5rem' }} />
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section style={{ padding: '5rem 2rem', backgroundColor: 'white' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            style={{ textAlign: 'center', marginBottom: '4rem' }}
          >
            <h2 style={{
              fontSize: 'clamp(2rem, 5vw, 3rem)',
              fontWeight: 900,
              marginBottom: '1.5rem'
            }}>
              <span style={{
                background: 'linear-gradient(to right, #003399, #009FE3)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>
                KI mit saarländischem Herz
              </span>
              <br />
              <span style={{ color: '#111827' }}>und globalem Verstand</span>
            </h2>
            <p style={{
              fontSize: '1.25rem',
              color: '#6b7280',
              maxWidth: '800px',
              margin: '0 auto'
            }}>
              Unsere Plattform verbindet modernste KI-Technologie mit regionaler Expertise 
              und demokratischen Werten.
            </p>
          </motion.div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
            gap: '2rem'
          }}>
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                style={{
                  padding: '2rem',
                  backgroundColor: 'white',
                  borderRadius: '16px',
                  boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)',
                  border: '1px solid #e5e7eb',
                  transition: 'all 0.3s',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)';
                }}
              >
                <div style={{
                  width: '56px',
                  height: '56px',
                  background: 'linear-gradient(135deg, #003399, #009FE3)',
                  borderRadius: '12px',
                  padding: '1px',
                  marginBottom: '1.5rem'
                }}>
                  <div style={{
                    width: '100%',
                    height: '100%',
                    backgroundColor: 'white',
                    borderRadius: '11px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <feature.icon size={28} color="#003399" />
                  </div>
                </div>
                <h3 style={{
                  fontSize: '1.25rem',
                  fontWeight: 700,
                  marginBottom: '0.75rem',
                  color: '#111827'
                }}>{feature.title}</h3>
                <p style={{
                  color: '#6b7280',
                  lineHeight: 1.6
                }}>{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{
        padding: '5rem 2rem',
        background: 'linear-gradient(135deg, #003399 0%, #009FE3 100%)',
        color: 'white',
        textAlign: 'center'
      }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          style={{ maxWidth: '800px', margin: '0 auto' }}
        >
          <h2 style={{
            fontSize: 'clamp(2rem, 5vw, 3rem)',
            fontWeight: 900,
            marginBottom: '1.5rem'
          }}>
            Bereit für die KI-Zukunft des Saarlandes?
          </h2>
          <p style={{
            fontSize: '1.25rem',
            marginBottom: '3rem',
            opacity: 0.9
          }}>
            Werden Sie Teil der regionalen KI-Revolution und gestalten Sie mit uns 
            die digitale Zukunft des Saarlandes.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/chat" style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: '1rem 2rem',
              fontSize: '1.125rem',
              fontWeight: 500,
              color: '#003399',
              backgroundColor: 'white',
              borderRadius: '9999px',
              textDecoration: 'none',
              boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)',
            }}>
              Jetzt loslegen
            </Link>
            <button style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: '1rem 2rem',
              fontSize: '1.125rem',
              fontWeight: 500,
              color: 'white',
              backgroundColor: 'rgba(255,255,255,0.1)',
              backdropFilter: 'blur(10px)',
              border: '2px solid rgba(255,255,255,0.3)',
              borderRadius: '9999px',
              cursor: 'pointer',
            }}>
              Kontakt aufnehmen
            </button>
          </div>
        </motion.div>
      </section>
    </div>
  )
}

const features = [
  {
    title: 'Technische Souveränität',
    description: 'Ihre Daten bleiben in der Region. Volle Kontrolle über KI-Prozesse und Datenhaltung.',
    icon: Shield,
  },
  {
    title: 'Regionale Intelligenz',
    description: 'KI-Agenten mit tiefem Verständnis für saarländische Besonderheiten und Bedürfnisse.',
    icon: Globe,
  },
  {
    title: 'Demokratische Governance',
    description: 'Transparente Entscheidungsprozesse und Community-getriebene Entwicklung.',
    icon: Users,
  },
  {
    title: 'Multi-Agenten-System',
    description: 'Spezialisierte Agenten arbeiten nahtlos zusammen für optimale Ergebnisse.',
    icon: Bot,
  },
  {
    title: 'Datenschutz First',
    description: 'DSGVO-konforme Verarbeitung mit Privacy-by-Design Prinzipien.',
    icon: Database,
  },
  {
    title: 'Innovation Hub',
    description: 'Verbindung zu DFKI und regionalen Forschungseinrichtungen.',
    icon: Sparkles,
  },
]