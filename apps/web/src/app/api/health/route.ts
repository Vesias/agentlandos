import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { multiModelAI } from '@/services/multi-model-ai';

export const runtime = 'edge';

// Supabase client for health checks
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  services: {
    database: ServiceHealth;
    ai_models: ServiceHealth;
    weather_api: ServiceHealth;
    real_data_cache: ServiceHealth;
  };
  version: string;
  uptime: number;
}

interface ServiceHealth {
  status: 'healthy' | 'degraded' | 'unhealthy';
  response_time_ms?: number;
  error?: string;
  details?: any;
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  const startTime = Date.now();
  
  try {
    // Parallel health checks for better performance
    const [
      databaseHealth,
      aiModelsHealth,
      weatherApiHealth,
      realDataCacheHealth
    ] = await Promise.allSettled([
      checkDatabaseHealth(),
      checkAIModelsHealth(),
      checkWeatherApiHealth(),
      checkRealDataCacheHealth()
    ]);

    // Extract results from settled promises
    const services = {
      database: databaseHealth.status === 'fulfilled' 
        ? databaseHealth.value 
        : { status: 'unhealthy' as const, error: databaseHealth.reason?.message },
      ai_models: aiModelsHealth.status === 'fulfilled' 
        ? aiModelsHealth.value 
        : { status: 'unhealthy' as const, error: aiModelsHealth.reason?.message },
      weather_api: weatherApiHealth.status === 'fulfilled' 
        ? weatherApiHealth.value 
        : { status: 'unhealthy' as const, error: weatherApiHealth.reason?.message },
      real_data_cache: realDataCacheHealth.status === 'fulfilled' 
        ? realDataCacheHealth.value 
        : { status: 'unhealthy' as const, error: realDataCacheHealth.reason?.message }
    };

    // Determine overall status
    const overallStatus = determineOverallStatus(services);

    const healthStatus: HealthStatus = {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      services,
      version: '2.0.0',
      uptime: Date.now() - startTime
    };

    // Log health check to database for monitoring
    try {
      await supabase.from('api_health_checks').insert({
        status: overallStatus,
        services: services,
        response_time_ms: Date.now() - startTime,
        timestamp: new Date().toISOString()
      });
    } catch (logError) {
      console.warn('Failed to log health check:', logError);
    }

    const statusCode = overallStatus === 'healthy' ? 200 : 
                      overallStatus === 'degraded' ? 200 : 503;

    return NextResponse.json(healthStatus, { 
      status: statusCode,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Content-Type': 'application/json'
      }
    });

  } catch (error: any) {
    console.error('Health check failed:', error);
    
    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: 'Health check system failure',
      uptime: Date.now() - startTime
    }, { status: 503 });
  }
}

async function checkDatabaseHealth(): Promise<ServiceHealth> {
  const startTime = Date.now();
  
  try {
    // Test database connection with a simple query
    const { data, error } = await supabase
      .from('chat_interactions')
      .select('id')
      .limit(1);

    if (error) {
      throw new Error(`Database query failed: ${error.message}`);
    }

    return {
      status: 'healthy',
      response_time_ms: Date.now() - startTime,
      details: {
        tables_accessible: true,
        connection: 'active'
      }
    };
  } catch (error: any) {
    return {
      status: 'unhealthy',
      response_time_ms: Date.now() - startTime,
      error: error?.message || 'Health check failed'
    };
  }
}

async function checkAIModelsHealth(): Promise<ServiceHealth> {
  const startTime = Date.now();
  
  try {
    // Test AI models availability
    const health = await multiModelAI.healthCheck();
    const availableModels = Object.entries(health).filter(([_, status]) => status);
    
    if (availableModels.length === 0) {
      return {
        status: 'unhealthy',
        response_time_ms: Date.now() - startTime,
        error: 'No AI models available',
        details: health
      };
    }

    const status = availableModels.length >= 2 ? 'healthy' : 'degraded';
    
    return {
      status,
      response_time_ms: Date.now() - startTime,
      details: {
        available_models: availableModels.length,
        models: health
      }
    };
  } catch (error: any) {
    return {
      status: 'unhealthy',
      response_time_ms: Date.now() - startTime,
      error: error?.message || 'Health check failed'
    };
  }
}

async function checkWeatherApiHealth(): Promise<ServiceHealth> {
  const startTime = Date.now();
  
  try {
    // Test Open-Meteo API (used by weather service)
    const response = await fetch(
      'https://api.open-meteo.com/v1/forecast?latitude=49.2401&longitude=6.9969&current=temperature_2m&forecast_days=1',
      { 
        signal: AbortSignal.timeout(5000) // 5 second timeout
      }
    );

    if (!response.ok) {
      throw new Error(`Weather API returned ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.current || typeof data.current.temperature_2m !== 'number') {
      throw new Error('Invalid weather data format');
    }

    return {
      status: 'healthy',
      response_time_ms: Date.now() - startTime,
      details: {
        temperature: Math.round(data.current.temperature_2m),
        api_endpoint: 'open-meteo.com'
      }
    };
  } catch (error: any) {
    return {
      status: 'unhealthy',
      response_time_ms: Date.now() - startTime,
      error: error?.message || 'Health check failed'
    };
  }
}

async function checkRealDataCacheHealth(): Promise<ServiceHealth> {
  const startTime = Date.now();
  
  try {
    // Test internal real-data cache endpoint
    const baseUrl = process.env.NEXT_PUBLIC_VERCEL_URL 
      ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
      : 'http://localhost:3000';
    
    const response = await fetch(`${baseUrl}/api/cache/real-data`, {
      signal: AbortSignal.timeout(10000) // 10 second timeout
    });

    if (!response.ok) {
      throw new Error(`Real data cache returned ${response.status}`);
    }

    const data = await response.json();
    
    return {
      status: 'healthy',
      response_time_ms: Date.now() - startTime,
      details: {
        has_events: Array.isArray(data.events),
        has_weather: !!data.weather,
        last_update: data.lastUpdate,
        cache_age: data.cacheAge || 0
      }
    };
  } catch (error: any) {
    return {
      status: 'degraded', // Cache failures are non-critical
      response_time_ms: Date.now() - startTime,
      error: error?.message || 'Real data cache check failed'
    };
  }
}

function determineOverallStatus(services: HealthStatus['services']): 'healthy' | 'degraded' | 'unhealthy' {
  const statuses = Object.values(services).map(service => service.status);
  
  // If any critical service is unhealthy
  if (services.database.status === 'unhealthy' || services.ai_models.status === 'unhealthy') {
    return 'unhealthy';
  }
  
  // If any service is degraded or unhealthy
  if (statuses.includes('degraded') || statuses.includes('unhealthy')) {
    return 'degraded';
  }
  
  // All services healthy
  return 'healthy';
}

// OPTIONS for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}