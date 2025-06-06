'use client'

import { createClient } from '@supabase/supabase-js'

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Storage buckets configuration
export const STORAGE_BUCKETS = {
  IMAGES: 'images',
  AUDIO: 'audio',
  DOCUMENTS: 'documents',
  AVATARS: 'avatars'
} as const

export type StorageBucket = typeof STORAGE_BUCKETS[keyof typeof STORAGE_BUCKETS]

interface UploadOptions {
  bucket: StorageBucket
  path?: string
  upsert?: boolean
  cacheControl?: string
  contentType?: string
}

interface UploadResult {
  success: boolean
  data?: {
    path: string
    publicUrl: string
    fullPath: string
  }
  error?: string
}

/**
 * Upload file to Supabase storage
 */
export async function uploadFile(
  file: File,
  options: UploadOptions
): Promise<UploadResult> {
  try {
    const { bucket, path, upsert = false, cacheControl = '3600', contentType } = options
    
    // Generate unique file path if not provided
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2, 15)
    const fileExtension = file.name.split('.').pop()
    const fileName = path || `${timestamp}_${randomString}.${fileExtension}`
    
    // Upload file
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(fileName, file, {
        cacheControl,
        upsert,
        contentType: contentType || file.type
      })

    if (error) {
      console.error('Upload error:', error)
      return {
        success: false,
        error: error.message
      }
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path)

    return {
      success: true,
      data: {
        path: data.path,
        publicUrl: urlData.publicUrl,
        fullPath: data.fullPath || data.path
      }
    }

  } catch (error) {
    console.error('Upload failed:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed'
    }
  }
}

/**
 * Upload image with compression and optimization
 */
export async function uploadImage(
  file: File,
  options: Partial<UploadOptions> = {}
): Promise<UploadResult> {
  try {
    // Compress image if it's large
    const compressedFile = await compressImage(file)
    
    return uploadFile(compressedFile, {
      bucket: STORAGE_BUCKETS.IMAGES,
      cacheControl: '86400', // 24 hours
      ...options
    })
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Image upload failed'
    }
  }
}

/**
 * Upload audio file
 */
export async function uploadAudio(
  file: File,
  options: Partial<UploadOptions> = {}
): Promise<UploadResult> {
  return uploadFile(file, {
    bucket: STORAGE_BUCKETS.AUDIO,
    cacheControl: '3600', // 1 hour
    ...options
  })
}

/**
 * Upload avatar image
 */
export async function uploadAvatar(
  file: File,
  userId: string,
  options: Partial<UploadOptions> = {}
): Promise<UploadResult> {
  try {
    // Compress and resize avatar
    const processedFile = await processAvatarImage(file)
    
    return uploadFile(processedFile, {
      bucket: STORAGE_BUCKETS.AVATARS,
      path: `${userId}/avatar.${file.name.split('.').pop()}`,
      upsert: true,
      cacheControl: '86400',
      ...options
    })
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Avatar upload failed'
    }
  }
}

/**
 * Delete file from storage
 */
export async function deleteFile(
  bucket: StorageBucket,
  path: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([path])

    if (error) {
      return {
        success: false,
        error: error.message
      }
    }

    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Delete failed'
    }
  }
}

/**
 * Get public URL for file
 */
export function getPublicUrl(bucket: StorageBucket, path: string): string {
  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(path)
  
  return data.publicUrl
}

/**
 * Get signed URL for private file
 */
export async function getSignedUrl(
  bucket: StorageBucket,
  path: string,
  expiresIn: number = 3600
): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(path, expiresIn)

    if (error) {
      return {
        success: false,
        error: error.message
      }
    }

    return {
      success: true,
      url: data.signedUrl
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get signed URL'
    }
  }
}

/**
 * Compress image for upload
 */
async function compressImage(file: File, quality: number = 0.8): Promise<File> {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')!
    const img = new Image()

    img.onload = () => {
      // Calculate new dimensions (max 1920px for images, 800px for avatars)
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

/**
 * Process avatar image (square crop + resize)
 */
async function processAvatarImage(file: File): Promise<File> {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')!
    const img = new Image()

    img.onload = () => {
      // Avatar dimensions (square)
      const size = 200
      canvas.width = size
      canvas.height = size

      // Calculate crop area for square center crop
      const { width, height } = img
      const minDimension = Math.min(width, height)
      const cropX = (width - minDimension) / 2
      const cropY = (height - minDimension) / 2

      // Draw cropped and resized image
      ctx.drawImage(
        img,
        cropX, cropY, minDimension, minDimension,
        0, 0, size, size
      )
      
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const processedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now()
            })
            resolve(processedFile)
          } else {
            resolve(file)
          }
        },
        file.type,
        0.9 // High quality for avatars
      )
    }

    img.src = URL.createObjectURL(file)
  })
}

/**
 * Initialize storage buckets (run this once)
 */
export async function initializeStorageBuckets() {
  const buckets = Object.values(STORAGE_BUCKETS)
  
  for (const bucket of buckets) {
    try {
      const { error } = await supabase.storage.createBucket(bucket, {
        public: true,
        allowedMimeTypes: bucket === STORAGE_BUCKETS.IMAGES 
          ? ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
          : bucket === STORAGE_BUCKETS.AUDIO
          ? ['audio/webm', 'audio/mp3', 'audio/wav', 'audio/ogg']
          : undefined,
        fileSizeLimit: bucket === STORAGE_BUCKETS.IMAGES ? 10485760 : 52428800 // 10MB for images, 50MB for audio
      })
      
      if (error && !error.message.includes('already exists')) {
        console.error(`Failed to create bucket ${bucket}:`, error)
      }
    } catch (error) {
      console.error(`Error creating bucket ${bucket}:`, error)
    }
  }
}