'use client';

import React, { useState, useEffect } from 'react';
import { Clock, Users, AlertCircle, CheckCircle, MapPin, Phone, Globe, Calendar } from 'lucide-react';
import { RealTimeServiceData, TemporaryClosure } from '@/types/enhanced-services';

interface ServiceMonitorProps {
  serviceId: string;
  showQueue?: boolean;
  showWaitTime?: boolean;
  showCapacity?: boolean;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export const RealTimeServiceMonitor: React.FC<ServiceMonitorProps> = ({
  serviceId,
  showQueue = true,
  showWaitTime = true,
  showCapacity = true,
  autoRefresh = true,
  refreshInterval = 60000 // 1 minute
}) => {
  const [serviceStatus, setServiceStatus] = useState<RealTimeServiceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  useEffect(() => {
    const fetchServiceStatus = async () => {
      try {
        setError(null);
        const response = await fetch(`/api/services/${serviceId}/status`);
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        if (data.success) {
          setServiceStatus(data.status);
          setLastRefresh(new Date());
        } else {
          throw new Error(data.error || 'Failed to fetch service status');
        }
      } catch (error) {
        console.error('Failed to fetch service status:', error);
        setError(error instanceof Error ? error.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchServiceStatus();

    if (autoRefresh) {
      const interval = setInterval(fetchServiceStatus, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [serviceId, autoRefresh, refreshInterval]);

  const getStatusColor = (capacity: number, staffing: string) => {
    if (staffing === 'minimal' || capacity > 90) return 'text-red-600';
    if (staffing === 'reduced' || capacity > 70) return 'text-orange-600';
    return 'text-green-600';
  };

  const getCapacityColor = (percentage: number) => {
    if (percentage > 90) return 'bg-red-500';
    if (percentage > 70) return 'bg-orange-500';
    if (percentage > 50) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  if (loading) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-20 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center space-x-2 text-red-800">
          <AlertCircle className="w-5 h-5" />
          <span className="font-medium">Service Status Unavailable</span>
        </div>
        <p className="text-red-700 text-sm mt-1">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="text-red-600 underline text-sm mt-2 hover:text-red-800"
        >
          Try again
        </button>
      </div>
    );
  }

  if (!serviceStatus) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="flex items-center space-x-2 text-gray-600">
          <AlertCircle className="w-5 h-5" />
          <span>No status data available</span>
        </div>
      </div>
    );
  }

  const isServiceOpen = serviceStatus.currentQueue !== undefined && serviceStatus.onlineAvailability;
  const hasTemporaryClosures = serviceStatus.temporaryClosures.length > 0;

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-900">Live Service Status</h3>
        <div className="flex items-center space-x-2">
          {isServiceOpen ? (
            <>
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="text-green-600 font-medium">Operational</span>
            </>
          ) : (
            <>
              <AlertCircle className="w-5 h-5 text-red-600" />
              <span className="text-red-600 font-medium">Closed</span>
            </>
          )}
        </div>
      </div>

      {/* Temporary Closures */}
      {hasTemporaryClosures && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <h4 className="font-medium text-red-900 mb-2">⚠️ Service Disruptions</h4>
          {serviceStatus.temporaryClosures.map((closure, index) => (
            <div key={index} className="text-sm text-red-800 mb-1">
              <span className="font-medium">{closure.reason}</span>
              <br />
              <span className="text-red-600">
                {new Date(closure.startDate).toLocaleDateString('de-DE')} - {' '}
                {new Date(closure.endDate).toLocaleDateString('de-DE')}
              </span>
              {closure.alternativeService && (
                <div className="mt-1 text-red-700">
                  Alternative: {closure.alternativeService}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Service Metrics */}
      {isServiceOpen && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Queue Information */}
          {showQueue && (
            <div className="bg-blue-50 rounded-lg p-3">
              <div className="flex items-center space-x-2 mb-2">
                <Users className="w-4 h-4 text-blue-600" />
                <span className="font-medium text-blue-900">Current Queue</span>
              </div>
              <div className="text-2xl font-bold text-blue-800">
                {serviceStatus.currentQueue}
              </div>
              <div className="text-sm text-blue-600">people waiting</div>
            </div>
          )}
          
          {/* Wait Time */}
          {showWaitTime && (
            <div className="bg-orange-50 rounded-lg p-3">
              <div className="flex items-center space-x-2 mb-2">
                <Clock className="w-4 h-4 text-orange-600" />
                <span className="font-medium text-orange-900">Estimated Wait</span>
              </div>
              <div className="text-2xl font-bold text-orange-800">
                ~{serviceStatus.estimatedWaitTime}
              </div>
              <div className="text-sm text-orange-600">minutes</div>
            </div>
          )}

          {/* Capacity */}
          {showCapacity && serviceStatus.capacity && (
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center space-x-2 mb-2">
                <MapPin className="w-4 h-4 text-gray-600" />
                <span className="font-medium text-gray-900">Capacity</span>
              </div>
              <div className="mb-2">
                <div className="flex justify-between text-sm">
                  <span>{serviceStatus.capacity.current}/{serviceStatus.capacity.maximum}</span>
                  <span>{serviceStatus.capacity.percentage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${getCapacityColor(serviceStatus.capacity.percentage)}`}
                    style={{ width: `${serviceStatus.capacity.percentage}%` }}
                  ></div>
                </div>
              </div>
              <div className={`text-sm font-medium ${getStatusColor(serviceStatus.capacity.percentage, serviceStatus.staffingLevel)}`}>
                Staffing: {serviceStatus.staffingLevel}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Next Available Slot */}
      {serviceStatus.nextAvailableSlot && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-center space-x-2 mb-2">
            <Calendar className="w-4 h-4 text-blue-600" />
            <span className="font-medium text-blue-900">Next Available Appointment</span>
          </div>
          <p className="text-blue-800">
            {new Date(serviceStatus.nextAvailableSlot).toLocaleString('de-DE', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </p>
        </div>
      )}

      {/* Online Alternative */}
      {serviceStatus.onlineAvailability && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <div className="flex items-center space-x-2 mb-2">
            <Globe className="w-4 h-4 text-green-600" />
            <span className="font-medium text-green-900">Digital Service Available</span>
          </div>
          <p className="text-green-800 text-sm">
            Many services can be completed online to avoid waiting times.
          </p>
          <button className="mt-2 text-green-600 underline hover:text-green-800 text-sm">
            Access online service →
          </button>
        </div>
      )}

      {/* Special Notices */}
      {serviceStatus.specialNotices.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <h4 className="font-medium text-yellow-900 mb-2">📢 Important Notices</h4>
          <ul className="space-y-1">
            {serviceStatus.specialNotices.map((notice, index) => (
              <li key={index} className="text-yellow-800 text-sm">• {notice}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Last Updated */}
      <div className="text-xs text-gray-500 text-center border-t pt-2">
        Last updated: {lastRefresh.toLocaleTimeString('de-DE')} • 
        Auto-refresh: {autoRefresh ? `every ${refreshInterval/1000}s` : 'disabled'}
      </div>
    </div>
  );
};