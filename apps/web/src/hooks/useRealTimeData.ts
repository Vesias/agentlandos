import { useState, useEffect } from 'react';

interface UseRealTimeDataReturn<T = any> {
  data: T | null
  isLoading: boolean
  error: string | null
  refetch: () => void
}

export function useRealTimeData<T = any>(
  endpoint: string, 
  refreshInterval: number = 30000 // 30 seconds default
): UseRealTimeDataReturn<T> {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setError(null);
      const response = await fetch(endpoint);
      
      if (!response.ok) {
        // More detailed error handling
        const errorText = await response.text().catch(() => 'Unknown error');
        console.warn(`API ${endpoint} returned ${response.status}: ${errorText}`);
        
        // For development, provide fallback data instead of hard error
        if (process.env.NODE_ENV === 'development') {
          setData({ fallback: true, message: `API ${endpoint} unavailable` } as T);
          return;
        }
        
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.success) {
        setData(result.data);
      } else {
        throw new Error(result.error || 'Failed to fetch data');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('Real-time data fetch error:', err);
      
      // Graceful degradation - don't break the app
      if (process.env.NODE_ENV === 'development') {
        setData({ error: true, message: errorMessage } as T);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const refetch = () => {
    setIsLoading(true);
    fetchData();
  };

  useEffect(() => {
    // Initial fetch
    fetchData();

    // Set up interval for real-time updates
    const interval = setInterval(fetchData, refreshInterval);

    // Cleanup interval on unmount
    return () => clearInterval(interval);
  }, [endpoint, refreshInterval]);

  // Re-fetch when window regains focus
  useEffect(() => {
    const handleFocus = () => {
      if (!isLoading) {
        fetchData();
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [isLoading]);

  return { data, isLoading, error, refetch };
}

// Legacy support for components using the old API
export function useRealTimeDataLegacy(dataType: string, refreshInterval: number = 60000) {
  const endpoint = `/api/realtime/${dataType}`;
  const { data, isLoading, error, refetch } = useRealTimeData(endpoint, refreshInterval);
  
  return { 
    data, 
    loading: isLoading, // Legacy prop name
    error, 
    refetch 
  };
}

export function useUserTracking() {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // Track initial page view with basic analytics
    const trackPageView = async () => {
      try {
        await fetch('/api/analytics/real-users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            activity_type: 'page_view',
            page: window.location.pathname,
            metadata: {
              referrer: document.referrer,
              user_agent: navigator.userAgent
            }
          })
        });
      } catch (error) {
        console.log('Analytics tracking failed:', error);
      }
    };
    
    trackPageView();
    
    // Track time spent on page
    const startTime = Date.now();
    
    return () => {
      const timeSpent = Math.floor((Date.now() - startTime) / 1000);
      if (timeSpent > 5) { // Only track if user spent more than 5 seconds
        fetch('/api/analytics/real-users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            activity_type: 'page_exit',
            page: window.location.pathname,
            metadata: { time_spent_seconds: timeSpent }
          })
        }).catch(() => {}); // Silent fail for exit tracking
      }
    };
  }, []);
}
