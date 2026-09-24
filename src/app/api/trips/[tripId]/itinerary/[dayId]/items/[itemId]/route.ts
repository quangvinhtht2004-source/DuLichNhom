import { NextResponse } from 'next/server'
import { verifyTripMember, isAuthError } from '@/lib/trip-auth'
import type { TablesUpdate } from '@/types/database'

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ tripId: string; dayId: string; itemId: string }> }
) {
  const { tripId, dayId, itemId } = await params
  const body = await request.json().catch(() => ({}))

  const auth = await verifyTripMember(tripId)
  if (isAuthError(auth)) return auth

  const { supabase } = auth

  const updates: TablesUpdate<'itinerary_items'> = {
    updated_at: new Date().toISOString(),
  }
  let hasChanges = false

  if (body.title !== undefined) { updates.title = body.title; hasChanges = true }
  if (body.location_name !== undefined) { updates.location_name = body.location_name; hasChanges = true }
  if (body.latitude !== undefined) { updates.latitude = body.latitude; hasChanges = true }
  if (body.longitude !== undefined) { updates.longitude = body.longitude; hasChanges = true }
  if (body.note !== undefined) { updates.note = body.note; hasChanges = true }
  if (body.image_url !== undefined) { updates.image_url = body.image_url; hasChanges = true }
  if (body.position !== undefined) { updates.position = body.position; hasChanges = true }

  // Chuẩn hóa start_time / end_time: chuỗi rỗng -> null
  if (body.start_time !== undefined) {
    updates.start_time = body.start_time?.trim() || null
    hasChanges = true
  }
  if (body.end_time !== undefined) {
    updates.end_time = body.end_time?.trim() || null
    hasChanges = true
  }

  // Xử lý di chuyển item sang ngày khác
  if (body.day_id !== undefined) {
    const { data: targetDay, error: dayError } = await supabase
      .from('itinerary_days')
      .select('id, trip_id')
      .eq('id', body.day_id)
      .eq('trip_id', tripId)
      .single()

    if (dayError || !targetDay) {
      return NextResponse.json(
        { error: 'Ngày đích không thuộc chuyến đi này' },
        { status: 400 }
      )
    }

    updates.day_id = body.day_id
    hasChanges = true

    // Tự động xếp vào cuối ngày mới nếu không chỉ định position
    if (body.position === undefined) {
      const { data: lastItem } = await supabase
        .from('itinerary_items')
        .select('position')
        .eq('day_id', body.day_id)
        .order('position', { ascending: false })
        .limit(1)
        .maybeSingle()

      updates.position = lastItem ? lastItem.position + 1 : 0
    }
  }

  if (!hasChanges) {
    return NextResponse.json({ error: 'Không có dữ liệu để cập nhật' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('itinerary_items')
    .update(updates)
    .eq('id', itemId)
    .eq('day_id', dayId)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json({ item: data })
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ tripId: string; dayId: string; itemId: string }> }
) {
  const { tripId, dayId, itemId } = await params
  const auth = await verifyTripMember(tripId)
  if (isAuthError(auth)) return auth

  const { supabase } = auth

  const { error } = await supabase
    .from('itinerary_items')
    .delete()
    .eq('id', itemId)
    .eq('day_id', dayId)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json({ success: true })
}
