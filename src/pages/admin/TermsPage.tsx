import SchemaCrudPage from '../../components/SchemaCrudPage'

export default function TermsPage() {
  return (
    <SchemaCrudPage
      title="Contract Terms"
      subtitle="Terms & conditions (cid → contract_id)"
      listUrl="/admin/terms"
      listKey="terms"
      fields={[
        { name: 'cid', label: 'Contract ID (cid)', type: 'number', required: true },
        { name: 'terms', label: 'Terms text', type: 'textarea', required: true },
      ]}
      columns={[
        { key: 'id', label: 'ID' },
        { key: 'cid', label: 'Contract (cid)' },
        { key: 'terms', label: 'Terms', render: r => (r.terms || '').slice(0, 80) + ((r.terms || '').length > 80 ? '…' : '') },
      ]}
    />
  )
}
