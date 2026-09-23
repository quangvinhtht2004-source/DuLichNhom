import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Chưa đăng nhập' }, { status: 401 })
  }

  const admin = createAdminClient()

  const { data, error } = await admin
    .from('trip_members')
    .select(
      'id, trip_id, role, status, invited_by, created_at, trips(name, destination, start_date, end_date, cover_image_url), inviter:profiles!trip_members_invited_by_fkey(full_name, avatar_url)'
    )
    .eq('user_id', user.id)
    .eq('status', 'pending')
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json({ invitations: data })
}
