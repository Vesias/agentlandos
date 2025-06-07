import { NextRequest, NextResponse } from 'next/server'
import APIGatewayManager from '@/lib/api-gateway/gateway-manager'

export const runtime = 'edge'

// API Gateway management and proxy
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, tenant_id, api_key_data, api_request } = body

    const gatewayManager = new APIGatewayManager()

    switch (action) {
      case 'create_api_key':
        if (!tenant_id || !api_key_data) {
          return NextResponse.json({
            success: false,
            error: 'Tenant ID and API key data are required'
          }, { status: 400 })
        }

        const { api_key, secret_key } = await gatewayManager.createAPIKey(tenant_id, api_key_data)
        
        return NextResponse.json({
          success: true,
          data: {
            api_key: {
              ...api_key,
              key_hash: undefined // Don't expose hash
            },
            secret_key, // Only returned once
            integration_docs: {
              authentication: 'Include the API key in the Authorization header: Bearer YOUR_API_KEY',
              base_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/gateway/proxy`,
              rate_limits: api_key.permissions.rate_limits,
              examples: {
                chat: {
                  url: '/api/gateway/proxy/chat',
                  method: 'POST',
                  headers: { 'Authorization': 'Bearer YOUR_API_KEY' },
                  body: { message: 'Hello AI' }
                }
              }
            }
          },
          message: 'API key created successfully',
          timestamp: new Date().toISOString()
        })

      case 'proxy_request':
        if (!api_request) {
          return NextResponse.json({
            success: false,
            error: 'API request data is required'
          }, { status: 400 })
        }

        const result = await gatewayManager.processAPIRequest({
          api_key: api_request.api_key,
          endpoint: api_request.endpoint,
          method: api_request.method,
          ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
          user_agent: request.headers.get('user-agent') || 'unknown',
          request_body: api_request.body,
          query_params: api_request.query_params
        })

        if (!result.success) {
          const statusCode = result.rate_limited ? 429 : 400
          return NextResponse.json({
            success: false,
            error: result.error,
            cost: result.cost || 0,
            ...(result.rate_limited && { retry_after: 60 })
          }, { status: statusCode })
        }

        return NextResponse.json({
          success: true,
          data: result.data,
          cost: result.cost,
          timestamp: new Date().toISOString()
        })

      case 'validate_key':
        const apiKey = body.api_key
        if (!apiKey) {
          return NextResponse.json({
            success: false,
            error: 'API key is required'
          }, { status: 400 })
        }

        const validatedKey = await gatewayManager.validateAPIKey(apiKey)
        
        return NextResponse.json({
          success: !!validatedKey,
          data: validatedKey ? {
            key_id: validatedKey.id,
            tenant_id: validatedKey.tenant_id,
            name: validatedKey.name,
            environment: validatedKey.environment,
            permissions: validatedKey.permissions,
            usage: validatedKey.usage_analytics
          } : null,
          message: validatedKey ? 'API key is valid' : 'Invalid API key',
          timestamp: new Date().toISOString()
        })

      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid action. Supported actions: create_api_key, proxy_request, validate_key'
        }, { status: 400 })
    }

  } catch (error) {
    console.error('API Gateway error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'API Gateway operation failed',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

// Get API keys and analytics
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const tenantId = url.searchParams.get('tenant_id')
    const action = url.searchParams.get('action')

    if (!tenantId) {
      return NextResponse.json({
        success: false,
        error: 'Tenant ID is required'
      }, { status: 400 })
    }

    const gatewayManager = new APIGatewayManager()

    switch (action) {
      case 'list_keys':
        const apiKeys = await gatewayManager.getAPIKeys(tenantId)
        
        return NextResponse.json({
          success: true,
          data: {
            api_keys: apiKeys.map(key => ({
              ...key,
              key_hash: undefined // Don't expose hash
            })),
            total: apiKeys.length,
            by_environment: apiKeys.reduce((acc, key) => {
              acc[key.environment] = (acc[key.environment] || 0) + 1
              return acc
            }, {} as Record<string, number>),
            by_status: apiKeys.reduce((acc, key) => {
              acc[key.status] = (acc[key.status] || 0) + 1
              return acc
            }, {} as Record<string, number>)
          },
          timestamp: new Date().toISOString()
        })

      case 'usage_analytics':
        const timeframe = url.searchParams.get('timeframe') as '24h' | '7d' | '30d' | '90d' || '30d'
        const analytics = await gatewayManager.getUsageAnalytics(tenantId, timeframe)
        
        return NextResponse.json({
          success: true,
          data: {
            timeframe,
            ...analytics,
            insights: {
              peak_usage_hour: analytics.usage_by_hour.reduce((max, curr) => 
                curr.requests > max.requests ? curr : max, { hour: 0, requests: 0 }).hour,
              most_used_endpoint: analytics.top_endpoints[0]?.endpoint || 'N/A',
              error_rate: analytics.total_requests > 0 
                ? (analytics.failed_requests / analytics.total_requests * 100).toFixed(2) + '%'
                : '0%',
              average_cost_per_request: analytics.total_requests > 0
                ? (analytics.total_cost / analytics.total_requests).toFixed(4)
                : '0'
            }
          },
          timestamp: new Date().toISOString()
        })

      case 'billing_summary':
        const period = url.searchParams.get('period') || new Date().toISOString().substring(0, 7)
        const keys = await gatewayManager.getAPIKeys(tenantId)
        
        const billingSummary = {
          period,
          total_requests: keys.reduce((sum, key) => sum + key.usage_analytics.current_month_usage, 0),
          total_cost: keys.reduce((sum, key) => sum + key.usage_analytics.current_month_cost, 0),
          by_key: keys.map(key => ({
            key_id: key.id,
            name: key.name,
            requests: key.usage_analytics.current_month_usage,
            cost: key.usage_analytics.current_month_cost,
            plan: key.billing.plan
          })),
          cost_breakdown: {
            included: keys.reduce((sum, key) => 
              sum + Math.min(key.usage_analytics.current_month_usage, key.billing.included_requests) * key.billing.cost_per_request, 0),
            overage: keys.reduce((sum, key) => 
              sum + Math.max(0, key.usage_analytics.current_month_usage - key.billing.included_requests) * key.billing.overage_rate, 0)
          },
          projections: {
            end_of_month_requests: keys.reduce((sum, key) => sum + key.usage_analytics.current_month_usage, 0) * 1.5,
            end_of_month_cost: keys.reduce((sum, key) => sum + key.usage_analytics.current_month_cost, 0) * 1.5
          }
        }
        
        return NextResponse.json({
          success: true,
          data: billingSummary,
          timestamp: new Date().toISOString()
        })

      case 'rate_limit_status':
        const rateLimitStatus = {
          global_limits: {
            requests_per_minute: 1000,
            requests_per_hour: 50000,
            requests_per_day: 1000000
          },
          current_usage: {
            last_minute: 45,
            last_hour: 2340,
            last_day: 45600
          },
          violations_last_24h: 12,
          top_limited_endpoints: [
            { endpoint: '/chat', violations: 8 },
            { endpoint: '/documents/generate', violations: 3 },
            { endpoint: '/workflows/execute', violations: 1 }
          ],
          recommendations: [
            'Consider upgrading to higher rate limits',
            'Implement request caching for frequently accessed data',
            'Use webhooks instead of polling for real-time updates'
          ]
        }
        
        return NextResponse.json({
          success: true,
          data: rateLimitStatus,
          timestamp: new Date().toISOString()
        })

      default:
        return NextResponse.json({
          success: true,
          data: {
            available_actions: ['list_keys', 'usage_analytics', 'billing_summary', 'rate_limit_status'],
            gateway_info: {
              version: '2.0.0',
              supported_auth: ['bearer_token'],
              rate_limiting: 'enabled',
              caching: 'enabled',
              monitoring: 'enabled',
              geographic_distribution: 'global'
            },
            endpoints: {
              chat: '/api/gateway/proxy/chat',
              documents: '/api/gateway/proxy/documents',
              workflows: '/api/gateway/proxy/workflows',
              analytics: '/api/gateway/proxy/analytics'
            },
            pricing_tiers: [
              { name: 'Free', requests: 1000, price: 0 },
              { name: 'Basic', requests: 10000, price: 29 },
              { name: 'Professional', requests: 100000, price: 99 },
              { name: 'Enterprise', requests: 'unlimited', price: 299 }
            ]
          },
          timestamp: new Date().toISOString()
        })
    }

  } catch (error) {
    console.error('API Gateway GET error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch gateway data',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

// Update API key
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { api_key_id, updates } = body

    if (!api_key_id || !updates) {
      return NextResponse.json({
        success: false,
        error: 'API key ID and updates are required'
      }, { status: 400 })
    }

    // Update API key in database
    const { error } = await supabase
      .from('api_keys')
      .update({
        ...updates,
        'metadata.updated_at': new Date().toISOString()
      })
      .eq('id', api_key_id)

    if (error) throw error

    return NextResponse.json({
      success: true,
      message: 'API key updated successfully',
      api_key_id,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('API key update error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'API key update failed',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

// Revoke API key
export async function DELETE(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const apiKeyId = url.searchParams.get('api_key_id')

    if (!apiKeyId) {
      return NextResponse.json({
        success: false,
        error: 'API key ID is required'
      }, { status: 400 })
    }

    // Revoke API key
    const { error } = await supabase
      .from('api_keys')
      .update({
        status: 'revoked',
        'metadata.updated_at': new Date().toISOString()
      })
      .eq('id', apiKeyId)

    if (error) throw error

    return NextResponse.json({
      success: true,
      message: 'API key revoked successfully',
      api_key_id: apiKeyId,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('API key revocation error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'API key revocation failed',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}