import { useEffect, useState } from 'react'
import type { FormEvent, CSSProperties } from 'react'
import api from '../api/axios'
import { formatDate } from '../utils/formatDate'
import { THEME, CornerBrackets, portalPageCss, heroStyle, panelStyle, thStyle, tdStyle, ghostBtnStyle } from './gfh/adminTheme'

export type FieldType = 'text' | 'number' | 'date' | 'textarea' | 'select' | 'checkbox'

export interface CrudField {
  name: string
  label: string
  type?: FieldType
  required?: boolean
  options?: { value: string | number; label: string }[]
  placeholder?: string
}

interface Props {
  title: string
  subtitle: string
  /** GET list endpoint, e.g. /admin/teams */
  listUrl: string
  /** Response key holding the array, e.g. teams */
  listKey: string
  /** POST create endpoint (defaults to listUrl) */
  createUrl?: string
  /** DELETE base, defaults to listUrl — delete at `${deleteUrl}/${id}` */
  deleteUrl?: string
  fields: CrudField[]
  columns: { key: string; label: string; render?: (row: any) => React.ReactNode }[]
  /** Map form state → API body */
  mapPayload?: (form: Record<string, string>) => Record<string, unknown>
}

/** Naively singularize a plural title for the "Add new" button, e.g. "Teams" -> "Team" */
const singularize = (word: string) => {
  if (/ies$/i.test(word)) return word.replace(/ies$/i, 'y')
  if (/ses$/i.test(word)) return word.replace(/es$/i, '')
  if (/s$/i.test(word) && !/ss$/i.test(word)) return word.replace(/s$/i, '')
  return word
}

const inputStyle: CSSProperties = {
  width: '100%',
  padding: '11px 13px',
  border: `1px solid ${THEME.border}`,
  borderRadius: 0,
  fontSize: 14,
  fontWeight: 500,
  background: '#fff',
  color: THEME.ink,
}

export default function SchemaCrudPage({
  title,
  subtitle,
  listUrl,
  listKey,
  createUrl,
  deleteUrl,
  fields,
  columns,
  mapPayload,
}: Props) {
  const [rows, setRows] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<Record<string, string>>({})
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const emptyForm = () =>
    Object.fromEntries(fields.map(f => [f.name, f.type === 'checkbox' ? 'false' : '']))

  useEffect(() => {
    setForm(emptyForm())
    fetchList()
  }, [listUrl])

  const fetchList = async () => {
    setLoading(true)
    try {
      const res = await api.get(listUrl)
      setRows(res.data.data?.[listKey] ?? [])
    } catch (e) {
      console.error(e)
      setRows([])
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setSaving(true)
    try {
      const payload = mapPayload
        ? mapPayload(form)
        : Object.fromEntries(
            fields.map(f => {
              let v: unknown = form[f.name]
              if (f.type === 'number') v = form[f.name] === '' ? null : Number(form[f.name])
              if (f.type === 'checkbox') v = form[f.name] === 'true'
              return [f.name, v]
            })
          )
      await api.post(createUrl || listUrl, payload)
      setShowForm(false)
      setForm(emptyForm())
      fetchList()
    } catch (err: any) {
      const data = err?.response?.data
      const firstFieldError = data?.errors
        ? Object.values(data.errors as Record<string, string[]>).flat()[0]
        : null
      setError(firstFieldError || data?.message || 'Failed to save.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this record?')) return
    try {
      await api.delete(`${deleteUrl || listUrl}/${id}`)
      fetchList()
    } catch {
      alert('Delete failed.')
    }
  }

  const addNewLabel = `New ${singularize(title)}`

  return (
    <div className="gfh-portal-page" style={{ fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif" }}>
      <style>{`
        ${portalPageCss}
        .gfh-scp-form-wrap { animation: gfhPortalPop 0.28s cubic-bezier(.2,.8,.2,1); }
        .gfh-scp-input:focus {
          outline: none;
          border-color: ${THEME.violetLight} !important;
          background: #ffffff !important;
          box-shadow: 0 0 0 3px rgba(15,118,110,0.15);
        }
        .gfh-scp-skeleton {
          background: linear-gradient(90deg, #f0fdfa 25%, #ffffff 50%, #f0fdfa 75%);
          background-size: 200% 100%;
          animation: gfhScpShimmer 1.4s ease infinite;
        }
        @keyframes gfhScpShimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        .gfh-scp-count-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 12px;
          background: #f0fdfa;
          border: 1px solid #99f6e4;
          color: #115e59;
          font-size: 12px;
          font-weight: 700;
          border-radius: 0;
        }
      `}</style>

      <div className="fade-in" style={heroStyle}>
        <CornerBrackets />
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 30, fontWeight: 700, color: THEME.ink, margin: 0 }}>
              {title}
            </h1>
            {!loading && (
              <span className="gfh-scp-count-pill">
                {rows.length} {rows.length === 1 ? 'record' : 'records'}
              </span>
            )}
          </div>
          <p style={{ fontSize: 14, color: THEME.textMuted, marginTop: 8, marginBottom: 0 }}>
            {subtitle}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowForm(s => !s)}
          className="gfh-portal-btn"
          style={{
            ...ghostBtnStyle,
            background: showForm ? '#f3f4f6' : THEME.violetLight,
            border: showForm ? '1px solid #e5e7eb' : 'none',
            color: showForm ? THEME.ink : '#fff',
          }}
        >
          {showForm ? 'Cancel' : addNewLabel}
        </button>
      </div>

      {showForm && (
        <div className="gfh-scp-form-wrap" style={{ ...panelStyle, marginBottom: 22, minHeight: 0 }}>
          <CornerBrackets />
          <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 18, fontWeight: 700, color: THEME.ink, margin: '0 0 20px' }}>
            {addNewLabel}
          </h2>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 18 }}>
              {fields.map(f => (
                <label
                  key={f.name}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 7,
                    fontSize: 12,
                    fontWeight: 800,
                    color: THEME.purple,
                    letterSpacing: '0.4px',
                    textTransform: 'uppercase',
                    gridColumn: f.type === 'textarea' ? '1 / -1' : undefined,
                  }}
                >
                  {f.label}{f.required ? ' *' : ''}
                  {f.type === 'textarea' ? (
                    <textarea
                      className="gfh-scp-input"
                      style={{ ...inputStyle, minHeight: 84, resize: 'vertical' }}
                      value={form[f.name] || ''}
                      required={f.required}
                      placeholder={f.placeholder}
                      onChange={e => setForm({ ...form, [f.name]: e.target.value })}
                    />
                  ) : f.type === 'select' ? (
                    <select
                      className="gfh-scp-input"
                      style={inputStyle}
                      value={form[f.name] || ''}
                      required={f.required}
                      onChange={e => setForm({ ...form, [f.name]: e.target.value })}
                    >
                      <option value="">Select…</option>
                      {(f.options || []).map(o => (
                        <option key={String(o.value)} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                  ) : f.type === 'checkbox' ? (
                    <div style={{ display: 'flex', alignItems: 'center', height: 42 }}>
                      <input
                        type="checkbox"
                        checked={form[f.name] === 'true'}
                        onChange={e => setForm({ ...form, [f.name]: e.target.checked ? 'true' : 'false' })}
                        style={{ width: 18, height: 18, accentColor: THEME.violetLight }}
                      />
                    </div>
                  ) : (
                    <input
                      type={f.type || 'text'}
                      className="gfh-scp-input"
                      style={inputStyle}
                      value={form[f.name] || ''}
                      required={f.required}
                      placeholder={f.placeholder}
                      onChange={e => setForm({ ...form, [f.name]: e.target.value })}
                    />
                  )}
                </label>
              ))}
            </div>
            {error && (
              <p style={{ color: '#b91c1c', fontWeight: 600, fontSize: 13, marginTop: 16 }}>{error}</p>
            )}
            <button
              type="submit"
              className="gfh-portal-btn"
              disabled={saving}
              style={{ ...ghostBtnStyle, marginTop: 20, opacity: saving ? 0.6 : 1 }}
            >
              {saving ? 'Saving…' : 'Save'}
            </button>
          </form>
        </div>
      )}

      <div className="fade-in" style={{ ...panelStyle, padding: 0, overflowX: 'auto' }}>
        <CornerBrackets />
        {loading ? (
          <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="gfh-scp-skeleton" style={{ height: 44 }} />
            ))}
          </div>
        ) : rows.length === 0 ? (
          <div style={{ padding: 56, textAlign: 'center' }}>
            <p style={{ fontSize: 14.5, color: THEME.textMuted, fontWeight: 600, margin: 0 }}>No records yet.</p>
            <p style={{ fontSize: 13, color: '#a8a29e', fontWeight: 500, marginTop: 4 }}>Click "{addNewLabel}" to create your first entry.</p>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: `2px solid ${THEME.border}` }}>
                {columns.map(c => (
                  <th key={c.key} style={thStyle}>{c.label}</th>
                ))}
                <th style={thStyle} />
              </tr>
            </thead>
            <tbody>
              {rows.map(row => (
                <tr key={row.id} className="gfh-portal-row" style={{ borderBottom: `1px solid ${THEME.border}` }}>
                  {columns.map(c => (
                    <td key={c.key} style={tdStyle}>
                      {c.render
                        ? c.render(row)
                        : (c.key.toLowerCase().includes('date') || c.key === 'created_at' || c.key === 'updated_at')
                          ? formatDate(row[c.key])
                          : String(row[c.key] ?? '—')}
                    </td>
                  ))}
                  <td style={{ ...tdStyle, textAlign: 'right' }}>
                    <button
                      type="button"
                      className="gfh-portal-btn"
                      onClick={() => handleDelete(row.id)}
                      style={{ background: '#fee2e2', border: '1px solid #fca5a5', color: '#991b1b', borderRadius: 0, padding: '6px 13px', cursor: 'pointer', fontSize: 12, fontWeight: 700 }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
