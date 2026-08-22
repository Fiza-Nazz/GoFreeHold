import SchemaCrudPage from '../../components/SchemaCrudPage'

export default function ItemStorePage() {
  return (
    <SchemaCrudPage
      title="Item Store"
      subtitle="Warehouse stock (item_store)"
      listUrl="/admin/item-store"
      listKey="item_store"
      fields={[
        { name: 'item_id', label: 'Item ID', type: 'number', required: true },
        { name: 'qty', label: 'Quantity', type: 'number', required: true },
        { name: 'remark', label: 'Remark', type: 'textarea' },
      ]}
      columns={[
        { key: 'id', label: 'ID' },
        { key: 'item', label: 'Item', render: r => r.item?.name || r.item_id },
        { key: 'qty', label: 'Qty' },
        { key: 'remark', label: 'Remark' },
      ]}
    />
  )
}
