import { NextResponse } from 'next/server'
import { verifyTripMember, isAuthError } from '@/lib/trip-auth'

const MAX_FILE_SIZE = 5 * 1024 * 1024
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']

export async function POST(
  request: Request,
  { params }: { params: Promise<{ tripId: string }> }
) {
  const { tripId } = await params
  const auth = await verifyTripMember(tripId)
  if (isAuthError(auth)) return auth

  const { supabase } = auth

  const formData = await request.formData()
  const file = formData.get('file')

  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'file là bắt buộc' }, { status: 400 })
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json({ error: 'Chỉ chấp nhận ảnh JPEG, PNG hoặc WEBP' }, { status: 400 })
  }

  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json({ error: 'Kích thước ảnh tối đa 5MB' }, { status: 400 })
  }

  const extension = file.name.split('.').pop() || 'jpg'
  const filename = `${tripId}/${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${extension}`

  const buffer = await file.arrayBuffer()
  const { error: uploadError } = await supabase.storage
    .from('receipts')
    .upload(filename, buffer, {
      contentType: file.type,
      upsert: true,
    })

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 })
  }

  const { data: publicUrlData } = supabase.storage
    .from('receipts')
    .getPublicUrl(filename)

  return NextResponse.json({
    success: true,
    publicUrl: publicUrlData.publicUrl,
  })
}
