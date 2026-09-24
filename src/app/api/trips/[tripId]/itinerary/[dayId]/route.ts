import { NextResponse } from 'next/server'
import { verifyTripMember, isAuthError } from '@/lib/trip-auth'
import type { TablesUpdate } from '@/types/database'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ tripId: string; dayId: string }> }
) {
  const { tripId, dayId } = await params
  const auth = await verifyTripMember(tripId)
  if (isAuthError(auth)) return auth

  const { supabase } = auth

  const { data, error } = await supabase
    .from('itinerary_days')
    .select('*, itinerary_items(*)')
    .eq('id', dayId)
    .eq('trip_id', tripId)
    .order('position', { referencedTable: 'itinerary_items', ascending: true })
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 404 })
  }

  return NextResponse.json({ day: data })
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ tripId: string; dayId: string }> }
) {
  const { tripId, dayId } = await params
  const body = await request.json().catch(() => ({}))

  const updates: TablesUpdate<'itinerary_days'> = {
    updated_at: new Date().toISOString(),
  }
  let hasChanges = false

  if (body.day_date !== undefined) { updates.day_date = body.day_date; hasChanges = true }
  if (body.notes !== undefined) { updates.notes = body.notes; hasChanges = true }

  if (!hasChanges) {
    return NextResponse.json({ error: 'Không có dữ liệu để cập nhật' }, { status: 400 })
  }

  const auth = await verifyTripMember(tripId)
  if (isAuthError(auth)) return auth

  const { supabase } = auth

  const { data, error } = await supabase
    .from('itinerary_days')
    .update(updates)
    .eq('id', dayId)
    .eq('trip_id', tripId)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json({ day: data })
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ tripId: string; dayId: string }> }
) {
  const { tripId, dayId } = await params
  const auth = await verifyTripMember(tripId)
  if (isAuthError(auth)) return auth

  const { supabase } = auth

  const { error } = await supabase
    .from('itinerary_days')
    .delete()
    .eq('id', dayId)
    .eq('trip_id', tripId)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json({ success: true })
}
