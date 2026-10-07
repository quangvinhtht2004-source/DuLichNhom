import { NextResponse } from 'next/server'
import { verifyTripMember, isAuthError } from '@/lib/trip-auth'

function roundVnd(value: number) {
  return Math.round(value)
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ tripId: string; expenseId: string }> }
) {
  const { tripId, expenseId } = await params
  const auth = await verifyTripMember(tripId)
  if (isAuthError(auth)) return auth

  const { supabase } = auth

  const { data: expense, error } = await supabase
    .from('expenses')
    .select('*, expense_splits(*)')
    .eq('id', expenseId)
    .eq('trip_id', tripId)
    .maybeSingle()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
  if (!expense) {
    return NextResponse.json({ error: 'Khoản chi không tồn tại' }, { status: 404 })
  }

  return NextResponse.json({ expense })
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ tripId: string; expenseId: string }> }
) {
  const { tripId, expenseId } = await params
  const auth = await verifyTripMember(tripId)
  if (isAuthError(auth)) return auth

  const { supabase, user, memberRole } = auth

  const { data: expense } = await supabase
    .from('expenses')
    .select('id, created_by, paid_by')
    .eq('id', expenseId)
    .eq('trip_id', tripId)
    .maybeSingle()

  if (!expense) {
    return NextResponse.json({ error: 'Khoản chi không tồn tại' }, { status: 404 })
  }

  // Chỉ người tạo, người chi trả, hoặc owner mới được xóa
  if (expense.created_by !== user.id && expense.paid_by !== user.id && memberRole !== 'owner') {
    return NextResponse.json(
      { error: 'Bạn không có quyền xóa khoản chi này' },
      { status: 403 }
    )
  }

  await supabase.from('expense_splits').delete().eq('expense_id', expenseId)
  const { error } = await supabase.from('expenses').delete().eq('id', expenseId)
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json({ success: true })
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ tripId: string; expenseId: string }> }
) {
  const { tripId, expenseId } = await params
  const auth = await verifyTripMember(tripId)
  if (isAuthError(auth)) return auth

  const { supabase, user, memberRole } = auth
  const body = await request.json().catch(() => null)

  const { data: existing } = await supabase
    .from('expenses')
    .select('*, expense_splits(*)')
    .eq('id', expenseId)
    .eq('trip_id', tripId)
    .maybeSingle()

  if (!existing) {
    return NextResponse.json({ error: 'Khoản chi không tồn tại' }, { status: 404 })
  }

  // Chỉ người tạo, người chi trả, hoặc owner mới được sửa
  if (existing.created_by !== user.id && existing.paid_by !== user.id && memberRole !== 'owner') {
    return NextResponse.json(
      { error: 'Bạn không có quyền chỉnh sửa khoản chi này' },
      { status: 403 }
    )
  }

  const amount = body?.amount !== undefined ? Number(body.amount) : Number(existing.amount)
  if (amount <= 0 || isNaN(amount)) {
    return NextResponse.json({ error: 'Số tiền chi tiêu phải lớn hơn 0' }, { status: 400 })
  }
  const description = body?.description !== undefined ? body.description.trim() : existing.description
  const paidBy = body?.paid_by !== undefined ? body.paid_by : existing.paid_by
  const splitMethod = body?.split_method !== undefined ? body.split_method : existing.split_method
  const category = body?.category !== undefined ? body.category : existing.category
  const expenseDate = body?.expense_date !== undefined ? body.expense_date : existing.expense_date
  const receiptImageUrl = body?.receipt_image_url !== undefined ? body.receipt_image_url : existing.receipt_image_url

  const { data: updatedExpense, error: expError } = await supabase
    .from('expenses')
    .update({
      amount,
      description,
      paid_by: paidBy,
      split_method: splitMethod,
      category,
      expense_date: expenseDate,
      receipt_image_url: receiptImageUrl,
      updated_at: new Date().toISOString(),
    })
    .eq('id', expenseId)
    .select()
    .single()

  if (expError) {
    return NextResponse.json({ error: expError.message }, { status: 400 })
  }

  if (body?.splits || body?.participants || body?.amount || body?.split_method || body?.paid_by) {
    const { data: members } = await supabase
      .from('trip_members')
      .select('user_id')
      .eq('trip_id', tripId)
      .eq('status', 'accepted')

    const memberIds = (members ?? []).map((m) => m.user_id)
    let splits: { user_id: string; amount_owed: number; percentage: number | null }[] = []

    if (splitMethod === 'equal') {
      const participants: string[] =
        Array.isArray(body?.participants) && body.participants.length > 0
          ? body.participants
          : memberIds
      const base = roundVnd(amount / participants.length)
      splits = participants.map((id, index) => ({
        user_id: id,
        amount_owed:
          index === participants.length - 1
            ? roundVnd(amount - base * (participants.length - 1))
            : base,
        percentage: null,
      }))
    } else if (splitMethod === 'percentage') {
      const input = Array.isArray(body?.splits) ? body.splits : []
      let runningTotal = 0
      splits = input.map((s: { user_id: string; percentage: number }, index: number) => {
        const owed =
          index === input.length - 1
            ? roundVnd(amount - runningTotal)
            : roundVnd((amount * Number(s.percentage)) / 100)
        runningTotal = roundVnd(runningTotal + owed)
        return { user_id: s.user_id, amount_owed: owed, percentage: Number(s.percentage) }
      })
    } else if (splitMethod === 'custom') {
      const input = Array.isArray(body?.splits) ? body.splits : []
      splits = input.map((s: { user_id: string; amount_owed: number }) => ({
        user_id: s.user_id,
        amount_owed: roundVnd(Number(s.amount_owed)),
        percentage: null,
      }))
    }

    if (splits.length > 0) {
      await supabase.from('expense_splits').delete().eq('expense_id', expenseId)
      await supabase.from('expense_splits').insert(
        splits.map((s) => ({
          expense_id: expenseId,
          user_id: s.user_id,
          amount_owed: s.amount_owed,
          percentage: s.percentage,
          is_settled: s.user_id === paidBy,
          settled_at: s.user_id === paidBy ? new Date().toISOString() : null,
        }))
      )
    }
  }

  return NextResponse.json({ expense: updatedExpense })
}
