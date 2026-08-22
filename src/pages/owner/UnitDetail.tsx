import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import api from '../../api/axios'
import { THEME, portalPageCss, heroStyle, panelStyle, ghostBtnStyle, RADIUS } from '../../components/gfh/adminTheme'
import { safeUpper } from '../../utils/safeLabel'

interface UnitDetail {
  id: number
  number: string
  floor: number
  type: string
  size: number | string | null
  furnished: boolean
  price: number
  status: string
  dhewa_no?: string | null
  category?: string | null
  property?: {
    id: number
    name: string
    address: string
    city: string
  }
}

export default function UnitDetailPage() {
  const { unitId } = useParams<{ unitId: string }>()
  const [unit, setUnit] = useState<UnitDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchUnit = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const res = await api.get(`/owner/dashboard/units/${unitId}`)
        setUnit(res.data.data.unit)
      } catch (err: any) {
        console.error(err)
        setError(err?.response?.data?.message || 'Failed to load unit details.')
      } finally {
        setIsLoading(false)
      }
    }
    if (unitId) fetchUnit()
  }, [unitId])

  return (
    <div className="gfh-portal-page" style={{ fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif" }}>
      <style>{portalPageCss}</style>

      <div className="fade-in" style={heroStyle}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 800, color: THEME.ink, margin: 0 }}>Unit details</div>
          <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 6 }}>Full unit information for your portfolio</div>
        </div>
        <Link to="/owner/properties" className="gfh-portal-btn" style={{ ...ghostBtnStyle, background: '#075985' }}>
          ← Back to properties
        </Link>
      </div>

      <div className="fade-in" style={{ ...panelStyle, minHeight: 280 }}>
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: 40 }}><span className="spinner" /></div>
        ) : error ? (
          <div style={{ textAlign: 'center', padding: 40, color: '#991b1b', fontWeight: 600 }}>{error}</div>
        ) : !unit ? (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <p style={{ fontSize: 14, color: THEME.textMuted, fontWeight: 500 }}>Unit not found.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 20 }}>
            <div style={{ paddingBottom: 18, borderBottom: `1px solid ${THEME.border}` }}>
              <div style={{ fontSize: 12, color: THEME.textMuted, fontWeight: 700, letterSpacing: '0.3px', textTransform: 'uppercase' }}>Property</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: THEME.ink, marginTop: 4 }}>
                {unit.property?.name || '—'}
              </div>
              <div style={{ fontSize: 14, color: THEME.textMuted, fontWeight: 500, marginTop: 2 }}>
                {unit.property?.address}{unit.property?.city ? `, ${unit.property.city}` : ''}
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14 }}>
              <Detail label="Unit number" value={unit.number} />
              <Detail label="Type" value={unit.type} />
              <Detail label="Floor" value={String(unit.floor)} />
              <Detail label="Status" value={safeUpper(unit.status)} />
              <Detail label="Size" value={unit.size != null ? String(unit.size) : '—'} />
              <Detail label="Furnished" value={unit.furnished ? 'Yes' : 'No'} />
              <Detail label="Rent (AED)" value={Number(unit.price).toLocaleString()} />
              <Detail label="DEWA no." value={unit.dhewa_no || '—'} />
              <Detail label="Category" value={unit.category || '—'} />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="gfh-portal-stat" style={{ padding: 14, border: `1px solid ${THEME.border}`, borderRadius: 0, background: '#fff' }}>
      <div style={{ fontSize: 11, color: THEME.textMuted, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.4px' }}>{label}</div>
      <div style={{ fontSize: 16, fontWeight: 700, color: THEME.ink, marginTop: 6 }}>{value}</div>
    </div>
  )
}
