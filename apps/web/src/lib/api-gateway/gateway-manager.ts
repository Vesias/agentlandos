import { supabase } from '@/lib/supabase'

export interface APIKey {
  id: string
  tenant_id: string
  name: string
  key_hash: string // Hashed version for security
  key_prefix: string // First 8 characters for display (e.g., 'ak_live_12345678')
  environment: 'sandbox' | 'production'
  status: 'active' | 'suspended' | 'revoked'
  permissions: {
    endpoints: string[] // ['chat', 'documents', 'workflows', '*']
    rate_limits: {
      requests_per_minute: number
      requests_per_hour: number
      requests_per_day: number
      requests_per_month: number
    }
    ip_whitelist?: string[]
    allowed_origins?: string[]
  }
  usage_analytics: {
    total_requests: number
    successful_requests: number
    failed_requests: number
    last_used_at?: string
    current_month_usage: number
    current_month_cost: number
  }
  billing: {
    plan: 'free' | 'basic' | 'professional' | 'enterprise' | 'custom'
    cost_per_request: number
    included_requests: number
    overage_rate: number
    billing_cycle: 'monthly' | 'yearly'
  }
  metadata: {
    description?: string
    webhook_url?: string
    created_by: string
    created_at: string
    updated_at: string
    expires_at?: string
  }
}

export interface RateLimitRule {
  id: string
  name: string
  tenant_id?: string // null for global rules
  priority: number
  conditions: {
    api_key_plan?: string[]
    endpoints?: string[]
    ip_ranges?: string[]
    user_agents?: string[]
    geographic_regions?: string[]
    time_windows?: Array<{
      start_time: string // HH:MM format
      end_time: string
      timezone: string
    }>
  }
  limits: {
    requests_per_second: number
    requests_per_minute: number
    requests_per_hour: number
    requests_per_day: number
    burst_capacity: number
    concurrent_requests: number
  }
  actions: {
    on_limit_exceeded: 'block' | 'queue' | 'throttle' | 'upgrade_prompt'
    retry_after_seconds?: number
    queue_timeout_seconds?: number
    throttle_factor?: number // 0.1 to 1.0
    custom_response?: {
      status_code: number
      message: string
      headers: Record<string, string>
    }
  }
  monitoring: {
    alert_threshold: number // percentage of limit
    notification_channels: string[]
    log_violations: boolean
  }
  active: boolean
  created_at: string
  updated_at: string
}

export interface APIUsageMetrics {
  tenant_id?: string
  api_key_id?: string
  endpoint: string
  method: string
  timestamp: string
  response_time_ms: number
  status_code: number
  request_size_bytes: number
  response_size_bytes: number
  ip_address: string
  user_agent: string
  geographic_location?: {
    country: string
    region: string
    city: string
  }
  cost_incurred: number
  rate_limit_hit: boolean
  error_details?: {
    error_type: string
    error_message: string
  }
}

export interface MonetizationRule {
  id: string
  name: string
  tenant_id?: string
  pricing_model: 'per_request' | 'per_token' | 'tiered' | 'usage_based' | 'subscription'
  pricing_config: {
    base_price?: number
    per_request_price?: number
    per_token_price?: number
    tiers?: Array<{
      from: number
      to?: number
      price: number
    }>
    included_quota?: number
    overage_rate?: number
  }
  conditions: {
    endpoints?: string[]
    api_key_plans?: string[]
    request_types?: string[]
    response_size_thresholds?: {
      small: number // bytes
      medium: number
      large: number
    }
    ai_model_used?: string[]
    processing_complexity?: 'simple' | 'medium' | 'complex'
  }
  billing_frequency: 'real_time' | 'daily' | 'monthly'
  currency: 'EUR' | 'USD'
  active: boolean
  created_at: string
  updated_at: string
}

export interface APIGatewayConfig {
  tenant_id: string
  global_settings: {
    default_rate_limits: {
      requests_per_minute: number
      requests_per_hour: number
      requests_per_day: number
    }
    security: {
      require_https: boolean
      cors_enabled: boolean
      allowed_origins: string[]
      require_api_key: boolean
      ip_blocking_enabled: boolean
      ddos_protection: boolean
    }
    caching: {
      enabled: boolean
      default_ttl_seconds: number
      cache_headers: boolean
      cache_by_query_params: boolean
    }
    monitoring: {
      detailed_logging: boolean
      performance_tracking: boolean
      error_tracking: boolean
      analytics_retention_days: number
    }
  }
  custom_domains: Array<{
    domain: string
    ssl_certificate: string
    redirect_to_https: boolean
    status: 'active' | 'pending' | 'error'
  }>
  load_balancing: {
    strategy: 'round_robin' | 'least_connections' | 'weighted' | 'geographic'
    health_checks: {
      enabled: boolean
      interval_seconds: number
      timeout_seconds: number
      failure_threshold: number
    }
    upstream_servers: Array<{
      url: string
      weight: number
      region: string
      status: 'healthy' | 'unhealthy' | 'maintenance'
    }>
  }
}

class APIGatewayManager {
  private rateLimitStore: Map<string, { count: number; resetTime: number }> = new Map()
  private requestQueue: Map<string, Array<{ resolve: Function; reject: Function; timeout: NodeJS.Timeout }>> = new Map()

  async createAPIKey(tenantId: string, keyData: Omit<APIKey, 'id' | 'key_hash' | 'key_prefix' | 'usage_analytics' | 'metadata'>): Promise<{ api_key: APIKey; secret_key: string }> {
    try {
      const keyId = crypto.randomUUID()
      const secretKey = this.generateSecretKey()
      const keyHash = await this.hashAPIKey(secretKey)
      const keyPrefix = secretKey.substring(0, 12) // ak_live_12345678

      const apiKey: APIKey = {
        id: keyId,
        tenant_id: tenantId,
        key_hash: keyHash,
        key_prefix: keyPrefix,
        usage_analytics: {
          total_requests: 0,
          successful_requests: 0,
          failed_requests: 0,
          current_month_usage: 0,
          current_month_cost: 0
        },
        metadata: {
          created_by: keyData.metadata?.created_by || 'system',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        ...keyData
      }

      // Save to database
      const { error } = await supabase
        .from('api_keys')
        .insert([apiKey])

      if (error) throw error

      // Never store the plain secret key
      return {
        api_key: apiKey,
        secret_key: secretKey // Return once for the user to store securely
      }
    } catch (error) {
      console.error('API key creation failed:', error)
      throw error
    }
  }

  async validateAPIKey(keyString: string): Promise<APIKey | null> {
    try {
      const keyHash = await this.hashAPIKey(keyString)
      
      const { data, error } = await supabase
        .from('api_keys')
        .select('*')
        .eq('key_hash', keyHash)
        .eq('status', 'active')
        .single()

      if (error || !data) return null

      // Update last used timestamp
      await this.updateKeyUsage(data.id, { last_used_at: new Date().toISOString() })

      return data as APIKey
    } catch (error) {
      console.error('API key validation failed:', error)
      return null
    }
  }

  async checkRateLimit(apiKey: APIKey, endpoint: string, ipAddress: string): Promise<{ allowed: boolean; retryAfter?: number; reason?: string }> {
    try {
      // Get applicable rate limit rules
      const rules = await this.getRateLimitRules(apiKey.tenant_id, endpoint, ipAddress)
      
      for (const rule of rules) {
        const limitKey = `${rule.id}:${apiKey.id}:${endpoint}:${ipAddress}`
        const now = Date.now()
        
        // Check different time windows
        const checks = [
          { limit: rule.limits.requests_per_second, window: 1000, key: `${limitKey}:second` },
          { limit: rule.limits.requests_per_minute, window: 60000, key: `${limitKey}:minute` },
          { limit: rule.limits.requests_per_hour, window: 3600000, key: `${limitKey}:hour` },
          { limit: rule.limits.requests_per_day, window: 86400000, key: `${limitKey}:day` }
        ]

        for (const check of checks) {
          const stored = this.rateLimitStore.get(check.key)
          
          if (!stored || now > stored.resetTime) {
            // Reset counter
            this.rateLimitStore.set(check.key, { count: 1, resetTime: now + check.window })
          } else {
            // Increment counter
            stored.count++
            
            if (stored.count > check.limit) {
              const retryAfter = Math.ceil((stored.resetTime - now) / 1000)
              
              // Handle rate limit exceeded
              await this.handleRateLimitExceeded(rule, apiKey, endpoint, {
                limit_type: this.getTimeWindowName(check.window),
                current_count: stored.count,
                limit: check.limit,
                retry_after: retryAfter
              })

              return {
                allowed: false,
                retryAfter,
                reason: `Rate limit exceeded: ${stored.count}/${check.limit} requests per ${this.getTimeWindowName(check.window)}`
              }
            }
          }
        }
      }

      return { allowed: true }
    } catch (error) {
      console.error('Rate limit check failed:', error)
      return { allowed: false, reason: 'Rate limit check error' }
    }
  }

  async processAPIRequest(request: {
    api_key: string
    endpoint: string
    method: string
    ip_address: string
    user_agent: string
    request_body?: any
    query_params?: Record<string, string>
  }): Promise<{ success: boolean; data?: any; error?: string; cost?: number; rate_limited?: boolean }> {
    try {
      // 1. Validate API Key
      const apiKey = await this.validateAPIKey(request.api_key)
      if (!apiKey) {
        return { success: false, error: 'Invalid API key' }
      }

      // 2. Check permissions
      if (!this.checkEndpointPermission(apiKey, request.endpoint)) {
        return { success: false, error: 'Insufficient permissions for this endpoint' }
      }

      // 3. Check rate limits
      const rateLimitCheck = await this.checkRateLimit(apiKey, request.endpoint, request.ip_address)
      if (!rateLimitCheck.allowed) {
        await this.logAPIUsage({
          api_key_id: apiKey.id,
          tenant_id: apiKey.tenant_id,
          endpoint: request.endpoint,
          method: request.method,
          timestamp: new Date().toISOString(),
          response_time_ms: 0,
          status_code: 429,
          request_size_bytes: JSON.stringify(request.request_body || {}).length,
          response_size_bytes: 0,
          ip_address: request.ip_address,
          user_agent: request.user_agent,
          cost_incurred: 0,
          rate_limit_hit: true
        })

        return { 
          success: false, 
          error: rateLimitCheck.reason || 'Rate limit exceeded',
          rate_limited: true
        }
      }

      // 4. Process the actual request
      const startTime = Date.now()
      const response = await this.executeAPICall(request, apiKey)
      const responseTime = Date.now() - startTime

      // 5. Calculate cost
      const cost = await this.calculateRequestCost(apiKey, request, response)

      // 6. Log usage
      await this.logAPIUsage({
        api_key_id: apiKey.id,
        tenant_id: apiKey.tenant_id,
        endpoint: request.endpoint,
        method: request.method,
        timestamp: new Date().toISOString(),
        response_time_ms: responseTime,
        status_code: response.status_code,
        request_size_bytes: JSON.stringify(request.request_body || {}).length,
        response_size_bytes: JSON.stringify(response.data || {}).length,
        ip_address: request.ip_address,
        user_agent: request.user_agent,
        cost_incurred: cost,
        rate_limit_hit: false
      })

      // 7. Update API key usage
      await this.updateKeyUsage(apiKey.id, {
        total_requests: apiKey.usage_analytics.total_requests + 1,
        successful_requests: apiKey.usage_analytics.successful_requests + (response.status_code < 400 ? 1 : 0),
        failed_requests: apiKey.usage_analytics.failed_requests + (response.status_code >= 400 ? 1 : 0),
        current_month_usage: apiKey.usage_analytics.current_month_usage + 1,
        current_month_cost: apiKey.usage_analytics.current_month_cost + cost
      })

      return {
        success: response.status_code < 400,
        data: response.data,
        error: response.status_code >= 400 ? response.error : undefined,
        cost
      }
    } catch (error) {
      console.error('API request processing failed:', error)
      return { success: false, error: 'Internal server error' }
    }
  }

  private async executeAPICall(request: any, apiKey: APIKey): Promise<{ status_code: number; data?: any; error?: string }> {
    // This would route to the actual API endpoints
    // For now, return a mock response
    
    const responses: Record<string, any> = {
      '/chat': {
        status_code: 200,
        data: {
          response: 'Hello! This is a mock AI response from the API Gateway.',
          model: 'deepseek-reasoner-r1-0528',
          tokens_used: 150
        }
      },
      '/documents/generate': {
        status_code: 200,
        data: {
          document_id: crypto.randomUUID(),
          status: 'generated',
          download_url: '/api/documents/download/123'
        }
      },
      '/workflows/execute': {
        status_code: 200,
        data: {
          execution_id: crypto.randomUUID(),
          status: 'started',
          estimated_completion: '30 seconds'
        }
      }
    }

    return responses[request.endpoint] || {
      status_code: 404,
      error: 'Endpoint not found'
    }
  }

  private async calculateRequestCost(apiKey: APIKey, request: any, response: any): Promise<number> {
    try {
      // Get monetization rules for this API key/tenant
      const rules = await this.getMonetizationRules(apiKey.tenant_id, request.endpoint)
      
      let totalCost = 0

      for (const rule of rules) {
        switch (rule.pricing_model) {
          case 'per_request':
            totalCost += rule.pricing_config.per_request_price || 0
            break

          case 'per_token':
            const tokensUsed = response.data?.tokens_used || 100 // Default estimate
            totalCost += (rule.pricing_config.per_token_price || 0) * tokensUsed
            break

          case 'tiered':
            const usage = apiKey.usage_analytics.current_month_usage
            const tier = rule.pricing_config.tiers?.find(t => 
              usage >= t.from && (!t.to || usage <= t.to)
            )
            if (tier) {
              totalCost += tier.price
            }
            break

          case 'usage_based':
            const responseSize = JSON.stringify(response.data || {}).length
            const sizeCost = responseSize * (rule.pricing_config.per_request_price || 0.001)
            totalCost += sizeCost
            break
        }
      }

      return Math.round(totalCost * 100) / 100 // Round to 2 decimal places
    } catch (error) {
      console.error('Cost calculation failed:', error)
      return 0
    }
  }

  private generateSecretKey(): string {
    const prefix = 'ak_live_'
    const randomPart = Array.from(crypto.getRandomValues(new Uint8Array(32)))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')
    return prefix + randomPart
  }

  private async hashAPIKey(key: string): Promise<string> {
    const encoder = new TextEncoder()
    const data = encoder.encode(key)
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  }

  private checkEndpointPermission(apiKey: APIKey, endpoint: string): boolean {
    const permissions = apiKey.permissions.endpoints
    return permissions.includes('*') || permissions.some(p => endpoint.startsWith(p))
  }

  private async getRateLimitRules(tenantId: string, endpoint: string, ipAddress: string): Promise<RateLimitRule[]> {
    try {
      const { data, error } = await supabase
        .from('rate_limit_rules')
        .select('*')
        .or(`tenant_id.is.null,tenant_id.eq.${tenantId}`)
        .eq('active', true)
        .order('priority', { ascending: true })

      if (error) throw error

      // Filter rules that apply to this request
      return (data as RateLimitRule[]).filter(rule => {
        if (rule.conditions.endpoints && !rule.conditions.endpoints.some(e => endpoint.startsWith(e))) {
          return false
        }
        // Add more condition checks here
        return true
      })
    } catch (error) {
      console.error('Rate limit rules fetch failed:', error)
      return []
    }
  }

  private async getMonetizationRules(tenantId: string, endpoint: string): Promise<MonetizationRule[]> {
    try {
      const { data, error } = await supabase
        .from('monetization_rules')
        .select('*')
        .or(`tenant_id.is.null,tenant_id.eq.${tenantId}`)
        .eq('active', true)

      if (error) throw error

      return (data as MonetizationRule[]).filter(rule => {
        if (rule.conditions.endpoints && !rule.conditions.endpoints.some(e => endpoint.startsWith(e))) {
          return false
        }
        return true
      })
    } catch (error) {
      console.error('Monetization rules fetch failed:', error)
      return []
    }
  }

  private async handleRateLimitExceeded(rule: RateLimitRule, apiKey: APIKey, endpoint: string, details: any): Promise<void> {
    switch (rule.actions.on_limit_exceeded) {
      case 'block':
        // Already handled by returning rate limit exceeded
        break

      case 'queue':
        await this.queueRequest(apiKey.id, endpoint, rule.actions.queue_timeout_seconds || 30)
        break

      case 'throttle':
        // Implement throttling logic
        break

      case 'upgrade_prompt':
        await this.sendUpgradePrompt(apiKey, details)
        break
    }

    // Send alerts if configured
    if (rule.monitoring.alert_threshold && details.current_count >= rule.limits.requests_per_minute * (rule.monitoring.alert_threshold / 100)) {
      await this.sendRateLimitAlert(rule, apiKey, details)
    }
  }

  private async queueRequest(apiKeyId: string, endpoint: string, timeoutSeconds: number): Promise<void> {
    const queueKey = `${apiKeyId}:${endpoint}`
    
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Request queue timeout'))
      }, timeoutSeconds * 1000)

      if (!this.requestQueue.has(queueKey)) {
        this.requestQueue.set(queueKey, [])
      }

      this.requestQueue.get(queueKey)!.push({ resolve, reject, timeout })
    })
  }

  private async sendUpgradePrompt(apiKey: APIKey, details: any): Promise<void> {
    // Send upgrade notification to tenant
    console.log(`Upgrade prompt sent to tenant ${apiKey.tenant_id}`)
  }

  private async sendRateLimitAlert(rule: RateLimitRule, apiKey: APIKey, details: any): Promise<void> {
    // Send alert to monitoring channels
    console.log(`Rate limit alert sent for rule ${rule.name}`)
  }

  private getTimeWindowName(windowMs: number): string {
    if (windowMs === 1000) return 'second'
    if (windowMs === 60000) return 'minute'
    if (windowMs === 3600000) return 'hour'
    if (windowMs === 86400000) return 'day'
    return 'unknown'
  }

  private async updateKeyUsage(keyId: string, updates: Partial<APIKey['usage_analytics']>): Promise<void> {
    try {
      const { error } = await supabase
        .from('api_keys')
        .update({
          usage_analytics: updates,
          'metadata.updated_at': new Date().toISOString()
        })
        .eq('id', keyId)

      if (error) throw error
    } catch (error) {
      console.error('Key usage update failed:', error)
    }
  }

  private async logAPIUsage(metrics: APIUsageMetrics): Promise<void> {
    try {
      const { error } = await supabase
        .from('api_usage_metrics')
        .insert([metrics])

      if (error) throw error
    } catch (error) {
      console.error('Usage logging failed:', error)
    }
  }

  // Public API methods
  async getAPIKeys(tenantId: string): Promise<APIKey[]> {
    try {
      const { data, error } = await supabase
        .from('api_keys')
        .select('*')
        .eq('tenant_id', tenantId)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data as APIKey[]
    } catch (error) {
      console.error('API keys fetch failed:', error)
      return []
    }
  }

  async getUsageAnalytics(tenantId: string, timeframe: '24h' | '7d' | '30d' | '90d'): Promise<any> {
    try {
      const cutoff = new Date()
      const days = timeframe === '24h' ? 1 : timeframe === '7d' ? 7 : timeframe === '30d' ? 30 : 90
      cutoff.setDate(cutoff.getDate() - days)

      const { data, error } = await supabase
        .from('api_usage_metrics')
        .select('*')
        .eq('tenant_id', tenantId)
        .gte('timestamp', cutoff.toISOString())

      if (error) throw error

      const metrics = data as APIUsageMetrics[]
      
      return {
        total_requests: metrics.length,
        successful_requests: metrics.filter(m => m.status_code < 400).length,
        failed_requests: metrics.filter(m => m.status_code >= 400).length,
        average_response_time: metrics.reduce((sum, m) => sum + m.response_time_ms, 0) / metrics.length || 0,
        total_cost: metrics.reduce((sum, m) => sum + m.cost_incurred, 0),
        rate_limit_hits: metrics.filter(m => m.rate_limit_hit).length,
        top_endpoints: this.getTopEndpoints(metrics),
        usage_by_hour: this.getUsageByHour(metrics),
        geographic_distribution: this.getGeographicDistribution(metrics)
      }
    } catch (error) {
      console.error('Usage analytics fetch failed:', error)
      throw error
    }
  }

  private getTopEndpoints(metrics: APIUsageMetrics[]): any[] {
    const endpointCounts = metrics.reduce((acc, m) => {
      acc[m.endpoint] = (acc[m.endpoint] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return Object.entries(endpointCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([endpoint, count]) => ({ endpoint, count }))
  }

  private getUsageByHour(metrics: APIUsageMetrics[]): any[] {
    const hourCounts = metrics.reduce((acc, m) => {
      const hour = new Date(m.timestamp).getHours()
      acc[hour] = (acc[hour] || 0) + 1
      return acc
    }, {} as Record<number, number>)

    return Array.from({ length: 24 }, (_, hour) => ({
      hour,
      requests: hourCounts[hour] || 0
    }))
  }

  private getGeographicDistribution(metrics: APIUsageMetrics[]): any[] {
    const countryCounts = metrics.reduce((acc, m) => {
      const country = m.geographic_location?.country || 'Unknown'
      acc[country] = (acc[country] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return Object.entries(countryCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([country, count]) => ({ country, count }))
  }
}

export default APIGatewayManager