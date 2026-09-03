import { useEffect, useState } from 'react'
import api from '../../api/axios'
import { THEME, Icon, ICONS, CornerBrackets, portalPageCss, heroStyle, panelStyle, thStyle, tdStyle, ghostBtnStyle } from '../../components/gfh/adminTheme'

interface Appliance {
  id: number
  unit_id: number
  name: string
  brand: string
  model_number?: string
  serial_number?: string
  purchase_date?: string
  warranty_expiry?: string
  condition: 'brand_new' | 'good' | 'needs_repair' | 'replaced'
  notes?: string
  unit?: { number: string; property?: { name: string } }
}

const CONDITION_COLOR: Record<string, string> = {
  brand_new: '#10b981',
  good: '#3b82f6',
  needs_repair: '#ef4444',
  replaced: '#6b7280',
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

export default function ApplianceCatalog() {
  const [appliances, setAppliances] = useState<Appliance[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [unitFilter, setUnitFilter] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [formData, setFormData] = useState({
    unit_id: '',
    name: '',
    brand: '',
    model_number: '',
    serial_number: '',
    purchase_date: '',
    warranty_expiry: '',
    condition: 'good',
    notes: '',
  })

  useEffect(() => { fetchAppliances() }, [unitFilter])

  const fetchAppliances = async () => {
    setIsLoading(true)
    try {
      const url = unitFilter ? `/admin/appliances?unit_id=${unitFilter}` : '/admin/appliances'
      const res = await api.get(url)
      setAppliances(res.data?.data?.appliances || [])
    } catch (err) { console.error(err) }
    finally { setIsLoading(false) }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await api.post('/admin/appliances', formData)
      setIsModalOpen(false)
      fetchAppliances()
      setFormData({ unit_id: '', name: '', brand: '', model_number: '', serial_number: '', purchase_date: '', warranty_expiry: '', condition: 'good', notes: '' })
    } catch (err) { alert('Error adding appliance') }
  }

  const handleDelete = async (id: number) => {
    if (confirm('Remove this appliance?')) {
      await api.delete(`/admin/appliances/${id}`)
      fetchAppliances()
    }
  }

  return (
    <div className="gfh-portal-page" style={{ fontFamily: "'Poppins', system-ui, sans-serif" }}>
      <style>{portalPageCss}</style>

      <div className="fade-in" style={heroStyle}>
        <CornerBrackets />
        <div>
          <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 30, fontWeight: 700, color: THEME.ink, margin: 0 }}>
            Appliance catalog
          </h1>
          <p style={{ fontSize: 14, color: THEME.textMuted, marginTop: 8, marginBottom: 0 }}>
            Track appliances assigned to individual property units
          </p>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <input
            placeholder="Unit ID filter"
            value={unitFilter}
            onChange={e => setUnitFilter(e.target.value)}
            style={{
              width: 140,
              borderRadius: 0,
              border: '1px solid rgba(255,255,255,0.3)',
              background: 'rgba(255,255,255,0.1)',
              color: '#fff',
              fontSize: 13,
              fontWeight: 500,
              padding: '8px 12px',
            }}
          />
          <button className="gfh-portal-btn" onClick={() => setIsModalOpen(true)} style={ghostBtnStyle}>
            <Icon path={icons.plus} size={16} />
            Add appliance
          </button>
        </div>
      </div>

      <div className="fade-in" style={{ ...panelStyle, minHeight: 400 }}>
        <CornerBrackets />
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: 40 }}><span className="spinner" /></div>
        ) : appliances.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <p style={{ fontSize: 14, color: THEME.textMuted, fontWeight: 500 }}>No appliances cataloged.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: `2px solid ${THEME.border}` }}>
                  {['Appliance', 'Brand / model', 'Unit / property', 'Serial #', 'Condition', 'Warranty expiry', 'Actions'].map(h => (
                    <th key={h} style={thStyle}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {appliances.map(app => (
                  <tr key={app.id} className="gfh-portal-row" style={{ borderBottom: `1px solid ${THEME.border}` }}>
                    <td style={{ ...tdStyle, fontWeight: 700 }}>{app.name}</td>
                    <td style={tdStyle}>
                      {app.brand} <span style={{ fontSize: 12, color: THEME.textMuted }}>({app.model_number || 'N/A'})</span>
                    </td>
                    <td style={tdStyle}>
                      Unit {app.unit?.number} <span style={{ fontSize: 12, color: THEME.textMuted }}>({app.unit?.property?.name})</span>
                    </td>
                    <td style={{ ...tdStyle, fontSize: 12.5, fontFamily: 'monospace', color: THEME.textMuted }}>{app.serial_number || 'N/A'}</td>
                    <td style={tdStyle}>
                      <span style={{ backgroundColor: (CONDITION_COLOR[app.condition] || '#888') + '22', color: CONDITION_COLOR[app.condition] || '#888', padding: '4px 10px', borderRadius: 0, fontSize: 12, fontWeight: 700, letterSpacing: '0.3px' }}>
                        {(app.condition || '—').toString().replace(/_/g, ' ').toUpperCase()}
                      </span>
                    </td>
                    <td style={tdStyle}>{app.warranty_expiry || 'N/A'}</td>
                    <td style={tdStyle}>
                      <button
                        className="gfh-portal-btn"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '5px 10px', fontSize: 12, fontWeight: 700, borderRadius: 0, background: '#991b1b', color: '#fff', border: 'none', cursor: 'pointer' }}
                        onClick={() => handleDelete(app.id)}
                      >
                        <Icon path={ICONS.trash} size={12} />
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 61, 58, 0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div
            className="fade-in"
            style={{
              position: 'relative',
              width: 480,
              padding: 30,
              background: '#ffffff',
              borderRadius: 0,
              border: `1px solid ${THEME.border}`,
            }}
          >
            <CornerBrackets />
            <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 22, fontWeight: 700, marginBottom: 20, color: THEME.purple }}>
              Add appliance
            </h2>
            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div>
                  <label style={labelStyle}>Unit ID</label>
                  <input type="number" style={inputStyle} value={formData.unit_id} onChange={e => setFormData({ ...formData, unit_id: e.target.value })} required />
                </div>
                <div>
                  <label style={labelStyle}>Appliance name</label>
                  <input style={inputStyle} placeholder="e.g. Refrigerator" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div>
                  <label style={labelStyle}>Brand</label>
                  <input style={inputStyle} placeholder="e.g. Samsung" value={formData.brand} onChange={e => setFormData({ ...formData, brand: e.target.value })} required />
                </div>
                <div>
                  <label style={labelStyle}>Model number</label>
                  <input style={inputStyle} value={formData.model_number} onChange={e => setFormData({ ...formData, model_number: e.target.value })} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div>
                  <label style={labelStyle}>Serial number</label>
                  <input style={inputStyle} value={formData.serial_number} onChange={e => setFormData({ ...formData, serial_number: e.target.value })} />
                </div>
                <div>
                  <label style={labelStyle}>Condition</label>
                  <select style={inputStyle} value={formData.condition} onChange={e => setFormData({ ...formData, condition: e.target.value as any })}>
                    <option value="brand_new">Brand new</option>
                    <option value="good">Good</option>
                    <option value="needs_repair">Needs repair</option>
                    <option value="replaced">Replaced</option>
                  </select>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div>
                  <label style={labelStyle}>Purchase date</label>
                  <input type="date" style={inputStyle} value={formData.purchase_date} onChange={e => setFormData({ ...formData, purchase_date: e.target.value })} />
                </div>
                <div>
                  <label style={labelStyle}>Warranty expiry</label>
                  <input type="date" style={inputStyle} value={formData.warranty_expiry} onChange={e => setFormData({ ...formData, warranty_expiry: e.target.value })} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 10 }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  style={{ borderRadius: 0, fontWeight: 700, fontSize: 13, padding: '9px 16px', background: '#f6f1fe', color: THEME.purple, border: `1px solid ${THEME.border}`, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button type="submit" className="gfh-portal-btn" style={ghostBtnStyle}>
                  Save appliance
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
