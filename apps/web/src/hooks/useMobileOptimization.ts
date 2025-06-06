'use client'

import { useEffect, useState, useCallback } from 'react'

interface MobileOptimizationState {
  isMobile: boolean
  isTablet: boolean
  isDesktop: boolean
  viewport: { width: number; height: number }
  isLandscape: boolean
  isPortrait: boolean
  touchSupported: boolean
  devicePixelRatio: number
  networkQuality: 'slow' | 'fast' | 'unknown'
  memoryLevel: 'low' | 'medium' | 'high' | 'unknown'
  batteryLevel: number | null
  isCharging: boolean
  reducedMotion: boolean
  highContrast: boolean
  darkMode: boolean
}

export function useMobileOptimization() {
  const [state, setState] = useState<MobileOptimizationState>({
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    viewport: { width: 0, height: 0 },
    isLandscape: false,
    isPortrait: true,
    touchSupported: false,
    devicePixelRatio: 1,
    networkQuality: 'unknown',
    memoryLevel: 'unknown',
    batteryLevel: null,
    isCharging: false,
    reducedMotion: false,
    highContrast: false,
    darkMode: false
  })

  // Enhanced device detection with capabilities
  const detectDevice = useCallback(async () => {
    if (typeof window === 'undefined') return state

    const width = window.innerWidth
    const height = window.innerHeight
    const touchSupported = 'ontouchstart' in window || navigator.maxTouchPoints > 0
    const devicePixelRatio = window.devicePixelRatio || 1

    const isMobile = width < 768 && touchSupported
    const isTablet = width >= 768 && width < 1024 && touchSupported
    const isDesktop = width >= 1024 || !touchSupported

    // Detect network quality
    let networkQuality: 'slow' | 'fast' | 'unknown' = 'unknown'
    if ('connection' in navigator) {
      const connection = (navigator as any).connection
      if (connection) {
        networkQuality = ['slow-2g', '2g'].includes(connection.effectiveType) ? 'slow' : 'fast'
      }
    }

    // Detect memory level
    let memoryLevel: 'low' | 'medium' | 'high' | 'unknown' = 'unknown'
    if ('deviceMemory' in navigator) {
      const memory = (navigator as any).deviceMemory
      if (memory < 4) memoryLevel = 'low'
      else if (memory < 8) memoryLevel = 'medium'
      else memoryLevel = 'high'
    }

    // Get battery info
    let batteryLevel: number | null = null
    let isCharging = false
    try {
      if ('getBattery' in navigator) {
        const battery = await (navigator as any).getBattery()
        batteryLevel = Math.round(battery.level * 100)
        isCharging = battery.charging
      }
    } catch (e) {
      // Battery API not available
    }

    // Detect user preferences
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const highContrast = window.matchMedia('(prefers-contrast: high)').matches
    const darkMode = window.matchMedia('(prefers-color-scheme: dark)').matches

    return {
      isMobile,
      isTablet,
      isDesktop,
      viewport: { width, height },
      isLandscape: width > height,
      isPortrait: height >= width,
      touchSupported,
      devicePixelRatio,
      networkQuality,
      memoryLevel,
      batteryLevel,
      isCharging,
      reducedMotion,
      highContrast,
      darkMode
    }
  }, [])

  // Initialize device detection
  useEffect(() => {
    detectDevice().then(setState)
  }, [detectDevice])

  // Monitor viewport and capability changes
  useEffect(() => {
    const handleResize = () => {
      detectDevice().then(setState)
    }

    const handleOrientationChange = () => {
      // Add small delay for orientation change to complete
      setTimeout(() => {
        detectDevice().then(setState)
      }, 100)
    }

    const throttledResize = throttle(handleResize, 150)

    window.addEventListener('resize', throttledResize)
    window.addEventListener('orientationchange', handleOrientationChange)

    // Monitor preference changes
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const contrastQuery = window.matchMedia('(prefers-contrast: high)')
    const themeQuery = window.matchMedia('(prefers-color-scheme: dark)')

    const handlePreferenceChange = () => {
      detectDevice().then(setState)
    }

    motionQuery.addEventListener('change', handlePreferenceChange)
    contrastQuery.addEventListener('change', handlePreferenceChange)
    themeQuery.addEventListener('change', handlePreferenceChange)

    return () => {
      window.removeEventListener('resize', throttledResize)
      window.removeEventListener('orientationchange', handleOrientationChange)
      motionQuery.removeEventListener('change', handlePreferenceChange)
      contrastQuery.removeEventListener('change', handlePreferenceChange)
      themeQuery.removeEventListener('change', handlePreferenceChange)
    }
  }, [detectDevice])

  // Utility functions
  const throttle = useCallback((func: Function, delay: number) => {
    let timeoutId: NodeJS.Timeout | null = null
    let lastExecTime = 0
    return function (this: any, ...args: any[]) {
      const currentTime = Date.now()
      
      if (currentTime - lastExecTime > delay) {
        func.apply(this, args)
        lastExecTime = currentTime
      } else {
        if (timeoutId) clearTimeout(timeoutId)
        timeoutId = setTimeout(() => {
          func.apply(this, args)
          lastExecTime = Date.now()
        }, delay - (currentTime - lastExecTime))
      }
    }
  }, [])

  const debounce = useCallback((func: Function, delay: number) => {
    let timeoutId: NodeJS.Timeout
    return function (this: any, ...args: any[]) {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(() => func.apply(this, args), delay)
    }
  }, [])

  const getOptimizedImageProps = useCallback((width: number, height: number) => {
    // Adjust quality based on network and device capabilities
    const quality = state.networkQuality === 'slow' ? 50 : state.memoryLevel === 'low' ? 65 : 85
    
    return {
      width: Math.round(width * state.devicePixelRatio),
      height: Math.round(height * state.devicePixelRatio),
      loading: (state.networkQuality === 'slow' ? 'lazy' : 'eager') as const,
      decoding: 'async' as const,
      style: {
        width: `${width}px`,
        height: `${height}px`,
        objectFit: 'cover' as const
      },
      quality
    }
  }, [state.devicePixelRatio, state.networkQuality, state.memoryLevel])

  const getBreakpointClass = useCallback(() => {
    if (state.isMobile) return 'mobile'
    if (state.isTablet) return 'tablet'
    return 'desktop'
  }, [state.isMobile, state.isTablet])

  const shouldReduceMotion = useCallback(() => {
    // Check for user preference or low battery
    return state.reducedMotion || (state.batteryLevel !== null && state.batteryLevel < 15 && !state.isCharging)
  }, [state.reducedMotion, state.batteryLevel, state.isCharging])

  // Performance recommendations
  const getPerformanceRecommendations = useCallback(() => {
    const recommendations = []
    
    if (state.networkQuality === 'slow') {
      recommendations.push('Reduce image quality and defer non-critical resources')
    }
    
    if (state.memoryLevel === 'low') {
      recommendations.push('Limit concurrent operations and use smaller bundles')
    }
    
    if (state.batteryLevel !== null && state.batteryLevel < 20) {
      recommendations.push('Enable battery saving mode and reduce animations')
    }
    
    if (state.reducedMotion) {
      recommendations.push('Disable animations and transitions')
    }
    
    return recommendations
  }, [state])

  // Adaptive loading strategy
  const getLoadingStrategy = useCallback(() => {
    return {
      shouldPreload: state.networkQuality === 'fast' && state.memoryLevel !== 'low',
      maxConcurrentRequests: state.networkQuality === 'slow' ? 2 : state.memoryLevel === 'low' ? 4 : 6,
      imageQuality: state.networkQuality === 'slow' ? 50 : state.memoryLevel === 'low' ? 65 : 85,
      shouldUseWebP: state.memoryLevel !== 'low',
      shouldDefer: state.networkQuality === 'slow' || state.memoryLevel === 'low'
    }
  }, [state])

  return {
    // State
    ...state,

    // Computed values
    breakpointClass: getBreakpointClass(),
    shouldReduceMotion: shouldReduceMotion(),
    performanceRecommendations: getPerformanceRecommendations(),
    loadingStrategy: getLoadingStrategy(),

    // Helper functions
    getOptimizedImageProps,
    throttle,
    debounce
  }
}

// Additional hooks for specific optimizations
export const useNetworkOptimization = () => {
  const { networkQuality, loadingStrategy } = useMobileOptimization()
  
  return {
    isSlowNetwork: networkQuality === 'slow',
    loadingStrategy,
    shouldPreload: loadingStrategy.shouldPreload
  }
}

export const useBatteryOptimization = () => {
  const { batteryLevel, isCharging, shouldReduceMotion } = useMobileOptimization()
  
  return {
    batteryLevel,
    isCharging,
    isLowBattery: batteryLevel !== null && batteryLevel < 20,
    shouldOptimizeForBattery: batteryLevel !== null && batteryLevel < 15 && !isCharging,
    shouldReduceMotion
  }
}

export const useAccessibilityOptimization = () => {
  const { reducedMotion, highContrast, darkMode } = useMobileOptimization()
  
  return {
    reducedMotion,
    highContrast,
    darkMode,
    hasAccessibilityPreferences: reducedMotion || highContrast
  }
}

export default useMobileOptimization