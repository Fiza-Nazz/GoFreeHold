import { useState } from 'react'
import api from '../../api/axios'

export interface ChequeDetailsData {
  id: number
  account_holder_name?: string | null
  payee_name?: string | null
  nature?: string | null
  type?: string | null
  notes?: string | null
  has_cheque_image?: boolean
  cheque_image_name?: string | null
}

export default function ChequeDetails({ cheque, contractId }: { cheque: ChequeDetailsData; contractId: number }) {
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const download = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await api.get(`/admin/contracts/${contractId}/cheques/${cheque.id}/attachment`, { responseType: 'blob' })
      const url = URL.createObjectURL(response.data)
      const anchor = document.createElement('a')
      anchor.href = url
      anchor.download = cheque.cheque_image_name || 'cheque-attachment'
      document.body.appendChild(anchor)
      anchor.click()
      anchor.remove()
      setTimeout(() => URL.revokeObjectURL(url), 1000)
    } catch {
      setError('Unable to download cheque attachment. Please try again.')
    } finally { setLoading(false) }
  }
  return <details style={{ minWidth: 180, maxWidth: 340, fontSize: 12, fontWeight: 400, color: '#334155' }}>
    <summary style={{ color: '#10B981', cursor: 'pointer', fontWeight: 600 }}>View details</summary>
    <dl style={{ margin: '10px 0', overflowWrap: 'anywhere' }}>
      {Object.entries({ 'Account Holder': cheque.account_holder_name, Payee: cheque.payee_name, Nature: cheque.nature, Type: cheque.type, Remarks: cheque.notes }).map(([label, value]) => <div key={label} style={{ marginBottom: 6 }}><dt style={{ fontWeight: 600 }}>{label}</dt><dd style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{value || 'Not recorded'}</dd></div>)}
    </dl>
    {cheque.has_cheque_image ? <button type="button" disabled={loading} onClick={download} style={{ color: '#065f46', cursor: 'pointer' }}>{loading ? 'Downloading…' : 'Download cheque image / PDF'}</button> : <span>No attachment</span>}
    {error && <p role="alert" style={{ color: '#991b1b' }}>{error}</p>}
  </details>
}
