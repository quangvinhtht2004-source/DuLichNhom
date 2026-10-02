import { NextResponse } from 'next/server'
import { verifyTripMember, isAuthError } from '@/lib/trip-auth'

function roundVnd(value: number) {
  return Math.round(value)
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ tripId: string }> }
) {
  const { tripId } = await params
  const { searchParams } = new URL(request.url)

  const paidBy = searchParams.get('paid_by')
  const category = searchParams.get('category')
  const from = searchParams.get('from')
  const to = searchParams.get('to')

  const auth = await verifyTripMember(tripId)
  if (isAuthError(auth)) return auth

  const { supabase } = auth

  let query = supabase
    .from('expenses')
    .select('*, expense_splits(*)')
    .eq('trip_id', tripId)
    .order('expense_date', { ascending: false })

  if (paidBy) query = query.eq('paid_by', paidBy)
  if (category) query = query.eq('category', category)
  if (from) query = query.gte('expense_date', from)
  if (to) query = query.lte('expense_date', to)

  const { data, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json({ expenses: data })
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ tripId: string }> }
) {
  const { tripId } = await params
  const body = await request.json().catch(() => null)

  const amount = Number(body?.amount)
  const description = body?.description?.trim()
  const splitMethod = body?.split_method ?? 'equal'

  if (!amount || amount <= 0) {
    return NextResponse.json({ error: 'amount phải lớn hơn 0' }, { status: 400 })
  }

  if (!description) {
    return NextResponse.json({ error: 'description là bắt buộc' }, { status: 400 })
  }

  if (!['equal', 'percentage', 'custom'].includes(splitMethod)) {
    return NextResponse.json({ error: 'split_method không hợp lệ' }, { status: 400 })
  }

  const auth = await verifyTripMember(tripId)
  if (isAuthError(auth)) return auth

  const { supabase, user } = auth

  const paidBy = body.paid_by ?? user.id

  const { data: members } = await supabase
    .from('trip_members')
    .select('user_id')
    .eq('trip_id', tripId)
    .eq('status', 'accepted')

  const memberIds = (members ?? []).map((m) => m.user_id)

  if (!memberIds.includes(paidBy)) {
    return NextResponse.json(
      { error: 'paid_by không phải thành viên của chuyến đi' },
      { status: 400 }
    )
  }

  let splits: { user_id: string; amount_owed: number; percentage: number | null }[] = []

  if (splitMethod === 'equal') {
    const participants: string[] =
      Array.isArray(body.participants) && body.participants.length > 0
        ? body.participants
        : memberIds

    const invalid = participants.find((id: string) => !memberIds.includes(id))
    if (invalid) {
      return NextResponse.json(
        { error: 'participants chứa user không thuộc chuyến đi' },
        { status: 400 }
      )
    }

    const base = roundVnd(amount / participants.length)
    splits = participants.map((id, index) => ({
      user_id: id,
      amount_owed:
        index === participants.length - 1
          ? roundVnd(amount - base * (participants.length - 1))
          : base,
      percentage: null,
    }))
  }

  if (splitMethod === 'percentage') {
    const input = Array.isArray(body.splits) ? body.splits : []

    if (input.length === 0) {
      return NextResponse.json({ error: 'splits là bắt buộc với percentage' }, { status: 400 })
    }

    const totalPercent = input.reduce(
      (sum: number, s: { percentage?: number }) => sum + Number(s.percentage || 0),
      0
    )
    if (Math.abs(totalPercent - 100) > 0.01) {
      return NextResponse.json({ error: 'Tổng percentage phải bằng 100' }, { status: 400 })
    }

    const invalid = input.find((s: { user_id: string }) => !memberIds.includes(s.user_id))
    if (invalid) {
      return NextResponse.json(
        { error: 'splits chứa user không thuộc chuyến đi' },
        { status: 400 }
      )
    }

    let runningTotal = 0
    splits = input.map((s: { user_id: string; percentage: number }, index: number) => {
      const owed =
        index === input.length - 1
          ? roundVnd(amount - runningTotal)
          : roundVnd((amount * Number(s.percentage)) / 100)
      runningTotal = roundVnd(runningTotal + owed)
      return { user_id: s.user_id, amount_owed: owed, percentage: Number(s.percentage) }
    })
  }

  if (splitMethod === 'custom') {
    const input = Array.isArray(body.splits) ? body.splits : []

    if (input.length === 0) {
      return NextResponse.json({ error: 'splits là bắt buộc với custom' }, { status: 400 })
    }

    const totalAmount = input.reduce(
      (sum: number, s: { amount_owed?: number }) => sum + Number(s.amount_owed || 0),
      0
    )
    if (Math.abs(roundVnd(totalAmount) - roundVnd(amount)) > 0.01) {
      return NextResponse.json({ error: 'Tổng amount_owed phải bằng amount' }, { status: 400 })
    }

    const invalid = input.find((s: { user_id: string }) => !memberIds.includes(s.user_id))
    if (invalid) {
      return NextResponse.json(
        { error: 'splits chứa user không thuộc chuyến đi' },
        { status: 400 }
      )
    }

    splits = input.map((s: { user_id: string; amount_owed: number }) => ({
      user_id: s.user_id,
      amount_owed: roundVnd(Number(s.amount_owed)),
      percentage: null,
    }))
  }

  const { data: expense, error: expenseError } = await supabase
    .from('expenses')
    .insert({
      trip_id: tripId,
      paid_by: paidBy,
      amount,
      description,
      category: body.category ?? null,
      expense_date: body.expense_date ?? undefined,
      split_method: splitMethod,
      receipt_image_url: body.receipt_image_url ?? null,
      created_by: user.id,
    })
    .select()
    .single()

  if (expenseError || !expense) {
    return NextResponse.json(
      { error: expenseError?.message ?? 'Không thể tạo khoản chi' },
      { status: 400 }
    )
  }

  const { error: splitsError } = await supabase.from('expense_splits').insert(
    splits.map((s) => ({
      expense_id: expense.id,
      user_id: s.user_id,
      amount_owed: s.amount_owed,
      percentage: s.percentage,
      is_settled: s.user_id === paidBy,
      settled_at: s.user_id === paidBy ? new Date().toISOString() : null,
    }))
  )

  if (splitsError) {
    await supabase.from('expenses').delete().eq('id', expense.id)
    return NextResponse.json({ error: splitsError.message }, { status: 400 })
  }

  return NextResponse.json({ expense, splits }, { status: 201 })
}
