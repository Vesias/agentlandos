import dynamic from 'next/dynamic'

const InteractiveSaarlandMap = dynamic(
  () => import('./InteractiveSaarlandMap'),
  { 
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-96 bg-gray-100 rounded-lg">
        <p className="text-gray-500">Karte wird geladen...</p>
      </div>
    )
  }
)

export default InteractiveSaarlandMap