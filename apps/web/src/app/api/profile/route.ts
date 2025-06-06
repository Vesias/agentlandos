import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { supabase } from '@/lib/supabase'

const profileSchema = z.object({
  language_preference: z.string().optional(),
  accessibility_needs: z.array(z.string()).optional(),
  interests: z.array(z.string()).optional()
})

export async function GET(request: NextRequest) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data } = await supabase.from('user_profiles').select('*').eq('id', user.id).single()
  return NextResponse.json({ profile: data })
}

export async function PUT(request: NextRequest) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const result = profileSchema.safeParse(body)
  if (!result.success) {
    return NextResponse.json({ error: 'Invalid data', details: result.error.flatten() }, { status: 400 })
  }

  const { data, error } = await supabase.from('user_profiles').upsert({ id: user.id, ...result.data })
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json({ profile: data?.[0] ?? null })
}
