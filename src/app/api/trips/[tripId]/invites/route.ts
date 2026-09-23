import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { randomBytes } from 'crypto'

export async function GET(
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

  const { data, error } = await supabase
    .from('trip_invites')
    .select('*')
    .eq('trip_id', tripId)
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json({ invites: data })
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ tripId: string }> }
) {
  const { tripId } = await params
  const body = await request.json().catch(() => ({}))

  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Chưa đăng nhập' }, { status: 401 })
  }

  // Kiểm tra quyền: Người tạo mã mời phải là thành viên hợp lệ của chuyến đi
  const { data: membership } = await supabase
    .from('trip_members')
    .select('role, status')
    .eq('trip_id', tripId)
    .eq('user_id', user.id)
    .maybeSingle()

  if (!membership || membership.status !== 'accepted') {
    return NextResponse.json(
      { error: 'Bạn không có quyền tạo mã mời cho chuyến đi này' },
      { status: 403 }
    )
  }

  const code = randomBytes(4).toString('hex')

  const { data, error } = await supabase
    .from('trip_invites')
    .insert({
      trip_id: tripId,
      code,
      created_by: user.id,
      expires_at: body.expires_at ?? null,
      max_uses: body.max_uses ?? null,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json({ invite: data })
}
