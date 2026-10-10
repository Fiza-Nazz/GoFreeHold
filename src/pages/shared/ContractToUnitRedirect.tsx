import { useEffect, useState } from 'react'
import { Navigate, useParams } from 'react-router-dom'
import api from '../../api/axios'

/**
 * Owner / cashier / accountant no longer use ContractDetailPage.
 * Deep links like /owner/contracts/6 redirect to the unit page instead.
 */
export default function ContractToUnitRedirect({ basePath }: { basePath: string }) {
  const { id } = useParams<{ id: string }>()
  const [unitId, setUnitId] = useState<number | null | undefined>(undefined)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!id) {
      setUnitId(null)
      return
    }
    let cancelled = false
    api
      .get(`/owner/contracts/${id}`)
      .then((res) => {
        if (cancelled) return
        const contract = res.data?.data?.contract || res.data?.data || res.data
        const resolved =
          contract?.unit_id ||
          contract?.unit?.id ||
          null
        setUnitId(resolved ? Number(resolved) : null)
      })
      .catch(() => {
        if (!cancelled) {
          setError('Contract not found')
          setUnitId(null)
        }
      })
    return () => {
      cancelled = true
    }
  }, [id])

  if (unitId === undefined) {
    return (
      <div style={{ padding: 40, textAlign: 'center', color: '#64748B', fontWeight: 500 }}>
        Opening unitΓÇª
      </div>
    )
  }

  if (unitId) {
    return <Navigate to={`${basePath}/units/${unitId}`} replace />
  }

  return <Navigate to={error ? `${basePath}/units` : `${basePath}/contracts`} replace />
}
