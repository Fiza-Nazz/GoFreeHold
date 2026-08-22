import SchemaCrudPage from '../../components/SchemaCrudPage'

export default function SettlementPaymentsPage() {
  return (
    <SchemaCrudPage
      title="Settlement Payments"
      subtitle="Payments recorded against owner settlements"
      listUrl="/admin/settlement-payments"
      listKey="payments"
      fields={[
        { name: 'settlement_id', label: 'Settlement ID', type: 'number', required: true },
        { name: 'payment_method', label: 'Payment method', placeholder: 'cash / transfer / cheque' },
        { name: 'amount', label: 'Amount (AED)', type: 'number', required: true },
        { name: 'payment_date', label: 'Payment date', type: 'date', required: true },
      ]}
      columns={[
        { key: 'id', label: 'ID' },
        { key: 'settlement_id', label: 'Settlement' },
        { key: 'payment_method', label: 'Method' },
        { key: 'amount', label: 'Amount' },
        { key: 'payment_date', label: 'Date' },
      ]}
    />
  )
}
