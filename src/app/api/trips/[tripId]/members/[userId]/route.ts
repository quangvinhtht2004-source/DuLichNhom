import { NextResponse } from 'next/server'
import { verifyTripMember, isAuthError } from '@/lib/trip-auth'

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

  const auth = await verifyTripMember(tripId)
  if (isAuthError(auth)) return auth

  const { supabase, memberRole } = auth

  // Chỉ Owner mới có quyền thay đổi vai trò thành viên
  if (memberRole !== 'owner') {
    return NextResponse.json(
      { error: 'Chỉ Trưởng nhóm mới có quyền thay đổi vai trò thành viên' },
      { status: 403 }
    )
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

  const auth = await verifyTripMember(tripId)
  if (isAuthError(auth)) return auth

  const { supabase, memberRole } = auth

  // Chỉ Owner mới có quyền xóa thành viên khác
  if (memberRole !== 'owner') {
    return NextResponse.json(
      { error: 'Chỉ Trưởng nhóm mới có quyền xóa thành viên' },
      { status: 403 }
    )
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
