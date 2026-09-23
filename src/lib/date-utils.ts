/**
 * Chuyển đổi các định dạng ngày phổ biến (DD/MM/YYYY, DD-MM-YYYY, YYYY-MM-DD) sang chuẩn YYYY-MM-DD cho PostgreSQL
 */
export function normalizeDateToISO(dateStr: string | null | undefined): string | null {
  if (!dateStr || typeof dateStr !== 'string') return null
  const trimmed = dateStr.trim()
  if (!trimmed) return null

  // Đã là chuẩn YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return trimmed
  }

  // Định dạng DD/MM/YYYY hoặc D/M/YYYY (dùng dấu / hoặc -)
  const dmyMatch = trimmed.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/)
  if (dmyMatch) {
    const day = dmyMatch[1].padStart(2, '0')
    const month = dmyMatch[2].padStart(2, '0')
    const year = dmyMatch[3]
    return `${year}-${month}-${day}`
  }

  // Định dạng YYYY/MM/DD
  const ymdMatch = trimmed.match(/^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})$/)
  if (ymdMatch) {
    const year = ymdMatch[1]
    const month = ymdMatch[2].padStart(2, '0')
    const day = ymdMatch[3].padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  // Fallback: parse với Date
  const parsed = new Date(trimmed)
  if (!isNaN(parsed.getTime())) {
    const y = parsed.getFullYear()
    const m = String(parsed.getMonth() + 1).padStart(2, '0')
    const d = String(parsed.getDate()).padStart(2, '0')
    return `${y}-${m}-${d}`
  }

  return null
}

/**
 * Chuyển đổi ngày từ chuẩn YYYY-MM-DD sang định dạng hiển thị DD/MM/YYYY cho người dùng Việt Nam
 */
export function formatDateToDisplay(dateStr: string | null | undefined): string {
  if (!dateStr || typeof dateStr !== 'string') return ''
  const trimmed = dateStr.trim()
  if (!trimmed) return ''

  // Nếu là YYYY-MM-DD
  const ymdMatch = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (ymdMatch) {
    return `${ymdMatch[3]}/${ymdMatch[2]}/${ymdMatch[1]}`
  }

  // Nếu đã là DD/MM/YYYY
  if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(trimmed)) {
    return trimmed
  }

  return trimmed
}
