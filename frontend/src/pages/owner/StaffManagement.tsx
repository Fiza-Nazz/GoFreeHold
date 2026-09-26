import { useEffect, useState } from 'react'
import api from '../../api/axios'
import { requestError } from '../../components/rbac/helpers'
import { THEME, ADMIN_COLORS } from '../../components/gfh/adminTheme'

type Staff = {
  id: number
  name: string
  email: string
  role: string
  account_status: string
  invitation_status: string
  unfinished_jobs: number
}

export default function StaffManagement() {
  const [rows, setRows] = useState<Staff[]>([])
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [busy, setBusy] = useState(false)
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ name: '', email: '', role: 'cashier', password: '' })
  const [edit, setEdit] = useState<number | null>(null)
  const [page, setPage] = useState(1)
  const [last, setLast] = useState(1)
  const [revision, refresh] = useState(0)
  const [search, setSearch] = useState('')

  useEffect(() => {
    const c = new AbortController()
    setLoading(true)
    setError('')
    api
      .get('/owner/staff', { params: { page, search }, signal: c.signal })
      .then(({ data }) => {
        setRows(data.data.staff)
        setLast(data.data.last_page)
      })
      .catch((e) => {
        if (!c.signal.aborted) setError(requestError(e))
      })
      .finally(() => {
        if (!c.signal.aborted) setLoading(false)
      })
    return () => c.abort()
  }, [page, revision, search])

  async function save(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError('')
    setNotice('')
    try {
      const payload: any = { name: form.name, role: form.role }
      if (form.password) payload.password = form.password
      if (!edit) {
        payload.email = form.email
      }
      const { data } = edit
        ? await api.patch('/owner/staff/' + edit, payload)
        : await api.post('/owner/staff', payload)
      setNotice(edit ? 'Staff updated successfully.' : 'Staff created successfully! Account is active and can log in immediately.')
      setForm({ name: '', email: '', role: 'cashier', password: '' })
      setEdit(null)
      refresh((v) => v + 1)
    } catch (e) {
      setError(requestError(e))
    } finally {
      setBusy(false)
    }
  }

  async function action(row: Staff, kind: string) {
    if (kind === 'delete') {
      if (!window.confirm(`Are you sure you want to delete ${row.name}'s staff account?`)) return
      setBusy(true)
      setError('')
      try {
        await api.delete('/owner/staff/' + row.id)
        setNotice('Staff account deleted successfully.')
        refresh((v) => v + 1)
      } catch (e) {
        setError(requestError(e))
      } finally {
        setBusy(false)
      }
      return
    }

    let reason = ''
    if (kind === 'disable') {
      const answer = window.prompt('Reason for disabling this staff account:')
      if (!answer?.trim()) return
      reason = answer
    }
    setBusy(true)
    setError('')
    try {
      await api.post('/owner/staff/' + row.id + '/' + kind, { reason })
      setNotice(
        kind === 'disable'
          ? 'Account disabled. Previous records remain safe. Reassign any unfinished jobs through admin.'
          : kind === 'invite'
          ? 'Invitation re-sent successfully to ' + row.email
          : 'Staff account updated.'
      )
      refresh((v) => v + 1)
    } catch (e) {
      setError(requestError(e))
    } finally {
      setBusy(false)
    }
  }

  const activeCount = rows.filter((r) => r.account_status === 'active').length
  const pendingCount = rows.filter((r) => r.account_status === 'pending').length

  return (
    <div style={{ padding: '4px 0 32px', fontFamily: "'Inter', system-ui, sans-serif" }}>
      {/* Top Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: '#0F172A', margin: 0, letterSpacing: '-0.02em' }}>
              Staff Management
            </h1>
            <p style={{ fontSize: 13.5, color: '#64748B', margin: '4px 0 0' }}>
              Delegate operational duties to Cashiers, Accountants, and Maintenance technicians across your properties.
            </p>
          </div>
        </div>
      </div>

      {/* Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
        <div
          style={{
            background: '#F0F9FF',
            borderRadius: 12,
            padding: '18px 20px',
            border: '1px solid #BAE6FD',
            boxShadow: '0 1px 3px rgba(16,24,40,0.04)',
          }}
        >
          <div style={{ fontSize: 12, fontWeight: 700, color: '#0369A1', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Total Staff
          </div>
          <div style={{ fontSize: 26, fontWeight: 800, color: '#0369A1', marginTop: 4 }}>{rows.length}</div>
        </div>

        <div
          style={{
            background: '#F0FDF4',
            borderRadius: 12,
            padding: '18px 20px',
            border: '1px solid #BBF7D0',
            boxShadow: '0 1px 3px rgba(16,24,40,0.04)',
          }}
        >
          <div style={{ fontSize: 12, fontWeight: 700, color: '#15803D', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Active Accounts
          </div>
          <div style={{ fontSize: 26, fontWeight: 800, color: '#15803D', marginTop: 4 }}>{activeCount}</div>
        </div>

        <div
          style={{
            background: '#FFFBEB',
            borderRadius: 12,
            padding: '18px 20px',
            border: '1px solid #FDE68A',
            boxShadow: '0 1px 3px rgba(16,24,40,0.04)',
          }}
        >
          <div style={{ fontSize: 12, fontWeight: 700, color: '#B45309', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Pending Invitations
          </div>
          <div style={{ fontSize: 26, fontWeight: 800, color: '#B45309', marginTop: 4 }}>{pendingCount}</div>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div
          style={{
            background: '#FEF2F2',
            border: '1px solid #FECACA',
            color: '#991B1B',
            padding: '12px 16px',
            borderRadius: 8,
            fontSize: 13,
            fontWeight: 600,
            marginBottom: 20,
          }}
          role="alert"
        >
          {error}
        </div>
      )}

      {notice && (
        <div
          style={{
            background: '#ECFDF8',
            border: '1px solid #A7F3DC',
            color: '#065F46',
            padding: '12px 16px',
            borderRadius: 8,
            fontSize: 13,
            fontWeight: 600,
            marginBottom: 20,
          }}
          role="status"
        >
          {notice}
        </div>
      )}

      {/* Add / Edit Staff Form */}
      <div
        style={{
          background: '#FFFFFF',
          borderRadius: 14,
          border: '1px solid #E2E8F0',
          padding: '24px 26px',
          boxShadow: '0 1px 3px rgba(16,24,40,0.04)',
          marginBottom: 24,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: 6,
              background: '#ECFDF8',
              color: '#0E5E48',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: 14,
            }}
          >
            +
          </div>
          <h2 style={{ fontSize: 17, fontWeight: 800, color: '#0F172A', margin: 0 }}>
            {edit ? 'Edit Staff Member' : 'Add New Staff Member'}
          </h2>
        </div>

        <form onSubmit={save} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, alignItems: 'end' }}>
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#0E5E48', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 6 }}>
              Full Name
            </label>
            <input
              required
              maxLength={255}
              placeholder="e.g. Tariq Mehmood"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              style={{
                width: '100%',
                boxSizing: 'border-box',
                padding: '10px 14px',
                borderRadius: 8,
                border: '1px solid #CBD5E1',
                fontSize: 13.5,
                color: '#0F172A',
                outline: 'none',
                fontFamily: 'inherit',
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#0E5E48', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 6 }}>
              Email Address
            </label>
            <input
              type="email"
              required
              disabled={!!edit}
              maxLength={255}
              placeholder="e.g. tariq@domain.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              style={{
                width: '100%',
                boxSizing: 'border-box',
                padding: '10px 14px',
                borderRadius: 8,
                border: '1px solid #CBD5E1',
                fontSize: 13.5,
                color: '#0F172A',
                outline: 'none',
                fontFamily: 'inherit',
                background: edit ? '#F1F5F9' : '#FFFFFF',
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#0E5E48', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 6 }}>
              Role Designation
            </label>
            <select
              aria-label="Role"
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              style={{
                width: '100%',
                boxSizing: 'border-box',
                padding: '10px 14px',
                borderRadius: 8,
                border: '1px solid #CBD5E1',
                fontSize: 13.5,
                color: '#0F172A',
                outline: 'none',
                fontFamily: 'inherit',
                background: '#FFFFFF',
              }}
            >
              <option value="cashier">Cashier (Payments & Receipts)</option>
              <option value="accountant">Accountant (Ledgers & Receivables)</option>
              <option value="maintenance">Maintenance (Complaints & Inventory)</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#0E5E48', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 6 }}>
              {edit ? 'New Password (Optional)' : 'Password'}
            </label>
            <input
              type="password"
              required={!edit}
              minLength={6}
              maxLength={255}
              placeholder={edit ? 'Leave blank to keep current' : 'Min 6 characters'}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              style={{
                width: '100%',
                boxSizing: 'border-box',
                padding: '10px 14px',
                borderRadius: 8,
                border: '1px solid #CBD5E1',
                fontSize: 13.5,
                color: '#0F172A',
                outline: 'none',
                fontFamily: 'inherit',
                background: '#FFFFFF',
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <button
              type="submit"
              disabled={busy}
              style={{
                background: '#0E5E48',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: 8,
                padding: '11px 20px',
                fontSize: 13.5,
                fontWeight: 700,
                cursor: busy ? 'not-allowed' : 'pointer',
                boxShadow: '0 2px 6px rgba(14, 94, 72, 0.25)',
                whiteSpace: 'nowrap',
              }}
            >
              {busy ? 'Saving…' : edit ? 'Save Changes' : 'Create Staff'}
            </button>
            {edit && (
              <button
                type="button"
                onClick={() => {
                  setEdit(null)
                  setForm({ name: '', email: '', role: 'cashier', password: '' })
                }}
                style={{
                  background: '#F1F5F9',
                  color: '#64748B',
                  border: '1px solid #CBD5E1',
                  borderRadius: 8,
                  padding: '11px 16px',
                  fontSize: 13.5,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Staff Listing Table */}
      <div
        style={{
          background: '#FFFFFF',
          borderRadius: 14,
          border: '1px solid #E2E8F0',
          padding: '22px 24px',
          boxShadow: '0 1px 3px rgba(16,24,40,0.04)',
        }}
      >
        {/* Table Controls */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18, gap: 14, flexWrap: 'wrap' }}>
          <div style={{ fontSize: 16, fontWeight: 800, color: '#0F172A' }}>
            Current Staff Directory
          </div>
          <div style={{ width: '100%', maxWidth: 280 }}>
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
              placeholder="Search by name or email…"
              style={{
                width: '100%',
                boxSizing: 'border-box',
                padding: '9px 14px',
                borderRadius: 8,
                border: '1px solid #CBD5E1',
                fontSize: 13,
                outline: 'none',
                fontFamily: 'inherit',
              }}
            />
          </div>
        </div>

        {loading ? (
          <div style={{ padding: '36px 0', textAlign: 'center', color: '#64748B', fontSize: 14 }}>
            Loading staff members…
          </div>
        ) : !rows.length ? (
          <div style={{ padding: '36px 0', textAlign: 'center', color: '#64748B', fontSize: 14 }}>
            No staff members found. Use the form above to invite your first staff member.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13.5, textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                  <th style={{ padding: '12px 14px', fontWeight: 700, color: '#475569', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Staff Member
                  </th>
                  <th style={{ padding: '12px 14px', fontWeight: 700, color: '#475569', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Role
                  </th>
                  <th style={{ padding: '12px 14px', fontWeight: 700, color: '#475569', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Account Status
                  </th>
                  <th style={{ padding: '12px 14px', fontWeight: 700, color: '#475569', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Invitation
                  </th>
                  <th style={{ padding: '12px 14px', fontWeight: 700, color: '#475569', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.04em', textAlign: 'right' }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => {
                  const roleBg =
                    row.role === 'cashier'
                      ? '#ECFDF8'
                      : row.role === 'accountant'
                      ? '#F0F9FF'
                      : '#FFFBEB'
                  const roleColor =
                    row.role === 'cashier'
                      ? '#065F46'
                      : row.role === 'accountant'
                      ? '#075985'
                      : '#B45309'
                  const roleBorder =
                    row.role === 'cashier'
                      ? '#A7F3DC'
                      : row.role === 'accountant'
                      ? '#BAE6FD'
                      : '#FDE68A'

                  const isPending = row.account_status === 'pending'
                  const isActive = row.account_status === 'active'

                  return (
                    <tr key={row.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                      <td style={{ padding: '14px 14px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div
                            style={{
                              width: 36,
                              height: 36,
                              borderRadius: '50%',
                              background: '#0E5E48',
                              color: '#FFFFFF',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 700,
                              fontSize: 13,
                              flexShrink: 0,
                            }}
                          >
                            {row.name
                              ? row.name
                                  .split(' ')
                                  .map((w) => w[0])
                                  .join('')
                                  .slice(0, 2)
                                  .toUpperCase()
                              : 'ST'}
                          </div>
                          <div>
                            <div style={{ fontWeight: 700, color: '#0F172A', fontSize: 14 }}>{row.name}</div>
                            <div style={{ color: '#64748B', fontSize: 12.5 }}>{row.email}</div>
                          </div>
                        </div>
                      </td>

                      <td style={{ padding: '14px 14px' }}>
                        <span
                          style={{
                            display: 'inline-block',
                            background: roleBg,
                            color: roleColor,
                            border: `1px solid ${roleBorder}`,
                            padding: '3px 10px',
                            borderRadius: 999,
                            fontSize: 11.5,
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            letterSpacing: '0.04em',
                          }}
                        >
                          {row.role}
                        </span>
                      </td>

                      <td style={{ padding: '14px 14px' }}>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 5,
                            background: isActive ? '#F0FDF4' : isPending ? '#FFFBEB' : '#FEF2F2',
                            color: isActive ? '#065F46' : isPending ? '#B45309' : '#991B1B',
                            border: `1px solid ${isActive ? '#BBF7D0' : isPending ? '#FDE68A' : '#FECACA'}`,
                            padding: '3px 10px',
                            borderRadius: 999,
                            fontSize: 11.5,
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            letterSpacing: '0.04em',
                          }}
                        >
                          <span
                            style={{
                              width: 6,
                              height: 6,
                              borderRadius: '50%',
                              background: isActive ? '#10B981' : isPending ? '#F59E0B' : '#EF4444',
                            }}
                          />
                          {row.account_status}
                        </span>
                        {row.unfinished_jobs > 0 && (
                          <div style={{ fontSize: 11, color: '#DC2626', marginTop: 3, fontWeight: 600 }}>
                            {row.unfinished_jobs} pending tasks
                          </div>
                        )}
                      </td>

                      <td style={{ padding: '14px 14px' }}>
                        <span
                          style={{
                            display: 'inline-block',
                            background: row.invitation_status === 'accepted' ? '#F0FDF4' : '#F0F9FF',
                            color: row.invitation_status === 'accepted' ? '#065F46' : '#075985',
                            border: `1px solid ${row.invitation_status === 'accepted' ? '#BBF7D0' : '#BAE6FD'}`,
                            padding: '3px 10px',
                            borderRadius: 999,
                            fontSize: 11.5,
                            fontWeight: 600,
                            textTransform: 'capitalize',
                          }}
                        >
                          {row.invitation_status}
                        </span>
                      </td>

                      <td style={{ padding: '14px 14px', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: 6 }}>
                          <button
                            disabled={busy}
                            onClick={() => {
                              setEdit(row.id)
                              setForm({ name: row.name, email: row.email, role: row.role, password: '' })
                              window.scrollTo({ top: 0, behavior: 'smooth' })
                            }}
                            style={{
                              background: '#F0F9FF',
                              color: '#075985',
                              border: '1px solid #BAE6FD',
                              padding: '6px 12px',
                              borderRadius: 6,
                              fontSize: 12,
                              fontWeight: 700,
                              cursor: 'pointer',
                            }}
                          >
                            Edit
                          </button>

                          <button
                            disabled={busy}
                            onClick={() => void action(row, row.account_status === 'disabled' ? 'enable' : 'disable')}
                            style={{
                              background: row.account_status === 'disabled' ? '#F0FDF4' : '#FEF2F2',
                              color: row.account_status === 'disabled' ? '#065F46' : '#991B1B',
                              border: `1px solid ${row.account_status === 'disabled' ? '#BBF7D0' : '#FECACA'}`,
                              padding: '6px 12px',
                              borderRadius: 6,
                              fontSize: 12,
                              fontWeight: 700,
                              cursor: 'pointer',
                            }}
                          >
                            {row.account_status === 'disabled' ? 'Enable' : 'Disable'}
                          </button>

                          <button
                            disabled={busy}
                            onClick={() => void action(row, 'delete')}
                            style={{
                              background: '#FEF2F2',
                              color: '#991B1B',
                              border: '1px solid #FECACA',
                              padding: '6px 12px',
                              borderRadius: 6,
                              fontSize: 12,
                              fontWeight: 700,
                              cursor: 'pointer',
                            }}
                          >
                            Delete
                          </button>

                          {row.account_status === 'pending' && (
                            <button
                              disabled={busy}
                              onClick={() => void action(row, 'invite')}
                              style={{
                                background: '#0E5E48',
                                color: '#FFFFFF',
                                border: 'none',
                                padding: '6px 12px',
                                borderRadius: 6,
                                fontSize: 12,
                                fontWeight: 700,
                                cursor: 'pointer',
                              }}
                            >
                              Resend Invite
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {last > 1 && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 20, paddingTop: 16, borderTop: '1px solid #E2E8F0' }}>
            <button
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
              style={{
                background: '#F8FAFC',
                border: '1px solid #CBD5E1',
                padding: '6px 14px',
                borderRadius: 6,
                fontSize: 12.5,
                fontWeight: 600,
                color: '#475569',
                cursor: page <= 1 ? 'not-allowed' : 'pointer',
                opacity: page <= 1 ? 0.5 : 1,
              }}
            >
              Previous
            </button>
            <span style={{ fontSize: 12.5, color: '#64748B', fontWeight: 500 }}>
              Page {page} of {last}
            </span>
            <button
              disabled={page >= last}
              onClick={() => setPage(page + 1)}
              style={{
                background: '#F8FAFC',
                border: '1px solid #CBD5E1',
                padding: '6px 14px',
                borderRadius: 6,
                fontSize: 12.5,
                fontWeight: 600,
                color: '#475569',
                cursor: page >= last ? 'not-allowed' : 'pointer',
                opacity: page >= last ? 0.5 : 1,
              }}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

