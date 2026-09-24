import { NextResponse } from 'next/server'
import { verifyTripMember, isAuthError } from '@/lib/trip-auth'

const MAX_FILE_SIZE = 5 * 1024 * 1024
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']

export async function POST(
  request: Request,
  { params }: { params: Promise<{ tripId: string; dayId: string; itemId: string }> }
) {
  const { tripId, dayId, itemId } = await params
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

  // Kiểm tra item thuộc đúng dayId
  const { data: item } = await supabase
    .from('itinerary_items')
    .select('id, image_url')
    .eq('id', itemId)
    .eq('day_id', dayId)
    .maybeSingle()

  if (!item) {
    return NextResponse.json(
      { error: 'Hoạt động không tồn tại hoặc không thuộc ngày này' },
      { status: 404 }
    )
  }

  // Xóa ảnh cũ trên Storage nếu có
  if (item.image_url) {
    try {
      const url = new URL(item.image_url)
      const storagePath = url.pathname.split('/object/public/itinerary-images/')[1]
      if (storagePath) {
        await supabase.storage.from('itinerary-images').remove([decodeURIComponent(storagePath)])
      }
    } catch {
      // Bỏ qua lỗi xóa ảnh cũ, không ảnh hưởng đến upload mới
    }
  }

  const extension = file.name.split('.').pop()
  const path = `${tripId}/${itemId}-${Date.now()}.${extension}`

  const { error: uploadError } = await supabase.storage
    .from('itinerary-images')
    .upload(path, file, { contentType: file.type, upsert: true })

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 400 })
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from('itinerary-images').getPublicUrl(path)

  const { data, error } = await supabase
    .from('itinerary_items')
    .update({ image_url: publicUrl, updated_at: new Date().toISOString() })
    .eq('id', itemId)
    .eq('day_id', dayId)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json({ item: data })
}
