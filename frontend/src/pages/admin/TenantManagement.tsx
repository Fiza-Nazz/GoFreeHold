import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../api/axios'
import { THEME, Icon, ICONS, portalPageCss, heroStyle, panelStyle, thStyle, tdStyle } from '../../components/gfh/adminTheme'

interface Tenant {
  id: number
  name: string
  email?: string | null
  phone?: string | null
  contact?: string | null
  emirates_id?: string | null
  nationality?: string | null
  passport_number?: string | null
}

interface Contract {
  id: number
  status: string
  end_date: string
  tenant?: Tenant | null
}

interface Props {
  mode?: 'list' | 'add' | 'previous'
}

const inactiveStatuses = new Set(['expired', 'terminated', 'vacated', 'settled', 'completed', 'cancelled'])

const inputStyle: React.CSSProperties = { width: '100%', boxSizing: 'border-box', padding: '10px 12px', border: '1px solid #CBD5E1', borderRadius: 8, color: '#0F172A', background: '#FFFFFF', fontSize: 13.5, outline: 'none' }
const labelStyle: React.CSSProperties = { display: 'block', marginBottom: 6, color: '#334155', fontSize: 11.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.35px' }

export default function TenantManagement({ mode = 'list' }: Props) {
  const navigate = useNavigate()
  const [tenants, setTenants] = useState<Tenant[]>([])
  const [contracts, setContracts] = useState<Contract[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [formData, setFormData] = useState({ name: '', email: '', address: '', contact: '', emirates_id: '', phone: '', nationality: '', passport_number: '' })

  const basePath = typeof window !== 'undefined' && window.location.pathname.startsWith('/owner') ? '/owner' : '/admin'

  useEffect(() => {
    const requests: Promise<any>[] = [api.get('/admin/tenants')]
    if (mode === 'previous') requests.push(api.get('/admin/contracts'))
    Promise.all(requests)
      .then(([tenantResponse, contractResponse]) => {
        setTenants(tenantResponse.data?.data?.tenants || [])
        setContracts(contractResponse?.data?.data?.contracts || [])
      })
      .catch((err) => setError(err.response?.data?.message || 'Unable to load tenant data.'))
      .finally(() => setIsLoading(false))
  }, [mode])

  const visibleTenants = useMemo(() => {
    let result = tenants
    if (mode === 'previous') {
      const previousIds = new Set(contracts.filter(contract => inactiveStatuses.has((contract.status || '').toLowerCase()) || new Date(contract.end_date) < new Date()).map(contract => contract.tenant?.id).filter(Boolean))
      result = result.filter(tenant => previousIds.has(tenant.id))
    }
    const query = search.trim().toLowerCase()
    if (!query) return result
    return result.filter(tenant => [tenant.name, tenant.email, tenant.phone, tenant.contact, tenant.emirates_id].some(value => (value || '').toLowerCase().includes(query)))
  }, [contracts, mode, search, tenants])

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setIsSaving(true)
    setError('')
    try {
      await api.post('/admin/tenants', formData)
      navigate(`${basePath}/tenants`)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Unable to add tenant.')
    } finally {
      setIsSaving(false)
    }
  }

  const tenantFields: Array<{ key: keyof typeof formData; label: string; required?: boolean }> = [
    { key: 'name', label: 'Full Name', required: true },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Phone' },
    { key: 'contact', label: 'Alternative Contact' },
    { key: 'emirates_id', label: 'Emirates ID' },
    { key: 'nationality', label: 'Nationality' },
    { key: 'passport_number', label: 'Passport Number' },
  ]

  if (mode === 'add') {
    return (
      <div className="gfh-portal-page">
        <style>{portalPageCss}</style>
        <div className="fade-in" style={heroStyle}>
          <div><h1 style={{ margin: 0, color: THEME.ink, fontSize: 24, fontWeight: 800 }}>Add Tenant</h1><p style={{ margin: '6px 0 0', color: THEME.textMuted, fontSize: 13 }}>Create a tenant record for contract assignment</p></div>
          <button type="button" onClick={() => navigate(`${basePath}/tenants`)} style={{ padding: '10px 15px', border: '1px solid #A7F3DC', background: '#ECFDF8', color: '#065F46', cursor: 'pointer', fontWeight: 700 }}>← Tenant List</button>
        </div>
        <div className="fade-in" style={{ ...panelStyle, width: '100%', minHeight: 0 }}>
          {error && <div role="alert" style={{ marginBottom: 16, padding: 11, border: '1px solid #FECACA', borderRadius: 8, background: '#FEF2F2', color: '#991B1B', fontWeight: 600 }}>{error}</div>}
          <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20, width: '100%' }}>
            {tenantFields.map(field => <div key={field.key}><label style={labelStyle} htmlFor={`tenant-${field.key}`}>{field.label}</label><input id={`tenant-${field.key}`} type={field.key === 'email' ? 'email' : 'text'} required={field.required} style={inputStyle} value={formData[field.key]} onChange={event => setFormData({ ...formData, [field.key]: event.target.value })} /></div>)}
            <div style={{ gridColumn: '1 / -1' }}><label style={labelStyle} htmlFor="tenant-address">Address</label><textarea id="tenant-address" style={{ ...inputStyle, minHeight: 80, resize: 'vertical' }} value={formData.address} onChange={event => setFormData({ ...formData, address: event.target.value })} /></div>
            <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button type="button" onClick={() => navigate(`${basePath}/tenants`)} style={{ padding: '10px 18px', border: '1px solid #CBD5E1', background: '#FFFFFF', color: '#475569', cursor: 'pointer', fontWeight: 700 }}>Cancel</button>
              <button type="submit" disabled={isSaving} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '10px 20px', border: 'none', background: '#0F8A67', color: '#FFFFFF', cursor: isSaving ? 'wait' : 'pointer', fontWeight: 700, opacity: isSaving ? 0.7 : 1 }}><Icon path={ICONS.plus} size={16} />{isSaving ? 'Saving…' : 'Save Tenant'}</button>
            </div>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="gfh-portal-page">
      <style>{portalPageCss}</style>
      <div className="fade-in" style={heroStyle}>
        <div><h1 style={{ margin: 0, color: THEME.ink, fontSize: 24, fontWeight: 800 }}>{mode === 'previous' ? 'Previous Tenants' : 'Tenant List'}</h1><p style={{ margin: '6px 0 0', color: THEME.textMuted, fontSize: 13 }}>{mode === 'previous' ? 'Tenants whose contracts ended or are no longer active' : 'View tenant records available for contracts'}</p></div>
        <button type="button" onClick={() => navigate(`${basePath}/tenants/add`)} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '10px 16px', border: 'none', background: '#0F8A67', color: '#FFFFFF', cursor: 'pointer', fontWeight: 700 }}><Icon path={ICONS.plus} size={16} />Add Tenant</button>
      </div>
      <div className="fade-in" style={{ ...panelStyle, minHeight: 360 }}>
        <input aria-label="Search tenants" placeholder="Search tenants..." value={search} onChange={event => setSearch(event.target.value)} style={{ ...inputStyle, maxWidth: 360, marginBottom: 18 }} />
        {error ? <div role="alert" style={{ color: '#991B1B', fontWeight: 600 }}>{error}</div> : isLoading ? <div style={{ padding: 40, textAlign: 'center' }}><span className="spinner" /></div> : visibleTenants.length === 0 ? <div style={{ padding: 40, textAlign: 'center', color: THEME.textMuted }}>No {mode === 'previous' ? 'previous ' : ''}tenants found.</div> : (
          <div style={{ overflowX: 'auto' }}><table style={{ width: '100%', borderCollapse: 'collapse' }}><thead><tr>{['Tenant', 'Email', 'Phone', 'Emirates ID', 'Nationality', 'Passport #'].map(header => <th key={header} style={thStyle}>{header}</th>)}</tr></thead><tbody>{visibleTenants.map(tenant => <tr key={tenant.id} className="gfh-portal-row" style={{ borderBottom: `1px solid ${THEME.border}` }}><td style={{ ...tdStyle, fontWeight: 700 }}>{tenant.name}</td><td style={tdStyle}>{tenant.email || '—'}</td><td style={tdStyle}>{tenant.phone || tenant.contact || '—'}</td><td style={tdStyle}>{tenant.emirates_id || '—'}</td><td style={tdStyle}>{tenant.nationality || '—'}</td><td style={tdStyle}>{tenant.passport_number || '—'}</td></tr>)}</tbody></table></div>
        )}
      </div>
    </div>
  )
}
