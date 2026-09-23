import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Chưa đăng nhập' }, { status: 401 })
  }

  const { data: trips, error } = await supabase
    .from('trips')
    .select(
      `id, name, destination, start_date, end_date, cover_image_url, created_by, created_at, updated_at,
       trip_members (id, user_id, role, status)`
    )
    .order('start_date', { ascending: true })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  const today = new Date().toISOString().slice(0, 10)
  const list = trips ?? []

  const upcoming = list.filter((t) => !t.end_date || t.end_date >= today)
  const past = list.filter((t) => t.end_date && t.end_date < today)

  return NextResponse.json({ trips: list, upcoming, past })
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null)

  if (!body?.name?.trim()) {
    return NextResponse.json({ error: 'Tên chuyến đi không được để trống' }, { status: 400 })
  }

  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Chưa đăng nhập' }, { status: 401 })
  }

  const { data: trip, error } = await supabase
    .from('trips')
    .insert({
      name: body.name.trim(),
      destination: body.destination?.trim() || null,
      start_date: body.start_date || null,
      end_date: body.end_date || null,
      cover_image_url: body.cover_image_url || null,
      created_by: user.id,
    })
    .select()
    .single()

  if (error || !trip) {
    return NextResponse.json({ error: error?.message || 'Không thể tạo chuyến đi' }, { status: 400 })
  }

  // Thêm người tạo vào bảng trip_members với quyền 'owner'
  const { error: memberError } = await supabase
    .from('trip_members')
    .insert({
      trip_id: trip.id,
      user_id: user.id,
      role: 'owner',
      status: 'accepted',
      joined_at: new Date().toISOString(),
    })

  if (memberError) {
    console.error('Error adding creator to trip_members:', memberError)
  }

  return NextResponse.json({ trip }, { status: 201 })
}
