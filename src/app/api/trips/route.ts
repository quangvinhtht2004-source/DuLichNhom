import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET: Lấy danh sách chuyến đi thật từ bảng 'trips' trong Supabase
export async function GET() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    // Query trips from Supabase database
    const { data: trips, error } = await supabase
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
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching trips from Supabase:', error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    // Nếu trong bảng chưa có chuyến đi nào, tự động gieo sẵn 2 chuyến đi thực tế vào database
    if (!trips || trips.length === 0) {
      let creatorId = user?.id
      if (!creatorId) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('id')
          .limit(1)
          .maybeSingle()
        creatorId = profile?.id
      }

      if (creatorId) {
        const seedTrips = [
          {
            name: 'Oanh tạc Đà Lạt 3N2Đ cùng Hội bạn thân 🌲',
            destination: 'Đà Lạt, Lâm Đồng',
            start_date: '15/10/2026',
            end_date: '18/10/2026',
            cover_image_url:
              'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=800&auto=format&fit=crop',
            created_by: creatorId,
          },
          {
            name: 'Vitamin Sea Phú Quốc Resort & Sunset Chill 🏖️',
            destination: 'Phú Quốc, Kiên Giang',
            start_date: '02/11/2026',
            end_date: '05/11/2026',
            cover_image_url:
              'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=800&auto=format&fit=crop',
            created_by: creatorId,
          },
        ]

        const { data: seeded, error: seedError } = await supabase
          .from('trips')
          .insert(seedTrips)
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

        if (!seedError && seeded) {
          for (const t of seeded) {
            await supabase.from('trip_members').insert({
              trip_id: t.id,
              user_id: creatorId,
              role: 'owner',
              status: 'accepted',
            })
          }
          return NextResponse.json({ trips: seeded, seeded: true })
        }
      }
    }

    return NextResponse.json({ trips: trips || [] })
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Lỗi truy vấn dữ liệu chuyến đi' },
      { status: 500 }
    )
  }
}

// POST: Tạo chuyến đi mới và lưu trực tiếp vào bảng 'trips' trong Supabase
export async function POST(request: Request) {
  try {
    let body: any
    try {
      body = await request.json()
    } catch {
      return NextResponse.json(
        { error: 'Dữ liệu JSON không hợp lệ' },
        { status: 400 }
      )
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

    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: 'Tên chuyến đi không được để trống' },
        { status: 400 }
      )
    }

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    let creatorId = user?.id
    if (!creatorId) {
      // Nếu chưa có phiên cookie đăng nhập, lấy ID người dùng đầu tiên từ bảng profiles
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .limit(1)
        .maybeSingle()
      creatorId = profile?.id
    }

    if (!creatorId) {
      return NextResponse.json(
        { error: 'Chưa có thông tin người dùng trong cơ sở dữ liệu' },
        { status: 401 }
      )
    }

    // Insert chuyến đi mới vào bảng trips của Supabase
    const { data: newTrip, error: tripError } = await supabase
      .from('trips')
      .insert({
        name: name.trim(),
        destination: destination ? destination.trim() : null,
        start_date: start_date || null,
        end_date: end_date || null,
        cover_image_url:
          cover_image_url ||
          'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=800&auto=format&fit=crop',
        created_by: creatorId,
      })
      .select()
      .single()

    if (tripError || !newTrip) {
      console.error('Error inserting trip into Supabase:', tripError)
      return NextResponse.json(
        { error: tripError?.message || 'Không thể tạo chuyến đi vào cơ sở dữ liệu' },
        { status: 400 }
      )
    }

    // Thêm người tạo vào bảng trip_members với quyền 'owner'
    await supabase.from('trip_members').insert({
      trip_id: newTrip.id,
      user_id: creatorId,
      role: 'owner',
      status: 'accepted',
    })

    return NextResponse.json(
      {
        success: true,
        message: 'Tạo chuyến đi thành công vào cơ sở dữ liệu!',
        trip: newTrip,
      },
      { status: 201 }
    )
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Lỗi xử lý phía máy chủ' },
      { status: 500 }
    )
  }
}

// PATCH: Cập nhật thông tin hoặc ảnh bìa của chuyến đi trong bảng 'trips'
export async function PATCH(request: Request) {
  try {
    const body = await request.json()
    const { id, cover_image_url, name, destination, start_date, end_date } =
      body || {}

    if (!id) {
      return NextResponse.json(
        { error: 'Thiếu ID chuyến đi cần cập nhật' },
        { status: 400 }
      )
    }

    const supabase = await createClient()
    const updates: any = { updated_at: new Date().toISOString() }
    if (cover_image_url !== undefined) updates.cover_image_url = cover_image_url
    if (name !== undefined) updates.name = name
    if (destination !== undefined) updates.destination = destination
    if (start_date !== undefined) updates.start_date = start_date
    if (end_date !== undefined) updates.end_date = end_date

    const { data, error } = await supabase
      .from('trips')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true, trip: data })
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Lỗi server' },
      { status: 500 }
    )
  }
}

