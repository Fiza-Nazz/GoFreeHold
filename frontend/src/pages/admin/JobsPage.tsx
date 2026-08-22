import SchemaCrudPage from '../../components/SchemaCrudPage'

export default function JobsPage() {
  return (
    <SchemaCrudPage
      title="Maintenance Jobs"
      subtitle="Dedicated jobs table (team assignment + status)"
      listUrl="/admin/jobs"
      listKey="jobs"
      fields={[
        { name: 'team_id', label: 'Team ID', type: 'number' },
        { name: 'complaint_id', label: 'Complaint ID', type: 'number' },
        { name: 'assigned_to', label: 'Assignee user ID', type: 'number' },
        { name: 'status', label: 'Status', placeholder: 'assigned / in_progress / done' },
        { name: 'scheduled_date', label: 'Scheduled date', type: 'date' },
        { name: 'notes', label: 'Notes', type: 'textarea' },
      ]}
      columns={[
        { key: 'id', label: 'ID' },
        { key: 'status', label: 'Status' },
        { key: 'team', label: 'Team', render: r => r.team?.name || r.team_id || '—' },
        { key: 'complaint', label: 'Complaint', render: r => r.complaint?.title || r.complaint_id || '—' },
        { key: 'scheduled_date', label: 'Scheduled' },
        { key: 'notes', label: 'Notes' },
      ]}
    />
  )
}
