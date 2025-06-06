// Mobile optimization utilities

export const mobileUtils = {
  // Detect if user is on mobile device
  isMobile: (): boolean => {
    if (typeof window === 'undefined') return false
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
  },

  // Detect if user is on iOS
  isIOS: (): boolean => {
    if (typeof window === 'undefined') return false
    return /iPad|iPhone|iPod/.test(navigator.userAgent)
  },

  // Detect if user is on Android
  isAndroid: (): boolean => {
    if (typeof window === 'undefined') return false
    return /Android/i.test(navigator.userAgent)
  },

  // Get device pixel ratio for high-DPI displays
  getPixelRatio: (): number => {
    if (typeof window === 'undefined') return 1
    return window.devicePixelRatio || 1
  },

  // Get viewport dimensions
  getViewport: () => {
    if (typeof window === 'undefined') return { width: 0, height: 0 }
    return {
      width: Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0),
      height: Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0)
    }
  },

  // Check if device supports touch
  supportsTouch: (): boolean => {
    if (typeof window === 'undefined') return false
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0
  },

  // Check network connection type
  getConnectionType: (): string => {
    if (typeof navigator === 'undefined' || !('connection' in navigator)) return 'unknown'
    const connection = (navigator as any).connection
    return connection?.effectiveType || 'unknown'
  },

  // Check if user is on slow connection
  isSlowConnection: (): boolean => {
    const connectionType = mobileUtils.getConnectionType()
    return ['slow-2g', '2g'].includes(connectionType)
  },

  // Optimize image src for device pixel ratio
  getOptimizedImageSrc: (baseSrc: string, width: number, height: number): string => {
    const pixelRatio = mobileUtils.getPixelRatio()
    const optimizedWidth = Math.round(width * pixelRatio)
    const optimizedHeight = Math.round(height * pixelRatio)
    
    // If using a CDN like Vercel, add optimization parameters
    if (baseSrc.includes('vercel') || baseSrc.includes('/_next/')) {
      return `${baseSrc}?w=${optimizedWidth}&h=${optimizedHeight}&q=75`
    }
    
    return baseSrc
  },

  // Debounce function for scroll/resize events
  debounce: <T extends (...args: any[]) => void>(func: T, wait: number): T => {
    let timeout: NodeJS.Timeout
    return ((...args: any[]) => {
      clearTimeout(timeout)
      timeout = setTimeout(() => func.apply(null, args), wait)
    }) as T
  },

  // Throttle function for performance-critical events
  throttle: <T extends (...args: any[]) => void>(func: T, limit: number): T => {
    let inThrottle: boolean
    return ((...args: any[]) => {
      if (!inThrottle) {
        func.apply(null, args)
        inThrottle = true
        setTimeout(() => (inThrottle = false), limit)
      }
    }) as T
  },

  // Preload critical resources
  preloadResource: (href: string, as: string, type?: string): void => {
    if (typeof document === 'undefined') return
    
    const link = document.createElement('link')
    link.rel = 'preload'
    link.href = href
    link.as = as
    if (type) link.type = type
    
    document.head.appendChild(link)
  },

  // Lazy load images with Intersection Observer
  lazyLoadImage: (img: HTMLImageElement, src: string): void => {
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      img.src = src
      return
    }

    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const lazyImage = entry.target as HTMLImageElement
          lazyImage.src = src
          lazyImage.classList.remove('lazy')
          observer.unobserve(lazyImage)
        }
      })
    }, {
      rootMargin: '50px'
    })

    imageObserver.observe(img)
  },

  // Optimize font loading
  optimizeFonts: (): void => {
    if (typeof document === 'undefined') return

    // Preload critical fonts
    const criticalFonts = [
      '/fonts/inter-regular.woff2',
      '/fonts/inter-medium.woff2',
      '/fonts/inter-bold.woff2'
    ]

    criticalFonts.forEach(font => {
      mobileUtils.preloadResource(font, 'font', 'font/woff2')
    })
  },

  // Handle safe area insets for notched devices
  getSafeAreaInsets: () => {
    if (typeof window === 'undefined') return { top: 0, bottom: 0, left: 0, right: 0 }
    
    const style = getComputedStyle(document.documentElement)
    return {
      top: parseInt(style.getPropertyValue('--safe-area-inset-top') || '0'),
      bottom: parseInt(style.getPropertyValue('--safe-area-inset-bottom') || '0'),
      left: parseInt(style.getPropertyValue('--safe-area-inset-left') || '0'),
      right: parseInt(style.getPropertyValue('--safe-area-inset-right') || '0')
    }
  },

  // Prevent zoom on input focus (iOS)
  preventInputZoom: (): void => {
    if (typeof document === 'undefined' || !mobileUtils.isIOS()) return

    const addMaximumScaleToMetaViewport = () => {
      const el = document.querySelector('meta[name=viewport]') as HTMLMetaElement
      if (el) {
        let content = el.content
        if (!content.includes('maximum-scale')) {
          content += ', maximum-scale=1.0'
        }
        if (!content.includes('user-scalable')) {
          content += ', user-scalable=no'
        }
        el.content = content
      }
    }

    const disableIosTextFieldZoom = () => {
      addMaximumScaleToMetaViewport()
    }

    const enableIosTextFieldZoom = () => {
      const el = document.querySelector('meta[name=viewport]') as HTMLMetaElement
      if (el) {
        el.content = el.content.replace(/maximum-scale=[0-9.]+/g, 'maximum-scale=5.0')
        el.content = el.content.replace(/user-scalable=no/g, 'user-scalable=yes')
      }
    }

    document.addEventListener('focusin', (e) => {
      if (e.target && (e.target as HTMLElement).tagName === 'INPUT') {
        disableIosTextFieldZoom()
      }
    })

    document.addEventListener('focusout', () => {
      enableIosTextFieldZoom()
    })
  },

  // Performance monitoring
  measurePerformance: () => {
    if (typeof window === 'undefined' || !('performance' in window)) return null

    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
    
    return {
      // Core Web Vitals
      fcp: 0, // First Contentful Paint (measured separately)
      lcp: 0, // Largest Contentful Paint (measured separately)
      fid: 0, // First Input Delay (measured separately)
      cls: 0, // Cumulative Layout Shift (measured separately)
      
      // Navigation timing
      domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
      loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
      
      // Resource timing
      dns: navigation.domainLookupEnd - navigation.domainLookupStart,
      tcp: navigation.connectEnd - navigation.connectStart,
      ttfb: navigation.responseStart - navigation.requestStart,
      
      // Total page load time
      pageLoad: navigation.loadEventEnd - navigation.fetchStart
    }
  },

  // Memory usage (if available)
  getMemoryUsage: () => {
    if (typeof window === 'undefined' || !('performance' in window) || !(performance as any).memory) {
      return null
    }

    const memory = (performance as any).memory
    return {
      used: Math.round(memory.usedJSHeapSize / 1048576), // MB
      total: Math.round(memory.totalJSHeapSize / 1048576), // MB
      limit: Math.round(memory.jsHeapSizeLimit / 1048576) // MB
    }
  },

  // Battery level (if available)
  getBatteryInfo: async () => {
    if (typeof navigator === 'undefined' || !('getBattery' in navigator)) {
      return null
    }

    try {
      const battery = await (navigator as any).getBattery()
      return {
        level: Math.round(battery.level * 100),
        charging: battery.charging,
        chargingTime: battery.chargingTime,
        dischargingTime: battery.dischargingTime
      }
    } catch (error) {
      return null
    }
  },

  // Enhanced battery optimization
  optimizeForLowBattery: async () => {
    const batteryInfo = await mobileUtils.getBatteryInfo()
    
    if (batteryInfo && batteryInfo.level < 20 && !batteryInfo.charging) {
      // Reduce animations and transitions
      document.documentElement.style.setProperty('--animation-duration', '0s')
      document.documentElement.classList.add('low-battery-mode')
      
      // Reduce background processes and visual effects
      const reducedMotionCSS = `
        .low-battery-mode *, 
        .low-battery-mode *::before, 
        .low-battery-mode *::after {
          animation-duration: 0.01ms !important;
          animation-iteration-count: 1 !important;
          transition-duration: 0.01ms !important;
          backdrop-filter: none !important;
          box-shadow: none !important;
        }
        .low-battery-mode .bg-gradient-to-r,
        .low-battery-mode .bg-gradient-to-br {
          background: var(--color-saarland-blue-700) !important;
        }
      `
      
      const style = document.createElement('style')
      style.id = 'low-battery-optimization'
      style.textContent = reducedMotionCSS
      document.head.appendChild(style)
      
      // Disable non-essential features
      localStorage.setItem('low-battery-mode', 'true')
      
      return true
    } else {
      // Remove optimizations when battery is charging or above 20%
      document.documentElement.classList.remove('low-battery-mode')
      const existingStyle = document.getElementById('low-battery-optimization')
      if (existingStyle) {
        existingStyle.remove()
      }
      localStorage.removeItem('low-battery-mode')
    }
    
    return false
  }
}

// Enhanced mobile interaction utilities
const enhancedMobileUtils = {
  ...mobileUtils,
  
  // Enhanced touch feedback with haptic support
  provideTouchFeedback: (element: HTMLElement, type: 'light' | 'medium' | 'heavy' = 'light') => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      const patterns = {
        light: [10],
        medium: [20],
        heavy: [30]
      }
      navigator.vibrate(patterns[type])
    }
    
    // Visual feedback
    element.style.transform = 'scale(0.95)'
    element.style.transition = 'transform 0.1s ease-out'
    
    setTimeout(() => {
      element.style.transform = ''
      element.style.transition = ''
    }, 100)
  },
  
  // Enhanced swipe gesture detection
  addSwipeGesture: (element: HTMLElement, callbacks: {
    onSwipeLeft?: () => void,
    onSwipeRight?: () => void,
    onSwipeUp?: () => void,
    onSwipeDown?: () => void,
    threshold?: number
  }) => {
    let startX = 0, startY = 0, endX = 0, endY = 0
    const threshold = callbacks.threshold || 50
    
    const handleTouchStart = (e: TouchEvent) => {
      startX = e.touches[0].clientX
      startY = e.touches[0].clientY
    }
    
    const handleTouchEnd = (e: TouchEvent) => {
      endX = e.changedTouches[0].clientX
      endY = e.changedTouches[0].clientY
      
      const deltaX = endX - startX
      const deltaY = endY - startY
      
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        if (Math.abs(deltaX) > threshold) {
          if (deltaX > 0 && callbacks.onSwipeRight) {
            callbacks.onSwipeRight()
          } else if (deltaX < 0 && callbacks.onSwipeLeft) {
            callbacks.onSwipeLeft()
          }
        }
      } else {
        if (Math.abs(deltaY) > threshold) {
          if (deltaY > 0 && callbacks.onSwipeDown) {
            callbacks.onSwipeDown()
          } else if (deltaY < 0 && callbacks.onSwipeUp) {
            callbacks.onSwipeUp()
          }
        }
      }
    }
    
    element.addEventListener('touchstart', handleTouchStart, { passive: true })
    element.addEventListener('touchend', handleTouchEnd, { passive: true })
    
    return () => {
      element.removeEventListener('touchstart', handleTouchStart)
      element.removeEventListener('touchend', handleTouchEnd)
    }
  },
  
  // Smart loading for mobile
  smartImageLoading: (img: HTMLImageElement, src: string, options?: {
    quality?: number,
    format?: 'webp' | 'avif' | 'auto',
    prioritize?: boolean
  }) => {
    const { quality = 75, format = 'auto', prioritize = false } = options || {}
    const isSlowConnection = mobileUtils.isSlowConnection()
    const pixelRatio = mobileUtils.getPixelRatio()
    
    // Determine optimal quality based on connection
    const optimalQuality = isSlowConnection ? Math.min(quality, 50) : quality
    
    // Generate responsive image URL
    let optimizedSrc = src
    if (src.includes('/_next/') || src.includes('vercel')) {
      const width = Math.round(img.offsetWidth * pixelRatio)
      const height = Math.round(img.offsetHeight * pixelRatio)
      optimizedSrc = `${src}?w=${width}&h=${height}&q=${optimalQuality}`
      
      if (format !== 'auto') {
        optimizedSrc += `&fmt=${format}`
      }
    }
    
    // Use intersection observer for lazy loading
    if (!prioritize) {
      mobileUtils.lazyLoadImage(img, optimizedSrc)
    } else {
      img.src = optimizedSrc
    }
    
    // Add loading indicators
    img.style.transition = 'opacity 0.3s ease-in-out'
    img.style.opacity = '0.5'
    
    img.onload = () => {
      img.style.opacity = '1'
    }
    
    img.onerror = () => {
      img.style.opacity = '1'
      console.warn('Failed to load optimized image, falling back:', src)
    }
  },
  
  // Enhanced performance monitoring with Core Web Vitals
  measureCoreWebVitals: () => {
    if (typeof window === 'undefined' || !('performance' in window)) return null
    
    const observer = new PerformanceObserver((entryList) => {
      for (const entry of entryList.getEntries()) {
        console.log(`📊 ${entry.name}:`, entry.value)
        
        // Store metrics for analytics
        if (typeof localStorage !== 'undefined') {
          const metrics = JSON.parse(localStorage.getItem('mobile-performance-metrics') || '{}')
          metrics[entry.name] = {
            value: entry.value,
            timestamp: Date.now(),
            url: window.location.pathname
          }
          localStorage.setItem('mobile-performance-metrics', JSON.stringify(metrics))
        }
      }
    })
    
    // Observe different metric types
    try {
      observer.observe({ entryTypes: ['measure', 'navigation', 'resource', 'paint'] })
    } catch (e) {
      console.warn('Performance observer not fully supported')
    }
    
    return observer
  },
  
  // PWA installation prompt
  showPWAInstallPrompt: () => {
    if (typeof window === 'undefined') return false
    
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      return false
    }
    
    // Check for install prompt event
    const deferredPrompt = (window as any).deferredPrompt
    if (deferredPrompt) {
      deferredPrompt.prompt()
      return true
    }
    
    return false
  },
  
  // Adaptive loading based on device capabilities
  getAdaptiveLoadingStrategy: () => {
    const isSlowConnection = mobileUtils.isSlowConnection()
    const isLowEnd = (() => {
      if (typeof navigator === 'undefined') return false
      const memory = (navigator as any).deviceMemory
      const cores = navigator.hardwareConcurrency
      return memory && memory < 4 || cores && cores < 4
    })()
    
    return {
      shouldPreload: !isSlowConnection && !isLowEnd,
      imageQuality: isSlowConnection ? 50 : isLowEnd ? 65 : 85,
      shouldUseWebP: !isLowEnd,
      maxConcurrentRequests: isSlowConnection ? 2 : isLowEnd ? 4 : 6,
      shouldDefer: isSlowConnection || isLowEnd
    }
  }
}

// Export individual utilities for easier imports
export const {
  isMobile,
  isIOS,
  isAndroid,
  getPixelRatio,
  getViewport,
  supportsTouch,
  getConnectionType,
  isSlowConnection,
  getOptimizedImageSrc,
  debounce,
  throttle,
  preloadResource,
  lazyLoadImage,
  optimizeFonts,
  getSafeAreaInsets,
  preventInputZoom,
  measurePerformance,
  getMemoryUsage,
  getBatteryInfo,
  optimizeForLowBattery,
  provideTouchFeedback,
  addSwipeGesture,
  smartImageLoading,
  measureCoreWebVitals,
  showPWAInstallPrompt,
  getAdaptiveLoadingStrategy
} = enhancedMobileUtils

export default enhancedMobileUtils