import { NextResponse } from 'next/server'
import { verifyTripMember, isAuthError } from '@/lib/trip-auth'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ tripId: string; dayId: string }> }
) {
  const { tripId, dayId } = await params
  const body = await request.json().catch(() => null)

  if (!Array.isArray(body?.order) || body.order.length === 0) {
    return NextResponse.json({ error: 'order phải là mảng itemId' }, { status: 400 })
  }

  const auth = await verifyTripMember(tripId)
  if (isAuthError(auth)) return auth

  const { supabase } = auth

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

  const results = await Promise.all(
    body.order.map((itemId: string, index: number) =>
      supabase
        .from('itinerary_items')
        .update({ position: index, updated_at: new Date().toISOString() })
        .eq('id', itemId)
        .eq('day_id', dayId)
    )
  )

  const failed = results.find((r) => r.error)

  if (failed?.error) {
    return NextResponse.json({ error: failed.error.message }, { status: 400 })
  }

  return NextResponse.json({ success: true })
}
