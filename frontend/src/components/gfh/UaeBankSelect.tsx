import type { CSSProperties } from 'react'
import { UAE_BANKS, DEFAULT_UAE_BANK } from '../../utils/uaeBanks'

type Props = {
  value: string
  onChange: (bank: string) => void
  id?: string
  required?: boolean
  className?: string
  style?: CSSProperties
  otherInputStyle?: CSSProperties
}

export default function UaeBankSelect({
  value,
  onChange,
  id,
  required,
  className,
  style,
  otherInputStyle,
}: Props) {
  const known = UAE_BANKS.includes(value as (typeof UAE_BANKS)[number])
  const selectValue = !value ? DEFAULT_UAE_BANK : known ? value : 'Other'
  const showOther = selectValue === 'Other'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <select
        id={id}
        required={required}
        className={className}
        value={selectValue}
        onChange={e => {
          const next = e.target.value
          if (next === 'Other') {
            onChange(known ? '' : value && !UAE_BANKS.includes(value as (typeof UAE_BANKS)[number]) ? value : '')
          } else {
            onChange(next)
          }
        }}
        style={style}
      >
        {UAE_BANKS.map(bank => (
          <option key={bank} value={bank}>{bank}</option>
        ))}
      </select>
      {showOther && (
        <input
          type="text"
          required={required}
          placeholder="Enter bank name"
          value={known ? '' : value}
          onChange={e => onChange(e.target.value)}
          className={className}
          style={otherInputStyle || style}
        />
      )}
    </div>
  )
}
