import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import api from '../../api/axios'
import { THEME, Icon, ICONS, CornerBrackets, portalPageCss, heroStyle, panelStyle, thStyle, tdStyle, ghostBtnStyle } from '../../components/gfh/adminTheme'

interface InventoryItem {
  id: number
  name: string
  category: string
  quantity: number
  unit_price: number
  location_type: 'warehouse' | 'unit'
  unit_id?: number
  min_stock_alert?: number
  unit?: { number: string; property?: { name: string } }
}

const icons = {
  plus: 'M12 5v14M5 12h14',
  box: 'M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16ZM3.3 7l8.7 5 8.7-5M12 22V12',
  alert: 'M12 9v4M12 17h.01M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z',
  building: 'M3 21h18M5 21V5a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v16M13 21V9a1 1 0 0 1 1-1h5a1 1 0 0 1 1 1v12',
}

const inputStyle: React.CSSProperties = {
  background: '#ffffff',
  border: `1px solid ${THEME.border}`,
  borderRadius: 8,
  color: THEME.ink,
  fontSize: 14,
  fontWeight: 500,
  padding: '10px 12px',
  width: '100%',
}

const labelStyle: React.CSSProperties = {
  fontSize: 12.5,
  fontWeight: 700,
  color: '#0F172A',
  letterSpacing: '0.4px',
  textTransform: 'uppercase',
  display: 'block',
  marginBottom: 6,
}

export default function InventoryManagement() {
  const [searchParams] = useSearchParams()
  const searchQuery = (searchParams.get('q') || '').trim().toLowerCase()
  const [tab, setTab] = useState<'warehouse' | 'unit'>('warehouse')
  const [items, setItems] = useState<InventoryItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    quantity: '1',
    unit_price: '0',
    location_type: 'warehouse',
    unit_id: '',
    min_stock_alert: '5',
    notes: '',
  })

  useEffect(() => { fetchInventory() }, [tab])

  const fetchInventory = async () => {
    setIsLoading(true)
    try {
      const url = tab === 'warehouse' ? '/admin/inventory/warehouse' : '/admin/inventory/unit'
      const res = await api.get(url)
      setItems(res.data?.data?.items || [])
    } catch (err) { console.error(err) }
    finally { setIsLoading(false) }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await api.post('/admin/inventory', formData)
      setIsModalOpen(false)
      fetchInventory()
      setFormData({ name: '', category: '', quantity: '1', unit_price: '0', location_type: tab, unit_id: '', min_stock_alert: '5', notes: '' })
    } catch (err) { alert('Error adding item') }
  }

  const handleDelete = async (id: number) => {
    if (confirm('Delete inventory item?')) {
      await api.delete(`/admin/inventory/${id}`)
      fetchInventory()
    }
  }

  // Real-time search filter connected to topbar search query
  const filteredItems = items.filter(item => {
    if (!searchQuery) return true
    return (
      (item.name && item.name.toLowerCase().includes(searchQuery)) ||
      (item.category && item.category.toLowerCase().includes(searchQuery)) ||
      (item.unit?.number && item.unit.number.toLowerCase().includes(searchQuery)) ||
      (item.unit?.property?.name && item.unit.property.name.toLowerCase().includes(searchQuery))
    )
  })
  const lowStockCount = items.filter(i => i.min_stock_alert && i.quantity <= i.min_stock_alert).length
  const totalQuantity = items.reduce((sum, i) => sum + Number(i.quantity || 0), 0)
  const warehouseItemsCount = items.filter(i => i.location_type === 'warehouse').length

  return (
    <div className="gfh-portal-page" style={{ fontFamily: "'Poppins', system-ui, sans-serif" }}>
      <style>{portalPageCss}</style>

      <div className="fade-in" style={heroStyle}>
        <CornerBrackets />
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <h1 style={{ fontFamily: "'Poppins', sans-serif", fontSize: 28, fontWeight: 800, color: THEME.ink, margin: 0, letterSpacing: '-0.01em' }}>
              Inventory & stock management
            </h1>
            <span style={{
              fontSize: 12.5,
              fontWeight: 700,
              color: '#334155',
              background: '#F1F5F9',
              border: '1px solid #CBD5E1',
              borderRadius: 8,
              padding: '5px 12px',
            }}>
              {items.length} {items.length === 1 ? 'item' : 'items'}
            </span>
            {lowStockCount > 0 && (
              <span style={{
                fontSize: 12.5,
                fontWeight: 700,
                color: '#FFFFFF',
                background: '#DC2626',
                border: '1px solid #B91C1C',
                borderRadius: 8,
                padding: '5px 14px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                boxShadow: '0 1px 3px rgba(220, 38, 38, 0.3)',
              }}>
                <Icon path={icons.alert} size={13} />
                {lowStockCount} low stock
              </span>
            )}
          </div>
          <p style={{ fontSize: 14, color: THEME.textMuted, marginTop: 8, marginBottom: 0, fontWeight: 500 }}>
            Track warehouse stock and unit-level assigned inventory
          </p>
        </div>
        <button
          onClick={() => { setFormData(prev => ({ ...prev, location_type: tab })); setIsModalOpen(true); }}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            background: '#0E5E48',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: 10,
            padding: '10px 20px',
            fontSize: 13.5,
            fontWeight: 700,
            cursor: 'pointer',
            boxShadow: '0 1px 3px rgba(14, 94, 72, 0.25)',
            transition: 'background 0.15s ease, transform 0.15s ease',
            fontFamily: "'Poppins', sans-serif",
          }}
          onMouseEnter={e => { e.currentTarget.style.background = '#06382C'; }}
          onMouseLeave={e => { e.currentTarget.style.background = '#0E5E48'; }}
        >
          <Icon path={icons.plus} size={16} />
          Add inventory item
        </button>
      </div>

      {/* Tabs Row matching Add Inventory Item styling with 10px rounded corners */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 22, alignItems: 'center' }}>
        {([
          { key: 'warehouse' as const, label: 'Warehouse stock' },
          { key: 'unit' as const, label: 'Unit-level inventory' },
        ]).map(t => {
          const isActive = tab === t.key
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '9px 18px',
                fontSize: 13,
                fontWeight: 700,
                borderRadius: 10,
                border: isActive ? 'none' : '1px solid #CBD5E1',
                background: isActive ? '#0E5E48' : '#FFFFFF',
                color: isActive ? '#FFFFFF' : '#334155',
                cursor: 'pointer',
                boxShadow: isActive ? '0 1px 3px rgba(14, 94, 72, 0.25)' : 'none',
                transition: 'all 0.15s ease',
                fontFamily: "'Poppins', sans-serif",
              }}
              onMouseEnter={e => {
                if (!isActive) {
                  e.currentTarget.style.borderColor = '#0E5E48'
                  e.currentTarget.style.color = '#0E5E48'
                }
              }}
              onMouseLeave={e => {
                if (!isActive) {
                  e.currentTarget.style.borderColor = '#CBD5E1'
                  e.currentTarget.style.color = '#334155'
                }
              }}
            >
              {t.label}
            </button>
          )
        })}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 18, marginBottom: 22 }}>
        {[
          { value: totalQuantity, label: 'Total Quantity', color: THEME.ink, icon: icons.box, iconBg: '#0E5E48' },
          { value: lowStockCount, label: 'Low Stock', color: '#ef4444', icon: icons.alert, iconBg: '#ef4444' },
          { value: warehouseItemsCount, label: 'Warehouse Items', color: THEME.ink, icon: icons.building, iconBg: '#0E5E48' },
        ].map((card, i) => (
          <div key={card.label} className="gfh-portal-stat fade-in" style={{ position: 'relative', background: '#fff', border: `1px solid ${THEME.border}`, borderRadius: 12, padding: 20, animationDelay: `${i * 0.06}s` }}>
            <CornerBrackets />
            <div style={{ width: 40, height: 40, borderRadius: 10, background: card.iconBg, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
              <Icon path={card.icon} size={18} />
            </div>
            <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: 24, fontWeight: 700, color: card.color }}>{card.value}</div>
            <div style={{ fontSize: 12, color: THEME.textMuted, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.3px', marginTop: 2 }}>{card.label}</div>
          </div>
        ))}
      </div>

      <div className="fade-in" style={{ ...panelStyle, minHeight: 400 }}>
        <CornerBrackets />
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: 40 }}><span className="spinner" /></div>
        ) : filteredItems.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <p style={{ fontSize: 14, color: THEME.textMuted, fontWeight: 500 }}>
              {searchQuery ? `No items matching "${searchQuery}".` : `No items in ${tab} inventory.`}
            </p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: `2px solid ${THEME.border}` }}>
                  {['Item name', 'Category', 'Quantity', 'Unit price (AED)', tab === 'unit' ? 'Assigned unit' : 'Min stock alert', 'Actions'].map(h => (
                    <th key={h} style={thStyle}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredItems.map(item => {
                  const isLow = !!(item.min_stock_alert && item.quantity <= item.min_stock_alert)
                  return (
                    <tr key={item.id} className="gfh-portal-row" style={{ borderBottom: `1px solid ${THEME.border}` }}>
                      <td style={{ ...tdStyle, fontWeight: 700 }}>{item.name}</td>
                      <td style={tdStyle}>{item.category}</td>
                      <td style={tdStyle}>
                        <span style={{ fontWeight: 700, color: isLow ? '#dc2626' : THEME.ink }}>{item.quantity}</span>
                        {isLow && <span style={{ marginLeft: 8, fontSize: 11, fontWeight: 700, color: '#dc2626', background: '#fee2e2', border: '1px solid #fca5a5', padding: '2px 8px', borderRadius: 6 }}>LOW</span>}
                      </td>
                      <td style={tdStyle}>{Number(item.unit_price).toLocaleString()}</td>
                      <td style={tdStyle}>
                        {tab === 'unit' ? (
                          <span>Unit {item.unit?.number} <span style={{ fontSize: 12, color: THEME.textMuted }}>({item.unit?.property?.name})</span></span>
                        ) : (
                          <span>{item.min_stock_alert || '-'}</span>
                        )}
                      </td>
                      <td style={tdStyle}>
                        <button
                          className="gfh-portal-btn"
                          style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '5px 10px', fontSize: 12, fontWeight: 700, borderRadius: 8, background: '#991b1b', color: '#fff', border: 'none', cursor: 'pointer' }}
                          onClick={() => handleDelete(item.id)}
                        >
                          <Icon path={ICONS.trash} size={12} />
                          Delete
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 61, 58, 0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div
            className="fade-in"
            style={{
              position: 'relative',
              width: 480,
              padding: 30,
              background: '#ffffff',
              borderRadius: 8,
              border: `1px solid ${THEME.border}`,
            }}
          >
            <CornerBrackets />
            <h2 style={{ fontFamily: "'Poppins', sans-serif", fontSize: 20, fontWeight: 700, marginBottom: 20, color: '#0F172A' }}>
              Add inventory item
            </h2>
            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div>
                  <label style={labelStyle}>Item name</label>
                  <input style={inputStyle} placeholder="e.g. Door lock" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
                </div>
                <div>
                  <label style={labelStyle}>Category</label>
                  <input style={inputStyle} placeholder="e.g. Hardware" value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} required />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div>
                  <label style={labelStyle}>Quantity</label>
                  <input type="number" style={inputStyle} value={formData.quantity} onChange={e => setFormData({ ...formData, quantity: e.target.value })} required />
                </div>
                <div>
                  <label style={labelStyle}>Unit price (AED)</label>
                  <input type="number" style={inputStyle} value={formData.unit_price} onChange={e => setFormData({ ...formData, unit_price: e.target.value })} required />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div>
                  <label style={labelStyle}>Location type</label>
                  <select style={inputStyle} value={formData.location_type} onChange={e => setFormData({ ...formData, location_type: e.target.value as any })}>
                    <option value="warehouse">Warehouse stock</option>
                    <option value="unit">Unit-level</option>
                  </select>
                </div>
                {formData.location_type === 'unit' ? (
                  <div>
                    <label style={labelStyle}>Unit ID</label>
                    <input type="number" style={inputStyle} value={formData.unit_id} onChange={e => setFormData({ ...formData, unit_id: e.target.value })} required />
                  </div>
                ) : (
                  <div>
                    <label style={labelStyle}>Min stock alert</label>
                    <input type="number" style={inputStyle} value={formData.min_stock_alert} onChange={e => setFormData({ ...formData, min_stock_alert: e.target.value })} />
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 10 }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  style={{ borderRadius: 8, fontWeight: 700, fontSize: 13, padding: '9px 16px', background: '#f1f5f9', color: '#64748b', border: '1px solid #cbd5e1', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    borderRadius: 8,
                    fontWeight: 700,
                    fontSize: 13,
                    padding: '9px 18px',
                    background: '#0E5E48',
                    color: '#ffffff',
                    border: 'none',
                    cursor: 'pointer',
                    boxShadow: '0 1px 3px rgba(14, 94, 72, 0.25)',
                  }}
                >
                  Save item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
