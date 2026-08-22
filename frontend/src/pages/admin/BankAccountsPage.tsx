import SchemaCrudPage from '../../components/SchemaCrudPage'

export default function BankAccountsPage() {
  return (
    <SchemaCrudPage
      title="Bank Accounts"
      subtitle="Company / property bank accounts"
      listUrl="/admin/bank-accounts"
      listKey="bank_accounts"
      fields={[
        { name: 'bank_name', label: 'Bank name', placeholder: 'Creates bank if needed' },
        { name: 'account_name', label: 'Account name', required: true },
        { name: 'account_number', label: 'Account number' },
        { name: 'iban', label: 'IBAN' },
        { name: 'branch', label: 'Branch' },
      ]}
      columns={[
        { key: 'id', label: 'ID' },
        { key: 'bank', label: 'Bank', render: r => r.bank?.name || '—' },
        { key: 'account_name', label: 'Account name' },
        { key: 'account_number', label: 'Number' },
        { key: 'iban', label: 'IBAN' },
        { key: 'branch', label: 'Branch' },
      ]}
    />
  )
}
