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
    devicePixelRatio: 1
  })

  // Device detection utility functions
  const detectDevice = useCallback(() => {
    if (typeof window === 'undefined') return state

    const width = window.innerWidth
    const height = window.innerHeight
    const touchSupported = 'ontouchstart' in window || navigator.maxTouchPoints > 0
    const devicePixelRatio = window.devicePixelRatio || 1

    const isMobile = width < 768 && touchSupported
    const isTablet = width >= 768 && width < 1024 && touchSupported
    const isDesktop = width >= 1024 || !touchSupported

    return {
      isMobile,
      isTablet,
      isDesktop,
      viewport: { width, height },
      isLandscape: width > height,
      isPortrait: height >= width,
      touchSupported,
      devicePixelRatio
    }
  }, [])

  // Initialize device detection
  useEffect(() => {
    setState(detectDevice())
  }, [detectDevice])

  // Monitor viewport changes
  useEffect(() => {
    const handleResize = () => {
      setState(detectDevice())
    }

    const throttledResize = throttle(handleResize, 150)

    window.addEventListener('resize', throttledResize)
    window.addEventListener('orientationchange', throttledResize)

    return () => {
      window.removeEventListener('resize', throttledResize)
      window.removeEventListener('orientationchange', throttledResize)
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
    return {
      width: Math.round(width * state.devicePixelRatio),
      height: Math.round(height * state.devicePixelRatio),
      loading: 'lazy' as const,
      decoding: 'async' as const,
      style: {
        width: `${width}px`,
        height: `${height}px`,
        objectFit: 'cover' as const
      }
    }
  }, [state.devicePixelRatio])

  const getBreakpointClass = useCallback(() => {
    if (state.isMobile) return 'mobile'
    if (state.isTablet) return 'tablet'
    return 'desktop'
  }, [state.isMobile, state.isTablet])

  const shouldReduceMotion = useCallback(() => {
    // Check for user preference
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches
    }
    return false
  }, [])

  return {
    // State
    ...state,

    // Computed values
    breakpointClass: getBreakpointClass(),
    shouldReduceMotion: shouldReduceMotion(),

    // Helper functions
    getOptimizedImageProps,
    throttle,
    debounce
  }
}

export default useMobileOptimization