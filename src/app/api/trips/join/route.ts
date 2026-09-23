import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}))
  const { code } = body

  if (!code || typeof code !== 'string') {
    return NextResponse.json({ error: 'Mã mời (code) là bắt buộc' }, { status: 400 })
  }

  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Chưa đăng nhập' }, { status: 401 })
  }

  const admin = createAdminClient()

  const { data: invite, error: inviteError } = await admin
    .from('trip_invites')
    .select('*')
    .eq('code', code.trim())
    .single()

  if (inviteError || !invite) {
    return NextResponse.json({ error: 'Mã mời không hợp lệ' }, { status: 404 })
  }

  if (invite.expires_at && new Date(invite.expires_at) < new Date()) {
    return NextResponse.json({ error: 'Mã mời đã hết hạn' }, { status: 400 })
  }

  if (invite.max_uses !== null && invite.uses_count >= invite.max_uses) {
    return NextResponse.json({ error: 'Mã mời đã hết lượt sử dụng' }, { status: 400 })
  }

  // Kiểm tra xem người dùng đã là thành viên trong chuyến đi chưa
  const { data: existingMember } = await admin
    .from('trip_members')
    .select('*')
    .eq('trip_id', invite.trip_id)
    .eq('user_id', user.id)
    .maybeSingle()

  if (existingMember) {
    if (existingMember.status === 'accepted') {
      return NextResponse.json({
        message: 'Bạn đã là thành viên của chuyến đi này',
        member: existingMember,
      })
    }

    // Nếu đang ở trạng thái pending/declined, cập nhật lên accepted nhưng GIỮ NGUYÊN role (tránh bị đè vai trò)
    const { data: updatedMember, error: updateError } = await admin
      .from('trip_members')
      .update({
        status: 'accepted',
        joined_at: new Date().toISOString(),
      })
      .eq('id', existingMember.id)
      .select()
      .single()

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 400 })
    }

    await admin
      .from('trip_invites')
      .update({ uses_count: invite.uses_count + 1 })
      .eq('id', invite.id)

    return NextResponse.json({ member: updatedMember })
  }

  // Nếu người dùng chưa từng tham gia, tạo mới với vai trò 'member'
  const { data: newMember, error: memberError } = await admin
    .from('trip_members')
    .insert({
      trip_id: invite.trip_id,
      user_id: user.id,
      role: 'member',
      status: 'accepted',
      invited_by: invite.created_by,
      joined_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (memberError) {
    return NextResponse.json({ error: memberError.message }, { status: 400 })
  }

  await admin
    .from('trip_invites')
    .update({ uses_count: invite.uses_count + 1 })
    .eq('id', invite.id)

  return NextResponse.json({ member: newMember })
}
