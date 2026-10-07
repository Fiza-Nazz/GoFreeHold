import api from '../api/axios'

export interface UnitImage {
  id: number
  unit_id?: number
  file_name?: string | null
  file_path?: string | null
  url?: string | null
  path?: string | null
  image_url?: string | null
  created_at?: string
}

const MAX_IMAGE_BYTES = 5 * 1024 * 1024
const MAX_IMAGES = 12
const ALLOWED_EXT = /\.(jpe?g|png|webp)$/i

export function isAllowedUnitImage(file: File): string | null {
  if (!ALLOWED_EXT.test(file.name)) return 'Use JPG, PNG, or WEBP images only.'
  if (file.size > MAX_IMAGE_BYTES) return 'Each image must be 5MB or smaller.'
  return null
}

/** Build a browser-usable URL from API image fields. */
export function resolveUnitImageUrl(image: UnitImage | string | null | undefined): string {
  if (!image) return ''
  if (typeof image === 'string') {
    if (/^https?:\/\//i.test(image) || image.startsWith('blob:') || image.startsWith('data:')) return image
    return toPublicUrl(image)
  }
  const raw = image.url || image.image_url || image.file_path || image.path || ''
  if (!raw) return ''
  if (/^https?:\/\//i.test(raw) || raw.startsWith('blob:') || raw.startsWith('data:')) return raw
  return toPublicUrl(raw)
}

function toPublicUrl(path: string): string {
  const cleaned = path.replace(/^\/+/, '')
  const apiBase = (import.meta.env.VITE_API_BASE_URL as string | undefined)
    || 'https://api2.gofreehold.com/public/api'
  // https://host/public/api → https://host/public
  const publicRoot = apiBase.replace(/\/api\/?$/, '')
  if (cleaned.startsWith('storage/')) return `${publicRoot}/${cleaned}`
  if (cleaned.startsWith('public/')) return `${publicRoot.replace(/\/public$/, '')}/${cleaned}`
  return `${publicRoot}/storage/${cleaned}`
}

function extractImages(payload: any): UnitImage[] {
  const candidates = [
    payload?.data?.images,
    payload?.data?.data?.images,
    payload?.images,
    payload?.data,
    payload,
  ]
  for (const c of candidates) {
    if (Array.isArray(c)) {
      return c
        .map((item, idx) => {
          if (typeof item === 'string') {
            return { id: idx + 1, url: item, file_path: item }
          }
          return item as UnitImage
        })
        .filter(Boolean)
    }
  }
  return []
}

export async function fetchUnitImages(unitId: number): Promise<UnitImage[]> {
  try {
    const res = await api.get(`/admin/units/${unitId}/images`)
    const list = extractImages(res.data)
    if (list.length > 0) return list
  } catch {
    /* fall through — images may be nested on the unit */
  }

  try {
    const res = await api.get(`/admin/units/${unitId}`)
    const unit = res.data?.data?.unit || res.data?.data || res.data
    const nested = unit?.images || unit?.unit_images || unit?.photos
    if (Array.isArray(nested)) return extractImages(nested)
  } catch {
    /* ignore */
  }
  return []
}

export async function uploadUnitImages(unitId: number, files: File[]): Promise<void> {
  if (!files.length) return
  if (files.length > MAX_IMAGES) {
    throw new Error(`You can upload up to ${MAX_IMAGES} images.`)
  }

  for (const file of files) {
    const err = isAllowedUnitImage(file)
    if (err) throw new Error(err)
  }

  // Prefer multi-upload in one request; fall back to one-by-one.
  try {
    const payload = new FormData()
    files.forEach((file) => {
      payload.append('images[]', file)
      payload.append('images', file)
    })
    if (files.length === 1) payload.append('image', files[0])
    await api.post(`/admin/units/${unitId}/images`, payload)
    return
  } catch (multiErr: any) {
    // If endpoint rejects multi shape, try single-file posts
    const status = multiErr?.response?.status
    if (status && status !== 404 && status !== 422) {
      // still try singles for older APIs
    }
  }

  for (const file of files) {
    const payload = new FormData()
    payload.append('image', file)
    payload.append('images[]', file)
    await api.post(`/admin/units/${unitId}/images`, payload)
  }
}

export async function deleteUnitImage(unitId: number, imageId: number): Promise<void> {
  await api.delete(`/admin/units/${unitId}/images/${imageId}`)
}

/** Stable Unsplash defaults by unit type (used when no photos uploaded). */
const UNSPLASH_BY_TYPE: Record<string, string> = {
  studio: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1400&q=80',
  'l-studio': 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1400&q=80',
  '1-br': 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1400&q=80',
  '2-br': 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1400&q=80',
  '3-br': 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=1400&q=80',
  '4-br': 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1400&q=80',
  penthouse: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1400&q=80',
  villa: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1400&q=80',
  shop: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1400&q=80',
  office: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1400&q=80',
  warehouse: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1400&q=80',
}

export const DEFAULT_UNIT_IMAGE_URL =
  'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1400&q=80'

const PROPERTY_IMAGES = [
  'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=400&q=80',
]

/** Stable Unsplash building thumbnail for property chips (by id/name). */
export function getDefaultPropertyImageUrl(seed?: number | string | null): string {
  const raw = String(seed ?? '0')
  let hash = 0
  for (let i = 0; i < raw.length; i++) hash = (hash * 31 + raw.charCodeAt(i)) >>> 0
  return PROPERTY_IMAGES[hash % PROPERTY_IMAGES.length]
}

export function getDefaultUnitImageUrl(unitType?: string | null): string {
  const key = (unitType || '').toLowerCase().trim()
  if (!key) return DEFAULT_UNIT_IMAGE_URL
  if (UNSPLASH_BY_TYPE[key]) return UNSPLASH_BY_TYPE[key]
  if (key.includes('studio')) return UNSPLASH_BY_TYPE.studio
  if (key.includes('villa')) return UNSPLASH_BY_TYPE.villa
  if (key.includes('pent')) return UNSPLASH_BY_TYPE.penthouse
  if (key.includes('shop') || key.includes('retail')) return UNSPLASH_BY_TYPE.shop
  if (key.includes('office')) return UNSPLASH_BY_TYPE.office
  if (key.includes('ware')) return UNSPLASH_BY_TYPE.warehouse
  if (/\b4\b|4-?br|4bed/.test(key)) return UNSPLASH_BY_TYPE['4-br']
  if (/\b3\b|3-?br|3bed/.test(key)) return UNSPLASH_BY_TYPE['3-br']
  if (/\b2\b|2-?br|2bed/.test(key)) return UNSPLASH_BY_TYPE['2-br']
  if (/\b1\b|1-?br|1bed/.test(key)) return UNSPLASH_BY_TYPE['1-br']
  return DEFAULT_UNIT_IMAGE_URL
}

export { MAX_IMAGES }
