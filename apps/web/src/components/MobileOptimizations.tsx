'use client'

import React, { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Wifi, WifiOff, Battery, BatteryLow, Smartphone, Tablet, 
  Monitor, Volume2, VolumeX, Sun, Moon, ZoomIn, ZoomOut,
  Accessibility, Eye, EyeOff, RotateCcw, Maximize2, Minimize2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useMobileOptimization } from '@/hooks/useMobileOptimization'
import { mobileUtils } from '@/lib/mobile-utils'

interface MobileOptimizationsProps {
  enabled?: boolean
  showDeviceInfo?: boolean
  showAccessibilityControls?: boolean
  showPerformanceInfo?: boolean
}

interface DeviceInfo {
  networkType: string
  batteryLevel: number | null
  batteryCharging: boolean
  memoryUsage: any
  isSlowConnection: boolean
  deviceType: 'mobile' | 'tablet' | 'desktop'
}

export default function MobileOptimizations({
  enabled = true,
  showDeviceInfo = false,
  showAccessibilityControls = false,
  showPerformanceInfo = false
}: MobileOptimizationsProps) {
  const mobileState = useMobileOptimization()
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>({
    networkType: 'unknown',
    batteryLevel: null,
    batteryCharging: false,
    memoryUsage: null,
    isSlowConnection: false,
    deviceType: 'desktop'
  })
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [fontSize, setFontSize] = useState(16)
  const [highContrast, setHighContrast] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(false)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [darkMode, setDarkMode] = useState(false)

  // Initialize device information
  useEffect(() => {
    if (!enabled) return

    const updateDeviceInfo = async () => {
      const networkType = mobileUtils.getConnectionType()
      const isSlowConnection = mobileUtils.isSlowConnection()
      const memoryUsage = mobileUtils.getMemoryUsage()
      const batteryInfo = await mobileUtils.getBatteryInfo()
      
      let deviceType: 'mobile' | 'tablet' | 'desktop' = 'desktop'
      if (mobileState.isMobile) deviceType = 'mobile'
      else if (mobileState.isTablet) deviceType = 'tablet'

      setDeviceInfo({
        networkType,
        batteryLevel: batteryInfo?.level || null,
        batteryCharging: batteryInfo?.charging || false,
        memoryUsage,
        isSlowConnection,
        deviceType
      })
    }

    updateDeviceInfo()
    
    // Update device info every 30 seconds
    const interval = setInterval(updateDeviceInfo, 30000)
    return () => clearInterval(interval)
  }, [enabled, mobileState])

  // Optimize for low battery
  useEffect(() => {
    if (!enabled) return

    const optimizeForLowBattery = async () => {
      const optimized = await mobileUtils.optimizeForLowBattery()
      if (optimized) {
        setReducedMotion(true)
        console.log('🔋 Battery optimization enabled')
      }
    }

    optimizeForLowBattery()
  }, [deviceInfo.batteryLevel, enabled])

  // Apply accessibility preferences
  useEffect(() => {
    if (!enabled) return

    // Apply font size changes
    document.documentElement.style.fontSize = `${fontSize}px`
    
    // Apply high contrast mode
    if (highContrast) {
      document.documentElement.classList.add('high-contrast')
    } else {
      document.documentElement.classList.remove('high-contrast')
    }
    
    // Apply reduced motion
    if (reducedMotion) {
      document.documentElement.classList.add('reduce-motion')
    } else {
      document.documentElement.classList.remove('reduce-motion')
    }
    
    // Apply dark mode
    if (darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [fontSize, highContrast, reducedMotion, darkMode, enabled])

  // Fullscreen handling
  const toggleFullscreen = useCallback(async () => {
    if (!document.fullscreenElement) {
      await document.documentElement.requestFullscreen()
      setIsFullscreen(true)
    } else {
      await document.exitFullscreen()
      setIsFullscreen(false)
    }
  }, [])

  // Font size controls
  const increaseFontSize = useCallback(() => {
    setFontSize(prev => Math.min(prev + 2, 24))
  }, [])

  const decreaseFontSize = useCallback(() => {
    setFontSize(prev => Math.max(prev - 2, 14))
  }, [])

  const resetFontSize = useCallback(() => {
    setFontSize(16)
  }, [])

  // Get device icon
  const getDeviceIcon = () => {
    switch (deviceInfo.deviceType) {
      case 'mobile': return Smartphone
      case 'tablet': return Tablet
      default: return Monitor
    }
  }

  // Get battery icon
  const getBatteryIcon = () => {
    if (deviceInfo.batteryLevel === null) return Battery
    return deviceInfo.batteryLevel < 20 ? BatteryLow : Battery
  }

  // Get network icon
  const getNetworkIcon = () => {
    return deviceInfo.isSlowConnection ? WifiOff : Wifi
  }

  if (!enabled) return null

  return (
    <>
      {/* Mobile Optimization Styles */}
      <style jsx global>{`
        .high-contrast {
          filter: contrast(1.5);
        }
        
        .reduce-motion * {
          animation-duration: 0.01ms !important;
          animation-iteration-count: 1 !important;
          transition-duration: 0.01ms !important;
        }
        
        @media (max-width: 768px) {
          .touch-optimized {
            min-height: 48px;
            min-width: 48px;
            padding: 12px;
          }
          
          .font-mobile-optimized {
            font-size: max(16px, 1rem);
          }
        }
        
        /* Enhanced focus indicators for mobile */
        .mobile-focus-enhanced:focus-visible {
          outline: 3px solid #003399;
          outline-offset: 3px;
          border-radius: 6px;
        }
        
        /* Improved touch feedback */
        .touch-feedback:active {
          transform: scale(0.96);
          transition: transform 0.1s ease-out;
        }
      `}</style>

      {/* Device Information Panel */}
      {showDeviceInfo && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed top-4 right-4 z-50 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg border p-3 max-w-xs"
        >
          <h4 className="text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
            {React.createElement(getDeviceIcon(), { className: "w-4 h-4" })}
            Device Info
          </h4>
          
          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Device:</span>
              <span className="font-medium">{deviceInfo.deviceType}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-gray-600 flex items-center gap-1">
                {React.createElement(getNetworkIcon(), { className: "w-3 h-3" })}
                Network:
              </span>
              <span className={`font-medium ${deviceInfo.isSlowConnection ? 'text-red-600' : 'text-green-600'}`}>
                {deviceInfo.networkType}
              </span>
            </div>
            
            {deviceInfo.batteryLevel !== null && (
              <div className="flex items-center justify-between">
                <span className="text-gray-600 flex items-center gap-1">
                  {React.createElement(getBatteryIcon(), { 
                    className: `w-3 h-3 ${deviceInfo.batteryLevel < 20 ? 'text-red-500' : 'text-green-500'}` 
                  })}
                  Battery:
                </span>
                <span className={`font-medium ${deviceInfo.batteryLevel < 20 ? 'text-red-600' : 'text-green-600'}`}>
                  {deviceInfo.batteryLevel}%
                  {deviceInfo.batteryCharging && ' ⚡'}
                </span>
              </div>
            )}
            
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Viewport:</span>
              <span className="font-medium">
                {mobileState.viewport.width} × {mobileState.viewport.height}
              </span>
            </div>
          </div>
        </motion.div>
      )}

      {/* Accessibility Controls */}
      {showAccessibilityControls && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="fixed bottom-4 right-4 z-50 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg border p-3"
        >
          <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
            <Accessibility className="w-4 h-4" />
            Accessibility
          </h4>
          
          <div className="space-y-3">
            {/* Font Size Controls */}
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={decreaseFontSize}
                className="p-2 h-8 w-8"
                aria-label="Decrease font size"
              >
                <ZoomOut className="w-3 h-3" />
              </Button>
              
              <span className="text-xs font-medium min-w-[3rem] text-center">
                {fontSize}px
              </span>
              
              <Button
                size="sm"
                variant="outline"
                onClick={increaseFontSize}
                className="p-2 h-8 w-8"
                aria-label="Increase font size"
              >
                <ZoomIn className="w-3 h-3" />
              </Button>
              
              <Button
                size="sm"
                variant="ghost"
                onClick={resetFontSize}
                className="p-2 h-8 w-8"
                aria-label="Reset font size"
              >
                <RotateCcw className="w-3 h-3" />
              </Button>
            </div>
            
            {/* Toggle Controls */}
            <div className="grid grid-cols-2 gap-2">
              <Button
                size="sm"
                variant={highContrast ? "default" : "outline"}
                onClick={() => setHighContrast(!highContrast)}
                className="text-xs flex items-center gap-1"
              >
                <Eye className="w-3 h-3" />
                Kontrast
              </Button>
              
              <Button
                size="sm"
                variant={reducedMotion ? "default" : "outline"}
                onClick={() => setReducedMotion(!reducedMotion)}
                className="text-xs flex items-center gap-1"
              >
                <EyeOff className="w-3 h-3" />
                Bewegung
              </Button>
              
              <Button
                size="sm"
                variant={darkMode ? "default" : "outline"}
                onClick={() => setDarkMode(!darkMode)}
                className="text-xs flex items-center gap-1"
              >
                {darkMode ? <Moon className="w-3 h-3" /> : <Sun className="w-3 h-3" />}
                {darkMode ? 'Dunkel' : 'Hell'}
              </Button>
              
              <Button
                size="sm"
                variant={soundEnabled ? "default" : "outline"}
                onClick={() => setSoundEnabled(!soundEnabled)}
                className="text-xs flex items-center gap-1"
              >
                {soundEnabled ? <Volume2 className="w-3 h-3" /> : <VolumeX className="w-3 h-3" />}
                Sound
              </Button>
            </div>
            
            {/* Fullscreen Toggle */}
            {mobileState.isMobile && (
              <Button
                size="sm"
                variant={isFullscreen ? "default" : "outline"}
                onClick={toggleFullscreen}
                className="w-full text-xs flex items-center gap-1"
              >
                {isFullscreen ? <Minimize2 className="w-3 h-3" /> : <Maximize2 className="w-3 h-3" />}
                {isFullscreen ? 'Vollbild verlassen' : 'Vollbild'}
              </Button>
            )}
          </div>
        </motion.div>
      )}

      {/* Performance Information */}
      {showPerformanceInfo && deviceInfo.memoryUsage && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-4 left-4 z-50 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg border p-3 max-w-xs"
        >
          <h4 className="text-sm font-bold text-gray-900 mb-2">Performance</h4>
          
          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Memory Used:</span>
              <span className="font-medium">{deviceInfo.memoryUsage.used}MB</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Memory Total:</span>
              <span className="font-medium">{deviceInfo.memoryUsage.total}MB</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Memory Limit:</span>
              <span className="font-medium">{deviceInfo.memoryUsage.limit}MB</span>
            </div>
            
            {/* Memory Usage Bar */}
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ 
                  width: `${Math.min((deviceInfo.memoryUsage.used / deviceInfo.memoryUsage.limit) * 100, 100)}%` 
                }}
              />
            </div>
          </div>
        </motion.div>
      )}

      {/* Low Battery Warning */}
      <AnimatePresence>
        {deviceInfo.batteryLevel !== null && deviceInfo.batteryLevel < 15 && !deviceInfo.batteryCharging && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 bg-red-500 text-white rounded-lg shadow-xl p-4 max-w-sm"
          >
            <div className="flex items-center gap-3">
              <BatteryLow className="w-6 h-6" />
              <div>
                <h4 className="font-bold">Niedriger Batteriestand</h4>
                <p className="text-sm opacity-90">
                  Batterie: {deviceInfo.batteryLevel}%. Energiesparmodus aktiviert.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Slow Connection Warning */}
      <AnimatePresence>
        {deviceInfo.isSlowConnection && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed top-20 left-4 right-4 z-40 bg-orange-500 text-white rounded-lg shadow-lg p-3 mx-auto max-w-md"
          >
            <div className="flex items-center gap-2">
              <WifiOff className="w-5 h-5" />
              <span className="text-sm font-medium">
                Langsame Verbindung erkannt. Inhalte werden optimiert.
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

// Export hook for manual control
export const useMobileOptimizations = () => {
  const [enabled, setEnabled] = useState(true)
  const mobileState = useMobileOptimization()
  
  const toggleEnabled = useCallback(() => {
    setEnabled(prev => !prev)
  }, [])
  
  const enableOptimizations = useCallback(() => {
    setEnabled(true)
  }, [])
  
  const disableOptimizations = useCallback(() => {
    setEnabled(false)
  }, [])
  
  return {
    enabled,
    toggleEnabled,
    enableOptimizations,
    disableOptimizations,
    mobileState
  }
}