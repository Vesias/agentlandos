import { NextRequest, NextResponse } from 'next/server'
import { cacheManager, getCacheStats } from '@/lib/performance/cache-manager'

export const runtime = 'edge'

// Performance monitoring API for cache management
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const action = url.searchParams.get('action')

    switch (action) {
      case 'stats':
        return NextResponse.json({
          success: true,
          data: getCacheStats(),
          timestamp: new Date().toISOString()
        })

      case 'health':
        const stats = getCacheStats()
        const health = {
          status: stats.hitRate > 60 ? 'healthy' : stats.hitRate > 30 ? 'degraded' : 'critical',
          hitRate: stats.hitRate,
          memoryUsage: stats.memoryUsage,
          memoryUsagePercent: (stats.memoryUsage / (100 * 1024 * 1024)) * 100, // Assuming 100MB max
          totalEntries: stats.totalEntries,
          recommendations: []
        }

        // Performance recommendations
        if (health.hitRate < 30) {
          health.recommendations.push('Low cache hit rate - consider increasing TTL values')
        }
        if (health.memoryUsagePercent > 90) {
          health.recommendations.push('High memory usage - consider reducing cache size or TTL')
        }
        if (stats.totalEntries > 10000) {
          health.recommendations.push('High entry count - implement more aggressive eviction')
        }

        return NextResponse.json({
          success: true,
          data: health,
          timestamp: new Date().toISOString()
        })

      case 'cleanup':
        const cleaned = cacheManager.cleanup()
        return NextResponse.json({
          success: true,
          message: `Cleaned ${cleaned} expired entries`,
          data: { cleanedEntries: cleaned },
          timestamp: new Date().toISOString()
        })

      default:
        return NextResponse.json({
          success: true,
          service: 'Cache Performance Monitor',
          version: '2.0.0',
          actions: ['stats', 'health', 'cleanup'],
          timestamp: new Date().toISOString()
        })
    }
  } catch (error) {
    console.error('Cache performance API error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Cache performance monitoring failed',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { action, category, key } = await request.json()

    switch (action) {
      case 'clear-category':
        if (!category) {
          return NextResponse.json(
            { error: 'Category parameter required' },
            { status: 400 }
          )
        }
        
        const cleared = cacheManager.clearCategory(category)
        return NextResponse.json({
          success: true,
          message: `Cleared ${cleared} entries from category: ${category}`,
          data: { clearedEntries: cleared },
          timestamp: new Date().toISOString()
        })

      case 'clear-all':
        cacheManager.clear()
        return NextResponse.json({
          success: true,
          message: 'All cache entries cleared',
          timestamp: new Date().toISOString()
        })

      case 'warmup':
        await cacheManager.warmup()
        return NextResponse.json({
          success: true,
          message: 'Cache warmed up successfully',
          timestamp: new Date().toISOString()
        })

      case 'delete':
        if (!key) {
          return NextResponse.json(
            { error: 'Key parameter required' },
            { status: 400 }
          )
        }
        
        const deleted = cacheManager.delete(key)
        return NextResponse.json({
          success: true,
          message: deleted ? `Deleted cache entry: ${key}` : `Cache entry not found: ${key}`,
          data: { deleted },
          timestamp: new Date().toISOString()
        })

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('Cache management error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Cache management operation failed',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}