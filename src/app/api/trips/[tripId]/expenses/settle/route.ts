import { NextResponse } from 'next/server'
import { verifyTripMember, isAuthError } from '@/lib/trip-auth'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ tripId: string }> }
) {
  const { tripId } = await params
  const body = await request.json().catch(() => null)

  const fromUser = body?.from_user
  const toUser = body?.to_user
  const isSettled = body?.is_settled !== false

  if (!fromUser || !toUser) {
    return NextResponse.json(
      { error: 'from_user và to_user là bắt buộc' },
      { status: 400 }
    )
  }

  const auth = await verifyTripMember(tripId)
  if (isAuthError(auth)) return auth

  const { supabase } = auth

  // Lấy tất cả các khoản chi của chuyến đi do toUser chi trả
  const { data: expenses, error: expError } = await supabase
    .from('expenses')
    .select('id')
    .eq('trip_id', tripId)
    .eq('paid_by', toUser)

  if (expError) {
    return NextResponse.json({ error: expError.message }, { status: 400 })
  }

  if (!expenses || expenses.length === 0) {
    return NextResponse.json({ success: true, count: 0 })
  }

  const expenseIds = expenses.map((e) => e.id)

  // Cập nhật trạng thái của các khoản nợ của fromUser
  const { data: updated, error: splitError } = await supabase
    .from('expense_splits')
    .update({
      is_settled: isSettled,
      settled_at: isSettled ? new Date().toISOString() : null,
    })
    .in('expense_id', expenseIds)
    .eq('user_id', fromUser)
    .select('id')

  if (splitError) {
    return NextResponse.json({ error: splitError.message }, { status: 400 })
  }

  return NextResponse.json({
    success: true,
    count: updated?.length || 0,
    is_settled: isSettled,
  })
}
