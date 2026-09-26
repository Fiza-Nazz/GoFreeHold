import { useEffect, useState, useMemo } from 'react'
import api from '../../api/axios'
import {
  THEME,
  Icon,
  CornerBrackets,
  portalPageCss,
  heroStyle,
  panelStyle,
  thStyle,
  tdStyle,
} from '../../components/gfh/adminTheme'

interface Team {
  id: number
  name: string
}

interface Technician {
  id: number
  name: string
  email?: string
}

interface Complaint {
  id: number
  title: string
  status: string
  unit_id?: number
}

interface Job {
  id: number
  complaint_id: number
  team_id?: number | null
  assigned_to: number
  assigned_by?: number
  status: 'assigned' | 'in_progress' | 'completed' | string
  scheduled_date?: string | null
  completed_at?: string | null
  notes?: string | null
  created_at: string
  updated_at?: string
  team?: { id: number; name: string } | null
  complaint?: { id: number; title: string; status: string; unit_id?: number } | null
  assignedTo?: { id: number; name: string } | null
}

const icons = {
  plus: 'M12 5v14M5 12h14',
  refresh: 'M21 12a9 9 0 1 1-2.64-6.36M21 3v6h-6',
  search: 'M21 21l-4.35-4.35M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16z',
  edit: 'M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z',
  trash: 'M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0-1 14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2L4 6h16z',
  toolbox: 'M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
  clock: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
  checkCircle: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
  userCheck: 'M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M8.5 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm8.5 3l2 2 4-4',
  calendar: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
  close: 'M18 6L6 18M6 6l12 12',
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

export default function JobsPage() {
  const basePath = typeof window !== 'undefined' && window.location.pathname.startsWith('/owner') ? '/owner' : '/admin'
  const [jobs, setJobs] = useState<Job[]>([])
  const [teams, setTeams] = useState<Team[]>([])
  const [technicians, setTechnicians] = useState<Technician[]>([])
  const [complaints, setComplaints] = useState<Complaint[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'assigned' | 'in_progress' | 'completed'>('all')
  const [teamFilter, setTeamFilter] = useState<string>('all')

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingJob, setEditingJob] = useState<Job | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  // Forms
  const [addForm, setAddForm] = useState({
    complaint_id: '',
    team_id: '',
    assigned_to: '',
    scheduled_date: '',
    notes: '',
  })

  const [editForm, setEditForm] = useState({
    status: 'assigned',
    team_id: '',
    assigned_to: '',
    scheduled_date: '',
    notes: '',
  })

  useEffect(() => {
    fetchInitialData()
  }, [])

  const fetchInitialData = async () => {
    setIsLoading(true)
    try {
      const [jobsRes, teamsRes, techRes, compRes] = await Promise.all([
        api.get(`${basePath}/jobs`),
        api.get(`${basePath}/teams`).catch(() => ({ data: { data: { teams: [] } } })),
        api.get(`${basePath}/technicians`).catch(() => ({ data: { data: { technicians: [] } } })),
        api.get(`${basePath}/complaints`).catch(() => ({ data: { data: { complaints: [] } } })),
      ])

      setJobs(jobsRes.data?.data?.jobs || [])
      setTeams(teamsRes.data?.data?.teams || [])
      setTechnicians(techRes.data?.data?.technicians || [])
      setComplaints(compRes.data?.data?.complaints || [])
    } catch (err) {
      console.error('Error fetching jobs data:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchJobs = async () => {
    try {
      const res = await api.get(`${basePath}/jobs`)
      setJobs(res.data?.data?.jobs || [])
    } catch (err) {
      console.error('Failed to refresh jobs:', err)
    }
  }

  // Open Create Job Modal
  const handleOpenAdd = () => {
    setAddForm({
      complaint_id: complaints.length > 0 ? String(complaints[0].id) : '',
      team_id: '',
      assigned_to: technicians.length > 0 ? String(technicians[0].id) : '',
      scheduled_date: new Date().toISOString().split('T')[0],
      notes: '',
    })
    setIsAddModalOpen(true)
  }

  // Open Edit Job Modal
  const handleOpenEdit = (job: Job) => {
    setEditingJob(job)
    let formattedDate = ''
    if (job.scheduled_date) {
      try {
        formattedDate = job.scheduled_date.substring(0, 10)
      } catch {
        formattedDate = ''
      }
    }
    setEditForm({
      status: job.status || 'assigned',
      team_id: job.team_id ? String(job.team_id) : '',
      assigned_to: String(job.assigned_to || ''),
      scheduled_date: formattedDate,
      notes: job.notes || '',
    })
    setIsEditModalOpen(true)
  }

  // Submit Create
  const handleCreateJob = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!addForm.complaint_id) {
      alert('Please select a complaint.')
      return
    }
    if (!addForm.assigned_to) {
      alert('Please select an assignee / technician.')
      return
    }

    setIsSaving(true)
    try {
      const payload: Record<string, any> = {
        complaint_id: Number(addForm.complaint_id),
        assigned_to: Number(addForm.assigned_to),
        status: 'assigned',
      }
      if (addForm.team_id) payload.team_id = Number(addForm.team_id)
      if (addForm.scheduled_date) payload.scheduled_date = addForm.scheduled_date
      if (addForm.notes) payload.notes = addForm.notes

      await api.post(`${basePath}/jobs`, payload)
      setIsAddModalOpen(false)
      fetchJobs()
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to create maintenance job.')
    } finally {
      setIsSaving(false)
    }
  }

  // Submit Update
  const handleUpdateJob = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingJob) return

    setIsSaving(true)
    try {
      const payload: Record<string, any> = {
        status: editForm.status,
      }
      if (editForm.assigned_to) payload.assigned_to = Number(editForm.assigned_to)
      if (editForm.team_id) {
        payload.team_id = Number(editForm.team_id)
      } else {
        payload.team_id = null
      }
      if (editForm.scheduled_date) {
        payload.scheduled_date = editForm.scheduled_date
      } else {
        payload.scheduled_date = null
      }
      if (editForm.notes !== undefined) payload.notes = editForm.notes

      await api.put(`${basePath}/jobs/${editingJob.id}`, payload)
      setIsEditModalOpen(false)
      setEditingJob(null)
      fetchJobs()
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update job.')
    } finally {
      setIsSaving(false)
    }
  }

  // Delete Job
  const handleDeleteJob = async (id: number) => {
    if (confirm(`Are you sure you want to delete maintenance job #JOB-00${id}?`)) {
      try {
        await api.delete(`${basePath}/jobs/${id}`)
        fetchJobs()
      } catch (err: any) {
        alert(err.response?.data?.message || 'Failed to delete job.')
      }
    }
  }

  // Summary Metrics
  const stats = useMemo(() => {
    const total = jobs.length
    const inProgress = jobs.filter(j => j.status === 'in_progress').length
    const assigned = jobs.filter(j => j.status === 'assigned').length
    const completed = jobs.filter(j => j.status === 'completed').length
    return { total, inProgress, assigned, completed }
  }, [jobs])

  // Filtered Jobs
  const filteredJobs = useMemo(() => {
    return jobs.filter(job => {
      // Status Filter
      if (statusFilter !== 'all' && job.status !== statusFilter) {
        return false
      }

      // Team Filter
      if (teamFilter !== 'all') {
        if (teamFilter === 'unassigned' && job.team_id) return false
        if (teamFilter !== 'unassigned' && String(job.team_id) !== teamFilter) return false
      }

      // Search Query
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase()
        const idMatch = String(job.id).includes(q) || `job-00${job.id}`.toLowerCase().includes(q)
        const complaintTitleMatch = (job.complaint?.title || '').toLowerCase().includes(q)
        const complaintIdMatch = String(job.complaint_id).includes(q)
        const teamNameMatch = (job.team?.name || '').toLowerCase().includes(q)
        const techMatch = (job.assignedTo?.name || '').toLowerCase().includes(q)
        const notesMatch = (job.notes || '').toLowerCase().includes(q)
        const statusMatch = (job.status || '').toLowerCase().includes(q)

        return idMatch || complaintTitleMatch || complaintIdMatch || teamNameMatch || techMatch || notesMatch || statusMatch
      }

      return true
    })
  }, [jobs, statusFilter, teamFilter, searchTerm])

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return '—'
    try {
      const d = new Date(dateStr)
      if (isNaN(d.getTime())) return dateStr
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    } catch {
      return dateStr
    }
  }

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <span className="status-badge-green">Completed</span>
      case 'in_progress':
        return <span className="status-badge-blue">In Progress</span>
      case 'assigned':
        return <span className="status-badge-amber">Assigned</span>
      default:
        return <span className="status-badge-amber">{status.toUpperCase()}</span>
    }
  }

  return (
    <div className="gfh-portal-page" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      <style>{portalPageCss}</style>

      {/* Hero Header */}
      <div className="fade-in" style={heroStyle}>
        <CornerBrackets />
        <div>
          <h1 style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", fontSize: 30, fontWeight: 700, color: THEME.ink, margin: 0 }}>
            Maintenance Work Orders & Jobs
          </h1>
          <p style={{ fontSize: 14, color: THEME.textMuted, marginTop: 8, marginBottom: 0 }}>
            Dispatch technicians, assign specialized teams, track work progress & execution logs
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <button
            type="button"
            onClick={fetchJobs}
            title="Refresh jobs"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              background: '#FFFFFF',
              color: '#475569',
              border: `1px solid ${THEME.border}`,
              borderRadius: 10,
              padding: '10px 14px',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
            }}
          >
            <Icon path={icons.refresh} size={15} />
            <span>Refresh</span>
          </button>
          <button
            type="button"
            onClick={handleOpenAdd}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              background: '#10B981',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: 10,
              padding: '10px 18px',
              fontSize: 13.5,
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 1px 3px rgba(14, 94, 72, 0.25)',
              transition: 'background 0.15s ease, transform 0.15s ease',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = '#094535'
              e.currentTarget.style.transform = 'translateY(-1px)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = '#10B981'
              e.currentTarget.style.transform = 'translateY(0)'
            }}
          >
            <Icon path={icons.plus} size={16} />
            <span>New Job Order</span>
          </button>
        </div>
      </div>

      {/* KPI Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 24 }}>
        {/* Total Jobs */}
        <div className="gfh-portal-stat" style={{ ...panelStyle, background: '#F8FAFC', border: '1px solid #CBD5E1', padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{
            width: 48,
            height: 48,
            borderRadius: 12,
            background: '#FFFFFF',
            border: '1px solid #CBD5E1',
            color: '#334155',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Icon path={icons.toolbox} size={22} />
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Total Work Orders
            </div>
            <div style={{ fontSize: 24, fontWeight: 800, color: '#0F172A', marginTop: 4 }}>
              {stats.total}
            </div>
          </div>
        </div>

        {/* In Progress */}
        <div className="gfh-portal-stat" style={{ ...panelStyle, background: '#F0F9FF', border: '1px solid #BAE6FD', padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{
            width: 48,
            height: 48,
            borderRadius: 12,
            background: '#FFFFFF',
            border: '1px solid #BAE6FD',
            color: '#0284C7',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Icon path={icons.clock} size={22} />
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#0284C7', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              In Progress
            </div>
            <div style={{ fontSize: 24, fontWeight: 800, color: '#0369A1', marginTop: 4 }}>
              {stats.inProgress}
            </div>
          </div>
        </div>

        {/* Assigned */}
        <div className="gfh-portal-stat" style={{ ...panelStyle, background: '#FFFBEB', border: '1px solid #FDE68A', padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{
            width: 48,
            height: 48,
            borderRadius: 12,
            background: '#FFFFFF',
            border: '1px solid #FDE68A',
            color: '#D97706',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Icon path={icons.userCheck} size={22} />
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#D97706', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Dispatched / Assigned
            </div>
            <div style={{ fontSize: 24, fontWeight: 800, color: '#B45309', marginTop: 4 }}>
              {stats.assigned}
            </div>
          </div>
        </div>

        {/* Completed */}
        <div className="gfh-portal-stat" style={{ ...panelStyle, background: '#ECFDF5', border: '1px solid #A7F3D0', padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{
            width: 48,
            height: 48,
            borderRadius: 12,
            background: '#FFFFFF',
            border: '1px solid #A7F3D0',
            color: '#059669',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Icon path={icons.checkCircle} size={22} />
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#059669', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Completed & Closed
            </div>
            <div style={{ fontSize: 24, fontWeight: 800, color: '#047857', marginTop: 4 }}>
              {stats.completed}
            </div>
          </div>
        </div>
      </div>

      {/* Main Table Panel */}
      <div className="fade-in" style={{ ...panelStyle, minHeight: 450, padding: 24 }}>
        <CornerBrackets />

        {/* Filters & Search Toolbar */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 12,
          marginBottom: 20,
          background: '#F8FAFC',
          padding: '12px 16px',
          borderRadius: 10,
          border: '1px solid #E2E8F0',
        }}>
          {/* Status Tab Pills & Team Dropdown */}
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
            {/* Status Tabs */}
            <div style={{ display: 'inline-flex', background: '#E2E8F0', padding: 3, borderRadius: 8 }}>
              {(['all', 'in_progress', 'assigned', 'completed'] as const).map(s => {
                const active = statusFilter === s
                const label = s === 'all' ? 'All' : s === 'in_progress' ? 'In Progress' : s === 'assigned' ? 'Assigned' : 'Completed'
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setStatusFilter(s)}
                    style={{
                      background: active ? '#FFFFFF' : 'transparent',
                      color: active ? '#0F172A' : '#64748B',
                      border: 'none',
                      borderRadius: 6,
                      padding: '6px 12px',
                      fontSize: 12,
                      fontWeight: active ? 700 : 500,
                      cursor: 'pointer',
                      boxShadow: active ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {label}
                  </button>
                )
              })}
            </div>

            {/* Team Filter */}
            <select
              value={teamFilter}
              onChange={e => setTeamFilter(e.target.value)}
              style={{
                padding: '7px 12px',
                fontSize: 12.5,
                borderRadius: 8,
                border: '1px solid #CBD5E1',
                background: '#FFFFFF',
                color: '#334155',
                fontWeight: 600,
                outline: 'none',
                cursor: 'pointer',
              }}
            >
              <option value="all">All Teams</option>
              <option value="unassigned">Unassigned Team</option>
              {teams.map(t => (
                <option key={t.id} value={String(t.id)}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>

          {/* Search Input */}
          <div style={{ position: 'relative', minWidth: 260, flex: '1 1 240px', maxWidth: 360 }}>
            <input
              type="text"
              placeholder="Search job ID, complaint, technician, notes..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px 8px 34px',
                fontSize: 12.5,
                borderRadius: 8,
                border: '1px solid #CBD5E1',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
            <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#94A3B8', display: 'flex' }}>
              <Icon path={icons.search} size={15} />
            </span>
            {searchTerm && (
              <button
                type="button"
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

        {/* Content Table */}
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: 60 }}>
            <span className="spinner" /> Loading maintenance jobs...
          </div>
        ) : filteredJobs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 60 }}>
            <p style={{ fontSize: 14, color: THEME.textMuted, fontWeight: 500 }}>
              {searchTerm || statusFilter !== 'all' || teamFilter !== 'all'
                ? 'No maintenance jobs match your active filters.'
                : 'No maintenance jobs logged yet. Dispatch a new job order above.'}
            </p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: `2px solid ${THEME.border}`, background: '#F8FAFC' }}>
                  <th style={thStyle}>Job Reference</th>
                  <th style={thStyle}>Complaint / Work Order</th>
                  <th style={thStyle}>Assigned Team</th>
                  <th style={thStyle}>Assigned Technician</th>
                  <th style={thStyle}>Scheduled Date</th>
                  <th style={thStyle}>Status</th>
                  <th style={thStyle}>Operational Notes</th>
                  <th style={{ ...thStyle, textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredJobs.map(job => (
                  <tr key={job.id} className="gfh-portal-row" style={{ borderBottom: `1px solid ${THEME.border}` }}>
                    {/* Job Reference */}
                    <td style={tdStyle}>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{
                          fontFamily: 'monospace',
                          fontSize: 13,
                          fontWeight: 700,
                          color: '#10B981',
                          background: '#ECFDF5',
                          border: '1px solid #A7F3D0',
                          padding: '3px 8px',
                          borderRadius: 6,
                          display: 'inline-block',
                          width: 'fit-content',
                        }}>
                          #JOB-{String(job.id).padStart(3, '0')}
                        </span>
                        <span style={{ fontSize: 11, color: '#94A3B8', marginTop: 4 }}>
                          {formatDate(job.created_at)}
                        </span>
                      </div>
                    </td>

                    {/* Complaint Details */}
                    <td style={tdStyle}>
                      <div style={{ fontWeight: 600, color: THEME.ink, fontSize: 13 }}>
                        {job.complaint?.title || `Complaint #${job.complaint_id}`}
                      </div>
                      <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
                        <span style={{
                          fontSize: 10.5,
                          fontWeight: 700,
                          background: '#F1F5F9',
                          color: '#475569',
                          padding: '1px 6px',
                          borderRadius: 4,
                        }}>
                          #COMP-{job.complaint_id}
                        </span>
                        {job.complaint?.unit_id && (
                          <span style={{
                            fontSize: 10.5,
                            fontWeight: 700,
                            background: '#F8FAFC',
                            color: '#64748B',
                            padding: '1px 6px',
                            borderRadius: 4,
                            border: '1px solid #E2E8F0',
                          }}>
                            Unit #{job.complaint.unit_id}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Assigned Team */}
                    <td style={tdStyle}>
                      {job.team?.name ? (
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 6,
                          padding: '3px 10px',
                          borderRadius: 6,
                          fontSize: 12,
                          fontWeight: 600,
                          background: '#F8FAFC',
                          color: '#334155',
                          border: '1px solid #CBD5E1',
                        }}>
                          <Icon path={icons.toolbox} size={13} />
                          {job.team.name}
                        </span>
                      ) : (
                        <span style={{ color: '#94A3B8', fontSize: 12, fontStyle: 'italic' }}>
                          Unassigned Team
                        </span>
                      )}
                    </td>

                    {/* Technician */}
                    <td style={tdStyle}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{
                          width: 28,
                          height: 28,
                          borderRadius: '50%',
                          background: '#E0F2FE',
                          color: '#0369A1',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700,
                          fontSize: 11,
                        }}>
                          {(job.assignedTo?.name || 'T')[0].toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 13, color: THEME.ink }}>
                            {job.assignedTo?.name || `User #${job.assigned_to}`}
                          </div>
                          <div style={{ fontSize: 10.5, color: '#94A3B8' }}>
                            Field Technician
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Scheduled Date */}
                    <td style={tdStyle}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12.5, color: '#334155' }}>
                        <Icon path={icons.calendar} size={14} />
                        <span>{formatDate(job.scheduled_date)}</span>
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td style={tdStyle}>
                      {renderStatusBadge(job.status)}
                    </td>

                    {/* Notes */}
                    <td style={{ ...tdStyle, maxWidth: 220 }}>
                      <span style={{
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        fontSize: 12,
                        color: job.notes ? '#475569' : '#94A3B8',
                        fontStyle: job.notes ? 'normal' : 'italic',
                      }}>
                        {job.notes || 'No remarks added'}
                      </span>
                    </td>

                    {/* Actions */}
                    <td style={{ ...tdStyle, textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: 6 }}>
                        <button
                          type="button"
                          className="gfh-portal-btn"
                          onClick={() => handleOpenEdit(job)}
                          title="Update job order status & assignment"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 5,
                            padding: '6px 12px',
                            fontSize: 12,
                            fontWeight: 600,
                            borderRadius: 6,
                            background: '#075985',
                            color: '#FFFFFF',
                            border: 'none',
                            cursor: 'pointer',
                          }}
                        >
                          <Icon path={icons.edit} size={13} />
                          <span>Update</span>
                        </button>
                        <button
                          type="button"
                          className="gfh-portal-btn"
                          onClick={() => handleDeleteJob(job.id)}
                          title="Delete job order"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 5,
                            padding: '6px 10px',
                            fontSize: 12,
                            fontWeight: 600,
                            borderRadius: 6,
                            background: '#991B1B',
                            color: '#FFFFFF',
                            border: 'none',
                            cursor: 'pointer',
                          }}
                        >
                          <Icon path={icons.trash} size={13} />
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

      {/* CREATE JOB MODAL */}
      {isAddModalOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(15, 61, 58, 0.55)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
        }}>
          <div
            className="fade-in"
            style={{
              position: 'relative',
              width: 520,
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: 30,
              background: '#ffffff',
              borderRadius: 12,
              border: `1px solid ${THEME.border}`,
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
            }}
          >
            <CornerBrackets />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div>
                <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0, color: THEME.ink }}>
                  Dispatch New Job Order
                </h2>
                <p style={{ fontSize: 12.5, color: THEME.textMuted, margin: '4px 0 0' }}>
                  Assign field technicians and teams to resolve logged maintenance complaints
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: THEME.textMuted, padding: 4 }}
              >
                <Icon path={icons.close} size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateJob} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {/* Select Complaint */}
              <div>
                <label style={labelStyle}>Select Complaint *</label>
                <select
                  style={inputStyle}
                  value={addForm.complaint_id}
                  onChange={e => setAddForm({ ...addForm, complaint_id: e.target.value })}
                  required
                >
                  <option value="">Choose a complaint...</option>
                  {complaints.map(c => (
                    <option key={c.id} value={c.id}>
                      #{c.id} — {c.title} (Status: {c.status})
                    </option>
                  ))}
                </select>
              </div>

              {/* Assignee / Technician */}
              <div>
                <label style={labelStyle}>Assign Technician / Staff *</label>
                <select
                  style={inputStyle}
                  value={addForm.assigned_to}
                  onChange={e => setAddForm({ ...addForm, assigned_to: e.target.value })}
                  required
                >
                  <option value="">Choose technician...</option>
                  {technicians.map(t => (
                    <option key={t.id} value={t.id}>
                      {t.name} {t.email ? `(${t.email})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Team & Scheduled Date */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={labelStyle}>Maintenance Team</label>
                  <select
                    style={inputStyle}
                    value={addForm.team_id}
                    onChange={e => setAddForm({ ...addForm, team_id: e.target.value })}
                  >
                    <option value="">No Team Assigned</option>
                    {teams.map(t => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Scheduled Date</label>
                  <input
                    type="date"
                    style={inputStyle}
                    value={addForm.scheduled_date}
                    onChange={e => setAddForm({ ...addForm, scheduled_date: e.target.value })}
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label style={labelStyle}>Operational Notes / Instructions</label>
                <textarea
                  style={{ ...inputStyle, minHeight: 80, resize: 'vertical' }}
                  placeholder="e.g. Bring spare parts for bathroom drainage repair..."
                  value={addForm.notes}
                  onChange={e => setAddForm({ ...addForm, notes: e.target.value })}
                />
              </div>

              {/* Modal Buttons */}
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 10 }}>
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  style={{
                    borderRadius: 8,
                    fontWeight: 700,
                    fontSize: 13,
                    padding: '9px 16px',
                    background: '#f1f5f9',
                    color: '#64748b',
                    border: '1px solid #cbd5e1',
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
                    background: '#10B981',
                    color: '#ffffff',
                    border: 'none',
                    cursor: isSaving ? 'not-allowed' : 'pointer',
                    boxShadow: '0 1px 3px rgba(14, 94, 72, 0.25)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  {isSaving ? 'Dispatching...' : 'Dispatch Job Order'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT / UPDATE JOB MODAL */}
      {isEditModalOpen && editingJob && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(15, 61, 58, 0.55)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
        }}>
          <div
            className="fade-in"
            style={{
              position: 'relative',
              width: 520,
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: 30,
              background: '#ffffff',
              borderRadius: 12,
              border: `1px solid ${THEME.border}`,
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
            }}
          >
            <CornerBrackets />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div>
                <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0, color: THEME.ink }}>
                  Update Job Order #JOB-{String(editingJob.id).padStart(3, '0')}
                </h2>
                <p style={{ fontSize: 12.5, color: THEME.textMuted, margin: '4px 0 0' }}>
                  {editingJob.complaint?.title || `Complaint #${editingJob.complaint_id}`}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsEditModalOpen(false)
                  setEditingJob(null)
                }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: THEME.textMuted, padding: 4 }}
              >
                <Icon path={icons.close} size={18} />
              </button>
            </div>

            <form onSubmit={handleUpdateJob} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {/* Status Selector */}
              <div>
                <label style={labelStyle}>Execution Status *</label>
                <select
                  style={inputStyle}
                  value={editForm.status}
                  onChange={e => setEditForm({ ...editForm, status: e.target.value })}
                  required
                >
                  <option value="assigned">Assigned (Pending dispatch)</option>
                  <option value="in_progress">In Progress (Work underway)</option>
                  <option value="completed">Completed (Resolved)</option>
                </select>
              </div>

              {/* Assignee / Technician */}
              <div>
                <label style={labelStyle}>Assigned Technician *</label>
                <select
                  style={inputStyle}
                  value={editForm.assigned_to}
                  onChange={e => setEditForm({ ...editForm, assigned_to: e.target.value })}
                  required
                >
                  <option value="">Choose technician...</option>
                  {technicians.map(t => (
                    <option key={t.id} value={t.id}>
                      {t.name} {t.email ? `(${t.email})` : ''}
                    </option>
                  ))}
                  {/* If current assignee is not in technicians list, ensure option is visible */}
                  {editingJob.assigned_to && !technicians.some(t => t.id === editingJob.assigned_to) && (
                    <option value={editingJob.assigned_to}>
                      {editingJob.assignedTo?.name || `User #${editingJob.assigned_to}`}
                    </option>
                  )}
                </select>
              </div>

              {/* Maintenance Team & Scheduled Date */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={labelStyle}>Assigned Team</label>
                  <select
                    style={inputStyle}
                    value={editForm.team_id}
                    onChange={e => setEditForm({ ...editForm, team_id: e.target.value })}
                  >
                    <option value="">No Team Assigned</option>
                    {teams.map(t => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Scheduled Date</label>
                  <input
                    type="date"
                    style={inputStyle}
                    value={editForm.scheduled_date}
                    onChange={e => setEditForm({ ...editForm, scheduled_date: e.target.value })}
                  />
                </div>
              </div>

              {/* Operational Notes */}
              <div>
                <label style={labelStyle}>Operational Notes / Work Log</label>
                <textarea
                  style={{ ...inputStyle, minHeight: 85, resize: 'vertical' }}
                  placeholder="Record work completion details, parts replaced, or next steps..."
                  value={editForm.notes}
                  onChange={e => setEditForm({ ...editForm, notes: e.target.value })}
                />
              </div>

              {/* Modal Buttons */}
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 10 }}>
                <button
                  type="button"
                  onClick={() => {
                    setIsEditModalOpen(false)
                    setEditingJob(null)
                  }}
                  style={{
                    borderRadius: 8,
                    fontWeight: 700,
                    fontSize: 13,
                    padding: '9px 16px',
                    background: '#f1f5f9',
                    color: '#64748b',
                    border: '1px solid #cbd5e1',
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
                    background: '#10B981',
                    color: '#ffffff',
                    border: 'none',
                    cursor: isSaving ? 'not-allowed' : 'pointer',
                    boxShadow: '0 1px 3px rgba(14, 94, 72, 0.25)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  {isSaving ? 'Saving Changes...' : 'Save Job Updates'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
