/** Common banks operating in the UAE (for PDC / cheque forms). */
export const UAE_BANKS = [
  'Emirates NBD',
  'First Abu Dhabi Bank (FAB)',
  'Abu Dhabi Commercial Bank (ADCB)',
  'Dubai Islamic Bank (DIB)',
  'Mashreq Bank',
  'Abu Dhabi Islamic Bank (ADIB)',
  'Commercial Bank of Dubai (CBD)',
  'Emirates Islamic',
  'RAKbank',
  'HSBC UAE',
  'Standard Chartered UAE',
  'National Bank of Fujairah (NBF)',
  'Bank of Sharjah',
  'Sharjah Islamic Bank',
  'Ajman Bank',
  'Al Hilal Bank',
  'United Arab Bank (UAB)',
  'National Bank of Umm Al Quwain (NBQ)',
  'Invest Bank',
  'Citibank UAE',
  'Arab Bank',
  'Habib Bank AG Zurich',
  'Wio Bank',
  'Liv by Emirates NBD',
  'Other',
] as const

export const DEFAULT_UAE_BANK: string = UAE_BANKS[0]

export type UaeBank = (typeof UAE_BANKS)[number]
