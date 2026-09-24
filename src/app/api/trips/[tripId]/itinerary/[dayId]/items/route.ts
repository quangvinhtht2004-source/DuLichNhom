import { NextResponse } from 'next/server'
import { verifyTripMember, isAuthError } from '@/lib/trip-auth'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ tripId: string; dayId: string }> }
) {
  const { tripId, dayId } = await params
  const auth = await verifyTripMember(tripId)
  if (isAuthError(auth)) return auth

  const { supabase } = auth

  const { data, error } = await supabase
    .from('itinerary_items')
    .select('*')
    .eq('day_id', dayId)
    .order('position', { ascending: true })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json({ items: data })
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ tripId: string; dayId: string }> }
) {
  const { tripId, dayId } = await params
  const body = await request.json().catch(() => null)

  if (!body?.title?.trim()) {
    return NextResponse.json({ error: 'title là bắt buộc' }, { status: 400 })
  }

  const auth = await verifyTripMember(tripId)
  if (isAuthError(auth)) return auth

  const { user, supabase } = auth

  // Kiểm tra dayId thuộc đúng tripId
  const { data: day } = await supabase
    .from('itinerary_days')
    .select('id')
    .eq('id', dayId)
    .eq('trip_id', tripId)
    .maybeSingle()

  if (!day) {
    return NextResponse.json(
      { error: 'Ngày không tồn tại hoặc không thuộc chuyến đi này' },
      { status: 404 }
    )
  }

  // Lấy max position thay vì count để tránh trùng khi có item bị xóa
  const { data: lastItem } = await supabase
    .from('itinerary_items')
    .select('position')
    .eq('day_id', dayId)
    .order('position', { ascending: false })
    .limit(1)
    .maybeSingle()

  const nextPosition = lastItem ? lastItem.position + 1 : 0

  const { data, error } = await supabase
    .from('itinerary_items')
    .insert({
      day_id: dayId,
      title: body.title.trim(),
      start_time: body.start_time?.trim() || null,
      end_time: body.end_time?.trim() || null,
      location_name: body.location_name ?? null,
      latitude: body.latitude ?? null,
      longitude: body.longitude ?? null,
      note: body.note ?? null,
      image_url: body.image_url ?? null,
      position: nextPosition,
      created_by: user.id,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json({ item: data }, { status: 201 })
}
