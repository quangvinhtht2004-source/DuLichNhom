import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ tripId: string; checklistId: string; itemId: string }> }
) {
  const { itemId } = await params
  const body = await request.json()

  const updates: {
    title?: string
    assigned_to?: string | null
    position?: number
    is_completed?: boolean
    completed_at?: string | null
  } = {}

  if (body.title !== undefined) updates.title = body.title
  if (body.assigned_to !== undefined) updates.assigned_to = body.assigned_to
  if (body.position !== undefined) updates.position = body.position

  if (body.is_completed !== undefined) {
    updates.is_completed = body.is_completed
    updates.completed_at = body.is_completed ? new Date().toISOString() : null
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'Không có dữ liệu để cập nhật' }, { status: 400 })
  }

  const supabase = await createClient()

  const { data, error } = await supabase
    .from('checklist_items')
    .update(updates)
    .eq('id', itemId)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json({ item: data })
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ tripId: string; checklistId: string; itemId: string }> }
) {
  const { itemId } = await params
  const supabase = await createClient()

  const { error } = await supabase.from('checklist_items').delete().eq('id', itemId)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json({ success: true })
}
