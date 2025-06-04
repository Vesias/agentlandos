'use client'

import { useEffect, useState, useCallback } from 'react'
import { mobileUtils } from '@/lib/mobile-utils'

interface MobileOptimizationState {
  isMobile: boolean
  isOnline: boolean
  connectionType: string
  isSlowConnection: boolean
  batteryLevel: number | null
  isLowBattery: boolean
  viewport: { width: number; height: number }
  safeAreaInsets: { top: number; bottom: number; left: number; right: number }
  performanceScore: number | null
}

interface UseMobileOptimizationOptions {
  enableBatteryOptimization?: boolean
  enablePerformanceMonitoring?: boolean
  enableConnectionOptimization?: boolean
  lowBatteryThreshold?: number
}

export function useMobileOptimization(options: UseMobileOptimizationOptions = {}) {
  const {
    enableBatteryOptimization = true,
    enablePerformanceMonitoring = true,
    enableConnectionOptimization = true,
    lowBatteryThreshold = 20
  } = options

  const [state, setState] = useState<MobileOptimizationState>({
    isMobile: false,
    isOnline: true,
    connectionType: 'unknown',
    isSlowConnection: false,
    batteryLevel: null,
    isLowBattery: false,
    viewport: { width: 0, height: 0 },
    safeAreaInsets: { top: 0, bottom: 0, left: 0, right: 0 },
    performanceScore: null
  })

  // Initialize mobile detection
  useEffect(() => {
    setState(prev => ({
      ...prev,
      isMobile: mobileUtils.isMobile(),
      viewport: mobileUtils.getViewport(),
      safeAreaInsets: mobileUtils.getSafeAreaInsets()
    }))
  }, [])

  // Monitor network status
  useEffect(() => {
    if (!enableConnectionOptimization) return

    const updateConnectionStatus = () => {
      setState(prev => ({
        ...prev,
        isOnline: navigator.onLine,
        connectionType: mobileUtils.getConnectionType(),
        isSlowConnection: mobileUtils.isSlowConnection()
      }))
    }

    const handleOnline = () => updateConnectionStatus()
    const handleOffline = () => updateConnectionStatus()

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Initial check
    updateConnectionStatus()

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [enableConnectionOptimization])

  // Monitor battery status
  useEffect(() => {
    if (!enableBatteryOptimization) return

    const updateBatteryStatus = async () => {
      const batteryInfo = await mobileUtils.getBatteryInfo()
      if (batteryInfo) {
        setState(prev => ({
          ...prev,
          batteryLevel: batteryInfo.level,
          isLowBattery: batteryInfo.level < lowBatteryThreshold && !batteryInfo.charging
        }))
      }
    }

    updateBatteryStatus()

    // Update battery status every 5 minutes
    const batteryInterval = setInterval(updateBatteryStatus, 5 * 60 * 1000)

    return () => clearInterval(batteryInterval)
  }, [enableBatteryOptimization, lowBatteryThreshold])

  // Monitor viewport changes
  useEffect(() => {
    const handleResize = mobileUtils.throttle(() => {
      setState(prev => ({
        ...prev,
        viewport: mobileUtils.getViewport(),
        safeAreaInsets: mobileUtils.getSafeAreaInsets()
      }))
    }, 150)

    window.addEventListener('resize', handleResize)
    window.addEventListener('orientationchange', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('orientationchange', handleResize)
    }
  }, [])

  // Performance monitoring
  useEffect(() => {
    if (!enablePerformanceMonitoring) return

    const measurePagePerformance = () => {
      const performance = mobileUtils.measurePerformance()
      if (performance) {
        // Calculate a simple performance score (0-100)
        const score = Math.max(0, 100 - (performance.pageLoad / 50)) // 5 seconds = 0 score
        setState(prev => ({
          ...prev,
          performanceScore: Math.round(score)
        }))
      }
    }

    // Measure performance after page load
    if (document.readyState === 'complete') {
      measurePagePerformance()
    } else {
      window.addEventListener('load', measurePagePerformance)
    }

    return () => {
      window.removeEventListener('load', measurePagePerformance)
    }
  }, [enablePerformanceMonitoring])

  // Auto-optimization for low battery
  useEffect(() => {
    if (state.isLowBattery && enableBatteryOptimization) {
      mobileUtils.optimizeForLowBattery()
    }
  }, [state.isLowBattery, enableBatteryOptimization])

  // Prevent input zoom on iOS
  useEffect(() => {
    if (state.isMobile && mobileUtils.isIOS()) {
      mobileUtils.preventInputZoom()
    }
  }, [state.isMobile])

  // Optimize fonts
  useEffect(() => {
    mobileUtils.optimizeFonts()
  }, [])

  // Helper functions
  const optimizeForSlowConnection = useCallback(() => {
    if (state.isSlowConnection) {
      // Disable auto-playing videos
      document.querySelectorAll('video[autoplay]').forEach(video => {
        (video as HTMLVideoElement).autoplay = false
      })

      // Reduce image quality
      document.querySelectorAll('img').forEach(img => {
        const src = img.src
        if (src.includes('?')) {
          img.src = src.replace(/q=\d+/, 'q=50') // Reduce quality to 50%
        }
      })

      return true
    }
    return false
  }, [state.isSlowConnection])

  const getOptimizedImageProps = useCallback((width: number, height: number) => {
    const pixelRatio = mobileUtils.getPixelRatio()
    return {
      width: Math.round(width * pixelRatio),
      height: Math.round(height * pixelRatio),
      loading: 'lazy' as const,
      decoding: 'async' as const,
      style: {
        width: `${width}px`,
        height: `${height}px`,
        objectFit: 'cover' as const
      }
    }
  }, [])

  const shouldReduceMotion = useCallback(() => {
    return state.isLowBattery || 
           state.isSlowConnection || 
           (state.performanceScore !== null && state.performanceScore < 50)
  }, [state.isLowBattery, state.isSlowConnection, state.performanceScore])

  const getRecommendedImageQuality = useCallback(() => {
    if (state.isSlowConnection) return 50
    if (state.isLowBattery) return 60
    if (mobileUtils.getPixelRatio() > 2) return 85
    return 75
  }, [state.isSlowConnection, state.isLowBattery])

  const shouldPreloadResources = useCallback(() => {
    return !state.isSlowConnection && 
           !state.isLowBattery && 
           state.isOnline &&
           (state.performanceScore === null || state.performanceScore > 60)
  }, [state.isSlowConnection, state.isLowBattery, state.isOnline, state.performanceScore])

  return {
    // State
    ...state,

    // Computed values
    shouldReduceMotion: shouldReduceMotion(),
    recommendedImageQuality: getRecommendedImageQuality(),
    shouldPreloadResources: shouldPreloadResources(),

    // Helper functions
    optimizeForSlowConnection,
    getOptimizedImageProps,

    // Utility functions
    preloadResource: mobileUtils.preloadResource,
    lazyLoadImage: mobileUtils.lazyLoadImage,
    debounce: mobileUtils.debounce,
    throttle: mobileUtils.throttle
  }
}

export default useMobileOptimization