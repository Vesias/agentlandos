/**
 * Real-Time Data Service für echte Daten
 */

// Use relative URLs for Next.js API routes (no CORS issues)
const API_BASE_URL = '';

export interface RealTimeStats {
  active_users: number;
  daily_visitors: number;
  weekly_visitors: number;
  monthly_visitors: number;
  total_users: number;
  timestamp: string;
}

export interface TourismData {
  weather: any;
  attractions: any[];
  events: any[];
  timestamp: string;
}

export interface BusinessData {
  funding_programs: any[];
  economic_indicators: any;
  timestamp: string;
}

export interface AdminData {
  offices: any[];
  online_service_availability: number;
  digital_services_count: number;
  timestamp: string;
}

class RealTimeDataService {
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private cacheDuration = 60000; // 1 Minute

  private async fetchWithCache(endpoint: string, cacheDuration?: number): Promise<any> {
    const cacheKey = endpoint;
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < (cacheDuration || this.cacheDuration)) {
      return cached.data;
    }
    
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      this.cache.set(cacheKey, { data, timestamp: Date.now() });
      return data;
    } catch (error) {
      console.error(`Error fetching ${endpoint}:`, error);
      
      // Return cached data if available, even if expired
      if (cached) {
        return cached.data;
      }
      
      throw error;
    }
  }

  async getUserStats(): Promise<RealTimeStats> {
    const response = await this.fetchWithCache('/api/realtime/user-count', 30000); // 30 seconds cache
    return response.data;
  }

  async getTourismData(): Promise<TourismData> {
    const response = await this.fetchWithCache('/api/realtime/tourism', 300000); // 5 minutes cache
    return response.data;
  }

  async getBusinessData(): Promise<BusinessData> {
    const response = await this.fetchWithCache('/api/realtime/business', 600000); // 10 minutes cache
    return response.data;
  }

  async getAdminData(): Promise<AdminData> {
    const response = await this.fetchWithCache('/api/realtime/admin', 180000); // 3 minutes cache
    return response.data;
  }

  async getAnalytics(): Promise<any> {
    const response = await this.fetchWithCache('/api/realtime/analytics', 60000); // 1 minute cache
    return response.data;
  }

  async trackActivity(activity: {
    activity_type: string;
    page?: string;
    metadata?: any;
  }): Promise<void> {
    try {
      await fetch(`${API_BASE_URL}/api/realtime/track`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(activity),
      });
    } catch (error) {
      console.error('Error tracking activity:', error);
    }
  }

  async getRealTimeData(dataTypes?: string[]): Promise<any> {
    const params = dataTypes ? `?data_types=${dataTypes.join(',')}` : '';
    const response = await this.fetchWithCache(`/api/realtime/analytics${params}`, 60000);
    return response.data;
  }
}

export const realTimeService = new RealTimeDataService();
