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

  // Optimize for low battery
  optimizeForLowBattery: async () => {
    const batteryInfo = await mobileUtils.getBatteryInfo()
    
    if (batteryInfo && batteryInfo.level < 20 && !batteryInfo.charging) {
      // Reduce animations
      document.documentElement.style.setProperty('--animation-duration', '0s')
      
      // Reduce background processes
      const reducedMotionCSS = `
        *, *::before, *::after {
          animation-duration: 0.01ms !important;
          animation-iteration-count: 1 !important;
          transition-duration: 0.01ms !important;
        }
      `
      
      const style = document.createElement('style')
      style.textContent = reducedMotionCSS
      document.head.appendChild(style)
      
      return true
    }
    
    return false
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
  optimizeForLowBattery
} = mobileUtils

export default mobileUtils