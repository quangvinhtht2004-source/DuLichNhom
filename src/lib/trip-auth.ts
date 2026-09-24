import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

type TypedSupabaseClient = SupabaseClient<Database>

interface AuthResult {
  user: { id: string }
  supabase: TypedSupabaseClient
  memberRole: 'owner' | 'member'
}

/**
 * Xác thực người dùng đã đăng nhập VÀ là thành viên hợp lệ (accepted) của chuyến đi.
 * Trả về user, supabase client và role nếu hợp lệ; trả về NextResponse lỗi nếu không.
 */
export async function verifyTripMember(
  tripId: string
): Promise<AuthResult | NextResponse> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Chưa đăng nhập' }, { status: 401 })
  }

  const { data: member } = await supabase
    .from('trip_members')
    .select('role')
    .eq('trip_id', tripId)
    .eq('user_id', user.id)
    .eq('status', 'accepted')
    .maybeSingle()

  if (!member) {
    return NextResponse.json(
      { error: 'Bạn không có quyền truy cập chuyến đi này' },
      { status: 403 }
    )
  }

  return {
    user,
    supabase,
    memberRole: member.role,
  }
}

/**
 * Type guard kiểm tra kết quả verifyTripMember có phải là lỗi (NextResponse) hay không.
 */
export function isAuthError(
  result: AuthResult | NextResponse
): result is NextResponse {
  return result instanceof NextResponse
}
