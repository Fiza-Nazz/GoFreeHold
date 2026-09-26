import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../api/axios'
import { THEME, Icon, ICONS, portalPageCss, heroStyle, panelStyle, thStyle, tdStyle } from '../../components/gfh/adminTheme'

interface Owner {
  id: number
  name: string
  email?: string | null
}

interface Tenant {
  id: number
  owner_id?: number | null
  owner?: Owner | null
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
  owner_id?: number | null
  tenant_id?: number | null
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
  const [owners, setOwners] = useState<Owner[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [ownerFilter, setOwnerFilter] = useState('')
  const [formData, setFormData] = useState({ owner_id: '', name: '', email: '', address: '', contact: '', emirates_id: '', phone: '', nationality: '', passport_number: '' })

  const basePath = typeof window !== 'undefined' && window.location.pathname.startsWith('/owner') ? '/owner' : '/admin'
  const isOwnerPortal = basePath === '/owner'

  useEffect(() => {
    const apiPrefix = isOwnerPortal ? '/owner' : '/admin'
    setIsLoading(true)
    Promise.all([
      api.get(`${apiPrefix}/tenants`),
      api.get(`${apiPrefix}/properties/owners`).catch(() => ({ data: { data: { owners: [] } } })),
      api.get(`${apiPrefix}/contracts`).catch(() => ({ data: { data: { contracts: [] } } })),
    ])
      .then(([tenantResponse, ownerResponse, contractResponse]) => {
        const loadedTenants: Tenant[] = tenantResponse.data?.data?.tenants || []
        const loadedOwners: Owner[] = ownerResponse.data?.data?.owners || []
        const loadedContracts: Contract[] = contractResponse?.data?.data?.contracts || []
        setTenants(loadedTenants)
        setOwners(loadedOwners)
        setContracts(loadedContracts)
        if (loadedOwners.length === 1 && loadedOwners[0]?.id) {
          setFormData(prev => ({ ...prev, owner_id: prev.owner_id || String(loadedOwners[0].id) }))
        }
      })
      .catch((err) => setError(err.response?.data?.message || 'Unable to load tenant data.'))
      .finally(() => setIsLoading(false))
  }, [mode, basePath, isOwnerPortal])

  const currentOwnerId = useMemo(() => {
    if (!isOwnerPortal) return null
    if (owners[0]?.id) return Number(owners[0].id)
    const fromContract = contracts.find(c => c.owner_id)?.owner_id
    return fromContract ? Number(fromContract) : null
  }, [isOwnerPortal, owners, contracts])

  const ownerMap = useMemo(() => {
    const map = new Map<number, string>()
    owners.forEach(o => map.set(Number(o.id), o.name))
    return map
  }, [owners])

  const ownerContractTenantIds = useMemo(() => {
    const ids = new Set<number>()
    contracts.forEach(c => {
      if (!currentOwnerId || !c.owner_id || Number(c.owner_id) === Number(currentOwnerId)) {
        const tid = c.tenant?.id ?? c.tenant_id
        if (tid) ids.add(Number(tid))
      }
    })
    return ids
  }, [contracts, currentOwnerId])

  const visibleTenants = useMemo(() => {
    let result = tenants

    // Strict Owner isolation: Owner 1 can ONLY see Owner 1's tenants, never Owner 2's tenants
    if (isOwnerPortal) {
      result = result.filter(tenant => {
        if (tenant.owner_id != null) {
          return currentOwnerId != null ? Number(tenant.owner_id) === Number(currentOwnerId) : true
        }
        return ownerContractTenantIds.has(Number(tenant.id))
      })
    } else if (ownerFilter) {
      result = result.filter(tenant => String(tenant.owner_id || '') === String(ownerFilter))
    }

    if (mode === 'previous') {
      const previousIds = new Set(
        contracts
          .filter(contract => inactiveStatuses.has((contract.status || '').toLowerCase()) || new Date(contract.end_date) < new Date())
          .map(contract => contract.tenant?.id ?? contract.tenant_id)
          .filter(Boolean)
          .map(Number)
      )
      result = result.filter(tenant => previousIds.has(Number(tenant.id)))
    }

    const query = search.trim().toLowerCase()
    if (!query) return result
    return result.filter(tenant =>
      [tenant.name, tenant.email, tenant.phone, tenant.contact, tenant.emirates_id, tenant.owner?.name || (tenant.owner_id ? ownerMap.get(Number(tenant.owner_id)) : '')]
        .some(value => (value || '').toLowerCase().includes(query))
    )
  }, [contracts, mode, search, tenants, isOwnerPortal, currentOwnerId, ownerContractTenantIds, ownerFilter, ownerMap])

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!isOwnerPortal && !formData.owner_id) {
      setError('Please select which Property Owner this tenant belongs to.')
      return
    }
    setIsSaving(true)
    setError('')
    try {
      const apiPrefix = isOwnerPortal ? '/owner' : '/admin'
      const payload: Record<string, any> = { ...formData }
      if (isOwnerPortal && currentOwnerId) {
        payload.owner_id = currentOwnerId
      } else if (payload.owner_id) {
        payload.owner_id = Number(payload.owner_id)
      } else {
        delete payload.owner_id
      }
      await api.post(`${apiPrefix}/tenants`, payload)
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
          <div><h1 style={{ margin: 0, color: THEME.ink, fontSize: 24, fontWeight: 800 }}>Add Tenant</h1><p style={{ margin: '6px 0 0', color: THEME.textMuted, fontSize: 13 }}>Create a tenant record scoped to the property owner</p></div>
          <button type="button" onClick={() => navigate(`${basePath}/tenants`)} style={{ padding: '10px 15px', border: '1px solid #A7F3DC', background: '#ECFDF8', color: '#065F46', cursor: 'pointer', fontWeight: 700 }}>← Tenant List</button>
        </div>
        <div className="fade-in" style={{ ...panelStyle, width: '100%', minHeight: 0 }}>
          {error && <div role="alert" style={{ marginBottom: 16, padding: 11, border: '1px solid #FECACA', borderRadius: 8, background: '#FEF2F2', color: '#991B1B', fontWeight: 600 }}>{error}</div>}
          <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20, width: '100%' }}>
            {!isOwnerPortal && (
              <div>
                <label style={labelStyle} htmlFor="tenant-owner_id">Property Owner *</label>
                <select
                  id="tenant-owner_id"
                  required
                  style={inputStyle}
                  value={formData.owner_id}
                  onChange={event => setFormData({ ...formData, owner_id: event.target.value })}
                >
                  <option value="">-- Select Property Owner --</option>
                  {owners.map(owner => (
                    <option key={owner.id} value={owner.id}>{owner.name}{owner.email ? ` (${owner.email})` : ''}</option>
                  ))}
                </select>
              </div>
            )}
            {tenantFields.map(field => <div key={field.key}><label style={labelStyle} htmlFor={`tenant-${field.key}`}>{field.label}{field.required ? ' *' : ''}</label><input id={`tenant-${field.key}`} type={field.key === 'email' ? 'email' : 'text'} required={field.required} style={inputStyle} value={formData[field.key]} onChange={event => setFormData({ ...formData, [field.key]: event.target.value })} /></div>)}
            <div style={{ gridColumn: '1 / -1' }}><label style={labelStyle} htmlFor="tenant-address">Address</label><textarea id="tenant-address" style={{ ...inputStyle, minHeight: 80, resize: 'vertical' }} value={formData.address} onChange={event => setFormData({ ...formData, address: event.target.value })} /></div>
            <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button type="button" onClick={() => navigate(`${basePath}/tenants`)} style={{ padding: '10px 18px', border: '1px solid #CBD5E1', background: '#FFFFFF', color: '#475569', cursor: 'pointer', fontWeight: 700 }}>Cancel</button>
              <button type="submit" disabled={isSaving} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '10px 20px', border: 'none', background: '#10B981', color: '#FFFFFF', cursor: isSaving ? 'wait' : 'pointer', fontWeight: 700, opacity: isSaving ? 0.7 : 1 }}><Icon path={ICONS.plus} size={16} />{isSaving ? 'Saving…' : 'Save Tenant'}</button>
            </div>
          </form>
        </div>
      </div>
    )
  }

  const tableHeaders = isOwnerPortal
    ? ['Tenant', 'Email', 'Phone', 'Emirates ID', 'Nationality', 'Passport #']
    : ['Tenant', 'Owner', 'Email', 'Phone', 'Emirates ID', 'Nationality', 'Passport #']

  return (
    <div className="gfh-portal-page">
      <style>{portalPageCss}</style>
      <div className="fade-in" style={heroStyle}>
        <div><h1 style={{ margin: 0, color: THEME.ink, fontSize: 24, fontWeight: 800 }}>{mode === 'previous' ? 'Previous Tenants' : 'Tenant List'}</h1><p style={{ margin: '6px 0 0', color: THEME.textMuted, fontSize: 13 }}>{mode === 'previous' ? 'Tenants whose contracts ended or are no longer active' : 'View tenant records available for contracts'}</p></div>
        <button type="button" onClick={() => navigate(`${basePath}/tenants/add`)} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '10px 16px', border: 'none', background: '#10B981', color: '#FFFFFF', cursor: 'pointer', fontWeight: 700 }}><Icon path={ICONS.plus} size={16} />Add Tenant</button>
      </div>
      <div className="fade-in" style={{ ...panelStyle, minHeight: 360 }}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 18 }}>
          <input aria-label="Search tenants" placeholder="Search tenants..." value={search} onChange={event => setSearch(event.target.value)} style={{ ...inputStyle, maxWidth: 360 }} />
          {!isOwnerPortal && (
            <select
              aria-label="Filter by owner"
              value={ownerFilter}
              onChange={event => setOwnerFilter(event.target.value)}
              style={{ ...inputStyle, maxWidth: 260 }}
            >
              <option value="">All Property Owners</option>
              {owners.map(owner => (
                <option key={owner.id} value={owner.id}>{owner.name}</option>
              ))}
            </select>
          )}
        </div>
        {error ? <div role="alert" style={{ color: '#991B1B', fontWeight: 600 }}>{error}</div> : isLoading ? <div style={{ padding: 40, textAlign: 'center' }}><span className="spinner" /></div> : visibleTenants.length === 0 ? <div style={{ padding: 40, textAlign: 'center', color: THEME.textMuted }}>No {mode === 'previous' ? 'previous ' : ''}tenants found.</div> : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>{tableHeaders.map(header => <th key={header} style={thStyle}>{header}</th>)}</tr>
              </thead>
              <tbody>
                {visibleTenants.map(tenant => {
                  const resolvedOwnerName = tenant.owner?.name || (tenant.owner_id ? ownerMap.get(Number(tenant.owner_id)) : '') || '—'
                  return (
                    <tr key={tenant.id} className="gfh-portal-row" style={{ borderBottom: `1px solid ${THEME.border}` }}>
                      <td style={{ ...tdStyle, fontWeight: 700 }}>{tenant.name}</td>
                      {!isOwnerPortal && (
                        <td style={tdStyle}>
                          <span style={{ display: 'inline-block', padding: '3px 9px', borderRadius: 6, background: '#ECFDF5', color: '#065F46', border: '1px solid #A7F3D0', fontSize: 12, fontWeight: 600 }}>
                            {resolvedOwnerName}
                          </span>
                        </td>
                      )}
                      <td style={tdStyle}>{tenant.email || '—'}</td>
                      <td style={tdStyle}>{tenant.phone || tenant.contact || '—'}</td>
                      <td style={tdStyle}>{tenant.emirates_id || '—'}</td>
                      <td style={tdStyle}>{tenant.nationality || '—'}</td>
                      <td style={tdStyle}>{tenant.passport_number || '—'}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
