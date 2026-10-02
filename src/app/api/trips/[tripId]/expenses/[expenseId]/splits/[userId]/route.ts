import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ tripId: string; expenseId: string; userId: string }> }
) {
  const { expenseId, userId } = await params
  const body = await request.json().catch(() => ({}))

  const isSettled = body.is_settled !== false

  const supabase = await createClient()

  const { data, error } = await supabase
    .from('expense_splits')
    .update({
      is_settled: isSettled,
      settled_at: isSettled ? new Date().toISOString() : null,
    })
    .eq('expense_id', expenseId)
    .eq('user_id', userId)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json({ split: data })
}
