import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { TablesUpdate } from '@/types/database'

interface RouteContext {
  params: Promise<{ id: string }>
}

// GET: Lấy thông tin chi tiết một chuyến đi từ Supabase Database
export async function GET(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params
    if (!id) {
      return NextResponse.json({ error: 'Thiếu ID chuyến đi' }, { status: 400 })
    }

    const supabase = await createClient()

    const { data: trip, error } = await supabase
      .from('trips')
      .select(`
        id,
        name,
        destination,
        start_date,
        end_date,
        cover_image_url,
        created_by,
        created_at,
        updated_at,
        trip_members (
          id,
          user_id,
          role,
          status
        )
      `)
      .eq('id', id)
      .maybeSingle()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    if (!trip) {
      return NextResponse.json({ error: 'Không tìm thấy chuyến đi' }, { status: 404 })
    }

    return NextResponse.json({ trip })
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Lỗi xử lý máy chủ' },
      { status: 500 }
    )
  }
}

// PATCH: Cập nhật thông tin chuyến đi trong bảng 'trips'
export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params
    if (!id) {
      return NextResponse.json({ error: 'Thiếu ID chuyến đi' }, { status: 400 })
    }

    let body: any
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: 'Dữ liệu JSON không hợp lệ' }, { status: 400 })
    }

    const {
      name,
      destination,
      start_date,
      end_date,
      cover_image_url,
      description,
      is_private,
    } = body || {}

    const supabase = await createClient()

    const updates: TablesUpdate<'trips'> = {
      updated_at: new Date().toISOString(),
    }

    if (name !== undefined) updates.name = name.trim()
    if (destination !== undefined) updates.destination = destination.trim()
    if (start_date !== undefined) updates.start_date = start_date
    if (end_date !== undefined) updates.end_date = end_date
    if (cover_image_url !== undefined) updates.cover_image_url = cover_image_url

    const { data: updatedTrip, error } = await supabase
      .from('trips')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      message: 'Cập nhật chuyến đi thành công!',
      trip: updatedTrip,
    })
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Lỗi xử lý máy chủ' },
      { status: 500 }
    )
  }
}

// DELETE: Xóa vĩnh viễn chuyến đi khỏi Supabase Database (VÙNG NGUY HIỂM)
export async function DELETE(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params
    if (!id) {
      return NextResponse.json({ error: 'Thiếu ID chuyến đi' }, { status: 400 })
    }

    const supabase = await createClient()

    // 1. Xóa toàn bộ thành viên trong trip_members liên kết với chuyến đi này
    await supabase.from('trip_members').delete().eq('trip_id', id)

    // 2. Xóa chuyến đi khỏi bảng trips
    const { error: deleteTripError } = await supabase
      .from('trips')
      .delete()
      .eq('id', id)

    if (deleteTripError) {
      return NextResponse.json({ error: deleteTripError.message }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      message: 'Đã xóa vĩnh viễn chuyến đi khỏi hệ thống thành công!',
    })
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Lỗi xóa chuyến đi' },
      { status: 500 }
    )
  }
}
