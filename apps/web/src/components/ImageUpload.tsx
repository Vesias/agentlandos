'use client'

import React, { useState, useRef, useCallback } from 'react'
import { Upload, X, Image as ImageIcon, Camera, FileImage, Loader2, CheckCircle, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ImageUploadProps {
  onImageSelect?: (file: File, preview: string) => void
  onImageRemove?: () => void
  maxSize?: number // in MB
  allowedTypes?: string[]
  className?: string
  multiple?: boolean
  showPreview?: boolean
  acceptCamera?: boolean
  disabled?: boolean
  placeholder?: string
}

interface UploadedImage {
  file: File
  preview: string
  id: string
  uploadProgress?: number
  uploadStatus?: 'uploading' | 'success' | 'error'
  error?: string
}

export default function ImageUpload({
  onImageSelect,
  onImageRemove,
  maxSize = 10, // 10MB default
  allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  className = '',
  multiple = false,
  showPreview = true,
  acceptCamera = true,
  disabled = false,
  placeholder = 'Bild hochladen oder hier ablegen'
}: ImageUploadProps) {
  const [images, setImages] = useState<UploadedImage[]>([])
  const [isDragOver, setIsDragOver] = useState(false)
  const [isCompressing, setIsCompressing] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)

  // Validate file
  const validateFile = (file: File): string | null => {
    // Check file type
    if (!allowedTypes.includes(file.type)) {
      return `Dateityp nicht unterstützt. Erlaubt: ${allowedTypes.join(', ')}`
    }

    // Check file size
    const maxSizeBytes = maxSize * 1024 * 1024
    if (file.size > maxSizeBytes) {
      return `Datei zu groß. Maximum: ${maxSize}MB`
    }

    return null
  }

  // Compress image
  const compressImage = async (file: File, quality: number = 0.8): Promise<File> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')!
      const img = new Image()

      img.onload = () => {
        // Calculate new dimensions (max 1920px width/height)
        const maxDimension = 1920
        let { width, height } = img
        
        if (width > height && width > maxDimension) {
          height = (height * maxDimension) / width
          width = maxDimension
        } else if (height > maxDimension) {
          width = (width * maxDimension) / height
          height = maxDimension
        }

        canvas.width = width
        canvas.height = height

        // Draw and compress
        ctx.drawImage(img, 0, 0, width, height)
        
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: file.type,
                lastModified: Date.now()
              })
              resolve(compressedFile)
            } else {
              resolve(file)
            }
          },
          file.type,
          quality
        )
      }

      img.src = URL.createObjectURL(file)
    })
  }

  // Process files
  const processFiles = useCallback(async (files: FileList | File[]) => {
    const fileArray = Array.from(files)
    
    for (const file of fileArray) {
      const error = validateFile(file)
      if (error) {
        console.error('File validation error:', error)
        continue
      }

      setIsCompressing(true)
      
      try {
        // Compress image if it's too large
        const shouldCompress = file.size > 2 * 1024 * 1024 // 2MB threshold
        const processedFile = shouldCompress ? await compressImage(file) : file
        
        const preview = URL.createObjectURL(processedFile)
        const imageId = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        
        const uploadedImage: UploadedImage = {
          file: processedFile,
          preview,
          id: imageId,
          uploadStatus: 'success'
        }

        if (multiple) {
          setImages(prev => [...prev, uploadedImage])
        } else {
          setImages([uploadedImage])
          // Clean up previous image URLs
          images.forEach(img => URL.revokeObjectURL(img.preview))
        }

        onImageSelect?.(processedFile, preview)
        
      } catch (error) {
        console.error('Error processing image:', error)
      } finally {
        setIsCompressing(false)
      }
    }
  }, [allowedTypes, maxSize, multiple, onImageSelect, images])

  // Handle drag events
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    if (!disabled) setIsDragOver(true)
  }, [disabled])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    
    if (disabled) return
    
    const files = e.dataTransfer.files
    if (files.length > 0) {
      processFiles(files)
    }
  }, [disabled, processFiles])

  // Handle file input change
  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      processFiles(files)
    }
    // Reset input
    e.target.value = ''
  }, [processFiles])

  // Remove image
  const removeImage = useCallback((imageId: string) => {
    setImages(prev => {
      const updated = prev.filter(img => {
        if (img.id === imageId) {
          URL.revokeObjectURL(img.preview)
          return false
        }
        return true
      })
      return updated
    })
    onImageRemove?.()
  }, [onImageRemove])

  // Open file dialog
  const openFileDialog = () => {
    if (!disabled) {
      fileInputRef.current?.click()
    }
  }

  // Open camera
  const openCamera = () => {
    if (!disabled && acceptCamera) {
      cameraInputRef.current?.click()
    }
  }

  // Clean up URLs on unmount
  React.useEffect(() => {
    return () => {
      images.forEach(img => URL.revokeObjectURL(img.preview))
    }
  }, [images])

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={openFileDialog}
        className={`
          relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all
          ${isDragOver 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          ${isCompressing ? 'bg-gray-50' : ''}
        `}
      >
        {isCompressing ? (
          <div className="flex flex-col items-center space-y-2">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            <p className="text-sm text-gray-600">Bild wird komprimiert...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center space-y-3">
            <div className="flex items-center space-x-2">
              <Upload className="w-8 h-8 text-gray-400" />
              {acceptCamera && (
                <Camera className="w-8 h-8 text-gray-400" />
              )}
            </div>
            
            <div>
              <p className="text-sm font-medium text-gray-900">{placeholder}</p>
              <p className="text-xs text-gray-500 mt-1">
                Max. {maxSize}MB • {allowedTypes.map(type => type.split('/')[1]).join(', ').toUpperCase()}
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <Button 
                type="button"
                variant="outline" 
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  openFileDialog()
                }}
                disabled={disabled}
              >
                <FileImage className="w-4 h-4 mr-1" />
                Datei wählen
              </Button>

              {acceptCamera && (
                <Button 
                  type="button"
                  variant="outline" 
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    openCamera()
                  }}
                  disabled={disabled}
                >
                  <Camera className="w-4 h-4 mr-1" />
                  Kamera
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Hidden file inputs */}
        <input
          ref={fileInputRef}
          type="file"
          accept={allowedTypes.join(',')}
          onChange={handleFileChange}
          multiple={multiple}
          className="hidden"
        />

        {acceptCamera && (
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFileChange}
            className="hidden"
          />
        )}
      </div>

      {/* Image Previews */}
      {showPreview && images.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-900">
            {multiple ? `${images.length} Bild(er) ausgewählt` : 'Ausgewähltes Bild'}
          </h4>
          
          <div className={`grid gap-3 ${multiple ? 'grid-cols-2 md:grid-cols-3' : 'grid-cols-1'}`}>
            {images.map((image) => (
              <div key={image.id} className="relative group">
                <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
                  <img
                    src={image.preview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Status overlay */}
                  <div className="absolute top-2 right-2">
                    {image.uploadStatus === 'success' && (
                      <CheckCircle className="w-5 h-5 text-green-500 bg-white rounded-full" />
                    )}
                    {image.uploadStatus === 'error' && (
                      <AlertCircle className="w-5 h-5 text-red-500 bg-white rounded-full" />
                    )}
                    {image.uploadStatus === 'uploading' && (
                      <Loader2 className="w-5 h-5 text-blue-500 bg-white rounded-full animate-spin" />
                    )}
                  </div>

                  {/* Remove button */}
                  <Button
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 left-2 w-6 h-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => removeImage(image.id)}
                  >
                    <X className="w-3 h-3" />
                  </Button>

                  {/* Upload progress */}
                  {image.uploadProgress !== undefined && image.uploadProgress < 100 && (
                    <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 p-2">
                      <div className="w-full bg-gray-300 rounded-full h-1">
                        <div 
                          className="bg-blue-500 h-1 rounded-full transition-all"
                          style={{ width: `${image.uploadProgress}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* File info */}
                <div className="mt-2 text-xs text-gray-500">
                  <p className="truncate">{image.file.name}</p>
                  <p>{(image.file.size / 1024 / 1024).toFixed(1)} MB</p>
                  {image.error && (
                    <p className="text-red-500 mt-1">{image.error}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}