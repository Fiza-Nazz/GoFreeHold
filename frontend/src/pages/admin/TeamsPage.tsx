import SchemaCrudPage from '../../components/SchemaCrudPage'

export default function TeamsPage() {
  return (
    <SchemaCrudPage
      title="Teams"
      subtitle="Maintenance teams assigned to jobs"
      listUrl="/admin/teams"
      listKey="teams"
      fields={[
        { name: 'name', label: 'Team name', required: true },
        { name: 'phone', label: 'Phone' },
        { name: 'remark', label: 'Remark', type: 'textarea' },
      ]}
      columns={[
        { key: 'id', label: 'ID' },
        { key: 'name', label: 'Name' },
        { key: 'phone', label: 'Phone' },
        { key: 'jobs_count', label: 'Jobs' },
        { key: 'remark', label: 'Remark' },
      ]}
    />
  )
}
