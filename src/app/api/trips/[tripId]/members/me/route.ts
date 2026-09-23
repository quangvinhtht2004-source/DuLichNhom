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
