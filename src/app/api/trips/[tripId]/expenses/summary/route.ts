import { NextResponse } from 'next/server'
import { verifyTripMember, isAuthError } from '@/lib/trip-auth'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ tripId: string }> }
) {
  const { tripId } = await params

  const auth = await verifyTripMember(tripId)
  if (isAuthError(auth)) return auth

  const { supabase } = auth

  const { data: expenses, error } = await supabase
    .from('expenses')
    .select('id, amount, category, paid_by, expense_splits(user_id, amount_owed, is_settled)')
    .eq('trip_id', tripId)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  const list = expenses ?? []

  const total = list.reduce((sum, e) => sum + Number(e.amount), 0)

  const byCategory = new Map<string, number>()
  for (const e of list) {
    const key = e.category ?? 'Khác'
    byCategory.set(key, (byCategory.get(key) ?? 0) + Number(e.amount))
  }

  const debtMap = new Map<string, number>()
  for (const e of list) {
    const splits = Array.isArray(e.expense_splits) ? e.expense_splits : []
    for (const split of splits) {
      if (split.is_settled || split.user_id === e.paid_by) continue
      const key = `${split.user_id}->${e.paid_by}`
      debtMap.set(key, (debtMap.get(key) ?? 0) + Number(split.amount_owed))
    }
  }

  const debts = Array.from(debtMap.entries()).map(([key, amount]) => {
    const [from_user, to_user] = key.split('->')
    return { from_user, to_user, amount: Math.round(amount) }
  })

  return NextResponse.json({
    total,
    by_category: Object.fromEntries(byCategory),
    debts,
  })
}
