export function formatRupees(value) {
  if (value === null || value === undefined || value === '') return '—'
  const n = Number(value)
  if (Number.isNaN(n)) return '—'
  return '\u20B9' + n.toLocaleString('en-IN', { maximumFractionDigits: 0 })
}

export function formatNumber(value) {
  if (value === null || value === undefined) return '—'
  const n = Number(value)
  if (Number.isNaN(n)) return '—'
  return n.toLocaleString('en-IN')
}

export function relativeDate(date) {
  if (!date) return ''
  const then = new Date(date).getTime()
  const now = Date.now()
  const diffMs = now - then
  if (diffMs < 0) return 'just now'
  const minutes = Math.floor(diffMs / 60000)
  if (minutes < 60) return `${Math.max(minutes, 1)} minute${minutes === 1 ? '' : 's'} ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days} day${days === 1 ? '' : 's'} ago`
  const months = Math.floor(days / 30)
  if (months < 12) return `${months} month${months === 1 ? '' : 's'} ago`
  const years = Math.floor(months / 12)
  return `${years} year${years === 1 ? '' : 's'} ago`
}

export function normalizeService(value) {
  if (!value) return ''
  return String(value).trim().toLowerCase().replace(/\s+/g, ' ')
}

export function monthYearToDate(month, year) {
  const d = new Date(year, month - 1, 1)
  return d.toISOString()
}
