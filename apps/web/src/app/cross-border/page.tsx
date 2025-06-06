import dynamic from 'next/dynamic'

// Dynamically import the Cross-Border Services component
const CrossBorderServices = dynamic(() => import('@/components/CrossBorderServices'), {
  loading: () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Lade grenzüberschreitende Services...</p>
      </div>
    </div>
  )
})

export default function CrossBorderPage() {
  return <CrossBorderServices />
}

export const metadata = {
  title: 'Grenzüberschreitende Services | AGENTLAND.SAARLAND',
  description: 'Umfassende Services für Deutschland, Frankreich und Luxemburg - Grenzpendler, internationale Geschäfte und grenzüberschreitende Steuern.',
  keywords: 'Grenzpendler, Deutschland, Frankreich, Luxemburg, Steuern, Business, Cross-Border, Saarland'
}