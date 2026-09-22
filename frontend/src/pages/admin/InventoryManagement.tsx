import { useEffect, useState, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import api from '../../api/axios'
import { THEME, Icon, ICONS, CornerBrackets, portalPageCss, heroStyle, panelStyle, thStyle, tdStyle } from '../../components/gfh/adminTheme'

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
  search: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z',
  dollar: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
}

const inputStyle: React.CSSProperties = {
  background: '#ffffff',
  border: `1px solid ${THEME.border}`,
  borderRadius: 8,
  color: THEME.ink,
  fontSize: 13.5,
  fontWeight: 500,
  padding: '10px 12px',
  width: '100%',
  outline: 'none',
  boxSizing: 'border-box',
}

const labelStyle: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 700,
  color: '#0F172A',
  letterSpacing: '0.4px',
  textTransform: 'uppercase',
  display: 'block',
  marginBottom: 6,
}

export default function InventoryManagement() {
  const basePath = typeof window !== 'undefined' && window.location.pathname.startsWith('/owner') ? '/owner' : '/admin'
  const [searchParams] = useSearchParams()
  const topbarQuery = (searchParams.get('q') || '').trim().toLowerCase()
  const [tab, setTab] = useState<'warehouse' | 'unit'>('warehouse')
  const [items, setItems] = useState<InventoryItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // In-page filters
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [lowStockOnly, setLowStockOnly] = useState(false)

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
      const url = tab === 'warehouse' ? `${basePath}/inventory/warehouse` : `${basePath}/inventory/unit`
      const res = await api.get(url)
      setItems(res.data?.data?.items || [])
    } catch (err) { console.error(err) }
    finally { setIsLoading(false) }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await api.post(`${basePath}/inventory`, formData)
      setIsModalOpen(false)
      fetchInventory()
      setFormData({ name: '', category: '', quantity: '1', unit_price: '0', location_type: tab, unit_id: '', min_stock_alert: '5', notes: '' })
    } catch (err) { alert('Error adding item') }
  }

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this inventory item?')) {
      await api.delete(`${basePath}/inventory/${id}`)
      fetchInventory()
    }
  }

  // Summary Metrics
  const summaryMetrics = useMemo(() => {
    const totalQuantity = items.reduce((sum, i) => sum + Number(i.quantity || 0), 0)
    const totalValuation = items.reduce((sum, i) => sum + (Number(i.quantity || 0) * Number(i.unit_price || 0)), 0)
    const lowStockCount = items.filter(i => i.min_stock_alert && i.quantity <= i.min_stock_alert).length
    const totalCatalogItems = items.length
    return { totalQuantity, totalValuation, lowStockCount, totalCatalogItems }
  }, [items])

  // Unique categories for the filter
  const categoryOptions = useMemo(() => {
    const cats = Array.from(new Set(items.map(i => i.category).filter(Boolean))) as string[]
    return cats.sort()
  }, [items])

  // Real-time filtered items
  const filteredItems = useMemo(() => {
    const activeSearch = searchTerm.trim().toLowerCase() || topbarQuery
    return items.filter(item => {
      // Low stock only filter
      if (lowStockOnly) {
        const isLow = !!(item.min_stock_alert && item.quantity <= item.min_stock_alert)
        if (!isLow) return false
      }
      // Category filter
      if (categoryFilter !== 'all' && (item.category || '').toLowerCase() !== categoryFilter.toLowerCase()) {
        return false
      }
      // Search filter
      if (activeSearch) {
        const name = (item.name || '').toLowerCase()
        const cat = (item.category || '').toLowerCase()
        const unitNum = (item.unit?.number || '').toLowerCase()
        const propName = (item.unit?.property?.name || '').toLowerCase()
        return name.includes(activeSearch) || cat.includes(activeSearch) || unitNum.includes(activeSearch) || propName.includes(activeSearch)
      }
      return true
    })
  }, [items, searchTerm, topbarQuery, categoryFilter, lowStockOnly])

  return (
    <div className="gfh-portal-page" style={{ fontFamily: "'Poppins', system-ui, sans-serif" }}>
      <style>{portalPageCss}</style>

      {/* Hero Header */}
      <div className="fade-in" style={heroStyle}>
        <CornerBrackets />
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 30, fontWeight: 700, color: THEME.ink, margin: 0 }}>
              Inventory & Stock Management
            </h1>
            <span style={{
              fontSize: 12,
              fontWeight: 700,
              color: '#0E5E48',
              background: '#F0FDF4',
              border: '1px solid #BBF7D0',
              borderRadius: 20,
              padding: '4px 12px',
            }}>
              {items.length} {items.length === 1 ? 'Catalog Item' : 'Catalog Items'}
            </span>
            {summaryMetrics.lowStockCount > 0 && (
              <span style={{
                fontSize: 12,
                fontWeight: 700,
                color: '#FFFFFF',
                background: '#DC2626',
                borderRadius: 20,
                padding: '4px 12px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
              }}>
                <Icon path={icons.alert} size={12} />
                {summaryMetrics.lowStockCount} Low Stock
              </span>
            )}
          </div>
          <p style={{ fontSize: 14, color: THEME.textMuted, marginTop: 8, marginBottom: 0 }}>
            Central warehouse assets, consumable supplies, and unit-assigned equipment tracking
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
          <Icon path={icons.plus} size={15} />
          <span>Add Inventory Item</span>
        </button>
      </div>

      {/* Tabs Row */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, alignItems: 'center' }}>
        {([
          { key: 'warehouse' as const, label: 'Central Warehouse Stock' },
          { key: 'unit' as const, label: 'Unit-Assigned Inventory' },
        ]).map(t => {
          const isActive = tab === t.key
          return (
            <button
              key={t.key}
              onClick={() => { setTab(t.key); setCategoryFilter('all'); setLowStockOnly(false); }}
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

      {/* 4 KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 22 }}>
        <div style={{ padding: '16px 20px', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 10 }}>
          <div style={{ fontSize: 11.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#64748B' }}>
            Total Stock Quantity
          </div>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#0E5E48', marginTop: 4 }}>
            {summaryMetrics.totalQuantity} Units
          </div>
          <div style={{ fontSize: 11.5, color: '#94A3B8', marginTop: 2 }}>In {tab} storage</div>
        </div>

        <div style={{ padding: '16px 20px', background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 10 }}>
          <div style={{ fontSize: 11.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#15803D' }}>
            Stock Valuation
          </div>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#15803D', marginTop: 4 }}>
            AED {Number(summaryMetrics.totalValuation).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
          </div>
          <div style={{ fontSize: 11.5, color: '#16A34A', marginTop: 2 }}>Total asset book value</div>
        </div>

        <div style={{ padding: '16px 20px', background: '#F0F9FF', border: '1px solid #BAE6FD', borderRadius: 10 }}>
          <div style={{ fontSize: 11.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#0369A1' }}>
            Catalog Items
          </div>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#0369A1', marginTop: 4 }}>
            {summaryMetrics.totalCatalogItems}
          </div>
          <div style={{ fontSize: 11.5, color: '#0284C7', marginTop: 2 }}>Unique SKU product codes</div>
        </div>

        <div style={{ padding: '16px 20px', background: '#FAF5FF', border: '1px solid #E9D5FF', borderRadius: 10 }}>
          <div style={{ fontSize: 11.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#7E22CE' }}>
            Low Stock Alerts
          </div>
          <div style={{ fontSize: 24, fontWeight: 800, color: summaryMetrics.lowStockCount > 0 ? '#DC2626' : '#7E22CE', marginTop: 4 }}>
            {summaryMetrics.lowStockCount}
          </div>
          <div style={{ fontSize: 11.5, color: '#9333EA', marginTop: 2 }}>Items requiring reorder</div>
        </div>
      </div>

      {/* Main Table Panel */}
      <div className="fade-in" style={{ ...panelStyle, minHeight: 400, padding: 24 }}>
        <CornerBrackets />

        {/* Toolbar & Filters */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 18, background: '#F8FAFC', padding: '12px 16px', borderRadius: 10, border: '1px solid #E2E8F0' }}>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
              style={{
                padding: '7px 12px',
                fontSize: 12.5,
                borderRadius: 8,
                border: '1px solid #CBD5E1',
                background: '#FFFFFF',
                color: '#334155',
                fontWeight: 600,
                outline: 'none',
                cursor: 'pointer',
              }}
            >
              <option value="all">All Categories</option>
              {categoryOptions.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>

            {/* Low stock quick toggle */}
            <button
              onClick={() => setLowStockOnly(!lowStockOnly)}
              style={{
                padding: '7px 14px',
                fontSize: 12,
                fontWeight: 700,
                borderRadius: 20,
                border: lowStockOnly ? '1px solid #DC2626' : '1px solid #CBD5E1',
                background: lowStockOnly ? '#DC2626' : '#FFFFFF',
                color: lowStockOnly ? '#FFFFFF' : '#475569',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              Low Stock Only ({summaryMetrics.lowStockCount})
            </button>
          </div>

          {/* Search Input */}
          <div style={{ position: 'relative', minWidth: 260, flex: '1 1 240px', maxWidth: 360 }}>
            <input
              type="text"
              placeholder="Search item, category, unit, property..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px 8px 32px',
                fontSize: 12.5,
                borderRadius: 8,
                border: '1px solid #CBD5E1',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
            <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#94A3B8', display: 'flex' }}>
              <Icon path={icons.search} size={14} />
            </span>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                style={{
                  position: 'absolute',
                  right: 8,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#94A3B8',
                  fontSize: 14,
                }}
              >
                ×
              </button>
            )}
          </div>
        </div>

        {isLoading ? (
          <div style={{ textAlign: 'center', padding: 60 }}><span className="spinner" /> Loading inventory...</div>
        ) : filteredItems.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 60 }}>
            <p style={{ fontSize: 14, color: THEME.textMuted, fontWeight: 500 }}>
              {searchTerm || topbarQuery || categoryFilter !== 'all' || lowStockOnly
                ? 'No inventory items matching your selected filters.'
                : `No items found in ${tab} inventory.`}
            </p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: `2px solid ${THEME.border}`, background: '#F8FAFC' }}>
                  {['Item Name', 'Category', 'Stock Qty', 'Unit Price', 'Total Valuation', tab === 'unit' ? 'Assigned Unit' : 'Min Alert', 'Actions'].map(h => (
                    <th key={h} style={thStyle}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredItems.map(item => {
                  const isLow = !!(item.min_stock_alert && item.quantity <= item.min_stock_alert)
                  const lineTotal = Number(item.quantity || 0) * Number(item.unit_price || 0)
                  return (
                    <tr key={item.id} className="gfh-portal-row" style={{ borderBottom: `1px solid ${THEME.border}` }}>
                      <td style={{ ...tdStyle, fontWeight: 700, color: THEME.ink }}>
                        {item.name}
                      </td>
                      <td style={tdStyle}>
                        <span style={{
                          display: 'inline-block',
                          padding: '2px 8px',
                          borderRadius: 4,
                          fontSize: 11,
                          fontWeight: 700,
                          background: '#F1F5F9',
                          color: '#475569',
                          border: '1px solid #CBD5E1',
                        }}>
                          {item.category || 'General'}
                        </span>
                      </td>
                      <td style={tdStyle}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ fontWeight: 800, fontSize: 13, color: isLow ? '#DC2626' : THEME.ink }}>
                            {item.quantity}
                          </span>
                          {isLow && (
                            <span style={{
                              fontSize: 10,
                              fontWeight: 800,
                              color: '#DC2626',
                              background: '#FEE2E2',
                              border: '1px solid #FCA5A5',
                              padding: '2px 6px',
                              borderRadius: 4,
                            }}>
                              LOW
                            </span>
                          )}
                        </div>
                      </td>
                      <td style={{ ...tdStyle, fontWeight: 600, color: '#334155' }}>
                        AED {Number(item.unit_price).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td style={{ ...tdStyle, fontWeight: 700, color: '#0E5E48' }}>
                        AED {lineTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td style={tdStyle}>
                        {tab === 'unit' ? (
                          item.unit ? (
                            <div>
                              <span style={{ fontWeight: 600, color: '#0E5E48' }}>Unit {item.unit.number}</span>
                              {item.unit.property?.name && (
                                <span style={{ fontSize: 11.5, color: '#64748B', display: 'block' }}>
                                  {item.unit.property.name}
                                </span>
                              )}
                            </div>
                          ) : (
                            <span style={{ color: '#94A3B8' }}>Unassigned</span>
                          )
                        ) : (
                          <span style={{ color: '#64748B', fontSize: 12.5 }}>
                            {item.min_stock_alert ? `≤ ${item.min_stock_alert} units` : '—'}
                          </span>
                        )}
                      </td>
                      <td style={tdStyle}>
                        <button
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4,
                            padding: '5px 10px',
                            fontSize: 12,
                            fontWeight: 700,
                            borderRadius: 6,
                            background: '#991B1B',
                            color: '#fff',
                            border: 'none',
                            cursor: 'pointer',
                          }}
                          onClick={() => handleDelete(item.id)}
                        >
                          <Icon path={ICONS.trash} size={12} />
                          <span>Delete</span>
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
