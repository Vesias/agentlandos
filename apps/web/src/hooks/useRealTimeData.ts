import { useState, useEffect } from 'react';
import { realTimeService } from '@/lib/realTimeDataService';

export function useRealTimeData(dataType: string, refreshInterval: number = 60000) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      let result;
      
      switch (dataType) {
        case 'tourism':
          result = await realTimeService.getTourismData();
          break;
        case 'business':
          result = await realTimeService.getBusinessData();
          break;
        case 'admin':
          result = await realTimeService.getAdminData();
          break;
        case 'analytics':
          result = await realTimeService.getAnalytics();
          break;
        default:
          result = await realTimeService.getRealTimeData([dataType]);
      }
      
      setData(result);
      setError(null);
    } catch (err) {
      console.error(`Error fetching ${dataType} data:`, err);
      setError(`Fehler beim Laden der ${dataType} Daten`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    
    const interval = setInterval(fetchData, refreshInterval);
    
    return () => clearInterval(interval);
  }, [dataType, refreshInterval]);

  return { data, loading, error, refetch: fetchData };
}

export function useUserTracking() {
  useEffect(() => {
    // Track initial page view
    realTimeService.trackActivity({
      activity_type: 'page_view',
      page: window.location.pathname,
      metadata: {
        referrer: document.referrer,
        user_agent: navigator.userAgent
      }
    });
    
    // Track time spent on page
    const startTime = Date.now();
    
    return () => {
      const timeSpent = Math.floor((Date.now() - startTime) / 1000);
      realTimeService.trackActivity({
        activity_type: 'page_exit',
        page: window.location.pathname,
        metadata: {
          time_spent_seconds: timeSpent
        }
      });
    };
  }, []);
}
