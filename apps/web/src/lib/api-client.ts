/**
 * API Client for AGENTLAND.SAARLAND
 * Handles communication with SAARTASKS and SAARAG endpoints
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api'

export interface SaarTaskRequest {
  message: string
  language?: string
  session_id?: string
  location?: { lat: number; lng: number }
}

export interface SaarTaskResponse {
  agent_id: string
  agent_name: string
  message: string
  confidence: number
  thought_process: string[]
  regional_context?: string
  metadata?: Record<string, any>
}

export interface SaaRagQuery {
  query: string
  limit?: number
  category?: string
}

export interface SaaRagResponse {
  query: string
  total_results: number
  results: Array<{
    id: string
    category: string
    title: string
    content: string
    relevance_score: number
    tags: string[]
  }>
  metadata: Record<string, any>
}

class AgentlandApiClient {
  private baseUrl: string

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl
  }

  /**
   * Query SAARTASKS AI Agent
   */
  async querySaarTasks(request: SaarTaskRequest): Promise<SaarTaskResponse> {
    const response = await fetch(`${this.baseUrl}/saartasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    })

    if (!response.ok) {
      throw new Error(`SAARTASKS Error: ${response.status}`)
    }

    return response.json()
  }

  /**
   * Search SAARAG Vector Database
   */
  async searchSaaRag(query: SaaRagQuery): Promise<SaaRagResponse> {
    const response = await fetch(`${this.baseUrl}/saarag`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(query),
    })

    if (!response.ok) {
      throw new Error(`SAARAG Error: ${response.status}`)
    }

    return response.json()
  }

  /**
   * Get API Health Status
   */
  async getHealthStatus(): Promise<Record<string, any>> {
    const response = await fetch(`${this.baseUrl}/health`)
    
    if (!response.ok) {
      throw new Error(`Health Check Error: ${response.status}`)
    }

    return response.json()
  }

  /**
   * Get SAARAG Database Stats
   */
  async getSaaRagStats(): Promise<Record<string, any>> {
    const response = await fetch(`${this.baseUrl}/saarag`)
    
    if (!response.ok) {
      throw new Error(`SAARAG Stats Error: ${response.status}`)
    }

    return response.json()
  }
}

// Export singleton instance
export const apiClient = new AgentlandApiClient()

// Export convenience functions
export const saarTasks = {
  ask: (message: string, language: string = 'de') => 
    apiClient.querySaarTasks({ message, language }),
  
  askWithLocation: (message: string, location: { lat: number; lng: number }, language: string = 'de') =>
    apiClient.querySaarTasks({ message, language, location }),
}

export const saaRag = {
  search: (query: string, limit: number = 5) =>
    apiClient.searchSaaRag({ query, limit }),
    
  searchByCategory: (query: string, category: string, limit: number = 5) =>
    apiClient.searchSaaRag({ query, category, limit }),
}

export const health = {
  check: () => apiClient.getHealthStatus(),
  saarag: () => apiClient.getSaaRagStats(),
}