import { NextResponse } from 'next/server'
import { verifyTripMember, isAuthError } from '@/lib/trip-auth'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ tripId: string }> }
) {
  const { tripId } = await params
  const auth = await verifyTripMember(tripId)
  if (isAuthError(auth)) return auth

  const { supabase } = auth

  const { data, error } = await supabase
    .from('itinerary_days')
    .select('*, itinerary_items(*)')
    .eq('trip_id', tripId)
    .order('day_index', { ascending: true })
    .order('position', { referencedTable: 'itinerary_items', ascending: true })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json({ days: data })
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ tripId: string }> }
) {
  const { tripId } = await params
  const body = await request.json().catch(() => null)

  if (!body?.day_date) {
    return NextResponse.json({ error: 'day_date là bắt buộc' }, { status: 400 })
  }

  const auth = await verifyTripMember(tripId)
  if (isAuthError(auth)) return auth

  const { supabase } = auth

  const { data: trip } = await supabase
    .from('trips')
    .select('start_date')
    .eq('id', tripId)
    .single()

  let dayIndex: number

  if (trip?.start_date) {
    const start = new Date(`${trip.start_date}T00:00:00Z`).getTime()
    const target = new Date(`${body.day_date}T00:00:00Z`).getTime()
    dayIndex = Math.round((target - start) / 86400000) + 1
  } else {
    const { count } = await supabase
      .from('itinerary_days')
      .select('id', { count: 'exact', head: true })
      .eq('trip_id', tripId)
    dayIndex = (count ?? 0) + 1
  }

  const { data, error } = await supabase
    .from('itinerary_days')
    .insert({
      trip_id: tripId,
      day_date: body.day_date,
      day_index: dayIndex,
      notes: body.notes ?? null,
    })
    .select()
    .single()

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json({ error: 'Ngày này đã có trong lịch trình' }, { status: 409 })
    }
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json({ day: data }, { status: 201 })
}
