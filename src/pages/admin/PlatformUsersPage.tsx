import { useEffect, useMemo, useState } from 'react'
import {
  createPlatformUser,
  disablePlatformUser,
  enablePlatformUser,
  fetchOrganizations,
  fetchPlatformUsers,
} from '../../api/platform'
import type { Organization, PlatformUser } from '../../types/platform'
import { THEME, portalPageCss } from '../../components/gfh/adminTheme'

const inputStyle: React.CSSProperties = {
  width: '100%',
  boxSizing: 'border-box',
  padding: '10px 12px',
  border: '1px solid #CBD5E1',
  borderRadius: 8,
  fontSize: 13.5,
}

export default function PlatformUsersPage() {
  const [users, setUsers] = useState<PlatformUser[]>([])
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    name: '',
    email: '',
    role: 'owner' as 'admin' | 'owner',
    organization_id: '',
    password: '',
  })

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const [list, orgs] = await Promise.all([
        fetchPlatformUsers(),
        fetchOrganizations().catch(() => [] as Organization[]),
      ])
      setUsers(list)
      setOrganizations(orgs)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Unable to load platform users.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return users
    return users.filter((user) =>
      [user.name, user.email, user.role, user.organization?.name]
        .some((value) => (value || '').toLowerCase().includes(q)),
    )
  }, [users, query])

  const handleCreate = async (event: React.FormEvent) => {
    event.preventDefault()
    if (form.role === 'owner' && !form.organization_id) {
      alert('Owner users require an organization.')
      return
    }
    setSaving(true)
    try {
      await createPlatformUser({
        name: form.name,
        email: form.email,
        role: form.role,
        organization_id: form.organization_id ? Number(form.organization_id) : null,
        password: form.password || undefined,
      })
      setShowCreate(false)
      setForm({ name: '', email: '', role: 'owner', organization_id: '', password: '' })
      await load()
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to create user.')
    } finally {
      setSaving(false)
    }
  }

  const toggleUser = async (user: PlatformUser) => {
    try {
      if (user.account_status === 'disabled') await enablePlatformUser(user.id)
      else await disablePlatformUser(user.id)
      await load()
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update user.')
    }
  }

  return (
    <div>
      <style>{portalPageCss}</style>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', marginBottom: 18 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700, color: THEME.ink }}>Platform Users</h1>
          <p style={{ margin: '6px 0 0', color: THEME.textMuted, fontSize: 14 }}>
            Manage platform admins and organization owners
          </p>
        </div>
        <button type="button" onClick={() => setShowCreate(true)} style={{ padding: '10px 16px', border: 'none', borderRadius: 8, background: '#10B981', color: '#fff', fontWeight: 600, cursor: 'pointer' }}>
          + Invite / Create User
        </button>
      </div>

      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search usersΓÇª"
        style={{ ...inputStyle, maxWidth: 320, marginBottom: 14 }}
      />

      {error && (
        <div style={{ padding: 14, borderRadius: 10, background: '#FEF2F2', border: '1px solid #FECACA', color: '#991B1B', marginBottom: 14 }}>
          {error}
        </div>
      )}

      {loading ? (
        <div style={{ padding: 40, color: THEME.textMuted }}>Loading usersΓÇª</div>
      ) : (
        <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 12, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                {['Name', 'Email', 'Role', 'Organization', 'Status', 'Actions'].map((h) => (
                  <th key={h} style={{ textAlign: 'left', padding: '12px 14px', fontSize: 11, color: '#64748B', textTransform: 'uppercase' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((user) => (
                <tr key={user.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                  <td style={{ padding: 14, fontWeight: 600 }}>{user.name}</td>
                  <td style={{ padding: 14 }}>{user.email}</td>
                  <td style={{ padding: 14 }}>{user.role}</td>
                  <td style={{ padding: 14 }}>{user.organization?.name || (user.role === 'admin' ? 'Platform' : 'ΓÇö')}</td>
                  <td style={{ padding: 14 }}>{user.account_status || 'active'}</td>
                  <td style={{ padding: 14 }}>
                    <button
                      type="button"
                      onClick={() => void toggleUser(user)}
                      style={{
                        padding: '7px 12px',
                        borderRadius: 8,
                        border: '1px solid #CBD5E1',
                        background: '#fff',
                        cursor: 'pointer',
                        fontWeight: 600,
                        fontSize: 12,
                        color: user.account_status === 'disabled' ? '#065F46' : '#991B1B',
                      }}
                    >
                      {user.account_status === 'disabled' ? 'Enable' : 'Disable'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showCreate && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 16 }}>
          <form onSubmit={handleCreate} style={{ width: '100%', maxWidth: 440, background: '#fff', borderRadius: 14, padding: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <h2 style={{ margin: 0, fontSize: 18 }}>Create platform user</h2>
            <input required placeholder="Full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} style={inputStyle} />
            <input required type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} style={inputStyle} />
            <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as 'admin' | 'owner' })} style={inputStyle}>
              <option value="owner">Organization owner</option>
              <option value="admin">Platform admin</option>
            </select>
            {form.role === 'owner' && (
              <select required value={form.organization_id} onChange={(e) => setForm({ ...form, organization_id: e.target.value })} style={inputStyle}>
                <option value="">Select organization</option>
                {organizations.map((org) => (
                  <option key={org.id} value={org.id}>{org.name}</option>
                ))}
              </select>
            )}
            <input type="password" placeholder="Temporary password (optional)" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} style={inputStyle} />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <button type="button" onClick={() => setShowCreate(false)} style={{ padding: '9px 14px', borderRadius: 8, border: '1px solid #CBD5E1', background: '#fff', cursor: 'pointer' }}>Cancel</button>
              <button type="submit" disabled={saving} style={{ padding: '9px 16px', borderRadius: 8, border: 'none', background: '#10B981', color: '#fff', fontWeight: 600, cursor: 'pointer' }}>
                {saving ? 'SavingΓÇª' : 'Create'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
