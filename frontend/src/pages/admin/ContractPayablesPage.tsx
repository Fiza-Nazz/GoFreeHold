import SchemaCrudPage from '../../components/SchemaCrudPage'

export default function ContractPayablesPage() {
  return (
    <SchemaCrudPage
      title="Contract Payables"
      subtitle="Payable amounts linked to contracts"
      listUrl="/admin/contract-payables"
      listKey="payables"
      fields={[
        { name: 'contract_id', label: 'Contract ID', type: 'number', required: true },
        { name: 'description', label: 'Description', type: 'textarea' },
        { name: 'amount', label: 'Amount (AED)', type: 'number', required: true },
        { name: 'due_date', label: 'Due date', type: 'date' },
        {
          name: 'status',
          label: 'Status',
          type: 'select',
          options: [
            { value: 'pending', label: 'Pending' },
            { value: 'paid', label: 'Paid' },
          ],
        },
      ]}
      columns={[
        { key: 'id', label: 'ID' },
        { key: 'contract_id', label: 'Contract' },
        { key: 'description', label: 'Description' },
        { key: 'amount', label: 'Amount' },
        { key: 'due_date', label: 'Due' },
        { key: 'status', label: 'Status' },
      ]}
    />
  )
}
