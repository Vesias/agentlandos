import { NextRequest, NextResponse } from 'next/server'
import { uploadImage, uploadAudio, uploadAvatar, STORAGE_BUCKETS } from '@/lib/supabase-storage'

export const runtime = 'nodejs'

interface UploadResponse {
  success: boolean
  data?: {
    url: string
    path: string
    type: string
  }
  error?: string
}

export async function POST(request: NextRequest): Promise<NextResponse<UploadResponse>> {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const type = formData.get('type') as string || 'image'
    const userId = formData.get('userId') as string
    
    if (!file) {
      return NextResponse.json(
        { success: false, error: 'Keine Datei hochgeladen' },
        { status: 400 }
      )
    }

    // Validate file size (max 10MB for images, 50MB for audio)
    const maxSize = type === 'audio' ? 50 * 1024 * 1024 : 10 * 1024 * 1024
    if (file.size > maxSize) {
      const maxSizeMB = maxSize / (1024 * 1024)
      return NextResponse.json(
        { success: false, error: `Datei zu groß. Maximum: ${maxSizeMB}MB` },
        { status: 400 }
      )
    }

    // Validate file type
    const allowedImageTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    const allowedAudioTypes = ['audio/webm', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/mp4']
    
    let result
    
    switch (type) {
      case 'image':
        if (!allowedImageTypes.includes(file.type)) {
          return NextResponse.json(
            { success: false, error: 'Ungültiger Bildtyp. Erlaubt: JPEG, PNG, WebP, GIF' },
            { status: 400 }
          )
        }
        result = await uploadImage(file)
        break
        
      case 'audio':
        if (!allowedAudioTypes.includes(file.type)) {
          return NextResponse.json(
            { success: false, error: 'Ungültiger Audiotyp. Erlaubt: WebM, MP3, WAV, OGG' },
            { status: 400 }
          )
        }
        result = await uploadAudio(file)
        break
        
      case 'avatar':
        if (!allowedImageTypes.includes(file.type)) {
          return NextResponse.json(
            { success: false, error: 'Ungültiger Bildtyp für Avatar. Erlaubt: JPEG, PNG, WebP, GIF' },
            { status: 400 }
          )
        }
        if (!userId) {
          return NextResponse.json(
            { success: false, error: 'Benutzer-ID für Avatar erforderlich' },
            { status: 400 }
          )
        }
        result = await uploadAvatar(file, userId)
        break
        
      default:
        return NextResponse.json(
          { success: false, error: 'Unbekannter Upload-Typ' },
          { status: 400 }
        )
    }

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || 'Upload fehlgeschlagen' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        url: result.data!.publicUrl,
        path: result.data!.path,
        type: file.type
      }
    })

  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Server-Fehler beim Upload',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const path = searchParams.get('path')
    const bucket = searchParams.get('bucket') as keyof typeof STORAGE_BUCKETS
    
    if (!path || !bucket) {
      return NextResponse.json(
        { success: false, error: 'Pfad und Bucket erforderlich' },
        { status: 400 }
      )
    }

    // Import deleteFile dynamically to avoid edge runtime issues
    const { deleteFile } = await import('@/lib/supabase-storage')
    const result = await deleteFile(STORAGE_BUCKETS[bucket], path)

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || 'Löschung fehlgeschlagen' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Delete error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Server-Fehler beim Löschen',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}