import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../api/axios'
import { THEME, Icon, ICONS, portalPageCss, heroStyle } from '../../components/gfh/adminTheme'

interface Owner {
  id: number
  name: string
  email: string
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  boxSizing: 'border-box',
  padding: '12px 14px',
  border: '1px solid #CBD5E1',
  borderRadius: 8,
  background: '#FFFFFF',
  color: '#0F172A',
  fontSize: 13.5,
  minHeight: 46,
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  marginBottom: 6,
  color: '#334155',
  fontSize: 12,
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '0.35px',
}

export default function AddPropertyPage() {
  const navigate = useNavigate()
  const [owners, setOwners] = useState<Owner[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    owner_id: '',
    name: '',
    address: '',
    city: '',
    type: 'residential',
  })

  const basePath = typeof window !== 'undefined' && window.location.pathname.startsWith('/owner') ? '/owner' : '/admin'

  useEffect(() => {
    api.get(`${basePath}/properties/owners`)
      .then(response => {
        const list = response.data?.data?.owners || []
        setOwners(list)
        if (list.length === 1) {
          setFormData(prev => ({ ...prev, owner_id: String(list[0].id) }))
        }
      })
      .catch((err) => setError(err.response?.data?.message || 'Unable to load owners.'))
      .finally(() => setIsLoading(false))
  }, [])

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (isSaving) return
    setIsSaving(true)
    setError('')
    try {
      await api.post('/admin/properties', formData)
      navigate(`${basePath}/properties`, { state: { message: 'Property created successfully.' } })
    } catch (err: any) {
      setError(err.response?.data?.message || 'Unable to create property.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="gfh-portal-page gfh-add-property-page" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      <style>{portalPageCss}</style>
      <style>{`
        .gfh-add-property-page { padding: 0; width: 100%; }
        .gfh-add-property-panel {
          width: 100%;
          max-width: 100%;
          min-width: 0;
          box-sizing: border-box;
          margin: 22px 0 0;
          padding: 28px;
          background: #FFFFFF;
          border: 1px solid #E2E8F0;
          border-radius: 16px;
          box-shadow: 0 2px 5px rgba(15, 23, 42, 0.04);
        }
        .gfh-property-form-row { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 18px; }
        .gfh-property-form-row > div { min-width: 0; }
        .gfh-add-property-panel input:focus-visible,
        .gfh-add-property-panel select:focus-visible,
        .gfh-add-property-panel textarea:focus-visible { outline: 2px solid #0F8A67; outline-offset: 2px; }
        .gfh-property-type-field { border-color: #80CBB4 !important; background: #F4FCF8 !important; }
        @media (max-width: 600px) {
          .gfh-add-property-panel { padding: 20px 16px; margin-top: 16px; }
          .gfh-property-form-row { grid-template-columns: minmax(0, 1fr); }
          .gfh-add-property-page .gfh-property-form-header { padding: 20px 16px !important; }
        }
      `}</style>
      <div className="fade-in gfh-property-form-header" style={{ ...heroStyle, marginBottom: 0 }}>
        <div>
          <h1 style={{ margin: 0, color: THEME.ink, fontSize: 24, fontWeight: 800 }}>Add Property</h1>
          <p style={{ margin: '6px 0 0', color: THEME.textMuted, fontSize: 13 }}>Register a new property and assign its owner</p>
        </div>
        <button type="button" className="gfh-portal-btn" onClick={() => navigate(`${basePath}/properties`)} style={{ border: '1px solid #A7F3DC', background: '#ECFDF8', color: '#065F46', padding: '10px 15px', cursor: 'pointer', fontWeight: 700 }}>
          ← Back to Buildings
        </button>
      </div>

      <div className="fade-in gfh-add-property-panel">
        {error && <div role="alert" style={{ marginBottom: 18, padding: '11px 13px', borderRadius: 8, border: '1px solid #FECACA', background: '#FEF2F2', color: '#991B1B', fontSize: 13, fontWeight: 600 }}>{error}</div>}
        {isLoading ? (
          <div style={{ padding: 40, textAlign: 'center' }}><span className="spinner" /></div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 22 }}>
            <div className="gfh-property-form-row">
              <div>
                <label style={labelStyle} htmlFor="property-owner">Owner</label>
                <select id="property-owner" style={inputStyle} value={formData.owner_id} onChange={event => setFormData({ ...formData, owner_id: event.target.value })} required>
                  <option value="">Select owner</option>
                  {owners.map(owner => <option key={owner.id} value={owner.id}>{owner.name} ({owner.email})</option>)}
                </select>
              </div>
              <div>
                <label style={{ ...labelStyle, color: '#065F46' }} htmlFor="property-type">Property Type</label>
                <select id="property-type" className="gfh-property-type-field" style={inputStyle} value={formData.type} onChange={event => setFormData({ ...formData, type: event.target.value })} required>
                  <option value="residential">Residential</option>
                  <option value="commercial">Commercial</option>
                  <option value="mixed">Mixed</option>
                </select>
              </div>
            </div>
            <div>
              <label style={labelStyle} htmlFor="property-name">Property Name</label>
              <input id="property-name" style={inputStyle} value={formData.name} onChange={event => setFormData({ ...formData, name: event.target.value })} placeholder="e.g. Marina Tower" maxLength={255} required />
            </div>
            <div>
              <label style={labelStyle} htmlFor="property-address">Address</label>
              <textarea id="property-address" style={{ ...inputStyle, minHeight: 100, resize: 'vertical' }} value={formData.address} onChange={event => setFormData({ ...formData, address: event.target.value })} placeholder="Full property address" maxLength={255} required />
            </div>
            <div>
              <label style={labelStyle} htmlFor="property-city">City</label>
              <input id="property-city" style={inputStyle} value={formData.city} onChange={event => setFormData({ ...formData, city: event.target.value })} placeholder="e.g. Dubai" maxLength={255} required />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, flexWrap: 'wrap' }}>
              <button type="button" onClick={() => navigate(`${basePath}/properties`)} style={{ padding: '10px 18px', border: '1px solid #CBD5E1', background: '#FFFFFF', color: '#475569', cursor: 'pointer', fontWeight: 700 }}>Cancel</button>
              <button type="submit" disabled={isSaving} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '10px 20px', border: 'none', background: '#0F8A67', color: '#FFFFFF', cursor: isSaving ? 'wait' : 'pointer', fontWeight: 700, opacity: isSaving ? 0.7 : 1 }}>
                <Icon path={ICONS.plus} size={16} />
                {isSaving ? 'Saving…' : 'Save Property'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}