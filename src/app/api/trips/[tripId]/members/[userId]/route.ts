import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ tripId: string; userId: string }> }
) {
  const { tripId, userId } = await params
  const body = await request.json().catch(() => ({}))
  const { role } = body

  if (role !== 'owner' && role !== 'member') {
    return NextResponse.json({ error: 'role không hợp lệ (phải là owner hoặc member)' }, { status: 400 })
  }

  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Chưa đăng nhập' }, { status: 401 })
  }

  // Bảo vệ chuyến đi: Không cho phép hạ quyền Owner duy nhất còn lại
  if (role === 'member') {
    const { data: owners } = await supabase
      .from('trip_members')
      .select('id, user_id')
      .eq('trip_id', tripId)
      .eq('role', 'owner')

    const isTargetOwner = owners?.some((o) => o.user_id === userId)
    if (isTargetOwner && (owners?.length || 0) <= 1) {
      return NextResponse.json(
        { error: 'Không thể hạ quyền Owner duy nhất còn lại của chuyến đi' },
        { status: 400 }
      )
    }
  }

  const { data, error } = await supabase
    .from('trip_members')
    .update({ role })
    .eq('trip_id', tripId)
    .eq('user_id', userId)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json({ member: data })
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ tripId: string; userId: string }> }
) {
  const { tripId, userId } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Chưa đăng nhập' }, { status: 401 })
  }

  // Bảo vệ chuyến đi: Không cho phép xóa Owner duy nhất còn lại
  const { data: owners } = await supabase
    .from('trip_members')
    .select('id, user_id')
    .eq('trip_id', tripId)
    .eq('role', 'owner')

  const isTargetOwner = owners?.some((o) => o.user_id === userId)
  if (isTargetOwner && (owners?.length || 0) <= 1) {
    return NextResponse.json(
      { error: 'Không thể xóa Owner duy nhất còn lại của chuyến đi' },
      { status: 400 }
    )
  }

  const { error } = await supabase
    .from('trip_members')
    .delete()
    .eq('trip_id', tripId)
    .eq('user_id', userId)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json({ success: true })
}
