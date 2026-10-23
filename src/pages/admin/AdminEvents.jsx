import { useEffect, useState, useMemo } from 'react'
import { supabase } from '../../lib/supabase'
import { uploadImage, validateImageFile } from '../../lib/storage'
import { AdminShell } from './AdminDashboard'
import { Plus, Pencil, Trash2, Search, Calendar, MapPin, X, Upload, Image as ImageIcon } from 'lucide-react'
import styles from './AdminLayout.module.css'

const EMPTY_EVENT = {
  title: '',
  event_date: new Date().toISOString().split('T')[0],
  location: '',
  category: 'General',
  short_desc: '',
  full_desc: '',
  cover_image: '',
  status: 'published',
}

export default function AdminEvents() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(EMPTY_EVENT)
  
  // Gallery images for the event
  const [existingImages, setExistingImages] = useState([])
  const [newImageFiles, setNewImageFiles] = useState([]) // Array of { file, previewUrl }
  const [coverFile, setCoverFile] = useState(null)
  const [coverPreview, setCoverPreview] = useState('')

  // Delete modal state
  const [deleteEvent, setDeleteEvent] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  async function loadEvents() {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('event_date', { ascending: false })
      if (!error && data) setEvents(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadEvents()
  }, [])

  function openCreate() {
    setForm(EMPTY_EVENT)
    setEditingId(null)
    setExistingImages([])
    setNewImageFiles([])
    setCoverFile(null)
    setCoverPreview('')
    setErrorMsg('')
    setSuccessMsg('')
    setShowForm(true)
  }

  async function openEdit(evt) {
    setForm({
      title: evt.title || '',
      event_date: evt.event_date || new Date().toISOString().split('T')[0],
      location: evt.location || '',
      category: evt.category || 'General',
      short_desc: evt.short_desc || '',
      full_desc: evt.full_desc || '',
      cover_image: evt.cover_image || '',
      status: evt.status || 'published',
    })
    setEditingId(evt.id)
    setCoverFile(null)
    setCoverPreview(evt.cover_image || '')
    setNewImageFiles([])
    setErrorMsg('')
    setSuccessMsg('')
    setShowForm(true)

    // Load existing event images
    try {
      const { data } = await supabase
        .from('event_images')
        .select('*')
        .eq('event_id', evt.id)
        .order('sort_order', { ascending: true })
      setExistingImages(data || [])
    } catch (err) {
      console.error(err)
    }
  }

  function handleCoverChange(e) {
    const file = e.target.files?.[0]
    if (!file) return
    const validation = validateImageFile(file)
    if (!validation.valid) {
      setErrorMsg(validation.error)
      return
    }
    setCoverFile(file)
    setCoverPreview(URL.createObjectURL(file))
  }

  function handleGalleryChange(e) {
    const files = Array.from(e.target.files || [])
    const validFiles = []
    for (const f of files) {
      const v = validateImageFile(f)
      if (v.valid) {
        validFiles.push({ file: f, previewUrl: URL.createObjectURL(f) })
      } else {
        setErrorMsg(`"${f.name}": ${v.error}`)
      }
    }
    setNewImageFiles(prev => [...prev, ...validFiles])
  }

  function removeNewImage(idx) {
    setNewImageFiles(prev => prev.filter((_, i) => i !== idx))
  }

  async function deleteExistingImage(imgId) {
    try {
      await supabase.from('event_images').delete().eq('id', imgId)
      setExistingImages(prev => prev.filter(img => img.id !== imgId))
    } catch (err) {
      console.error(err)
    }
  }

  async function handleSave(e) {
    e.preventDefault()
    if (!form.title.trim()) {
      setErrorMsg('Event title is required.')
      return
    }
    setSubmitting(true)
    setErrorMsg('')

    try {
      let coverUrl = form.cover_image
      if (coverFile) {
        const uploadRes = await uploadImage(coverFile, 'events')
        if (uploadRes.url) {
          coverUrl = uploadRes.url
        } else if (uploadRes.error) {
          console.warn('Cover upload note:', uploadRes.error)
        }
      }

      const slug = form.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '') || `event-${Date.now()}`

      const payload = {
        title: form.title,
        slug: editingId ? undefined : slug,
        event_date: form.event_date,
        location: form.location,
        category: form.category,
        short_desc: form.short_desc,
        full_desc: form.full_desc,
        cover_image: coverUrl,
        status: form.status,
        updated_at: new Date().toISOString(),
      }
      if (!editingId) payload.slug = slug

      let eventId = editingId
      if (editingId) {
        const { error } = await supabase.from('events').update(payload).eq('id', editingId)
        if (error) throw error
      } else {
        const { data, error } = await supabase.from('events').insert(payload).select().single()
        if (error) throw error
        eventId = data.id
      }

      // Upload and insert new gallery images if any
      if (newImageFiles.length > 0 && eventId) {
        for (const item of newImageFiles) {
          const upRes = await uploadImage(item.file, 'events/gallery')
          const imgUrl = upRes.url || item.previewUrl
          await supabase.from('event_images').insert({
            event_id: eventId,
            image_url: imgUrl,
            caption: form.title,
          })
        }
      }

      setSuccessMsg(`Event successfully ${editingId ? 'updated' : 'created'}!`)
      setShowForm(false)
      loadEvents()
    } catch (err) {
      setErrorMsg(err.message || 'Failed to save event.')
    } finally {
      setSubmitting(false)
    }
  }

  async function confirmDelete() {
    if (!deleteEvent) return
    try {
      const { error } = await supabase.from('events').delete().eq('id', deleteEvent.id)
      if (error) throw error
      setSuccessMsg(`"${deleteEvent.title}" was deleted.`)
      setDeleteEvent(null)
      loadEvents()
    } catch (err) {
      setErrorMsg(err.message || 'Failed to delete event.')
    }
  }

  const filteredEvents = useMemo(() => {
    return events.filter(e =>
      (e.title || '').toLowerCase().includes(search.toLowerCase()) ||
      (e.location || '').toLowerCase().includes(search.toLowerCase()) ||
      (e.category || '').toLowerCase().includes(search.toLowerCase())
    )
  }, [events, search])

  return (
    <AdminShell active="/admin/events">
      <div className={styles.pageHeader}>
        <h1>Events Management</h1>
        <p>Create, edit, and organize community events and campaigns.</p>
      </div>

      {successMsg && <div className={styles.successBanner}>{successMsg}</div>}
      {errorMsg && <div className={styles.errorBanner}>{errorMsg}</div>}

      <div className={styles.actionHeader}>
        <div className={styles.searchWrap}>
          <Search size={18} style={{ color: 'var(--color-mid-gray)' }} />
          <input
            type="text"
            placeholder="Search events by title, location, or category..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <button
          className={styles.btnPrimary}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          onClick={openCreate}
        >
          <Plus size={18} /> Add New Event
        </button>
      </div>

      {/* Event Form (Create / Edit) */}
      {showForm && (
        <div className={styles.formCard} style={{ marginBottom: '2.5rem' }}>
          <h2>{editingId ? 'Edit Event' : 'Create New Event'}</h2>
          <form onSubmit={handleSave} className={styles.formGrid}>
            <div className={styles.formRow}>
              <div className={styles.formField}>
                <label className={styles.formLabel}>Event Title *</label>
                <input
                  type="text"
                  className={styles.formInput}
                  value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Annual Tree Plantation Drive"
                  required
                />
              </div>
              <div className={styles.formField}>
                <label className={styles.formLabel}>Date *</label>
                <input
                  type="date"
                  className={styles.formInput}
                  value={form.event_date}
                  onChange={e => setForm({ ...form, event_date: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className={styles.formRow}>
              <div className={styles.formField}>
                <label className={styles.formLabel}>Location</label>
                <input
                  type="text"
                  className={styles.formInput}
                  value={form.location}
                  onChange={e => setForm({ ...form, location: e.target.value })}
                  placeholder="e.g. Khudel Village, Indore"
                />
              </div>
              <div className={styles.formField}>
                <label className={styles.formLabel}>Category / Program</label>
                <input
                  type="text"
                  className={styles.formInput}
                  value={form.category}
                  onChange={e => setForm({ ...form, category: e.target.value })}
                  placeholder="e.g. Environmental Action, Education, Mental Health"
                />
              </div>
            </div>

            <div className={styles.formRow}>
              <div className={styles.formField}>
                <label className={styles.formLabel}>Status</label>
                <select
                  className={styles.formSelect}
                  value={form.status}
                  onChange={e => setForm({ ...form, status: e.target.value })}
                >
                  <option value="published">Published (Visible to public)</option>
                  <option value="draft">Draft (Hidden from public)</option>
                </select>
              </div>
              <div className={styles.formField}>
                <label className={styles.formLabel}>Cover Photo (JPG, PNG, WEBP &lt; 5MB)</label>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleCoverChange}
                  className={styles.formInput}
                />
              </div>
            </div>

            {coverPreview && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '-0.5rem' }}>
                <img
                  src={coverPreview}
                  alt="Cover preview"
                  style={{ width: '80px', height: '60px', objectFit: 'cover', borderRadius: '4px', border: '1px solid var(--color-warm-gray)' }}
                />
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-mid-gray)' }}>
                  Cover preview {coverFile ? `(${coverFile.name})` : ''}
                </span>
              </div>
            )}

            <div className={styles.formField}>
              <label className={styles.formLabel}>Short Summary (1-2 sentences)</label>
              <input
                type="text"
                className={styles.formInput}
                value={form.short_desc}
                onChange={e => setForm({ ...form, short_desc: e.target.value })}
                placeholder="Brief summary to show on event cards"
              />
            </div>

            <div className={styles.formField}>
              <label className={styles.formLabel}>Full Description</label>
              <textarea
                className={styles.formTextarea}
                rows={5}
                value={form.full_desc}
                onChange={e => setForm({ ...form, full_desc: e.target.value })}
                placeholder="Detailed event background, impact, activities, participants..."
              />
            </div>

            {/* Event Photo Gallery Upload */}
            <div className={styles.formField}>
              <label className={styles.formLabel}>Event Photos Gallery (Multiple allowed)</label>
              <div className={styles.uploadZone}>
                <label style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem' }}>
                  <Upload size={28} style={{ color: 'var(--color-saffron)' }} />
                  <span style={{ fontWeight: 'var(--fw-medium)', fontSize: 'var(--text-sm)', color: 'var(--color-earth)' }}>
                    Click or drag photos here to upload
                  </span>
                  <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-mid-gray)' }}>
                    Supported formats: JPG, PNG, WEBP · Max 5MB per file
                  </span>
                  <input
                    type="file"
                    multiple
                    accept="image/jpeg,image/png,image/webp"
                    style={{ display: 'none' }}
                    onChange={handleGalleryChange}
                  />
                </label>
              </div>

              {/* Photo Previews */}
              {(existingImages.length > 0 || newImageFiles.length > 0) && (
                <div className={styles.previewGrid}>
                  {existingImages.map(img => (
                    <div key={img.id} className={styles.previewCard}>
                      <img src={img.image_url} alt="Saved" className={styles.previewImg} />
                      <button
                        type="button"
                        className={styles.previewRemove}
                        onClick={() => deleteExistingImage(img.id)}
                        title="Delete photo"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                  {newImageFiles.map((item, idx) => (
                    <div key={idx} className={styles.previewCard}>
                      <img src={item.previewUrl} alt="Pending upload" className={styles.previewImg} />
                      <button
                        type="button"
                        className={styles.previewRemove}
                        onClick={() => removeNewImage(idx)}
                        title="Remove preview"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className={styles.formBtns}>
              <button type="submit" className={styles.btnPrimary} disabled={submitting}>
                {submitting ? 'Saving...' : (editingId ? 'Update Event' : 'Create Event')}
              </button>
              <button
                type="button"
                className={styles.btnSecondary}
                onClick={() => setShowForm(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Events Table */}
      {loading ? (
        <div className={styles.loading}>Loading events...</div>
      ) : filteredEvents.length === 0 ? (
        <p className={styles.empty}>No events found.</p>
      ) : (
        <div className={styles.table}>
          <div className={styles.tableHead} style={{ gridTemplateColumns: '1.5fr 1fr 1fr 0.8fr 1fr' }}>
            <span>Title</span>
            <span>Date &amp; Location</span>
            <span>Category</span>
            <span>Status</span>
            <span>Actions</span>
          </div>
          {filteredEvents.map(evt => (
            <div
              key={evt.id}
              className={styles.tableRow}
              style={{ gridTemplateColumns: '1.5fr 1fr 1fr 0.8fr 1fr', alignItems: 'center' }}
            >
              <span style={{ fontWeight: 'var(--fw-medium)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Calendar size={16} style={{ color: 'var(--color-saffron)', flexShrink: 0 }} />
                {evt.title}
              </span>
              <span>
                {new Date(evt.event_date).toLocaleDateString('en-IN')}<br />
                <small style={{ color: 'var(--color-mid-gray)' }}>{evt.location || 'Indore'}</small>
              </span>
              <span>{evt.category || 'General'}</span>
              <span>
                <span className={`${styles.badge} ${evt.status === 'published' ? styles.badgeSuccess : styles.badgeReviewed}`}>
                  {evt.status === 'published' ? 'Published' : 'Draft'}
                </span>
              </span>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  type="button"
                  className={styles.btnSecondary}
                  style={{ padding: '0.35rem 0.65rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                  onClick={() => openEdit(evt)}
                  title="Edit"
                >
                  <Pencil size={14} /> Edit
                </button>
                <button
                  type="button"
                  className={styles.btnDanger}
                  style={{ padding: '0.35rem 0.65rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                  onClick={() => setDeleteEvent(evt)}
                  title="Delete"
                >
                  <Trash2 size={14} /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Popup */}
      {deleteEvent && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalCard}>
            <h3 className={styles.modalTitle}>Confirm Delete</h3>
            <p className={styles.modalText}>
              Are you sure you want to delete the event <strong>"{deleteEvent.title}"</strong>?
              This action cannot be undone and will also remove all linked event photos.
            </p>
            <div className={styles.modalActions}>
              <button
                className={styles.btnSecondary}
                onClick={() => setDeleteEvent(null)}
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
