import Link from 'next/link'
import { Bot, MessageSquare } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Hero Section */}
      <section className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-3xl mx-auto text-center">
          {/* Logo */}
          <div className="w-24 h-24 mx-auto mb-8 bg-white rounded-2xl shadow-lg flex items-center justify-center">
            <div className="w-20 h-20 rounded-xl flex items-center justify-center bg-[#003399]">
              <Bot className="w-12 h-12 text-white" />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            <span className="text-[#003399]">AGENTLAND</span>
            <span className="text-[#009FE3]">.SAARLAND</span>
          </h1>

          {/* Subtitle */}
          <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
            Die KI-Plattform für das Saarland. Intelligent, regional, souverän.
          </p>

          {/* CTA Button */}
          <Link href="/chat">
            <button className="bg-[#003399] hover:bg-[#002266] text-white px-8 py-4 rounded-xl font-semibold text-lg transition-colors flex items-center justify-center mx-auto">
              <MessageSquare className="w-5 h-5 mr-2" />
              Chat starten
            </button>
          </Link>
        </div>
      </section>




    </div>
  )
}