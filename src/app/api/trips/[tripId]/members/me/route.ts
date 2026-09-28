import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ tripId: string }> }
) {
  const { tripId } = await params
  const body = await request.json().catch(() => ({}))
  const { action } = body

  if (action !== 'accept' && action !== 'decline') {
    return NextResponse.json({ error: 'action phải là accept hoặc decline' }, { status: 400 })
  }

  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Chưa đăng nhập' }, { status: 401 })
  }

  const updates =
    action === 'accept'
      ? { status: 'accepted' as const, joined_at: new Date().toISOString() }
      : { status: 'declined' as const }

  const { data, error } = await supabase
    .from('trip_members')
    .update(updates)
    .eq('trip_id', tripId)
    .eq('user_id', user.id)
    .eq('status', 'pending')
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json({ member: data })
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ tripId: string }> }
) {
  const { tripId } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Chưa đăng nhập' }, { status: 401 })
  }

  // Kiểm tra thành viên hiện tại
  const { data: member, error: memberError } = await supabase
    .from('trip_members')
    .select('id, role')
    .eq('trip_id', tripId)
    .eq('user_id', user.id)
    .maybeSingle()

  if (memberError || !member) {
    return NextResponse.json({ error: 'Bạn không phải thành viên của chuyến đi này' }, { status: 404 })
  }

  // Bảo vệ: Nếu là Owner duy nhất còn lại
  if (member.role === 'owner') {
    const { data: owners } = await supabase
      .from('trip_members')
      .select('id, user_id')
      .eq('trip_id', tripId)
      .eq('role', 'owner')

    if ((owners?.length || 0) <= 1) {
      return NextResponse.json(
        {
          error:
            'Bạn là Trưởng nhóm duy nhất. Vui lòng chỉ định một Trưởng nhóm mới trước khi rời đi, hoặc chọn Xóa chuyến đi.',
        },
        { status: 400 }
      )
    }
  }

  // Xóa bản ghi thành viên
  const { error: deleteError } = await supabase
    .from('trip_members')
    .delete()
    .eq('trip_id', tripId)
    .eq('user_id', user.id)

  if (deleteError) {
    return NextResponse.json({ error: deleteError.message }, { status: 400 })
  }

  return NextResponse.json({
    success: true,
    message: 'Bạn đã rời khỏi chuyến đi thành công!',
  })
}
