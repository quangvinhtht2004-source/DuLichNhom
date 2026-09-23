import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const isBirthdayPattern = (pwd: string) => {
  if (!pwd) return false

  // 1. Date with delimiters: DD/MM/YYYY, DD-MM-YYYY, DD.MM.YYYY, YYYY/MM/DD, DD/MM/YY, etc.
  const delimitedDate = /\b(0[1-9]|[12]\d|3[01])[-/.](0[1-9]|1[0-2])[-/.](19\d{2}|20\d{2}|\d{2})\b/
  const delimitedDateRev = /\b(19\d{2}|20\d{2})[-/.](0[1-9]|1[0-2])[-/.](0[1-9]|[12]\d|3[01])\b/
  if (delimitedDate.test(pwd) || delimitedDateRev.test(pwd)) return true

  // 2. 8-digit date patterns without delimiters:
  // DDMMYYYY (e.g. 25121998, 01012000)
  const ddmmyyyy = /(0[1-9]|[12]\d|3[01])(0[1-9]|1[0-2])(19\d{2}|20\d{2})/
  // YYYYMMDD (e.g. 19981225, 20000101)
  const yyyymmdd = /(19\d{2}|20\d{2})(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])/
  // MMDDYYYY (e.g. 12251998)
  const mmddyyyy = /(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])(19\d{2}|20\d{2})/
  if (ddmmyyyy.test(pwd) || yyyymmdd.test(pwd) || mmddyyyy.test(pwd)) return true

  // 3. 6-digit date patterns without delimiters:
  // DDMMYY (e.g. 251298, 010100)
  const ddmmyy = /(0[1-9]|[12]\d|3[01])(0[1-9]|1[0-2])(\d{2})/
  // YYMMDD
  const yymmdd = /(\d{2})(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])/
  if (ddmmyy.test(pwd) || yymmdd.test(pwd)) return true

  return false
}

export async function POST(request: Request) {
  let body: any
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Dữ liệu JSON không hợp lệ' }, { status: 400 })
  }

  const { password, current_password } = body || {}

  if (!password || password.length < 8) {
    return NextResponse.json(
      { error: 'Mật khẩu mới phải có tối thiểu 8 ký tự' },
      { status: 400 }
    )
  }

  if (!/\d/.test(password)) {
    return NextResponse.json(
      { error: 'Mật khẩu mới phải chứa ít nhất một chữ số' },
      { status: 400 }
    )
  }

  if (!/[A-Z]/.test(password)) {
    return NextResponse.json(
      { error: 'Mật khẩu mới phải chứa ít nhất một ký tự viết hoa' },
      { status: 400 }
    )
  }

  if (isBirthdayPattern(password)) {
    return NextResponse.json(
      { error: 'Mật khẩu mới không được chứa định dạng ngày tháng năm sinh' },
      { status: 400 }
    )
  }

  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json(
      { error: 'Phiên đăng nhập đã hết hạn hoặc không hợp lệ. Vui lòng đăng nhập lại.' },
      { status: 401 }
    )
  }

  // If current password is provided, verify it
  if (current_password) {
    if (current_password === password) {
      return NextResponse.json(
        { error: 'Mật khẩu mới không được trùng với mật khẩu hiện tại' },
        { status: 400 }
      )
    }

    if (user.email) {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: current_password,
      })
      if (signInError) {
        return NextResponse.json(
          { error: 'Mật khẩu hiện tại không chính xác' },
          { status: 400 }
        )
      }
    }
  }

  const { error } = await supabase.auth.updateUser({ password })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: error.status ?? 400 })
  }

  return NextResponse.json({ success: true })
}
