import { NextRequest, NextResponse } from 'next/server'
import TenantManager from '@/lib/multi-tenant/tenant-manager'

export const runtime = 'edge'

// Multi-tenant management API
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, tenant_data, tenant_id, config_updates } = body

    const tenantManager = new TenantManager()

    switch (action) {
      case 'create_tenant':
        if (!tenant_data) {
          return NextResponse.json({
            success: false,
            error: 'Tenant data is required'
          }, { status: 400 })
        }

        const newTenant = await tenantManager.createTenant(tenant_data)
        
        return NextResponse.json({
          success: true,
          data: {
            tenant: newTenant,
            deployment_info: {
              subdomain_url: `https://${newTenant.subdomain}.agentland.saarland`,
              admin_panel: `https://${newTenant.subdomain}.agentland.saarland/admin`,
              api_endpoint: `https://${newTenant.subdomain}.agentland.saarland/api`
            }
          },
          message: 'Tenant created successfully',
          timestamp: new Date().toISOString()
        })

      case 'update_tenant':
        if (!tenant_id || !tenant_data) {
          return NextResponse.json({
            success: false,
            error: 'Tenant ID and update data are required'
          }, { status: 400 })
        }

        await tenantManager.updateTenant(tenant_id, tenant_data)
        
        return NextResponse.json({
          success: true,
          message: 'Tenant updated successfully',
          tenant_id,
          timestamp: new Date().toISOString()
        })

      case 'suspend_tenant':
        if (!tenant_id) {
          return NextResponse.json({
            success: false,
            error: 'Tenant ID is required'
          }, { status: 400 })
        }

        await tenantManager.suspendTenant(tenant_id, body.reason || 'Administrative action')
        
        return NextResponse.json({
          success: true,
          message: 'Tenant suspended successfully',
          tenant_id,
          timestamp: new Date().toISOString()
        })

      case 'reactivate_tenant':
        if (!tenant_id) {
          return NextResponse.json({
            success: false,
            error: 'Tenant ID is required'
          }, { status: 400 })
        }

        await tenantManager.reactivateTenant(tenant_id)
        
        return NextResponse.json({
          success: true,
          message: 'Tenant reactivated successfully',
          tenant_id,
          timestamp: new Date().toISOString()
        })

      case 'update_configuration':
        if (!tenant_id || !config_updates) {
          return NextResponse.json({
            success: false,
            error: 'Tenant ID and configuration updates are required'
          }, { status: 400 })
        }

        await tenantManager.updateTenantConfiguration(tenant_id, config_updates)
        
        return NextResponse.json({
          success: true,
          message: 'Tenant configuration updated successfully',
          tenant_id,
          timestamp: new Date().toISOString()
        })

      case 'deploy_white_label':
        if (!tenant_id) {
          return NextResponse.json({
            success: false,
            error: 'Tenant ID is required'
          }, { status: 400 })
        }

        const deployment = await tenantManager.deployWhiteLabelInstance(tenant_id)
        
        return NextResponse.json({
          success: deployment.success,
          data: {
            deployment_url: deployment.deployment_url,
            status: deployment.success ? 'deployed' : 'failed'
          },
          message: deployment.success ? 'White-label instance deployed' : 'Deployment failed',
          timestamp: new Date().toISOString()
        })

      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid action. Supported actions: create_tenant, update_tenant, suspend_tenant, reactivate_tenant, update_configuration, deploy_white_label'
        }, { status: 400 })
    }

  } catch (error) {
    console.error('Multi-tenant API error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Multi-tenant operation failed',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

// Get tenant information and analytics
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const tenantId = url.searchParams.get('tenant_id')
    const slug = url.searchParams.get('slug')
    const subdomain = url.searchParams.get('subdomain')
    const action = url.searchParams.get('action')

    const tenantManager = new TenantManager()

    switch (action) {
      case 'list':
        const filters = {
          status: url.searchParams.get('status') as any,
          plan: url.searchParams.get('plan') || undefined,
          search: url.searchParams.get('search') || undefined,
          limit: parseInt(url.searchParams.get('limit') || '50'),
          offset: parseInt(url.searchParams.get('offset') || '0')
        }

        const tenantList = await tenantManager.listTenants(filters)
        
        return NextResponse.json({
          success: true,
          data: tenantList,
          filters,
          timestamp: new Date().toISOString()
        })

      case 'usage':
        if (!tenantId) {
          return NextResponse.json({
            success: false,
            error: 'Tenant ID is required for usage data'
          }, { status: 400 })
        }

        const period = url.searchParams.get('period') || undefined
        const usage = await tenantManager.getTenantUsage(tenantId, period)
        
        return NextResponse.json({
          success: true,
          data: {
            usage,
            period: period || 'current_month'
          },
          timestamp: new Date().toISOString()
        })

      case 'billing':
        if (!tenantId) {
          return NextResponse.json({
            success: false,
            error: 'Tenant ID is required for billing data'
          }, { status: 400 })
        }

        const billingPeriod = url.searchParams.get('period') || new Date().toISOString().substring(0, 7)
        const billing = await tenantManager.calculateTenantBilling(tenantId, billingPeriod)
        
        return NextResponse.json({
          success: true,
          data: billing,
          timestamp: new Date().toISOString()
        })

      case 'configuration':
        if (!tenantId) {
          return NextResponse.json({
            success: false,
            error: 'Tenant ID is required for configuration data'
          }, { status: 400 })
        }

        const config = await tenantManager.getTenantConfiguration(tenantId)
        
        return NextResponse.json({
          success: true,
          data: {
            configuration: config
          },
          timestamp: new Date().toISOString()
        })

      default:
        // Get single tenant by ID, slug, or subdomain
        let tenant = null
        
        if (tenantId) {
          tenant = await tenantManager.getTenant(tenantId, 'id')
        } else if (slug) {
          tenant = await tenantManager.getTenant(slug, 'slug')
        } else if (subdomain) {
          tenant = await tenantManager.getTenant(subdomain, 'subdomain')
        }

        if (!tenant) {
          return NextResponse.json({
            success: false,
            error: 'Tenant not found'
          }, { status: 404 })
        }

        return NextResponse.json({
          success: true,
          data: {
            tenant,
            urls: {
              primary: tenant.domain ? `https://${tenant.domain}` : `https://${tenant.subdomain}.agentland.saarland`,
              admin: tenant.domain ? `https://${tenant.domain}/admin` : `https://${tenant.subdomain}.agentland.saarland/admin`,
              api: tenant.domain ? `https://${tenant.domain}/api` : `https://${tenant.subdomain}.agentland.saarland/api`
            }
          },
          timestamp: new Date().toISOString()
        })
    }

  } catch (error) {
    console.error('Multi-tenant GET error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch tenant data',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

// Delete tenant
export async function DELETE(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const tenantId = url.searchParams.get('tenant_id')

    if (!tenantId) {
      return NextResponse.json({
        success: false,
        error: 'Tenant ID is required'
      }, { status: 400 })
    }

    const tenantManager = new TenantManager()
    await tenantManager.deleteTenant(tenantId)

    return NextResponse.json({
      success: true,
      message: 'Tenant deleted successfully',
      tenant_id: tenantId,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Tenant deletion error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Tenant deletion failed',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}