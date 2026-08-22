import { useEffect, useState } from 'react'
import api from '../../api/axios'
import { formatDate } from '../../utils/formatDate'
import { THEME, Icon, CornerBrackets, portalPageCss, heroStyle, panelStyle, ghostBtnStyle } from '../../components/gfh/adminTheme'

interface CaseDoc {
  id: number
  legal_case_id: number
  file_name: string
  file_path: string
}

interface LegalCase {
  id: number
  contract_id: number | null
  settlement_id: number | null
  status: 'open' | 'in_progress' | 'closed'
  notes?: string | null
  created_at?: string
  contract?: {
    id: number
    status?: string
    tenant?: { id: number; name: string }
    unit?: { id: number; number: string; property?: { id: number; name: string } }
  }
  settlement?: { id: number; status?: string; vacant_date?: string }
  documents?: CaseDoc[]
}

interface ContractOption {
  id: number
  tenant?: { name: string }
  unit?: { number: string }
}

interface SettlementOption {
  id: number
  contract_id?: number
  status?: string
}

const icons = {
  plus: 'M12 5v14M5 12h14',
}

const inputStyle: React.CSSProperties = {
  background: '#ffffff',
  border: `1px solid ${THEME.border}`,
  borderRadius: 0,
  color: THEME.ink,
  fontSize: 14,
  fontWeight: 500,
  padding: '10px 12px',
  width: '100%',
}

const labelStyle: React.CSSProperties = {
  fontSize: 12.5,
  fontWeight: 700,
  color: THEME.purple,
  letterSpacing: '0.4px',
  textTransform: 'uppercase',
  display: 'block',
  marginBottom: 6,
}

const statusStyle = (status: string): React.CSSProperties => {
  const map: Record<string, { bg: string; color: string; border: string }> = {
    open:        { bg: '#fef2f2', color: '#991b1b', border: '#fecaca' },
    in_progress: { bg: '#fffbeb', color: '#b45309', border: '#fde68a' },
    closed:      { bg: '#f0fdf4', color: '#065f46', border: '#bbf7d0' },
  }
  const tone = map[status] || { bg: '#f3f4f6', color: '#374151', border: '#d1d5db' }
  return {
    backgroundColor: tone.bg,
    color: tone.color,
    border: `1px solid ${tone.border}`,
    padding: '3px 10px',
    borderRadius: 0,
    fontSize: 12,
    fontWeight: 700,
    letterSpacing: '0.3px',
    textTransform: 'uppercase',
  }
}

/**
 * Legal case management — prompt.md Module 4:
 * cases linked to contracts/settlements, status, notes, related documents.
 * List + detail screens.
 */
export default function LegalCases() {
  const [cases, setCases] = useState<LegalCase[]>([])
  const [contracts, setContracts] = useState<ContractOption[]>([])
  const [settlements, setSettlements] = useState<SettlementOption[]>([])
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [detail, setDetail] = useState<LegalCase | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const [form, setForm] = useState({
    contract_id: '',
    settlement_id: '',
    status: 'open',
    notes: '',
  })

  useEffect(() => {
    fetchCases()
    fetchContracts()
    fetchSettlements()
  }, [])

  useEffect(() => {
    if (selectedId == null) {
      setDetail(null)
      return
    }
    fetchDetail(selectedId)
  }, [selectedId])

  const fetchCases = async () => {
    setIsLoading(true)
    try {
      const res = await api.get('/admin/legal-cases')
      setCases(res.data.data.legal_cases || [])
    } catch (err) {
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchDetail = async (id: number) => {
    try {
      const res = await api.get(`/admin/legal-cases/${id}`)
      setDetail(res.data.data.legal_case || null)
    } catch (err) {
      console.error(err)
      setDetail(null)
    }
  }

  const fetchContracts = async () => {
    try {
      const res = await api.get('/admin/contracts')
      setContracts(res.data.data.contracts || [])
    } catch (err) {
      console.error(err)
    }
  }

  const fetchSettlements = async () => {
    try {
      const res = await api.get('/admin/settlements')
      setSettlements(res.data.data.settlements || [])
    } catch (err) {
      console.error(err)
    }
  }

  const createCase = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.contract_id && !form.settlement_id) {
      alert('Link at least a contract or a settlement.')
      return
    }
    try {
      const payload: Record<string, unknown> = {
        status: form.status,
        notes: form.notes || null,
      }
      if (form.contract_id) payload.contract_id = Number(form.contract_id)
      if (form.settlement_id) payload.settlement_id = Number(form.settlement_id)

      const res = await api.post('/admin/legal-cases', payload)
      setIsCreateOpen(false)
      setForm({ contract_id: '', settlement_id: '', status: 'open', notes: '' })
      await fetchCases()
      setSelectedId(res.data.data.legal_case.id)
    } catch {
      alert('Failed to create legal case')
    }
  }

  const updateStatus = async (status: LegalCase['status']) => {
    if (!detail) return
    try {
      await api.put(`/admin/legal-cases/${detail.id}`, { status })
      fetchCases()
      fetchDetail(detail.id)
    } catch {
      alert('Failed to update status')
    }
  }

  const saveNotes = async () => {
    if (!detail) return
    try {
      await api.put(`/admin/legal-cases/${detail.id}`, { notes: detail.notes ?? '' })
      fetchCases()
      alert('Notes saved')
    } catch {
      alert('Failed to save notes')
    }
  }

  const uploadDoc = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!detail || !uploadFile) return
    const body = new FormData()
    body.append('file', uploadFile)
    try {
      await api.post(`/admin/legal-cases/${detail.id}/documents`, body, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setUploadFile(null)
      fetchDetail(detail.id)
      fetchCases()
    } catch {
      alert('Failed to upload document')
    }
  }

  const deleteDoc = async (docId: number) => {
    if (!detail || !confirm('Delete this case document?')) return
    try {
      await api.delete(`/admin/legal-cases/${detail.id}/documents/${docId}`)
      fetchDetail(detail.id)
      fetchCases()
    } catch {
      alert('Failed to delete document')
    }
  }

  return (
    <div className="gfh-portal-page" style={{ fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif" }}>
      <style>{portalPageCss}</style>

      <div className="fade-in" style={heroStyle}>
        <CornerBrackets />
        <div>
          <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 30, fontWeight: 700, color: THEME.ink, margin: 0 }}>
            Legal cases
          </h1>
          <p style={{ fontSize: 14, color: THEME.textMuted, marginTop: 8, marginBottom: 0 }}>
            Case management linked to contracts and settlements — status, notes, and documents
          </p>
        </div>
        <button className="gfh-portal-btn" onClick={() => setIsCreateOpen(true)} style={ghostBtnStyle}>
          <Icon path={icons.plus} size={16} />
          New legal case
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(280px, 1fr) minmax(360px, 1.4fr)', gap: 16 }}>
        <div className="fade-in" style={{ ...panelStyle, minHeight: 420 }}>
          <CornerBrackets />
          <h2 style={{ fontSize: 16, fontWeight: 700, marginTop: 0, marginBottom: 14, color: THEME.ink }}>Cases</h2>
          {isLoading ? (
            <div style={{ textAlign: 'center', padding: 40 }}><span className="spinner" /></div>
          ) : cases.length === 0 ? (
            <p style={{ fontSize: 14, color: THEME.textMuted, fontWeight: 500 }}>No legal cases yet.</p>
          ) : (
            <div style={{ display: 'grid', gap: 10 }}>
              {cases.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setSelectedId(c.id)}
                  style={{
                    textAlign: 'left',
                    padding: 14,
                    background: selectedId === c.id ? '#f6f1fe' : '#fff',
                    border: `1px solid ${THEME.border}`,
                    borderRadius: 0,
                    cursor: 'pointer',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, marginBottom: 6 }}>
                    <strong style={{ color: THEME.ink }}>CASE-{String(c.id).padStart(4, '0')}</strong>
                    <span style={statusStyle(c.status)}>{c.status.replace('_', ' ')}</span>
                  </div>
                  <p style={{ margin: 0, fontSize: 13, color: THEME.textMuted }}>
                    Contract: {c.contract_id ? `GFH-${String(c.contract_id).padStart(5, '0')}` : '—'}
                    {c.contract?.tenant?.name ? ` · ${c.contract.tenant.name}` : ''}
                  </p>
                  {c.settlement_id ? (
                    <p style={{ margin: '4px 0 0', fontSize: 12, color: THEME.textMuted }}>
                      Settlement #{c.settlement_id}
                    </p>
                  ) : null}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="fade-in" style={{ ...panelStyle, minHeight: 420 }}>
          <CornerBrackets />
          {!detail ? (
            <p style={{ fontSize: 14, color: THEME.textMuted }}>Select a legal case to view details.</p>
          ) : (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', marginBottom: 16 }}>
                <div>
                  <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 22, fontWeight: 700, margin: 0, color: THEME.purple }}>
                    CASE-{String(detail.id).padStart(4, '0')}
                  </h2>
                  <p style={{ fontSize: 13, color: THEME.textMuted, marginTop: 6 }}>
                    Opened {formatDate(detail.created_at)}
                  </p>
                </div>
                <span style={statusStyle(detail.status)}>{detail.status.replace('_', ' ')}</span>
              </div>

              <div style={{ display: 'grid', gap: 8, marginBottom: 16, fontSize: 13, color: THEME.ink }}>
                <p style={{ margin: 0 }}>
                  <strong>Contract:</strong>{' '}
                  {detail.contract_id
                    ? `GFH-${String(detail.contract_id).padStart(5, '0')} · ${detail.contract?.tenant?.name || '—'} · Unit ${detail.contract?.unit?.number || '—'}`
                    : '—'}
                </p>
                <p style={{ margin: 0 }}>
                  <strong>Settlement:</strong> {detail.settlement_id ? `#${detail.settlement_id}` : '—'}
                </p>
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={labelStyle}>Case status</label>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {(['open', 'in_progress', 'closed'] as const).map((s) => {
                    const statusColors: Record<string, { active: string; inactive: { bg: string; color: string; border: string } }> = {
                      open:        { active: '#991b1b', inactive: { bg: '#fef2f2', color: '#991b1b', border: '#fecaca' } },
                      in_progress: { active: '#b45309', inactive: { bg: '#fffbeb', color: '#b45309', border: '#fde68a' } },
                      closed:      { active: '#065f46', inactive: { bg: '#f0fdf4', color: '#065f46', border: '#bbf7d0' } },
                    }
                    const c = statusColors[s] || { active: '#374151', inactive: { bg: '#f3f4f6', color: '#374151', border: '#d1d5db' } }
                    return (
                      <button
                        key={s}
                        type="button"
                        onClick={() => updateStatus(s)}
                        style={{
                          ...ghostBtnStyle,
                          background: detail.status === s ? c.active : c.inactive.bg,
                          color: detail.status === s ? '#fff' : c.inactive.color,
                          border: detail.status === s ? 'none' : `1px solid ${c.inactive.border}`,
                        }}
                      >
                        {s.replace('_', ' ')}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={labelStyle}>Notes</label>
                <textarea
                  style={{ ...inputStyle, minHeight: 100, resize: 'vertical' }}
                  value={detail.notes || ''}
                  onChange={(e) => setDetail({ ...detail, notes: e.target.value })}
                />
                <button type="button" className="gfh-portal-btn" style={{ ...ghostBtnStyle, marginTop: 8, background: '#065f46' }} onClick={saveNotes}>
                  Save Notes
                </button>
              </div>

              <div style={{ borderTop: `1px solid ${THEME.border}`, paddingTop: 14 }}>
                <p style={{ fontSize: 13, fontWeight: 700, marginBottom: 8, color: THEME.ink }}>Related documents</p>
                {(detail.documents || []).length === 0 ? (
                  <p style={{ fontSize: 12, color: THEME.textMuted }}>No documents uploaded yet.</p>
                ) : (
                  <ul style={{ margin: '0 0 12px', paddingLeft: 18 }}>
                    {(detail.documents || []).map((doc) => (
                      <li key={doc.id} style={{ marginBottom: 6, fontSize: 13, color: THEME.ink }}>
                        {doc.file_name}{' '}
                        <button
                          type="button"
                          style={{ padding: '3px 9px', fontSize: 11, fontWeight: 700, marginLeft: 8, borderRadius: 0, background: '#991b1b', color: '#fff', border: 'none', cursor: 'pointer' }}
                          onClick={() => deleteDoc(doc.id)}
                        >
                          Delete
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
                <form onSubmit={uploadDoc} style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                  <input type="file" style={inputStyle} onChange={(e) => setUploadFile(e.target.files?.[0] || null)} required />
                  <button type="submit" className="gfh-portal-btn" style={{ ...ghostBtnStyle, background: '#0e7490' }}>Upload</button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>

      {isCreateOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 61, 58, 0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div
            className="fade-in"
            style={{
              position: 'relative',
              width: 480,
              padding: 28,
              background: '#ffffff',
              borderRadius: 0,
              border: `1px solid ${THEME.border}`,
            }}
          >
            <CornerBrackets />
            <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 22, fontWeight: 700, marginBottom: 16, color: THEME.purple }}>
              New legal case
            </h2>
            <form onSubmit={createCase} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={labelStyle}>Contract (optional if settlement set)</label>
                <select
                  style={inputStyle}
                  value={form.contract_id}
                  onChange={(e) => setForm({ ...form, contract_id: e.target.value })}
                >
                  <option value="">Select contract…</option>
                  {contracts.map((c) => (
                    <option key={c.id} value={c.id}>
                      GFH-{String(c.id).padStart(5, '0')} — {c.tenant?.name || 'Tenant'} / Unit {c.unit?.number || '?'}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Settlement (optional if contract set)</label>
                <select
                  style={inputStyle}
                  value={form.settlement_id}
                  onChange={(e) => setForm({ ...form, settlement_id: e.target.value })}
                >
                  <option value="">Select settlement…</option>
                  {settlements.map((s) => (
                    <option key={s.id} value={s.id}>
                      Settlement #{s.id} {s.status ? `(${s.status})` : ''}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Status</label>
                <select
                  style={inputStyle}
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  required
                >
                  <option value="open">Open</option>
                  <option value="in_progress">In progress</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>Notes</label>
                <textarea
                  style={{ ...inputStyle, minHeight: 90 }}
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                />
              </div>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  style={{ borderRadius: 0, fontWeight: 700, fontSize: 13, padding: '9px 16px', background: '#f1f5f9', color: THEME.textMuted, border: `1px solid ${THEME.border}`, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button type="submit" className="gfh-portal-btn" style={ghostBtnStyle}>
                  Create case
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
