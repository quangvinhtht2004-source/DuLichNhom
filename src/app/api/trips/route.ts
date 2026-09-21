import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET /api/trips - Lấy danh sách các chuyến đi
export async function GET(request: Request) {
  try {
    const supabase = await createClient();

    // 1. Kiểm tra session người dùng
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, message: 'Chưa đăng nhập' },
        { status: 401 }
      );
    }

    // 2. Lấy danh sách chuyến đi mà user này tham gia hoặc làm chủ
    const { data: trips, error: dbError } = await supabase
      .from('trips')
      .select(`
        *,
        trip_members!inner(user_id, role)
      `)
      .eq('trip_members.user_id', user.id)
      .order('created_at', { ascending: false });

    if (dbError) {
      return NextResponse.json(
        { success: false, message: dbError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: trips,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Lỗi hệ thống' },
      { status: 500 }
    );
  }
}

// POST /api/trips - Tạo chuyến đi mới
export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, message: 'Chưa đăng nhập' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { title, destination, start_date, end_date, cover_image } = body;

    if (!title || !destination || !start_date || !end_date) {
      return NextResponse.json(
        { success: false, message: 'Vui lòng điền đầy đủ thông tin bắt buộc' },
        { status: 400 }
      );
    }

    // Tạo mã mời ngẫu nhiên 6 ký tự
    const invite_code = Math.random().toString(36).substring(2, 8).toUpperCase();

    // 1. Tạo trip
    const { data: trip, error: tripError } = await supabase
      .from('trips')
      .insert({
        title,
        destination,
        start_date,
        end_date,
        cover_image,
        invite_code,
        created_by: user.id,
      })
      .select()
      .single();

    if (tripError) {
      return NextResponse.json(
        { success: false, message: tripError.message },
        { status: 500 }
      );
    }

    // 2. Thêm người tạo làm LEADER trong trip_members
    const { error: memberError } = await supabase.from('trip_members').insert({
      trip_id: trip.id,
      user_id: user.id,
      role: 'LEADER',
    });

    if (memberError) {
      return NextResponse.json(
        { success: false, message: memberError.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Tạo chuyến đi thành công',
        data: trip,
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Lỗi hệ thống' },
      { status: 500 }
    );
  }
}
