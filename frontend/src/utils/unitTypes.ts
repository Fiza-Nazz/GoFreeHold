/** Shared unit type options for create/edit forms and filters. */
export const UNIT_TYPE_OPTIONS = [
  { value: 'studio', label: 'Studio' },
  { value: 'l-studio', label: 'L-Studio' },
  { value: '1-br', label: '1 BR' },
  { value: '2-br', label: '2 BR' },
  { value: '3-br', label: '3 BR' },
  { value: '4-br', label: '4 BR' },
  { value: 'penthouse', label: 'Penthouse' },
  { value: 'villa', label: 'Villa' },
  { value: 'shop', label: 'Shop' },
  { value: 'office', label: 'Office' },
  { value: 'warehouse', label: 'Warehouse' },
] as const

export const DEFAULT_UNIT_TYPE = 'studio'
