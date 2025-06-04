'use client'

import React from 'react'

interface MobileFeaturesProps {
  showLocationButton?: boolean
  showCallButton?: boolean
  showShareButton?: boolean
  showInstallButton?: boolean
  className?: string
}

export default function MobileFeatures({
  showLocationButton = true,
  showCallButton = true,
  showShareButton = true,
  showInstallButton = true,
  className = ''
}: MobileFeaturesProps) {
  // REMOVED: No more floating mobile icons - they were annoying and unnecessary
  // User feedback: "schwebende icons mit behörden ruf und so unnötig remove diesen fehler"
  return null
}