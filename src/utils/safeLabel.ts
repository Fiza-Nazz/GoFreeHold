/** Null-safe display helpers — avoid `.toUpperCase()` crashes on missing API fields. */

export function safeUpper(value: unknown, fallback = '—'): string {
  if (value === null || value === undefined || value === '') return fallback
  return String(value).toUpperCase()
}

export function safeLabel(value: unknown, fallback = '—'): string {
  if (value === null || value === undefined || value === '') return fallback
  return String(value).replace(/_/g, ' ')
}

export function safeUpperLabel(value: unknown, fallback = '—'): string {
  return safeUpper(safeLabel(value, fallback) === fallback ? fallback : safeLabel(value), fallback)
}
