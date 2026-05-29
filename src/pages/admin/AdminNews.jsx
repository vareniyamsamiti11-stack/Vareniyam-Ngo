import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { AdminShell } from './AdminDashboard'
import { Plus, Pencil, Trash2, Eye, EyeOff } from 'lucide-react'
import styles from './AdminLayout.module.css'

const EMPTY = { title: '', excerpt: '', content: '', category: 'news', published: false }

export default function AdminNews() {
  const [posts, setPosts]       = useState([])
  const [form, setForm]         = useState(EMPTY)
  const [editing, setEditing]   = useState(null) // post id being edited
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading]   = useState(true)
  const [saved, setSaved]       = useState(false)

  async function loadPosts() {
    const { data } = await supabase
      .from('news_posts')
      .select('*')
      .order('created_at', { ascending: false })
    setPosts(data || [])
    setLoading(false)
  }

  useEffect(() => { loadPosts() }, [])

  function startNew() { setForm(EMPTY); setEditing(null); setShowForm(true) }
  function startEdit(post) {
    setForm({ title: post.title, excerpt: post.excerpt || '', content: post.content || '', category: post.category || 'news', published: post.published })
    setEditing(post.id)
    setShowForm(true)
  }

  async function handleSave(e) {
    e.preventDefault()
    const slug = form.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
    const payload = { ...form, slug, published_at: form.published ? new Date().toISOString() : null }

    if (editing) {
      await supabase.from('news_posts').update(payload).eq('id', editing)
    } else {
      await supabase.from('news_posts').insert(payload)
    }
    setSaved(true); setTimeout(() => setSaved(false), 3000)
    setShowForm(false); setEditing(null); setForm(EMPTY)
    loadPosts()
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this post?')) return
    await supabase.from('news_posts').delete().eq('id', id)
    loadPosts()
  }

  async function togglePublish(post) {
    await supabase.from('news_posts').update({
      published: !post.published,
      published_at: !post.published ? new Date().toISOString() : null
    }).eq('id', post.id)
    loadPosts()
  }

  return (
    <AdminShell active="/admin/news">
      <div className={styles.pageHeader}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
          <div>
            <h1>News CMS</h1>
            <p>Create, edit and publish news posts and updates.</p>
          </div>
          <button className={styles.btnPrimary} onClick={startNew} id="admin-new-post-btn">
            <Plus size={16} style={{ display:'inline', marginRight:'0.4rem' }} />
            New Post
          </button>
        </div>
      </div>

      {saved && <div className={styles.successBanner}>✅ Post saved successfully!</div>}

      {/* Form */}
      {showForm && (
        <div className={styles.formCard} style={{ marginBottom:'2rem' }}>
          <h2>{editing ? 'Edit Post' : 'New Post'}</h2>
          <form onSubmit={handleSave} className={styles.formGrid}>
            <div className={styles.formField}>
              <label className={styles.formLabel}>Title *</label>
              <input className={styles.formInput} required value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                placeholder="Post title" />
            </div>
            <div className={styles.formRow}>
              <div className={styles.formField}>
                <label className={styles.formLabel}>Category</label>
                <select className={styles.formSelect} value={form.category}
                  onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                  <option value="news">News</option>
                  <option value="event">Event</option>
                  <option value="media">Media Coverage</option>
                  <option value="blog">Blog</option>
                </select>
              </div>
              <div className={styles.formField}>
                <label className={styles.formLabel}>Status</label>
                <select className={styles.formSelect} value={form.published ? 'published' : 'draft'}
                  onChange={e => setForm(f => ({ ...f, published: e.target.value === 'published' }))}>
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </div>
            </div>
            <div className={styles.formField}>
              <label className={styles.formLabel}>Excerpt</label>
              <textarea className={styles.formTextarea} rows={2} value={form.excerpt}
                onChange={e => setForm(f => ({ ...f, excerpt: e.target.value }))}
                placeholder="Short summary (shown in cards)" />
            </div>
            <div className={styles.formField}>
              <label className={styles.formLabel}>Full Content</label>
              <textarea className={styles.formTextarea} rows={8} value={form.content}
                onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
                placeholder="Full article content (HTML or plain text)" />
            </div>
            <div className={styles.formBtns}>
              <button type="submit" className={styles.btnPrimary}>Save Post</button>
              <button type="button" className={styles.btnSecondary} onClick={() => { setShowForm(false); setEditing(null) }}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Posts Table */}
      {loading ? <p className={styles.empty}>Loading…</p> : posts.length === 0 ? (
        <p className={styles.empty}>No posts yet. Click "New Post" to get started.</p>
      ) : (
        <div className={styles.table}>
          <div className={styles.tableHead} style={{ gridTemplateColumns:'2fr 1fr 1fr 1fr auto' }}>
            <span>Title</span><span>Category</span><span>Status</span><span>Date</span><span>Actions</span>
          </div>
          {posts.map(post => (
            <div key={post.id} className={styles.tableRow} style={{ gridTemplateColumns:'2fr 1fr 1fr 1fr auto', alignItems:'center' }}>
              <span title={post.title}>{post.title}</span>
              <span><span className={styles.badge}>{post.category}</span></span>
              <span>
                <span className={`${styles.badge} ${post.published ? styles.badgeSuccess : styles.badgePending}`}>
                  {post.published ? 'Published' : 'Draft'}
                </span>
              </span>
              <span>{new Date(post.created_at).toLocaleDateString('en-IN')}</span>
              <span style={{ display:'flex', gap:'0.5rem' }}>
                <button title={post.published ? 'Unpublish' : 'Publish'} onClick={() => togglePublish(post)}
                  style={{ background:'none', border:'none', cursor:'pointer', color: post.published ? 'var(--color-success)' : 'var(--color-mid-gray)' }}>
                  {post.published ? <Eye size={16} /> : <EyeOff size={16} />}
                </button>
                <button title="Edit" onClick={() => startEdit(post)}
                  style={{ background:'none', border:'none', cursor:'pointer', color:'var(--color-saffron)' }}>
                  <Pencil size={16} />
                </button>
                <button title="Delete" onClick={() => handleDelete(post.id)}
                  style={{ background:'none', border:'none', cursor:'pointer', color:'var(--color-error)' }}>
                  <Trash2 size={16} />
                </button>
              </span>
            </div>
          ))}
        </div>
      )}
    </AdminShell>
  )
}
