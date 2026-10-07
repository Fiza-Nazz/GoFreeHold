import { useEffect, useMemo, useRef, useState } from 'react'
import {
  MAX_IMAGES,
  deleteUnitImage,
  fetchUnitImages,
  getDefaultUnitImageUrl,
  isAllowedUnitImage,
  resolveUnitImageUrl,
  uploadUnitImages,
  type UnitImage,
} from '../../utils/unitImages'

type Props = {
  unitId?: number | null
  /** Local files held before the unit exists (create form). */
  pendingFiles?: File[]
  onPendingFilesChange?: (files: File[]) => void
  readOnly?: boolean
  compact?: boolean
  title?: string
  onChanged?: () => void
  /** Show Unsplash placeholder when the unit has no photos. */
  showDefaultImage?: boolean
  unitType?: string | null
}

export default function UnitImageGallery({
  unitId,
  pendingFiles = [],
  onPendingFilesChange,
  readOnly = false,
  compact = false,
  title = 'Unit Photos',
  onChanged,
  showDefaultImage = false,
  unitType,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [images, setImages] = useState<UnitImage[]>([])
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null)

  const pendingPreviews = useMemo(
    () => pendingFiles.map((file) => ({ file, url: URL.createObjectURL(file) })),
    [pendingFiles],
  )

  useEffect(() => {
    return () => {
      pendingPreviews.forEach((p) => URL.revokeObjectURL(p.url))
    }
  }, [pendingPreviews])

  const load = async () => {
    if (!unitId) {
      setImages([])
      return
    }
    setLoading(true)
    setError('')
    try {
      const list = await fetchUnitImages(unitId)
      setImages(list)
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Unable to load unit photos.')
      setImages([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unitId])

  const totalCount = images.length + pendingFiles.length
  const canUpload = !readOnly && totalCount < MAX_IMAGES

  const handleFilesSelected = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return
    setError('')
    const incoming = Array.from(fileList)
    const remaining = MAX_IMAGES - totalCount
    if (remaining <= 0) {
      setError(`Maximum ${MAX_IMAGES} photos per unit.`)
      return
    }
    const selected = incoming.slice(0, remaining)
    for (const file of selected) {
      const err = isAllowedUnitImage(file)
      if (err) {
        setError(err)
        return
      }
    }

    // Create mode — keep files locally until unit is saved
    if (!unitId) {
      onPendingFilesChange?.([...pendingFiles, ...selected])
      return
    }

    setUploading(true)
    try {
      await uploadUnitImages(unitId, selected)
      await load()
      onChanged?.()
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Upload failed. Backend may not support unit images yet.')
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  const handleDeleteSaved = async (image: UnitImage) => {
    if (!unitId || readOnly) return
    if (!window.confirm('Delete this photo?')) return
    setError('')
    try {
      await deleteUnitImage(unitId, image.id)
      setImages((prev) => prev.filter((img) => img.id !== image.id))
      onChanged?.()
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Unable to delete photo.')
    }
  }

  const handleRemovePending = (index: number) => {
    if (!onPendingFilesChange) return
    onPendingFilesChange(pendingFiles.filter((_, i) => i !== index))
  }

  const tileSize = compact ? 72 : 110

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#0F766E', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            {title}
          </div>
          <div style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>
            JPG, PNG or WEBP · max 5MB each · up to {MAX_IMAGES} photos
          </div>
        </div>
        {canUpload && (
          <label
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '8px 12px',
              borderRadius: 8,
              border: '1px solid #99F6E4',
              background: '#ECFDF5',
              color: '#065F46',
              fontSize: 12.5,
              fontWeight: 700,
              cursor: uploading ? 'wait' : 'pointer',
              opacity: uploading ? 0.7 : 1,
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            {uploading ? 'Uploading…' : unitId ? 'Upload Photos' : 'Add Photos'}
            <input
              ref={inputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
              multiple
              hidden
              disabled={uploading}
              onChange={(e) => void handleFilesSelected(e.target.files)}
            />
          </label>
        )}
      </div>

      {error && (
        <div style={{ padding: '8px 10px', borderRadius: 8, background: '#FEF2F2', border: '1px solid #FECACA', color: '#991B1B', fontSize: 12.5, fontWeight: 600 }}>
          {error}
        </div>
      )}

      {loading ? (
        <div style={{ fontSize: 13, color: '#64748B', fontWeight: 500 }}>Loading photos…</div>
      ) : images.length === 0 && pendingFiles.length === 0 ? (
        showDefaultImage ? (
          <div style={{ position: 'relative', borderRadius: 12, overflow: 'hidden', border: '1px solid #E2E8F0' }}>
            <button
              type="button"
              onClick={() => setLightboxUrl(getDefaultUnitImageUrl(unitType))}
              style={{ display: 'block', width: '100%', padding: 0, border: 'none', cursor: 'zoom-in', background: '#F1F5F9' }}
              title="View default photo"
            >
              <img
                src={getDefaultUnitImageUrl(unitType)}
                alt="Default unit photo"
                style={{
                  width: '100%',
                  height: compact ? 140 : 260,
                  objectFit: 'cover',
                  display: 'block',
                }}
              />
            </button>
            <div
              style={{
                position: 'absolute',
                left: 10,
                bottom: 10,
                padding: '4px 8px',
                borderRadius: 6,
                background: 'rgba(15,23,42,0.72)',
                color: '#FFFFFF',
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: '0.02em',
              }}
            >
              Default photo · Unsplash
            </div>
          </div>
        ) : (
          <div
            style={{
              border: '1px dashed #CBD5E1',
              borderRadius: 10,
              padding: compact ? '16px 12px' : '22px 14px',
              textAlign: 'center',
              color: '#94A3B8',
              fontSize: 13,
              fontWeight: 500,
              background: '#F8FAFC',
            }}
          >
            No unit photos yet
          </div>
        )
      ) : (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
          {images.map((image) => {
            const url = resolveUnitImageUrl(image)
            return (
              <div
                key={`saved-${image.id}`}
                style={{
                  width: tileSize,
                  height: tileSize,
                  borderRadius: 10,
                  overflow: 'hidden',
                  border: '1px solid #E2E8F0',
                  position: 'relative',
                  background: '#F1F5F9',
                }}
              >
                <button
                  type="button"
                  onClick={() => url && setLightboxUrl(url)}
                  style={{ display: 'block', width: '100%', height: '100%', padding: 0, border: 'none', cursor: 'pointer', background: 'transparent' }}
                  title="View photo"
                >
                  {url ? (
                    <img src={url} alt={image.file_name || 'Unit photo'} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                  ) : (
                    <span style={{ fontSize: 11, color: '#94A3B8' }}>No preview</span>
                  )}
                </button>
                {!readOnly && (
                  <button
                    type="button"
                    onClick={() => void handleDeleteSaved(image)}
                    title="Delete photo"
                    style={{
                      position: 'absolute',
                      top: 4,
                      right: 4,
                      width: 22,
                      height: 22,
                      borderRadius: 999,
                      border: 'none',
                      background: 'rgba(15,23,42,0.72)',
                      color: '#fff',
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: 'pointer',
                      lineHeight: '22px',
                    }}
                  >
                    ×
                  </button>
                )}
              </div>
            )
          })}

          {pendingPreviews.map((item, index) => (
            <div
              key={`pending-${item.file.name}-${index}`}
              style={{
                width: tileSize,
                height: tileSize,
                borderRadius: 10,
                overflow: 'hidden',
                border: '1px solid #A7F3D0',
                position: 'relative',
                background: '#ECFDF5',
              }}
            >
              <img src={item.url} alt={item.file.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
              {!readOnly && (
                <button
                  type="button"
                  onClick={() => handleRemovePending(index)}
                  title="Remove"
                  style={{
                    position: 'absolute',
                    top: 4,
                    right: 4,
                    width: 22,
                    height: 22,
                    borderRadius: 999,
                    border: 'none',
                    background: 'rgba(15,23,42,0.72)',
                    color: '#fff',
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: 'pointer',
                    lineHeight: '22px',
                  }}
                >
                  ×
                </button>
              )}
              <div style={{ position: 'absolute', left: 4, bottom: 4, background: 'rgba(6,95,70,0.85)', color: '#fff', fontSize: 9, fontWeight: 700, padding: '2px 5px', borderRadius: 4 }}>
                NEW
              </div>
            </div>
          ))}
        </div>
      )}

      {lightboxUrl && (
        <div
          onClick={() => setLightboxUrl(null)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 2000,
            background: 'rgba(15,23,42,0.82)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 24,
            cursor: 'zoom-out',
          }}
        >
          <img
            src={lightboxUrl}
            alt="Unit photo"
            style={{ maxWidth: 'min(960px, 96vw)', maxHeight: '90vh', borderRadius: 10, boxShadow: '0 20px 50px rgba(0,0,0,0.35)' }}
          />
        </div>
      )}
    </div>
  )
}
