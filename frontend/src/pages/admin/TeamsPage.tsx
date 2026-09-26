import { useEffect, useState, useMemo } from 'react'
import api from '../../api/axios'
import { THEME, Icon, ICONS, CornerBrackets, portalPageCss, heroStyle, panelStyle, thStyle, tdStyle } from '../../components/gfh/adminTheme'

interface Team {
  id: number
  name: string
  phone?: string
  remark?: string
  jobs_count?: number
  created_at?: string
}

const icons = {
  plus: 'M12 5v14M5 12h14',
  users: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z',
  briefcase: 'M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
  phone: 'M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z',
  search: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z',
  edit: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z',
}

const inputStyle: React.CSSProperties = {
  background: '#ffffff',
  border: `1px solid ${THEME.border}`,
  borderRadius: 8,
  color: THEME.ink,
  fontSize: 13.5,
  fontWeight: 500,
  padding: '10px 12px',
  width: '100%',
  outline: 'none',
  boxSizing: 'border-box',
}

const labelStyle: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 700,
  color: '#0F172A',
  letterSpacing: '0.4px',
  textTransform: 'uppercase',
  display: 'block',
  marginBottom: 6,
}

export default function TeamsPage() {
  const basePath = typeof window !== 'undefined' && window.location.pathname.startsWith('/owner') ? '/owner' : '/admin'
  const [teams, setTeams] = useState<Team[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingTeam, setEditingTeam] = useState<Team | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    remark: '',
  })
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    fetchTeams()
  }, [])

  const fetchTeams = async () => {
    setIsLoading(true)
    try {
      const res = await api.get(`${basePath}/teams`)
      setTeams(res.data?.data?.teams || [])
    } catch (err) {
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleOpenAdd = () => {
    setEditingTeam(null)
    setFormData({ name: '', phone: '', remark: '' })
    setIsModalOpen(true)
  }

  const handleOpenEdit = (team: Team) => {
    setEditingTeam(team)
    setFormData({
      name: team.name || '',
      phone: team.phone || '',
      remark: team.remark || '',
    })
    setIsModalOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    try {
      if (editingTeam) {
        await api.put(`${basePath}/teams/${editingTeam.id}`, formData)
      } else {
        await api.post(`${basePath}/teams`, formData)
      }
      setIsModalOpen(false)
      fetchTeams()
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error saving team')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this maintenance team?')) {
      try {
        await api.delete(`${basePath}/teams/${id}`)
        fetchTeams()
      } catch (err: any) {
        alert(err.response?.data?.message || 'Failed to delete team.')
      }
    }
  }

  const stats = useMemo(() => {
    const total = teams.length
    const totalJobs = teams.reduce((acc, t) => acc + (Number(t.jobs_count) || 0), 0)
    const withPhone = teams.filter(t => !!t.phone).length
    return { total, totalJobs, withPhone }
  }, [teams])

  const filteredTeams = useMemo(() => {
    if (!searchTerm.trim()) return teams
    const q = searchTerm.toLowerCase()
    return teams.filter(t => {
      return (
        (t.name || '').toLowerCase().includes(q) ||
        (t.phone || '').toLowerCase().includes(q) ||
        (t.remark || '').toLowerCase().includes(q) ||
        String(t.id).includes(q)
      )
    })
  }, [teams, searchTerm])

  return (
    <div className="gfh-portal-page" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      <style>{portalPageCss}</style>

      {/* Hero Header */}
      <div className="fade-in" style={heroStyle}>
        <CornerBrackets />
        <div>
          <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 30, fontWeight: 700, color: THEME.ink, margin: 0 }}>
            Maintenance Teams
          </h1>
          <p style={{ fontSize: 14, color: THEME.textMuted, marginTop: 8, marginBottom: 0 }}>
            Field technicians, specialized service squads, and job assignment management
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            background: '#0E5E48',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: 10,
            padding: '10px 20px',
            fontSize: 13.5,
            fontWeight: 700,
            cursor: 'pointer',
            boxShadow: '0 1px 3px rgba(14, 94, 72, 0.25)',
            transition: 'background 0.15s ease, transform 0.15s ease',
            fontFamily: "'Inter', sans-serif",
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = '#094535'
            e.currentTarget.style.transform = 'translateY(-1px)'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = '#0E5E48'
            e.currentTarget.style.transform = 'translateY(0)'
          }}
        >
          <Icon path={icons.plus} size={15} />
          <span>Add New Team</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 22 }}>
        <div style={{ padding: '16px 20px', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 10 }}>
          <div style={{ fontSize: 11.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#64748B' }}>
            Total Teams
          </div>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#0E5E48', marginTop: 4 }}>
            {stats.total}
          </div>
          <div style={{ fontSize: 11.5, color: '#94A3B8', marginTop: 2 }}>Registered service squads</div>
        </div>

        <div style={{ padding: '16px 20px', background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 10 }}>
          <div style={{ fontSize: 11.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#15803D' }}>
            Assigned Jobs
          </div>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#15803D', marginTop: 4 }}>
            {stats.totalJobs}
          </div>
          <div style={{ fontSize: 11.5, color: '#16A34A', marginTop: 2 }}>Active job work orders</div>
        </div>

        <div style={{ padding: '16px 20px', background: '#F0F9FF', border: '1px solid #BAE6FD', borderRadius: 10 }}>
          <div style={{ fontSize: 11.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#0369A1' }}>
            Direct Contact Ready
          </div>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#0369A1', marginTop: 4 }}>
            {stats.withPhone}
          </div>
          <div style={{ fontSize: 11.5, color: '#0284C7', marginTop: 2 }}>Teams with direct phone line</div>
        </div>
      </div>

      {/* Main Table Panel */}
      <div className="fade-in" style={{ ...panelStyle, minHeight: 380, padding: 24 }}>
        <CornerBrackets />

        {/* Search Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 18 }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: THEME.ink }}>
            Active Teams Directory ({filteredTeams.length})
          </div>
          <div style={{ position: 'relative', minWidth: 260, flex: '1 1 240px', maxWidth: 360 }}>
            <input
              type="text"
              placeholder="Search by team name, phone, remark..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px 8px 32px',
                fontSize: 12.5,
                borderRadius: 8,
                border: '1px solid #CBD5E1',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
            <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#94A3B8', display: 'flex' }}>
              <Icon path={icons.search} size={14} />
            </span>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                style={{
                  position: 'absolute',
                  right: 8,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#94A3B8',
                  fontSize: 14,
                }}
              >
                ×
              </button>
            )}
          </div>
        </div>

        {isLoading ? (
          <div style={{ textAlign: 'center', padding: 60 }}>
            <span className="spinner" /> Loading teams...
          </div>
        ) : filteredTeams.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 60 }}>
            <p style={{ fontSize: 14, color: THEME.textMuted, fontWeight: 500 }}>No teams found matching your query.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: `2px solid ${THEME.border}`, background: '#F8FAFC' }}>
                  {['Team Ref', 'Team Name', 'Direct Contact', 'Assigned Work', 'Specialization / Remark', 'Actions'].map(h => (
                    <th key={h} style={thStyle}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredTeams.map(t => (
                  <tr key={t.id} className="gfh-portal-row" style={{ borderBottom: `1px solid ${THEME.border}` }}>
                    <td style={{ ...tdStyle, fontWeight: 700, color: '#64748B', whiteSpace: 'nowrap' }}>
                      #TEAM-{String(t.id).padStart(3, '0')}
                    </td>
                    <td style={{ ...tdStyle, fontWeight: 700, color: THEME.ink }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{
                          width: 30,
                          height: 30,
                          borderRadius: 6,
                          background: '#E0F2FE',
                          color: '#0369A1',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 800,
                          fontSize: 12,
                        }}>
                          {t.name.charAt(0).toUpperCase()}
                        </div>
                        <span>{t.name}</span>
                      </div>
                    </td>
                    <td style={tdStyle}>
                      {t.phone ? (
                        <a
                          href={`tel:${t.phone}`}
                          style={{
                            color: '#0E5E48',
                            fontWeight: 600,
                            textDecoration: 'none',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 6,
                            background: '#F0FDF4',
                            padding: '3px 8px',
                            borderRadius: 6,
                            border: '1px solid #BBF7D0',
                            fontSize: 12,
                          }}
                        >
                          <Icon path={icons.phone} size={12} />
                          {t.phone}
                        </a>
                      ) : (
                        <span style={{ color: '#94A3B8', fontSize: 12 }}>—</span>
                      )}
                    </td>
                    <td style={tdStyle}>
                      <span style={{
                        display: 'inline-block',
                        padding: '3px 9px',
                        borderRadius: 20,
                        fontSize: 11.5,
                        fontWeight: 700,
                        background: (t.jobs_count || 0) > 0 ? '#EFF6FF' : '#F1F5F9',
                        color: (t.jobs_count || 0) > 0 ? '#1D4ED8' : '#64748B',
                        border: `1px solid ${(t.jobs_count || 0) > 0 ? '#BFDBFE' : '#E2E8F0'}`,
                        whiteSpace: 'nowrap',
                      }}>
                        {t.jobs_count || 0} {t.jobs_count === 1 ? 'Job' : 'Jobs'}
                      </span>
                    </td>
                    <td style={{ ...tdStyle, color: '#475569', fontSize: 12.5 }}>
                      {t.remark || '—'}
                    </td>
                    <td style={{ ...tdStyle, whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button
                          onClick={() => handleOpenEdit(t)}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4,
                            padding: '5px 10px',
                            fontSize: 12,
                            fontWeight: 700,
                            borderRadius: 6,
                            background: '#075985',
                            color: '#fff',
                            border: 'none',
                            cursor: 'pointer',
                          }}
                        >
                          <Icon path={icons.edit} size={12} />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => handleDelete(t.id)}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4,
                            padding: '5px 10px',
                            fontSize: 12,
                            fontWeight: 700,
                            borderRadius: 6,
                            background: '#991B1B',
                            color: '#fff',
                            border: 'none',
                            cursor: 'pointer',
                          }}
                        >
                          <Icon path={ICONS.trash} size={12} />
                          <span>Delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 61, 58, 0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div
            className="fade-in"
            style={{
              position: 'relative',
              width: 480,
              padding: 28,
              background: '#ffffff',
              borderRadius: 10,
              border: `1px solid ${THEME.border}`,
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            }}
          >
            <CornerBrackets />
            <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 20, fontWeight: 700, marginBottom: 18, color: THEME.ink }}>
              {editingTeam ? 'Edit Maintenance Team' : 'Add Maintenance Team'}
            </h2>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={labelStyle}>Team Name *</label>
                <input
                  style={inputStyle}
                  placeholder="e.g. Electrical Squad Alpha"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div>
                <label style={labelStyle}>Direct Phone Contact</label>
                <input
                  style={inputStyle}
                  placeholder="e.g. +971-50-1234567"
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>

              <div>
                <label style={labelStyle}>Specialization / Remarks</label>
                <textarea
                  style={{ ...inputStyle, minHeight: 80, resize: 'vertical' }}
                  placeholder="e.g. Specialized in VRF, chillers, and emergency plumbing..."
                  value={formData.remark}
                  onChange={e => setFormData({ ...formData, remark: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 10 }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  style={{
                    borderRadius: 8,
                    fontWeight: 700,
                    fontSize: 13,
                    padding: '9px 16px',
                    background: '#F1F5F9',
                    color: '#64748B',
                    border: '1px solid #CBD5E1',
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  style={{
                    borderRadius: 8,
                    fontWeight: 700,
                    fontSize: 13,
                    padding: '9px 20px',
                    background: '#0E5E48',
                    color: '#ffffff',
                    border: 'none',
                    cursor: isSaving ? 'not-allowed' : 'pointer',
                    boxShadow: '0 1px 3px rgba(14, 94, 72, 0.25)',
                    opacity: isSaving ? 0.7 : 1,
                  }}
                >
                  {isSaving ? 'Saving...' : editingTeam ? 'Update Team' : 'Create Team'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

