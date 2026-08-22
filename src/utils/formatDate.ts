/**
 * Shared display formatter for API date / datetime values.
 * Outputs e.g. "01 Aug 2026". Returns em dash for empty/invalid values.
 */
export function formatDate(value?: string | Date | null): string {
  if (value === undefined || value === null || value === '') return '—'

  const raw = value instanceof Date ? value : String(value).trim()
  if (!raw) return '—'

  const d = value instanceof Date ? value : new Date(raw)
  if (Number.isNaN(d.getTime())) {
    // Already a plain date like YYYY-MM-DD that some engines reject — try UTC parse
    const m = String(raw).match(/^(\d{4})-(\d{2})-(\d{2})/)
    if (!m) return String(raw)
    const fallback = new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3])))
    if (Number.isNaN(fallback.getTime())) return String(raw)
    return formatParts(fallback)
  }

  return formatParts(d)
}

function formatParts(d: Date): string {
  const day = String(d.getUTCDate()).padStart(2, '0')
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const month = months[d.getUTCMonth()]
  const year = d.getUTCFullYear()
  return `${day} ${month} ${year}`
}

/** Alias kept for call sites that want an explicit name. */
export const formatDisplayDate = formatDate
