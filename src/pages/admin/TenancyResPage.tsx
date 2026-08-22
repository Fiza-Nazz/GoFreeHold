import SchemaCrudPage from '../../components/SchemaCrudPage'

export default function TenancyResPage() {
  return (
    <SchemaCrudPage
      title="Tenancy Res Forms"
      subtitle="UAE residential tenancy form fields"
      listUrl="/admin/tenancy-res"
      listKey="tenancy_res"
      fields={[
        { name: 'contract_id', label: 'Contract ID', type: 'number', required: true },
        { name: 'owner_name', label: 'Owner name' },
        { name: 'lessor_name', label: 'Lessor name' },
        { name: 'tenant_name', label: 'Tenant name' },
        { name: 'property_name', label: 'Property name' },
        { name: 'premises_no', label: 'Premises no' },
        { name: 'location', label: 'Location' },
        { name: 'annual_rent', label: 'Annual rent', type: 'number' },
        { name: 'period_from', label: 'Period from', type: 'date' },
        { name: 'period_to', label: 'Period to', type: 'date' },
        { name: 'security_deposit', label: 'Security deposit', type: 'number' },
        { name: 'mode_of_payment', label: 'Mode of payment' },
      ]}
      columns={[
        { key: 'id', label: 'ID' },
        { key: 'contract_id', label: 'Contract' },
        { key: 'tenant_name', label: 'Tenant' },
        { key: 'property_name', label: 'Property' },
        { key: 'annual_rent', label: 'Annual rent' },
        { key: 'period_from', label: 'From' },
        { key: 'period_to', label: 'To' },
      ]}
    />
  )
}
