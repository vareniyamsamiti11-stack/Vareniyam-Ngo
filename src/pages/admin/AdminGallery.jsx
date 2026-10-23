import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { uploadImage, validateImageFile } from '../../lib/storage'
import { AdminShell } from './AdminDashboard'
import { Upload, Trash2, X, Plus, Filter, Image as ImageIcon, Check } from 'lucide-react'
import styles from './AdminLayout.module.css'

const CATEGORIES = [
  { id: 'all', label: 'All Photos' },
  { id: 'navankar-project', label: 'Navankar Project' },
  { id: 'mental-health-awareness', label: 'Mental Health' },
  { id: 'prashishta-patra', label: 'Prashishta Patra' },
  { id: 'm-power', label: 'M-Power' },
  { id: 'aditya-birla-education-trust', label: 'Aditya Birla Trust' },
  { id: 'tree-plantation', label: 'Plantation & Green' },
  { id: 'events', label: 'Events & Campaigns' },
  { id: 'general', label: 'General Gallery' },
]

export default function AdminGallery() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [events, setEvents] = useState([])
  const [programs, setPrograms] = useState([])

  // Upload modal / state
  const [showUploader, setShowUploader] = useState(false)
  const [uploadCategory, setUploadCategory] = useState('general')
  const [linkedEventId, setLinkedEventId] = useState('')
  const [linkedProgramSlug, setLinkedProgramSlug] = useState('')
  const [sharedCaption, setSharedCaption] = useState('')
  const [selectedFiles, setSelectedFiles] = useState([]) // Array of { file, previewUrl, caption }
  
  const [submitting, setSubmitting] = useState(false)
  const [deleteItem, setDeleteItem] = useState(null)
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  async function loadGallery() {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('gallery_items')
        .select('*')
        .order('created_at', { ascending: false })
      if (!error && data) setItems(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  async function loadRelated() {
    try {
      const [evRes, prRes] = await Promise.all([
        supabase.from('events').select('id, title').order('title'),
        supabase.from('programs').select('slug, title').order('title'),
      ])
      if (evRes.data) setEvents(evRes.data)
      if (prRes.data) setPrograms(prRes.data)
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    loadGallery()
    loadRelated()
  }, [])

  function handleFilesSelect(e) {
    const files = Array.from(e.target.files || [])
    const validBatch = []
    for (const f of files) {
      const v = validateImageFile(f)
      if (v.valid) {
        validBatch.push({
          file: f,
          previewUrl: URL.createObjectURL(f),
          caption: f.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '),
        })
      } else {
        setErrorMsg(`"${f.name}": ${v.error}`)
      }
    }
    setSelectedFiles(prev => [...prev, ...validBatch])
  }

  function removeSelectedFile(index) {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index))
  }

  async function handleBatchUpload(e) {
    e.preventDefault()
    if (selectedFiles.length === 0) {
      setErrorMsg('Please choose at least one photo to upload.')
      return
    }
    setSubmitting(true)
    setErrorMsg('')

    try {
      let uploadedCount = 0
      for (const item of selectedFiles) {
        const upRes = await uploadImage(item.file, `gallery/${uploadCategory}`)
        const imgUrl = upRes.url || item.previewUrl
        const caption = item.caption || sharedCaption || 'VSKS Community Photo'

        await supabase.from('gallery_items').insert({
          image_url: imgUrl,
          caption: caption,
          category: uploadCategory,
          event_id: linkedEventId || null,
          program_slug: linkedProgramSlug || null,
        })
        uploadedCount++
      }

      setSuccessMsg(`Successfully uploaded ${uploadedCount} photo${uploadedCount > 1 ? 's' : ''}!`)
      setSelectedFiles([])
      setSharedCaption('')
      setShowUploader(false)
      loadGallery()
    } catch (err) {
      setErrorMsg(err.message || 'Failed to upload photos.')
    } finally {
      setSubmitting(false)
    }
  }

  async function confirmDelete() {
    if (!deleteItem) return
    try {
      const { error } = await supabase.from('gallery_items').delete().eq('id', deleteItem.id)
      if (error) throw error
      setSuccessMsg('Photo deleted successfully.')
      setDeleteItem(null)
      loadGallery()
    } catch (err) {
      setErrorMsg(err.message || 'Failed to delete photo.')
    }
  }

  const filteredItems = items.filter(item => {
    if (selectedCategory === 'all') return true
    return item.category === selectedCategory
  })

  return (
    <AdminShell active="/admin/gallery">
      <div className={styles.pageHeader}>
        <h1>Photo Gallery Management</h1>
        <p>Batch upload photos, assign categories, tag events/programs, and manage galleries.</p>
      </div>

      {successMsg && <div className={styles.successBanner}>{successMsg}</div>}
      {errorMsg && <div className={styles.errorBanner}>{errorMsg}</div>}

      <div className={styles.actionHeader}>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <Filter size={16} style={{ color: 'var(--color-mid-gray)' }} />
          <span style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--fw-semi)', color: 'var(--color-mid-gray)', textTransform: 'uppercase' }}>
            Filter:
          </span>
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              className={`${styles.tabButton} ${selectedCategory === cat.id ? styles.tabButtonActive : ''}`}
              style={{ padding: '0.4rem 0.8rem', fontSize: 'var(--text-xs)' }}
              onClick={() => setSelectedCategory(cat.id)}
            >
              {cat.label}
            </button>
          ))}
        </div>
        <button
          className={styles.btnPrimary}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          onClick={() => {
            setShowUploader(true)
            setSelectedFiles([])
            setErrorMsg('')
          }}
        >
          <Upload size={18} /> Upload Photos
        </button>
      </div>

      {/* Batch Upload Modal */}
      {showUploader && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalCard} style={{ maxWidth: '640px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2 className={styles.modalTitle} style={{ margin: 0 }}>Upload Multiple Photos</h2>
              <button
                type="button"
                onClick={() => setShowUploader(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-mid-gray)' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleBatchUpload} className={styles.formGrid}>
              <div className={styles.uploadZone}>
                <label style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                  <Upload size={32} style={{ color: 'var(--color-saffron)' }} />
                  <span style={{ fontWeight: 'var(--fw-semi)', color: 'var(--color-earth)' }}>
                    Select Photos from Your Computer
                  </span>
                  <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-mid-gray)' }}>
                    JPG, PNG, WEBP · Up to 5MB each · Select many photos at once
                  </span>
                  <input
                    type="file"
                    multiple
                    accept="image/jpeg,image/png,image/webp"
                    style={{ display: 'none' }}
                    onChange={handleFilesSelect}
                  />
                </label>
              </div>

              {selectedFiles.length > 0 && (
                <div>
                  <p style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--fw-semi)', color: 'var(--color-teal)', margin: '0 0 0.5rem' }}>
                    {selectedFiles.length} photo{selectedFiles.length > 1 ? 's' : ''} ready for upload (preview before saving):
                  </p>
                  <div className={styles.previewGrid} style={{ maxHeight: '180px', overflowY: 'auto' }}>
                    {selectedFiles.map((item, idx) => (
                      <div key={idx} className={styles.previewCard}>
                        <img src={item.previewUrl} alt="Preview" className={styles.previewImg} />
                        <button
                          type="button"
                          className={styles.previewRemove}
                          onClick={() => removeSelectedFile(idx)}
                          title="Remove photo"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className={styles.formRow}>
                <div className={styles.formField}>
                  <label className={styles.formLabel}>Gallery Category</label>
                  <select
                    className={styles.formSelect}
                    value={uploadCategory}
                    onChange={e => setUploadCategory(e.target.value)}
                  >
                    {CATEGORIES.filter(c => c.id !== 'all').map(c => (
                      <option key={c.id} value={c.id}>{c.label}</option>
                    ))}
                  </select>
                </div>
                <div className={styles.formField}>
                  <label className={styles.formLabel}>Tag to Program (Optional)</label>
                  <select
                    className={styles.formSelect}
                    value={linkedProgramSlug}
                    onChange={e => setLinkedProgramSlug(e.target.value)}
                  >
                    <option value="">-- None --</option>
                    {programs.map(pr => (
                      <option key={pr.slug} value={pr.slug}>{pr.title}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formField}>
                  <label className={styles.formLabel}>Tag to Event (Optional)</label>
                  <select
                    className={styles.formSelect}
                    value={linkedEventId}
                    onChange={e => setLinkedEventId(e.target.value)}
                  >
                    <option value="">-- None --</option>
                    {events.map(ev => (
                      <option key={ev.id} value={ev.id}>{ev.title}</option>
                    ))}
                  </select>
                </div>
                <div className={styles.formField}>
                  <label className={styles.formLabel}>Default Caption</label>
                  <input
                    type="text"
                    className={styles.formInput}
                    value={sharedCaption}
                    onChange={e => setSharedCaption(e.target.value)}
                    placeholder="e.g. Tree plantation drive with students"
                  />
                </div>
              </div>

              <div className={styles.modalActions}>
                <button
                  type="button"
                  className={styles.btnSecondary}
                  onClick={() => setShowUploader(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={styles.btnPrimary}
                  disabled={submitting || selectedFiles.length === 0}
                >
                  {submitting ? 'Uploading...' : `Upload ${selectedFiles.length} Photo${selectedFiles.length > 1 ? 's' : ''}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Gallery Items Grid */}
      {loading ? (
        <div className={styles.loading}>Loading photos...</div>
      ) : filteredItems.length === 0 ? (
        <div className={styles.empty} style={{ textAlign: 'center', padding: '3rem 1rem' }}>
          <ImageIcon size={48} style={{ color: 'var(--color-mid-gray)', marginBottom: '1rem' }} />
          <p>No photos in this category yet. Click "Upload Photos" above to add some!</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1.25rem' }}>
          {filteredItems.map(item => (
            <div
              key={item.id}
              style={{
                background: 'var(--color-white)',
                borderRadius: 'var(--radius-md)',
                overflow: 'hidden',
                boxShadow: 'var(--shadow-card)',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <div style={{ position: 'relative', width: '100%', aspectRatio: '4/3', background: 'var(--color-warm-gray)' }}>
                <img
                  src={item.image_url}
                  alt={item.caption || 'Gallery photo'}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  loading="lazy"
                />
                <button
                  type="button"
                  onClick={() => setDeleteItem(item)}
                  style={{
                    position: 'absolute',
                    top: '8px',
                    right: '8px',
                    background: 'rgba(0,0,0,0.65)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '50%',
                    width: '28px',
                    height: '28px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                  }}
                  title="Delete photo"
                >
                  <Trash2 size={14} />
                </button>
              </div>
              <div style={{ padding: '0.85rem', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <p style={{ margin: '0 0 0.5rem', fontSize: 'var(--text-sm)', fontWeight: 'var(--fw-medium)', color: 'var(--color-earth)' }}>
                  {item.caption || 'Untitled photo'}
                </p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className={styles.badge} style={{ background: 'rgba(232,101,26,0.1)', color: 'var(--color-saffron)' }}>
                    {item.category || 'General'}
                  </span>
                  <small style={{ color: 'var(--color-mid-gray)', fontSize: '11px' }}>
                    {new Date(item.created_at).toLocaleDateString('en-IN')}
                  </small>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteItem && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalCard}>
            <h3 className={styles.modalTitle}>Confirm Delete Photo</h3>
            <p className={styles.modalText}>
              Are you sure you want to delete this photo?
            </p>
            {deleteItem.image_url && (
              <img
                src={deleteItem.image_url}
                alt="To delete"
                style={{ width: '100%', height: '140px', objectFit: 'cover', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem' }}
              />
            )}
            <div className={styles.modalActions}>
              <button
                className={styles.btnSecondary}
                onClick={() => setDeleteItem(null)}
              >
                Cancel
              </button>
              <button
                className={styles.btnDanger}
                style={{ background: 'var(--color-error)', color: 'white' }}
                onClick={confirmDelete}
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminShell>
  )
}
