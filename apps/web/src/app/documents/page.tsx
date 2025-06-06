import dynamic from 'next/dynamic'

// Dynamically import the AI Document Automation component
const AIDocumentAutomation = dynamic(() => import('@/components/AIDocumentAutomation'), {
  loading: () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Lade KI-Dokumentenerstellung...</p>
      </div>
    </div>
  )
})

export default function DocumentsPage() {
  return <AIDocumentAutomation />
}

export const metadata = {
  title: 'KI-Dokumentenerstellung | AGENTLAND.SAARLAND',
  description: 'Automatische Erstellung von Behörden- und Geschäftsdokumenten mit künstlicher Intelligenz für das Saarland.',
  keywords: 'KI, Dokumente, Automatisierung, Behörden, Saarland, AI, Formulare'
}