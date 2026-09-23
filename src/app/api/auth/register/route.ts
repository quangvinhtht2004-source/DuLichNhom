import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  let body: any
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Dữ liệu JSON không hợp lệ' }, { status: 400 })
  }

  const { email, password, full_name } = body || {}

  if (!email || !password) {
    return NextResponse.json({ error: 'email và password là bắt buộc' }, { status: 400 })
  }

  if (password.length < 6) {
    return NextResponse.json({ error: 'Mật khẩu phải có ít nhất 6 ký tự' }, { status: 400 })
  }

  const supabase = await createClient()
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name },
      emailRedirectTo: `${siteUrl}/api/auth/callback`,
    },
  })

  if (error) {
    if (error.message?.toLowerCase().includes('rate limit')) {
      return NextResponse.json(
        {
          error:
            'Đã vượt quá giới hạn gửi email của Supabase (tối đa 3-4 email/giờ với SMTP mặc định). Vui lòng thử đăng nhập bằng Google hoặc tắt "Confirm email" trong Supabase Dashboard.',
        },
        { status: 429 }
      )
    }
    return NextResponse.json({ error: error.message }, { status: error.status ?? 400 })
  }

  return NextResponse.json({ user: data.user, session: data.session })
}

