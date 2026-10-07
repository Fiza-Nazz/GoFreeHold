export type LeaseTerm = 'Monthly' | 'Yearly'

/** Normalize legacy lease terms to Monthly | Yearly. */
export function normalizeLeaseTerm(leaseTerm?: string | null): LeaseTerm {
  const term = (leaseTerm || '').toLowerCase().trim()
  if (!term) return 'Yearly'
  if (term.includes('month')) return 'Monthly'
  if (term.includes('year') || term.includes('annual')) return 'Yearly'
  return 'Yearly'
}

/** Resolve the monthly installment from contract rent + lease term. */
export function resolveMonthlyRent(
  rentAmount: number | string | null | undefined,
  leaseTerm?: string | null,
): number {
  const rent = Number(rentAmount) || 0
  if (rent <= 0) return 0
  return normalizeLeaseTerm(leaseTerm) === 'Monthly' ? rent : rent / 12
}

type LedgerLike = {
  date?: string | null
  debit?: number | string | null
  credit?: number | string | null
}

/**
 * Monthly outstanding for monthly-billed contracts:
 * prior unpaid months (arrears) + unpaid amount for the current month.
 */
export function computeMonthlyOutstanding(
  entries: LedgerLike[],
  monthlyRent: number,
  asOf: Date = new Date(),
): number {
  if (monthlyRent <= 0 && (!entries || entries.length === 0)) return 0

  const y = asOf.getFullYear()
  const m = asOf.getMonth()
  const monthStart = new Date(y, m, 1)

  let monthDebit = 0
  let monthCredit = 0
  let priorNet = 0

  for (const entry of entries || []) {
    if (!entry.date) continue
    const d = new Date(entry.date)
    if (isNaN(d.getTime())) continue
    const debit = Number(entry.debit) || 0
    const credit = Number(entry.credit) || 0
    if (d.getFullYear() === y && d.getMonth() === m) {
      monthDebit += debit
      monthCredit += credit
    } else if (d < monthStart) {
      priorNet += debit - credit
    }
  }

  const arrears = Math.max(0, priorNet)
  const expectedThisMonth = monthDebit > 0 ? monthDebit : monthlyRent
  const thisMonthDue = Math.max(0, expectedThisMonth - monthCredit)

  return Math.round((arrears + thisMonthDue) * 100) / 100
}
