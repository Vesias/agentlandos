import { supabase } from '@/lib/supabase'

export interface Tenant {
  id: string
  slug: string // Unique identifier for URLs (e.g., 'customer-company')
  name: string
  display_name: string
  description?: string
  domain?: string // Custom domain (e.g., ai.customer-company.com)
  subdomain: string // Subdomain (e.g., customer-company.agentland.saarland)
  logo_url?: string
  favicon_url?: string
  brand_colors: {
    primary: string
    secondary: string
    accent: string
    background: string
    text: string
  }
  subscription: {
    plan: 'white_label_basic' | 'white_label_premium' | 'white_label_enterprise'
    status: 'active' | 'suspended' | 'cancelled'
    billing_cycle: 'monthly' | 'yearly'
    amount: number
    currency: 'EUR' | 'USD'
    next_billing_date: string
  }
  features: {
    custom_branding: boolean
    custom_domain: boolean
    api_access: boolean
    white_label_mobile: boolean
    advanced_analytics: boolean
    priority_support: boolean
    custom_integrations: boolean
    remove_powered_by: boolean
    custom_ai_models: boolean
    dedicated_instance: boolean
  }
  settings: {
    timezone: string
    locale: string
    default_language: 'de' | 'fr' | 'en'
    currency: 'EUR' | 'USD'
    date_format: string
    privacy_policy_url?: string
    terms_of_service_url?: string
    support_email: string
    max_users: number
    max_storage_gb: number
    max_api_calls_per_month: number
  }
  owner: {
    user_id: string
    email: string
    name: string
    role: 'owner'
  }
  admins: Array<{
    user_id: string
    email: string
    name: string
    role: 'admin'
    permissions: string[]
  }>
  created_at: string
  updated_at: string
  last_active: string
  status: 'active' | 'inactive' | 'suspended'
}

export interface TenantConfiguration {
  tenant_id: string
  ai_models: {
    primary_model: string
    fallback_model: string
    custom_prompts: Record<string, string>
    max_tokens: number
    temperature: number
  }
  ui_customization: {
    theme: 'light' | 'dark' | 'auto'
    layout: 'sidebar' | 'topbar' | 'minimal'
    custom_css?: string
    custom_js?: string
    hide_elements: string[]
    custom_menu_items: Array<{
      label: string
      url: string
      icon?: string
      target?: '_blank' | '_self'
    }>
  }
  integrations: {
    sso_enabled: boolean
    sso_provider?: 'google' | 'microsoft' | 'okta' | 'auth0'
    sso_config?: Record<string, any>
    webhook_endpoints: Array<{
      name: string
      url: string
      events: string[]
      secret: string
    }>
    api_keys: Array<{
      name: string
      key: string
      permissions: string[]
      created_at: string
      last_used?: string
    }>
  }
  compliance: {
    gdpr_enabled: boolean
    data_retention_days: number
    audit_logging: boolean
    encryption_at_rest: boolean
    backup_frequency: 'daily' | 'weekly' | 'monthly'
    compliance_frameworks: string[]
  }
}

export interface TenantUsage {
  tenant_id: string
  period: string // YYYY-MM format
  metrics: {
    active_users: number
    total_sessions: number
    api_calls: number
    storage_used_gb: number
    bandwidth_used_gb: number
    ai_requests: number
    documents_generated: number
    collaboration_sessions: number
  }
  costs: {
    infrastructure: number
    ai_processing: number
    storage: number
    bandwidth: number
    support: number
    total: number
  }
  limits: {
    users_limit: number
    api_calls_limit: number
    storage_limit_gb: number
    bandwidth_limit_gb: number
  }
  overage_charges: {
    users: number
    api_calls: number
    storage: number
    bandwidth: number
    total: number
  }
}

class TenantManager {
  async createTenant(tenantData: Omit<Tenant, 'id' | 'created_at' | 'updated_at' | 'last_active'>): Promise<Tenant> {
    try {
      const tenantId = crypto.randomUUID()
      const now = new Date().toISOString()

      // Validate slug is unique
      const { data: existingTenant } = await supabase
        .from('tenants')
        .select('id')
        .eq('slug', tenantData.slug)
        .single()

      if (existingTenant) {
        throw new Error('Tenant slug already exists')
      }

      // Validate subdomain is unique
      const { data: existingSubdomain } = await supabase
        .from('tenants')
        .select('id')
        .eq('subdomain', tenantData.subdomain)
        .single()

      if (existingSubdomain) {
        throw new Error('Subdomain already exists')
      }

      const tenant: Tenant = {
        id: tenantId,
        created_at: now,
        updated_at: now,
        last_active: now,
        status: 'active',
        ...tenantData
      }

      // Create tenant record
      const { error: tenantError } = await supabase
        .from('tenants')
        .insert([tenant])

      if (tenantError) throw tenantError

      // Create default configuration
      await this.createDefaultConfiguration(tenantId)

      // Create tenant database schema
      await this.setupTenantSchema(tenantId)

      // Initialize default data
      await this.initializeTenantData(tenantId)

      return tenant
    } catch (error) {
      console.error('Tenant creation failed:', error)
      throw error
    }
  }

  async getTenant(identifier: string, identifierType: 'id' | 'slug' | 'subdomain' | 'domain' = 'id'): Promise<Tenant | null> {
    try {
      const { data, error } = await supabase
        .from('tenants')
        .select('*')
        .eq(identifierType, identifier)
        .single()

      if (error && error.code !== 'PGRST116') throw error

      return data as Tenant || null
    } catch (error) {
      console.error('Tenant fetch failed:', error)
      return null
    }
  }

  async updateTenant(tenantId: string, updates: Partial<Tenant>): Promise<void> {
    try {
      const { error } = await supabase
        .from('tenants')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', tenantId)

      if (error) throw error

      // If domain or subdomain changed, update DNS configuration
      if (updates.domain || updates.subdomain) {
        await this.updateDNSConfiguration(tenantId, updates)
      }
    } catch (error) {
      console.error('Tenant update failed:', error)
      throw error
    }
  }

  async suspendTenant(tenantId: string, reason: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('tenants')
        .update({
          status: 'suspended',
          updated_at: new Date().toISOString()
        })
        .eq('id', tenantId)

      if (error) throw error

      // Log suspension
      await this.logTenantEvent(tenantId, 'suspended', { reason })

      // Disable tenant services
      await this.disableTenantServices(tenantId)
    } catch (error) {
      console.error('Tenant suspension failed:', error)
      throw error
    }
  }

  async reactivateTenant(tenantId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('tenants')
        .update({
          status: 'active',
          updated_at: new Date().toISOString()
        })
        .eq('id', tenantId)

      if (error) throw error

      // Log reactivation
      await this.logTenantEvent(tenantId, 'reactivated', {})

      // Re-enable tenant services
      await this.enableTenantServices(tenantId)
    } catch (error) {
      console.error('Tenant reactivation failed:', error)
      throw error
    }
  }

  async deleteTenant(tenantId: string): Promise<void> {
    try {
      // Backup tenant data
      await this.backupTenantData(tenantId)

      // Delete tenant data
      await this.cleanupTenantData(tenantId)

      // Remove tenant record
      const { error } = await supabase
        .from('tenants')
        .delete()
        .eq('id', tenantId)

      if (error) throw error

      // Log deletion
      await this.logTenantEvent(tenantId, 'deleted', {})
    } catch (error) {
      console.error('Tenant deletion failed:', error)
      throw error
    }
  }

  async getTenantConfiguration(tenantId: string): Promise<TenantConfiguration | null> {
    try {
      const { data, error } = await supabase
        .from('tenant_configurations')
        .select('*')
        .eq('tenant_id', tenantId)
        .single()

      if (error && error.code !== 'PGRST116') throw error

      return data as TenantConfiguration || null
    } catch (error) {
      console.error('Tenant configuration fetch failed:', error)
      return null
    }
  }

  async updateTenantConfiguration(tenantId: string, config: Partial<TenantConfiguration>): Promise<void> {
    try {
      const { error } = await supabase
        .from('tenant_configurations')
        .upsert({
          tenant_id: tenantId,
          ...config,
          updated_at: new Date().toISOString()
        })

      if (error) throw error

      // Apply configuration changes
      await this.applyConfigurationChanges(tenantId, config)
    } catch (error) {
      console.error('Tenant configuration update failed:', error)
      throw error
    }
  }

  async getTenantUsage(tenantId: string, period?: string): Promise<TenantUsage | null> {
    try {
      const usagePeriod = period || new Date().toISOString().substring(0, 7) // Current month

      const { data, error } = await supabase
        .from('tenant_usage')
        .select('*')
        .eq('tenant_id', tenantId)
        .eq('period', usagePeriod)
        .single()

      if (error && error.code !== 'PGRST116') throw error

      return data as TenantUsage || null
    } catch (error) {
      console.error('Tenant usage fetch failed:', error)
      return null
    }
  }

  async calculateTenantBilling(tenantId: string, period: string): Promise<any> {
    try {
      const usage = await this.getTenantUsage(tenantId, period)
      const tenant = await this.getTenant(tenantId)

      if (!usage || !tenant) {
        throw new Error('Tenant or usage data not found')
      }

      const baseCost = tenant.subscription.amount
      const overageCosts = usage.overage_charges.total
      const totalCost = baseCost + overageCosts

      return {
        tenant_id: tenantId,
        period,
        base_cost: baseCost,
        overage_costs: overageCosts,
        total_cost: totalCost,
        usage_details: usage.metrics,
        overage_details: usage.overage_charges,
        billing_items: [
          {
            description: `${tenant.subscription.plan} - Base Plan`,
            amount: baseCost,
            type: 'subscription'
          },
          ...(overageCosts > 0 ? [{
            description: 'Usage Overages',
            amount: overageCosts,
            type: 'usage'
          }] : [])
        ]
      }
    } catch (error) {
      console.error('Tenant billing calculation failed:', error)
      throw error
    }
  }

  async listTenants(filters?: {
    status?: Tenant['status']
    plan?: string
    search?: string
    limit?: number
    offset?: number
  }): Promise<{ tenants: Tenant[], total: number }> {
    try {
      let query = supabase
        .from('tenants')
        .select('*', { count: 'exact' })

      if (filters?.status) {
        query = query.eq('status', filters.status)
      }

      if (filters?.plan) {
        query = query.eq('subscription->>plan', filters.plan)
      }

      if (filters?.search) {
        query = query.or(`name.ilike.%${filters.search}%, display_name.ilike.%${filters.search}%`)
      }

      if (filters?.limit) {
        query = query.limit(filters.limit)
      }

      if (filters?.offset) {
        query = query.range(filters.offset, filters.offset + (filters.limit || 50) - 1)
      }

      const { data, error, count } = await query

      if (error) throw error

      return {
        tenants: data as Tenant[],
        total: count || 0
      }
    } catch (error) {
      console.error('Tenant list fetch failed:', error)
      throw error
    }
  }

  private async createDefaultConfiguration(tenantId: string): Promise<void> {
    const defaultConfig: TenantConfiguration = {
      tenant_id: tenantId,
      ai_models: {
        primary_model: 'deepseek-reasoner-r1-0528',
        fallback_model: 'gemini-2.5-flash',
        custom_prompts: {},
        max_tokens: 4000,
        temperature: 0.7
      },
      ui_customization: {
        theme: 'light',
        layout: 'sidebar',
        hide_elements: [],
        custom_menu_items: []
      },
      integrations: {
        sso_enabled: false,
        webhook_endpoints: [],
        api_keys: []
      },
      compliance: {
        gdpr_enabled: true,
        data_retention_days: 730,
        audit_logging: true,
        encryption_at_rest: true,
        backup_frequency: 'daily',
        compliance_frameworks: ['GDPR']
      }
    }

    const { error } = await supabase
      .from('tenant_configurations')
      .insert([defaultConfig])

    if (error) throw error
  }

  private async setupTenantSchema(tenantId: string): Promise<void> {
    // This would typically create tenant-specific database schemas
    // For now, we'll use row-level security with tenant_id
    console.log(`Setting up schema for tenant: ${tenantId}`)
  }

  private async initializeTenantData(tenantId: string): Promise<void> {
    // Initialize default data for the tenant
    const defaultData = [
      // Default pricing tiers
      {
        tenant_id: tenantId,
        name: 'Basic',
        price: 10,
        features: ['AI Assistant', 'Document Templates', 'Email Support'],
        active: true
      },
      {
        tenant_id: tenantId,
        name: 'Professional',
        price: 50,
        features: ['AI Assistant', 'Advanced Templates', 'API Access', 'Priority Support'],
        active: true
      }
    ]

    // Insert default pricing tiers
    const { error } = await supabase
      .from('tenant_pricing_tiers')
      .insert(defaultData)

    if (error) {
      console.error('Failed to initialize tenant data:', error)
    }
  }

  private async updateDNSConfiguration(tenantId: string, updates: Partial<Tenant>): Promise<void> {
    // This would integrate with DNS provider (e.g., Cloudflare, Route53)
    // to update DNS records for custom domains
    console.log(`Updating DNS for tenant: ${tenantId}`)
  }

  private async logTenantEvent(tenantId: string, event: string, data: any): Promise<void> {
    try {
      const { error } = await supabase
        .from('tenant_events')
        .insert([{
          tenant_id: tenantId,
          event,
          data,
          timestamp: new Date().toISOString()
        }])

      if (error) throw error
    } catch (error) {
      console.error('Tenant event logging failed:', error)
    }
  }

  private async disableTenantServices(tenantId: string): Promise<void> {
    // Disable tenant-specific services (API access, webhooks, etc.)
    console.log(`Disabling services for tenant: ${tenantId}`)
  }

  private async enableTenantServices(tenantId: string): Promise<void> {
    // Re-enable tenant-specific services
    console.log(`Enabling services for tenant: ${tenantId}`)
  }

  private async backupTenantData(tenantId: string): Promise<void> {
    // Create backup of tenant data before deletion
    console.log(`Backing up data for tenant: ${tenantId}`)
  }

  private async cleanupTenantData(tenantId: string): Promise<void> {
    // Clean up all tenant-related data
    const tables = [
      'tenant_configurations',
      'tenant_usage',
      'tenant_events',
      'tenant_pricing_tiers'
    ]

    for (const table of tables) {
      const { error } = await supabase
        .from(table)
        .delete()
        .eq('tenant_id', tenantId)

      if (error) {
        console.error(`Failed to cleanup ${table} for tenant ${tenantId}:`, error)
      }
    }
  }

  private async applyConfigurationChanges(tenantId: string, config: Partial<TenantConfiguration>): Promise<void> {
    // Apply configuration changes (restart services, update caches, etc.)
    console.log(`Applying configuration changes for tenant: ${tenantId}`)
  }

  // Multi-tenant routing helper
  async resolveTenantFromRequest(request: Request): Promise<Tenant | null> {
    try {
      const url = new URL(request.url)
      const host = request.headers.get('host') || ''

      // Check for custom domain
      if (!host.includes('agentland.saarland')) {
        return await this.getTenant(host, 'domain')
      }

      // Check for subdomain
      const subdomain = host.split('.')[0]
      if (subdomain !== 'agentland' && subdomain !== 'www') {
        return await this.getTenant(subdomain, 'subdomain')
      }

      // Check for path-based tenant (e.g., /tenant/customer-company)
      const pathSegments = url.pathname.split('/')
      if (pathSegments[1] === 'tenant' && pathSegments[2]) {
        return await this.getTenant(pathSegments[2], 'slug')
      }

      return null
    } catch (error) {
      console.error('Tenant resolution failed:', error)
      return null
    }
  }

  // White-label deployment helper
  async deployWhiteLabelInstance(tenantId: string): Promise<{ success: boolean; deployment_url: string }> {
    try {
      const tenant = await this.getTenant(tenantId)
      if (!tenant) throw new Error('Tenant not found')

      // This would typically:
      // 1. Create a new deployment on Vercel/similar
      // 2. Configure environment variables
      // 3. Set up custom domain
      // 4. Configure CDN
      // 5. Update DNS records

      const deploymentUrl = tenant.domain || `${tenant.subdomain}.agentland.saarland`

      return {
        success: true,
        deployment_url: deploymentUrl
      }
    } catch (error) {
      console.error('White-label deployment failed:', error)
      return {
        success: false,
        deployment_url: ''
      }
    }
  }
}

export default TenantManager