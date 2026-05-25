/** YYYY-MM-DD in the user's local timezone (not UTC). */
export function toLocalDateString(date = new Date()) {
  const d = new Date(date)
  if (Number.isNaN(d.getTime())) return ''
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function isSameLocalDay(a, b = new Date()) {
  if (!a) return false
  return toLocalDateString(a) === toLocalDateString(b)
}

/** Value for `<input type="date">` from an ISO or Date string. */
export function toDateInputValue(iso) {
  if (!iso) return toLocalDateString()
  return toLocalDateString(iso)
}
