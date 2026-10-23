import { useEffect, useState, useMemo } from 'react'
import { supabase } from '../../lib/supabase'
import { uploadImage, validateImageFile } from '../../lib/storage'
import { AdminShell } from './AdminDashboard'
import { Plus, Pencil, Trash2, Search, BookOpen, Layers, CheckCircle2 } from 'lucide-react'
import styles from './AdminLayout.module.css'

const EMPTY_PROGRAM = {
  title: '',
  subtitle: '',
  short_desc: '',
  full_desc: '',
  cover_image: '',
  icon: 'BookOpen',
  color: 'var(--color-teal)',
  sort_order: 1,
  is_active: true,
}

export default function AdminPrograms() {
  const [programs, setPrograms] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(EMPTY_PROGRAM)
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState('')
  
  // Delete modal state
  const [deleteProgram, setDeleteProgram] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  async function loadPrograms() {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('programs')
        .select('*')
        .order('sort_order', { ascending: true })
      if (!error && data) setPrograms(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadPrograms()
  }, [])

  function openCreate() {
    setForm({
      ...EMPTY_PROGRAM,
      sort_order: (programs.length + 1),
    })
    setEditingId(null)
    setImageFile(null)
    setImagePreview('')
    setErrorMsg('')
    setSuccessMsg('')
    setShowForm(true)
  }

  function openEdit(prg) {
    setForm({
      title: prg.title || '',
      subtitle: prg.subtitle || '',
      short_desc: prg.short_desc || '',
      full_desc: prg.full_desc || '',
      cover_image: prg.cover_image || '',
      icon: prg.icon || 'BookOpen',
      color: prg.color || 'var(--color-teal)',
      sort_order: prg.sort_order ?? 1,
      is_active: prg.is_active ?? true,
    })
    setEditingId(prg.id)
    setImageFile(null)
    setImagePreview(prg.cover_image || '')
    setErrorMsg('')
    setSuccessMsg('')
    setShowForm(true)
  }

  function handleImageChange(e) {
    const file = e.target.files?.[0]
    if (!file) return
    const v = validateImageFile(file)
    if (!v.valid) {
      setErrorMsg(v.error)
      return
    }
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  async function handleSave(e) {
    e.preventDefault()
    if (!form.title.trim()) {
      setErrorMsg('Program title is required.')
      return
    }
    setSubmitting(true)
    setErrorMsg('')

    try {
      let finalImageUrl = form.cover_image
      if (imageFile) {
        const upRes = await uploadImage(imageFile, 'programs')
        if (upRes.url) {
          finalImageUrl = upRes.url
        } else if (upRes.error) {
          console.warn('Program image upload notice:', upRes.error)
        }
      }

      const slug = form.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '') || `program-${Date.now()}`

      const payload = {
        title: form.title,
        subtitle: form.subtitle,
        short_desc: form.short_desc,
        full_desc: form.full_desc,
        cover_image: finalImageUrl,
        icon: form.icon,
        color: form.color,
        sort_order: parseInt(form.sort_order, 10) || 0,
        is_active: Boolean(form.is_active),
        updated_at: new Date().toISOString(),
      }
      if (!editingId) payload.slug = slug

      if (editingId) {
        const { error } = await supabase.from('programs').update(payload).eq('id', editingId)
        if (error) throw error
      } else {
        const { error } = await supabase.from('programs').insert(payload)
        if (error) throw error
      }

      setSuccessMsg(`Program successfully ${editingId ? 'updated' : 'created'}!`)
      setShowForm(false)
      loadPrograms()
    } catch (err) {
      setErrorMsg(err.message || 'Failed to save program.')
    } finally {
      setSubmitting(false)
    }
  }

  async function confirmDelete() {
    if (!deleteProgram) return
    try {
      const { error } = await supabase.from('programs').delete().eq('id', deleteProgram.id)
      if (error) throw error
      setSuccessMsg(`"${deleteProgram.title}" was deleted.`)
      setDeleteProgram(null)
      loadPrograms()
    } catch (err) {
      setErrorMsg(err.message || 'Failed to delete program.')
    }
  }

  const filteredPrograms = useMemo(() => {
    return programs.filter(p =>
      (p.title || '').toLowerCase().includes(search.toLowerCase()) ||
      (p.subtitle || '').toLowerCase().includes(search.toLowerCase()) ||
      (p.short_desc || '').toLowerCase().includes(search.toLowerCase())
    )
  }, [programs, search])

  return (
    <AdminShell active="/admin/programs">
      <div className={styles.pageHeader}>
        <h1>Programs Management</h1>
        <p>Manage NGO programs, objectives, descriptions, and display orders.</p>
      </div>

      {successMsg && <div className={styles.successBanner}>{successMsg}</div>}
      {errorMsg && <div className={styles.errorBanner}>{errorMsg}</div>}

      <div className={styles.actionHeader}>
        <div className={styles.searchWrap}>
          <Search size={18} style={{ color: 'var(--color-mid-gray)' }} />
          <input
            type="text"
            placeholder="Search programs by title or description..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <button
          className={styles.btnPrimary}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          onClick={openCreate}
        >
          <Plus size={18} /> Add New Program
        </button>
      </div>

      {/* Program Create/Edit Form */}
      {showForm && (
        <div className={styles.formCard} style={{ marginBottom: '2.5rem' }}>
          <h2>{editingId ? 'Edit Program' : 'Create New Program'}</h2>
          <form onSubmit={handleSave} className={styles.formGrid}>
            <div className={styles.formRow}>
              <div className={styles.formField}>
                <label className={styles.formLabel}>Program Title *</label>
                <input
                  type="text"
                  className={styles.formInput}
                  value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Pehchan – Special Education"
                  required
                />
              </div>
              <div className={styles.formField}>
                <label className={styles.formLabel}>Subtitle / Tagline</label>
                <input
                  type="text"
                  className={styles.formInput}
                  value={form.subtitle}
                  onChange={e => setForm({ ...form, subtitle: e.target.value })}
                  placeholder="e.g. School for Special Children"
                />
              </div>
            </div>

            <div className={styles.formRow}>
              <div className={styles.formField}>
                <label className={styles.formLabel}>Display Order (Sort Index)</label>
                <input
                  type="number"
                  className={styles.formInput}
                  value={form.sort_order}
                  onChange={e => setForm({ ...form, sort_order: e.target.value })}
                  min={1}
                />
              </div>
              <div className={styles.formField}>
                <label className={styles.formLabel}>Status</label>
                <select
                  className={styles.formSelect}
                  value={form.is_active ? 'active' : 'inactive'}
                  onChange={e => setForm({ ...form, is_active: e.target.value === 'active' })}
                >
                  <option value="active">Active (Visible on public site)</option>
                  <option value="inactive">Inactive (Hidden)</option>
                </select>
              </div>
            </div>

            <div className={styles.formRow}>
              <div className={styles.formField}>
                <label className={styles.formLabel}>Theme Color Accent</label>
                <select
                  className={styles.formSelect}
                  value={form.color}
                  onChange={e => setForm({ ...form, color: e.target.value })}
                >
                  <option value="var(--color-teal)">Teal (Education &amp; Health)</option>
                  <option value="var(--color-saffron)">Saffron (Community &amp; Livelihood)</option>
                  <option value="var(--color-success)">Green (Environment &amp; Nature)</option>
                  <option value="var(--color-earth)">Earth Brown (Sanitation &amp; Village)</option>
                  <option value="var(--color-error)">Crimson (Crisis &amp; Prevention)</option>
                </select>
              </div>
              <div className={styles.formField}>
                <label className={styles.formLabel}>Cover Image (JPG, PNG, WEBP &lt; 5MB)</label>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleImageChange}
                  className={styles.formInput}
                />
              </div>
            </div>

            {imagePreview && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '-0.5rem' }}>
                <img
                  src={imagePreview}
                  alt="Preview"
                  style={{ width: '80px', height: '60px', objectFit: 'cover', borderRadius: '4px', border: '1px solid var(--color-warm-gray)' }}
                />
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-mid-gray)' }}>
                  Image preview {imageFile ? `(${imageFile.name})` : ''}
                </span>
              </div>
            )}

            <div className={styles.formField}>
              <label className={styles.formLabel}>Short Description (Shown on cards)</label>
              <input
                type="text"
                className={styles.formInput}
                value={form.short_desc}
                onChange={e => setForm({ ...form, short_desc: e.target.value })}
                placeholder="1-2 sentences summarizing this program"
              />
            </div>

            <div className={styles.formField}>
              <label className={styles.formLabel}>Full Description (Shown on details page)</label>
              <textarea
                className={styles.formTextarea}
                rows={5}
                value={form.full_desc}
                onChange={e => setForm({ ...form, full_desc: e.target.value })}
                placeholder="Comprehensive background, objectives, intervention model, and impact..."
              />
            </div>

            <div className={styles.formBtns}>
              <button type="submit" className={styles.btnPrimary} disabled={submitting}>
                {submitting ? 'Saving...' : (editingId ? 'Update Program' : 'Create Program')}
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

      {/* Programs Table */}
      {loading ? (
        <div className={styles.loading}>Loading programs...</div>
      ) : filteredPrograms.length === 0 ? (
        <p className={styles.empty}>No programs found.</p>
      ) : (
        <div className={styles.table}>
          <div className={styles.tableHead} style={{ gridTemplateColumns: '0.6fr 1.5fr 2fr 0.8fr 1fr' }}>
            <span>Order</span>
            <span>Title</span>
            <span>Summary</span>
            <span>Status</span>
            <span>Actions</span>
          </div>
          {filteredPrograms.map(p => (
            <div
              key={p.id}
              className={styles.tableRow}
              style={{ gridTemplateColumns: '0.6fr 1.5fr 2fr 0.8fr 1fr', alignItems: 'center' }}
            >
              <span style={{ fontWeight: 'var(--fw-bold)', color: 'var(--color-mid-gray)' }}>
                #{p.sort_order ?? 1}
              </span>
              <span style={{ fontWeight: 'var(--fw-medium)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <BookOpen size={16} style={{ color: p.color || 'var(--color-teal)', flexShrink: 0 }} />
                {p.title}
              </span>
              <span title={p.short_desc}>
                {(p.short_desc || '—').slice(0, 65)}...
              </span>
              <span>
                <span className={`${styles.badge} ${p.is_active ? styles.badgeSuccess : styles.badgeReviewed}`}>
                  {p.is_active ? 'Active' : 'Hidden'}
                </span>
              </span>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  type="button"
                  className={styles.btnSecondary}
                  style={{ padding: '0.35rem 0.65rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                  onClick={() => openEdit(p)}
                  title="Edit"
                >
                  <Pencil size={14} /> Edit
                </button>
                <button
                  type="button"
                  className={styles.btnDanger}
                  style={{ padding: '0.35rem 0.65rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                  onClick={() => setDeleteProgram(p)}
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
      {deleteProgram && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalCard}>
            <h3 className={styles.modalTitle}>Confirm Delete</h3>
            <p className={styles.modalText}>
              Are you sure you want to delete the program <strong>"{deleteProgram.title}"</strong>?
              This action cannot be undone.
            </p>
            <div className={styles.modalActions}>
              <button
                className={styles.btnSecondary}
                onClick={() => setDeleteProgram(null)}
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
