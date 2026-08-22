import { useEffect, useState } from 'react'
import SchemaCrudPage from '../../components/SchemaCrudPage'
import api from '../../api/axios'

export default function MaintenancesPage() {
  const [unitOptions, setUnitOptions] = useState<{ value: string | number; label: string }[]>([])

  useEffect(() => {
    let cancelled = false
    api
      .get('/admin/units')
      .then(res => {
        if (cancelled) return
        const units = res.data?.data?.units || []
        setUnitOptions(
          units.map((u: any) => ({
            value: u.id,
            label: `Unit ${u.number || u.id}${u.property?.name ? ` · ${u.property.name}` : ''} (ID ${u.id})`,
          }))
        )
      })
      .catch(() => {
        if (!cancelled) setUnitOptions([])
      })
    return () => { cancelled = true }
  }, [])

  return (
    <SchemaCrudPage
      title="Maintenances"
      subtitle="Unit maintenance cost records"
      listUrl="/admin/maintenances"
      listKey="maintenances"
      fields={[
        {
          name: 'unit_id',
          label: 'Unit',
          type: 'select',
          options: unitOptions,
          placeholder: unitOptions.length ? 'Select a unit…' : 'Loading units…',
        },
        { name: 'date', label: 'Date', type: 'date', required: true },
        { name: 'description', label: 'Description', type: 'textarea' },
        { name: 'cost', label: 'Cost (AED)', type: 'number' },
      ]}
      columns={[
        { key: 'id', label: 'ID' },
        { key: 'date', label: 'Date' },
        { key: 'unit', label: 'Unit', render: r => r.unit?.number || r.unit_id || '—' },
        { key: 'description', label: 'Description' },
        { key: 'cost', label: 'Cost' },
      ]}
      mapPayload={(form) => ({
        unit_id: form.unit_id === '' ? null : Number(form.unit_id),
        date: form.date,
        description: form.description || null,
        cost: form.cost === '' ? null : Number(form.cost),
      })}
    />
  )
}
