import { useEffect, useState } from 'react'
import api from '../../api/axios'
import { safeUpper } from '../../utils/safeLabel'
import { THEME, Icon, CornerBrackets, portalPageCss, heroStyle, panelStyle, thStyle, tdStyle, ghostBtnStyle } from '../../components/gfh/adminTheme'

interface PurchaseItem {
  id?: number
  item_name?: string
  qty: number
  price: number
}

interface Purchase {
  id: number
  supplier_name: string
  purchase_date: string
  total_amount: number
  status: 'pending' | 'received' | 'cancelled' | string
  remark?: string
  items?: PurchaseItem[]
}

const STATUS_STYLE: Record<string, { bg: string; color: string }> = {
  pending:   { bg: '#fef3c7', color: '#b45309' },
  received:  { bg: '#d1fae5', color: '#065f46' },
  cancelled: { bg: '#fee2e2', color: '#991b1b' },
}

const icons = {
  plus: 'M12 5v14M5 12h14',
  cart: 'M6 6h15l-1.5 9h-12L6 6zM6 6 5 3H2M9 20a1 1 0 1 0 0-2 1 1 0 0 0 0 2zM18 20a1 1 0 1 0 0-2 1 1 0 0 0 0 2z',
  wallet: 'M21 12V7H5a2 2 0 0 1 0-4h14v4M3 5v14a2 2 0 0 0 2 2h16v-5M18 12a2 2 0 1 0 0 4 2 2 0 0 0 0-4z',
  clock: 'M12 8v4l3 3M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z',
  check: 'M20 6 9 17l-5-5',
  trash: 'M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0-1 14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2L4 6h16z',
  close: 'M18 6 6 18M6 6l12 12',
}

const inputStyle: React.CSSProperties = {
  background: '#ffffff',
  border: `1px solid ${THEME.border}`,
  borderRadius: 0,
  color: THEME.ink,
  fontSize: 14,
  fontWeight: 500,
  padding: '10px 12px',
  width: '100%',
}

const labelStyle: React.CSSProperties = {
  fontSize: 12.5,
  fontWeight: 700,
  color: THEME.violetLight,
  letterSpacing: '0.4px',
  textTransform: 'uppercase',
  display: 'block',
  marginBottom: 6,
}

export default function PurchaseOrderTracker() {
  const [orders, setOrders] = useState<Purchase[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [formData, setFormData] = useState({
    supplier_name: '',
    item_name: '',
    quantity: '1',
    unit_price: '',
    purchase_date: new Date().toISOString().split('T')[0],
    remark: '',
  })

  useEffect(() => { fetchOrders() }, [])

  const fetchOrders = async () => {
    setIsLoading(true)
    try {
      // Real backend: GET /admin/purchases → data.purchases
      const res = await api.get('/admin/purchases')
      setOrders(res.data.data.purchases || [])
    } catch (err) {
      console.error(err)
      setOrders([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    const qty = Math.max(1, parseInt(formData.quantity, 10) || 1)
    const price = Math.max(0, parseFloat(formData.unit_price) || 0)
    try {
      await api.post('/admin/purchases', {
        supplier_name: formData.supplier_name,
        purchase_date: formData.purchase_date,
        remark: formData.remark || undefined,
        items: [
          {
            item_name: formData.item_name,
            qty,
            price,
          },
        ],
      })
      setIsModalOpen(false)
      fetchOrders()
      setFormData({
        supplier_name: '',
        item_name: '',
        quantity: '1',
        unit_price: '',
        purchase_date: new Date().toISOString().split('T')[0],
        remark: '',
      })
    } catch (err) {
      alert('Error creating purchase order')
    }
  }

  const updateStatus = async (id: number, status: string) => {
    try {
      await api.put(`/admin/purchases/${id}/status`, { status })
      fetchOrders()
    } catch (err) {
      alert('Error updating purchase status')
    }
  }

  const handleDelete = async (id: number) => {
    if (confirm('Delete this purchase?')) {
      await api.delete(`/admin/purchases/${id}`)
      fetchOrders()
    }
  }

  const firstItemName = (po: Purchase) => po.items?.[0]?.item_name || '—'
  const firstItemQty = (po: Purchase) => po.items?.[0]?.qty ?? '—'

  // Derived summary stats — computed from real fetched data only
  const totalSpend = orders.reduce((sum, po) => sum + Number(po.total_amount || 0), 0)
  const pendingCount = orders.filter(po => po.status === 'pending').length

  return (
    <div className="gfh-portal-page" style={{ fontFamily: "'Poppins', system-ui, sans-serif" }}>
      <style>{portalPageCss}</style>

      <div className="fade-in" style={heroStyle}>
        <CornerBrackets />
        <div>
          <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 30, fontWeight: 700, color: THEME.ink, margin: 0 }}>
            Purchases
          </h1>
          <p style={{ fontSize: 14, color: THEME.textMuted, marginTop: 8, marginBottom: 0 }}>
            Create and track supplier purchases
          </p>
        </div>
        <button
          type="button"
          className="gfh-portal-btn"
          onClick={() => setIsModalOpen(true)}
          style={ghostBtnStyle}
        >
          <Icon path={icons.plus} size={16} />
          New Purchase
        </button>
      </div>

      {/* Summary stats — derived from real orders data */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 18, marginBottom: 22 }}>
        <div className="gfh-portal-stat" style={{ position: 'relative', background: '#fff', border: `1px solid ${THEME.border}`, borderRadius: 0, padding: 20 }}>
          <CornerBrackets />
          <div style={{ width: 40, height: 40, borderRadius: 0, background: `linear-gradient(135deg, ${THEME.violetLight}, ${THEME.purple})`, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
            <Icon path={icons.cart} size={18} />
          </div>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, fontWeight: 700, color: THEME.ink }}>{orders.length}</div>
          <div style={{ fontSize: 12, color: THEME.textMuted, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.3px', marginTop: 2 }}>Total Purchases</div>
        </div>

        <div className="gfh-portal-stat" style={{ position: 'relative', background: '#fff', border: `1px solid ${THEME.border}`, borderRadius: 0, padding: 20, animationDelay: '0.06s' }}>
          <CornerBrackets />
          <div style={{ width: 40, height: 40, borderRadius: 0, background: `linear-gradient(135deg, ${THEME.violetLight}, ${THEME.purple})`, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
            <Icon path={icons.wallet} size={18} />
          </div>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, fontWeight: 700, color: THEME.ink }}>AED {totalSpend.toLocaleString()}</div>
          <div style={{ fontSize: 12, color: THEME.textMuted, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.3px', marginTop: 2 }}>Total Spend</div>
        </div>

        <div className="gfh-portal-stat" style={{ position: 'relative', background: '#fff', border: `1px solid ${THEME.border}`, borderRadius: 0, padding: 20, animationDelay: '0.12s' }}>
          <CornerBrackets />
          <div style={{ width: 40, height: 40, borderRadius: 0, background: 'linear-gradient(135deg, #f59e0b, #b45309)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
            <Icon path={icons.clock} size={18} />
          </div>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, fontWeight: 700, color: '#b45309' }}>{pendingCount}</div>
          <div style={{ fontSize: 12, color: THEME.textMuted, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.3px', marginTop: 2 }}>Pending Orders</div>
        </div>
      </div>

      <div className="fade-in" style={{ ...panelStyle, minHeight: 400 }}>
        <CornerBrackets />
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: 40 }}><span className="spinner" /></div>
        ) : orders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <p style={{ fontSize: 14, color: THEME.textMuted, fontWeight: 500 }}>No purchases created.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: `2px solid ${THEME.border}` }}>
                  {['ID', 'Supplier', 'Item', 'Qty', 'Total (AED)', 'Date', 'Status', 'Actions'].map(h => (
                    <th key={h} style={thStyle}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {orders.map(po => {
                  const st = STATUS_STYLE[po.status] || { bg: '#e5e7eb', color: '#374151' }
                  return (
                    <tr key={po.id} className="gfh-portal-row" style={{ borderBottom: `1px solid ${THEME.border}` }}>
                      <td style={{ ...tdStyle, fontWeight: 700 }}>#{po.id}</td>
                      <td style={{ ...tdStyle, fontWeight: 600 }}>{po.supplier_name}</td>
                      <td style={tdStyle}>{firstItemName(po)}</td>
                      <td style={tdStyle}>{firstItemQty(po)}</td>
                      <td style={{ ...tdStyle, fontWeight: 700, color: THEME.violetLight }}>{Number(po.total_amount || 0).toLocaleString()}</td>
                      <td style={tdStyle}>{String(po.purchase_date || '').slice(0, 10)}</td>
                      <td style={tdStyle}>
                        <span style={{ backgroundColor: st.bg, color: st.color, padding: '4px 10px', borderRadius: 0, fontSize: 12, fontWeight: 700 }}>
                          {safeUpper(po.status)}
                        </span>
                      </td>
                      <td style={tdStyle}>
                        <div style={{ display: 'flex', gap: 6 }}>
                          {po.status === 'pending' && (
                            <button
                              type="button"
                              className="gfh-portal-btn"
                              style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '5px 10px', fontSize: 12, fontWeight: 700, borderRadius: 0, background: 'linear-gradient(135deg, #22c55e, #15803d)', color: '#fff', border: 'none', cursor: 'pointer' }}
                              onClick={() => updateStatus(po.id, 'received')}
                            >
                              <Icon path={icons.check} size={12} />
                              Mark Received
                            </button>
                          )}
                          <button
                            type="button"
                            className="gfh-portal-btn"
                            style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '5px 10px', fontSize: 12, fontWeight: 700, borderRadius: 0, background: '#991b1b', color: '#fff', border: 'none', cursor: 'pointer' }}
                            onClick={() => handleDelete(po.id)}
                          >
                            <Icon path={icons.trash} size={12} />
                            Delete
                          </button>
                        </div>
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
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(27,14,51,0.55)', backdropFilter: 'blur(3px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="fade-in" style={{ position: 'relative', width: 480, padding: 30, background: '#ffffff', borderRadius: 0, border: `1px solid ${THEME.border}`, boxShadow: '0 24px 55px -18px rgba(27,14,51,0.35)' }}>
            <CornerBrackets />
            <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 22, fontWeight: 700, marginBottom: 20, color: THEME.violetLight }}>
              Create Purchase
            </h2>
            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div>
                  <label style={labelStyle}>Supplier Name</label>
                  <input style={inputStyle} value={formData.supplier_name} onChange={e => setFormData({ ...formData, supplier_name: e.target.value })} required />
                </div>
                <div>
                  <label style={labelStyle}>Item Name</label>
                  <input style={inputStyle} value={formData.item_name} onChange={e => setFormData({ ...formData, item_name: e.target.value })} required />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div>
                  <label style={labelStyle}>Quantity</label>
                  <input type="number" min={1} style={inputStyle} value={formData.quantity} onChange={e => setFormData({ ...formData, quantity: e.target.value })} required />
                </div>
                <div>
                  <label style={labelStyle}>Unit Price (AED)</label>
                  <input type="number" min={0} step="0.01" style={inputStyle} value={formData.unit_price} onChange={e => setFormData({ ...formData, unit_price: e.target.value })} required />
                </div>
              </div>
              <div>
                <label style={labelStyle}>Purchase Date</label>
                <input type="date" style={inputStyle} value={formData.purchase_date} onChange={e => setFormData({ ...formData, purchase_date: e.target.value })} required />
              </div>
              <div>
                <label style={labelStyle}>Remark</label>
                <input style={inputStyle} value={formData.remark} onChange={e => setFormData({ ...formData, remark: e.target.value })} />
              </div>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 10 }}>
                <button type="button" className="gfh-portal-btn" onClick={() => setIsModalOpen(false)} style={{ ...ghostBtnStyle, background: '#f6f1fe', color: THEME.violetLight, border: `1px solid ${THEME.border}` }}>
                  <Icon path={icons.close} size={13} />
                  Cancel
                </button>
                <button type="submit" className="gfh-portal-btn" style={ghostBtnStyle}>
                  <Icon path={icons.check} size={13} />
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}