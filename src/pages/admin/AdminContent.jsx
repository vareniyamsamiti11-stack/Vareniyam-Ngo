import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { uploadImage, validateImageFile } from '../../lib/storage'
import { AdminShell } from './AdminDashboard'
import {
  Save, Plus, Trash2, Pencil, Upload, Check,
  Home, Info, BarChart2, Users, MessageSquareQuote, PhoneCall
} from 'lucide-react'
import styles from './AdminLayout.module.css'

const TABS = [
  { id: 'hero',         label: 'Homepage Hero',    icon: Home },
  { id: 'about',        label: 'About & Founder',  icon: Info },
  { id: 'impact',       label: 'Impact Numbers',   icon: BarChart2 },
  { id: 'team',         label: 'Team Members',     icon: Users },
  { id: 'testimonials', label: 'Testimonials',     icon: MessageSquareQuote },
  { id: 'contact',      label: 'Contact & Social', icon: PhoneCall },
]

export default function AdminContent() {
  const [activeTab, setActiveTab] = useState('hero')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  // 1. Homepage Hero Content
  const [heroForm, setHeroForm] = useState({
    tagline: 'Registered NGO · Since 2018',
    title: 'Building Inclusive Communities, One Life at a Time',
    accentWord: 'Communities',
    subtitle: 'To empower marginalized communities through education, mental health advocacy, environmental action, and inclusive development — creating a society where every individual can live with dignity.',
    coverImage: '/Assets/heropage.jpeg',
    primaryCtaText: 'Donate Now',
    primaryCtaLink: '/get-involved',
    secondaryCtaText: 'Our Programs',
    secondaryCtaLink: '/programs',
  })
  const [heroImageFile, setHeroImageFile] = useState(null)
  const [heroImagePreview, setHeroImagePreview] = useState('')

  // 2. About Page Content
  const [aboutForm, setAboutForm] = useState({
    story: '',
    mission: '',
    vision: '',
    founderName: 'Soni Dharva',
    founderTitle: 'Founder & Secretary',
    founderBio: '',
    founderImage: '/Assets/Founder.jpeg',
  })
  const [founderImageFile, setFounderImageFile] = useState(null)
  const [founderImagePreview, setFounderImagePreview] = useState('')

  // 3. Impact Stats
  const [impactStats, setImpactStats] = useState([
    { value: 10000, suffix: '+', label: 'People Sensitized', color: 'var(--color-saffron)' },
    { value: 2500,  suffix: '+', label: 'Students Benefited', color: 'var(--color-teal)' },
    { value: 150,   suffix: '+', label: 'Trees Planted', color: 'var(--color-success)' },
    { value: 100,   suffix: '+', label: 'Awareness Sessions', color: 'var(--color-earth)' },
  ])

  // 4. Team Members List & Form
  const [teamMembers, setTeamMembers] = useState([])
  const [editingMember, setEditingMember] = useState(null)
  const [memberForm, setMemberForm] = useState({ name: '', role: '', bio: '', photo_url: '', is_active: true, sort_order: 1 })
  const [memberFile, setMemberFile] = useState(null)
  const [memberPreview, setMemberPreview] = useState('')

  // 5. Testimonials List & Form
  const [testimonials, setTestimonials] = useState([])
  const [editingTestimonial, setEditingTestimonial] = useState(null)
  const [testimonialForm, setTestimonialForm] = useState({ name: '', role: '', program: '', quote: '', category: 'general', sort_order: 1 })

  // 6. Contact & Social Links
  const [contactForm, setContactForm] = useState({
    phone: '+91 83194 28199',
    email: 'Vreniyam.samiti11@gmail.com',
    address: 'X-16 Near Gol Garden, New Ranibag Limbodi, Khandwa Road, Indore – 452020, Madhya Pradesh',
    whatsapp: '+91 83194 28199',
  })
  const [socialForm, setSocialForm] = useState({
    facebook: 'https://facebook.com',
    instagram: 'https://instagram.com',
    whatsapp: 'https://wa.me/918319428199',
    linkedin: 'https://linkedin.com/company/vareniyam-samaj-kalyan-samiti',
  })

  // Load all data
  async function loadAllContent() {
    setLoading(true)
    try {
      const [siteRes, teamRes, testRes] = await Promise.all([
        supabase.from('site_content').select('*'),
        supabase.from('team_members').select('*').order('sort_order', { ascending: true }),
        supabase.from('testimonials').select('*').order('sort_order', { ascending: true }),
      ])

      if (siteRes.data) {
        for (const row of siteRes.data) {
          if (row.key === 'homepage_hero' && row.value) {
            setHeroForm(prev => ({ ...prev, ...row.value }))
            setHeroImagePreview(row.value.coverImage || '')
          }
          if (row.key === 'about_page' && row.value) {
            setAboutForm(prev => ({ ...prev, ...row.value }))
            setFounderImagePreview(row.value.founderImage || '')
          }
          if (row.key === 'impact_stats' && Array.isArray(row.value)) {
            setImpactStats(row.value)
          }
          if (row.key === 'contact_info' && row.value) {
            setContactForm(prev => ({ ...prev, ...row.value }))
          }
          if (row.key === 'social_links' && row.value) {
            setSocialForm(prev => ({ ...prev, ...row.value }))
          }
        }
      }

      if (teamRes.data) setTeamMembers(teamRes.data)
      if (testRes.data) setTestimonials(testRes.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAllContent()
  }, [])

  // 1. Save Hero
  async function saveHero(e) {
    e.preventDefault()
    setSaving(true); setErrorMsg(''); setSuccessMsg('')
    try {
      let finalImg = heroForm.coverImage
      if (heroImageFile) {
        const up = await uploadImage(heroImageFile, 'site')
        if (up.url) finalImg = up.url
      }
      const val = { ...heroForm, coverImage: finalImg }
      const { error } = await supabase.from('site_content').upsert({
        key: 'homepage_hero',
        value: val,
        updated_at: new Date().toISOString(),
      })
      if (error) throw error
      setHeroForm(val)
      setSuccessMsg('Homepage hero content updated successfully!')
    } catch (err) {
      setErrorMsg(err.message || 'Failed to update hero content.')
    } finally { setSaving(false) }
  }

  // 2. Save About
  async function saveAbout(e) {
    e.preventDefault()
    setSaving(true); setErrorMsg(''); setSuccessMsg('')
    try {
      let founderImg = aboutForm.founderImage
      if (founderImageFile) {
        const up = await uploadImage(founderImageFile, 'team')
        if (up.url) founderImg = up.url
      }
      const val = { ...aboutForm, founderImage: founderImg }
      const { error } = await supabase.from('site_content').upsert({
        key: 'about_page',
        value: val,
        updated_at: new Date().toISOString(),
      })
      if (error) throw error
      setAboutForm(val)
      setSuccessMsg('About page & founder information saved!')
    } catch (err) {
      setErrorMsg(err.message || 'Failed to save about content.')
    } finally { setSaving(false) }
  }

  // 3. Save Impact Stats
  async function saveImpact(e) {
    e.preventDefault()
    setSaving(true); setErrorMsg(''); setSuccessMsg('')
    try {
      const { error } = await supabase.from('site_content').upsert({
        key: 'impact_stats',
        value: impactStats,
        updated_at: new Date().toISOString(),
      })
      if (error) throw error
      setSuccessMsg('Impact numbers saved successfully!')
    } catch (err) {
      setErrorMsg(err.message || 'Failed to save impact stats.')
    } finally { setSaving(false) }
  }

  function addStatItem() {
    setImpactStats(prev => [...prev, { value: 500, suffix: '+', label: 'New Metric', color: 'var(--color-teal)' }])
  }
  function removeStatItem(index) {
    setImpactStats(prev => prev.filter((_, i) => i !== index))
  }
  function updateStatItem(index, key, val) {
    setImpactStats(prev => {
      const copy = [...prev]
      copy[index] = { ...copy[index], [key]: key === 'value' ? Number(val) : val }
      return copy
    })
  }

  // 4. Save Team Member
  async function saveTeamMember(e) {
    e.preventDefault()
    if (!memberForm.name.trim()) return
    setSaving(true); setErrorMsg(''); setSuccessMsg('')
    try {
      let photoUrl = memberForm.photo_url
      if (memberFile) {
        const up = await uploadImage(memberFile, 'team')
        if (up.url) photoUrl = up.url
      }
      const payload = {
        name: memberForm.name,
        role: memberForm.role,
        bio: memberForm.bio,
        photo_url: photoUrl,
        sort_order: parseInt(memberForm.sort_order, 10) || 1,
        is_active: Boolean(memberForm.is_active),
        updated_at: new Date().toISOString(),
      }
      if (editingMember) {
        const { error } = await supabase.from('team_members').update(payload).eq('id', editingMember.id)
        if (error) throw error
      } else {
        const { error } = await supabase.from('team_members').insert(payload)
        if (error) throw error
      }
      setSuccessMsg(`Team member ${editingMember ? 'updated' : 'added'}!`)
      setEditingMember(null)
      setMemberForm({ name: '', role: '', bio: '', photo_url: '', is_active: true, sort_order: teamMembers.length + 1 })
      setMemberFile(null); setMemberPreview('')
      const { data } = await supabase.from('team_members').select('*').order('sort_order', { ascending: true })
      if (data) setTeamMembers(data)
    } catch (err) {
      setErrorMsg(err.message || 'Failed to save team member.')
    } finally { setSaving(false) }
  }

  async function deleteTeamMember(id) {
    if (!window.confirm('Are you sure you want to remove this team member?')) return
    try {
      await supabase.from('team_members').delete().eq('id', id)
      setTeamMembers(prev => prev.filter(m => m.id !== id))
      setSuccessMsg('Team member removed.')
    } catch (err) {
      setErrorMsg(err.message)
    }
  }

  // 5. Save Testimonial
  async function saveTestimonial(e) {
    e.preventDefault()
    if (!testimonialForm.name.trim() || !testimonialForm.quote.trim()) return
    setSaving(true); setErrorMsg(''); setSuccessMsg('')
    try {
      const payload = {
        name: testimonialForm.name,
        role: testimonialForm.role,
        program: testimonialForm.program,
        category: testimonialForm.category,
        quote: testimonialForm.quote,
        sort_order: parseInt(testimonialForm.sort_order, 10) || 1,
        is_active: true,
      }
      if (editingTestimonial) {
        const { error } = await supabase.from('testimonials').update(payload).eq('id', editingTestimonial.id)
        if (error) throw error
      } else {
        const { error } = await supabase.from('testimonials').insert(payload)
        if (error) throw error
      }
      setSuccessMsg(`Testimonial ${editingTestimonial ? 'updated' : 'added'}!`)
      setEditingTestimonial(null)
      setTestimonialForm({ name: '', role: '', program: '', quote: '', category: 'general', sort_order: testimonials.length + 1 })
      const { data } = await supabase.from('testimonials').select('*').order('sort_order', { ascending: true })
      if (data) setTestimonials(data)
    } catch (err) {
      setErrorMsg(err.message || 'Failed to save testimonial.')
    } finally { setSaving(false) }
  }

  async function deleteTestimonial(id) {
    if (!window.confirm('Are you sure you want to delete this testimonial?')) return
    try {
      await supabase.from('testimonials').delete().eq('id', id)
      setTestimonials(prev => prev.filter(t => t.id !== id))
      setSuccessMsg('Testimonial removed.')
    } catch (err) {
      setErrorMsg(err.message)
    }
  }

  // 6. Save Contact & Social
  async function saveContactAndSocial(e) {
    e.preventDefault()
    setSaving(true); setErrorMsg(''); setSuccessMsg('')
    try {
      await Promise.all([
        supabase.from('site_content').upsert({
          key: 'contact_info',
          value: contactForm,
          updated_at: new Date().toISOString(),
        }),
        supabase.from('site_content').upsert({
          key: 'social_links',
          value: socialForm,
          updated_at: new Date().toISOString(),
        }),
      ])
      setSuccessMsg('Contact details and social links updated!')
    } catch (err) {
      setErrorMsg(err.message || 'Failed to update contact info.')
    } finally { setSaving(false) }
  }

  return (
    <AdminShell active="/admin/content">
      <div className={styles.pageHeader}>
        <h1>Edit Website Content</h1>
        <p>Directly modify text, hero banners, impact statistics, team, testimonials, and contact links.</p>
      </div>

      {successMsg && <div className={styles.successBanner}>{successMsg}</div>}
      {errorMsg && <div className={styles.errorBanner}>{errorMsg}</div>}

      {/* Tabs */}
      <div className={styles.tabsBar}>
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            className={`${styles.tabButton} ${activeTab === id ? styles.tabButtonActive : ''}`}
            onClick={() => {
              setActiveTab(id)
              setErrorMsg('')
              setSuccessMsg('')
            }}
          >
            <Icon size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '6px' }} />
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className={styles.loading}>Loading site content...</div>
      ) : (
        <>
          {/* TAB 1: HERO */}
          {activeTab === 'hero' && (
            <div className={styles.formCard}>
              <h2>Homepage Hero Section</h2>
              <form onSubmit={saveHero} className={styles.formGrid}>
                <div className={styles.formRow}>
                  <div className={styles.formField}>
                    <label className={styles.formLabel}>Badge / Eyebrow Text</label>
                    <input
                      type="text"
                      className={styles.formInput}
                      value={heroForm.tagline}
                      onChange={e => setHeroForm({ ...heroForm, tagline: e.target.value })}
                      placeholder="e.g. Registered NGO · Since 2018"
                    />
                  </div>
                  <div className={styles.formField}>
                    <label className={styles.formLabel}>Accent Word (Highlighted in Orange)</label>
                    <input
                      type="text"
                      className={styles.formInput}
                      value={heroForm.accentWord}
                      onChange={e => setHeroForm({ ...heroForm, accentWord: e.target.value })}
                      placeholder="Communities"
                    />
                  </div>
                </div>

                <div className={styles.formField}>
                  <label className={styles.formLabel}>Main Heading (H1)</label>
                  <input
                    type="text"
                    className={styles.formInput}
                    value={heroForm.title}
                    onChange={e => setHeroForm({ ...heroForm, title: e.target.value })}
                    required
                  />
                </div>

                <div className={styles.formField}>
                  <label className={styles.formLabel}>Hero Subtitle / Mission Statement</label>
                  <textarea
                    className={styles.formTextarea}
                    rows={4}
                    value={heroForm.subtitle}
                    onChange={e => setHeroForm({ ...heroForm, subtitle: e.target.value })}
                  />
                </div>

                <div className={styles.formField}>
                  <label className={styles.formLabel}>Hero Image (JPG, PNG, WEBP &lt; 5MB)</label>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className={styles.formInput}
                    onChange={e => {
                      const f = e.target.files?.[0]
                      if (!f) return
                      const v = validateImageFile(f)
                      if (!v.valid) { setErrorMsg(v.error); return }
                      setHeroImageFile(f)
                      setHeroImagePreview(URL.createObjectURL(f))
                    }}
                  />
                  {heroImagePreview && (
                    <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <img
                        src={heroImagePreview}
                        alt="Hero preview"
                        style={{ width: '120px', height: '80px', objectFit: 'cover', borderRadius: '4px', border: '1px solid var(--color-warm-gray)' }}
                      />
                      <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-mid-gray)' }}>Current Hero Image</span>
                    </div>
                  )}
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formField}>
                    <label className={styles.formLabel}>Primary CTA Button Text</label>
                    <input
                      type="text"
                      className={styles.formInput}
                      value={heroForm.primaryCtaText}
                      onChange={e => setHeroForm({ ...heroForm, primaryCtaText: e.target.value })}
                    />
                  </div>
                  <div className={styles.formField}>
                    <label className={styles.formLabel}>Primary CTA Link</label>
                    <input
                      type="text"
                      className={styles.formInput}
                      value={heroForm.primaryCtaLink}
                      onChange={e => setHeroForm({ ...heroForm, primaryCtaLink: e.target.value })}
                    />
                  </div>
                </div>

                <button type="submit" className={styles.btnPrimary} disabled={saving} style={{ alignSelf: 'flex-start' }}>
                  {saving ? 'Saving...' : 'Save Homepage Hero'}
                </button>
              </form>
            </div>
          )}

          {/* TAB 2: ABOUT */}
          {activeTab === 'about' && (
            <div className={styles.formCard}>
              <h2>About Us &amp; Founder Information</h2>
              <form onSubmit={saveAbout} className={styles.formGrid}>
                <div className={styles.formField}>
                  <label className={styles.formLabel}>Organization Story / Overview</label>
                  <textarea
                    className={styles.formTextarea}
                    rows={5}
                    value={aboutForm.story}
                    onChange={e => setAboutForm({ ...aboutForm, story: e.target.value })}
                  />
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formField}>
                    <label className={styles.formLabel}>Our Mission</label>
                    <textarea
                      className={styles.formTextarea}
                      rows={3}
                      value={aboutForm.mission}
                      onChange={e => setAboutForm({ ...aboutForm, mission: e.target.value })}
                    />
                  </div>
                  <div className={styles.formField}>
                    <label className={styles.formLabel}>Our Vision</label>
                    <textarea
                      className={styles.formTextarea}
                      rows={3}
                      value={aboutForm.vision}
                      onChange={e => setAboutForm({ ...aboutForm, vision: e.target.value })}
                    />
                  </div>
                </div>

                <h3 style={{ margin: '1rem 0 0.5rem', color: 'var(--color-earth)', fontSize: 'var(--text-lg)' }}>
                  Founder Profile
                </h3>

                <div className={styles.formRow}>
                  <div className={styles.formField}>
                    <label className={styles.formLabel}>Founder Name</label>
                    <input
                      type="text"
                      className={styles.formInput}
                      value={aboutForm.founderName}
                      onChange={e => setAboutForm({ ...aboutForm, founderName: e.target.value })}
                    />
                  </div>
                  <div className={styles.formField}>
                    <label className={styles.formLabel}>Founder Title</label>
                    <input
                      type="text"
                      className={styles.formInput}
                      value={aboutForm.founderTitle}
                      onChange={e => setAboutForm({ ...aboutForm, founderTitle: e.target.value })}
                    />
                  </div>
                </div>

                <div className={styles.formField}>
                  <label className={styles.formLabel}>Founder Biography</label>
                  <textarea
                    className={styles.formTextarea}
                    rows={4}
                    value={aboutForm.founderBio}
                    onChange={e => setAboutForm({ ...aboutForm, founderBio: e.target.value })}
                  />
                </div>

                <div className={styles.formField}>
                  <label className={styles.formLabel}>Founder Photo</label>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className={styles.formInput}
                    onChange={e => {
                      const f = e.target.files?.[0]
                      if (!f) return
                      const v = validateImageFile(f)
                      if (!v.valid) { setErrorMsg(v.error); return }
                      setFounderImageFile(f)
                      setFounderImagePreview(URL.createObjectURL(f))
                    }}
                  />
                  {founderImagePreview && (
                    <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <img
                        src={founderImagePreview}
                        alt="Founder preview"
                        style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--color-warm-gray)' }}
                      />
                      <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-mid-gray)' }}>Current Founder Photo</span>
                    </div>
                  )}
                </div>

                <button type="submit" className={styles.btnPrimary} disabled={saving} style={{ alignSelf: 'flex-start' }}>
                  {saving ? 'Saving...' : 'Save About & Founder Info'}
                </button>
              </form>
            </div>
          )}

          {/* TAB 3: IMPACT STATS */}
          {activeTab === 'impact' && (
            <div className={styles.formCard}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <h2 style={{ margin: 0 }}>Impact Counters</h2>
                <button type="button" className={styles.btnSecondary} onClick={addStatItem} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Plus size={16} /> Add Metric
                </button>
              </div>

              <form onSubmit={saveImpact} className={styles.formGrid}>
                {impactStats.map((stat, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1.5fr 0.8fr 2fr 1.5fr auto',
                      gap: '0.75rem',
                      alignItems: 'center',
                      background: 'var(--color-cream)',
                      padding: '0.85rem 1rem',
                      borderRadius: 'var(--radius-md)',
                    }}
                  >
                    <div>
                      <label className={styles.formLabel} style={{ fontSize: '11px' }}>Metric Number</label>
                      <input
                        type="number"
                        className={styles.formInput}
                        value={stat.value}
                        onChange={e => updateStatItem(idx, 'value', e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <label className={styles.formLabel} style={{ fontSize: '11px' }}>Suffix</label>
                      <input
                        type="text"
                        className={styles.formInput}
                        value={stat.suffix || '+'}
                        onChange={e => updateStatItem(idx, 'suffix', e.target.value)}
                        placeholder="+"
                      />
                    </div>
                    <div>
                      <label className={styles.formLabel} style={{ fontSize: '11px' }}>Label</label>
                      <input
                        type="text"
                        className={styles.formInput}
                        value={stat.label}
                        onChange={e => updateStatItem(idx, 'label', e.target.value)}
                        placeholder="e.g. People Sensitized"
                        required
                      />
                    </div>
                    <div>
                      <label className={styles.formLabel} style={{ fontSize: '11px' }}>Color Accent</label>
                      <select
                        className={styles.formSelect}
                        value={stat.color}
                        onChange={e => updateStatItem(idx, 'color', e.target.value)}
                      >
                        <option value="var(--color-saffron)">Saffron</option>
                        <option value="var(--color-teal)">Teal</option>
                        <option value="var(--color-success)">Green</option>
                        <option value="var(--color-earth)">Earth Brown</option>
                      </select>
                    </div>
                    <button
                      type="button"
                      className={styles.btnDanger}
                      style={{ padding: '0.4rem', marginTop: '14px' }}
                      onClick={() => removeStatItem(idx)}
                      title="Remove metric"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}

                <button type="submit" className={styles.btnPrimary} disabled={saving} style={{ alignSelf: 'flex-start', marginTop: '1rem' }}>
                  {saving ? 'Saving...' : 'Save Impact Numbers'}
                </button>
              </form>
            </div>
          )}

          {/* TAB 4: TEAM MEMBERS */}
          {activeTab === 'team' && (
            <div className={styles.formCard}>
              <h2>Team &amp; Advisory Members</h2>

              <form onSubmit={saveTeamMember} className={styles.formGrid} style={{ marginBottom: '2.5rem', background: 'var(--color-cream)', padding: '1.5rem', borderRadius: 'var(--radius-md)' }}>
                <h3 style={{ margin: 0, fontSize: 'var(--text-md)', color: 'var(--color-earth)' }}>
                  {editingMember ? 'Edit Team Member' : 'Add New Team Member'}
                </h3>

                <div className={styles.formRow}>
                  <div className={styles.formField}>
                    <label className={styles.formLabel}>Full Name *</label>
                    <input
                      type="text"
                      className={styles.formInput}
                      value={memberForm.name}
                      onChange={e => setMemberForm({ ...memberForm, name: e.target.value })}
                      placeholder="e.g. Dr. Anjali Verma"
                      required
                    />
                  </div>
                  <div className={styles.formField}>
                    <label className={styles.formLabel}>Role / Designation *</label>
                    <input
                      type="text"
                      className={styles.formInput}
                      value={memberForm.role}
                      onChange={e => setMemberForm({ ...memberForm, role: e.target.value })}
                      placeholder="e.g. Advisory Board – Mental Health"
                      required
                    />
                  </div>
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formField}>
                    <label className={styles.formLabel}>Sort Order</label>
                    <input
                      type="number"
                      className={styles.formInput}
                      value={memberForm.sort_order}
                      onChange={e => setMemberForm({ ...memberForm, sort_order: e.target.value })}
                    />
                  </div>
                  <div className={styles.formField}>
                    <label className={styles.formLabel}>Member Photo (Optional)</label>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className={styles.formInput}
                      onChange={e => {
                        const f = e.target.files?.[0]
                        if (!f) return
                        const v = validateImageFile(f)
                        if (!v.valid) { setErrorMsg(v.error); return }
                        setMemberFile(f)
                        setMemberPreview(URL.createObjectURL(f))
                      }}
                    />
                  </div>
                </div>

                <div className={styles.formField}>
                  <label className={styles.formLabel}>Short Bio</label>
                  <textarea
                    className={styles.formTextarea}
                    rows={2}
                    value={memberForm.bio}
                    onChange={e => setMemberForm({ ...memberForm, bio: e.target.value })}
                    placeholder="Brief background and expertise..."
                  />
                </div>

                <div className={styles.formBtns}>
                  <button type="submit" className={styles.btnPrimary} disabled={saving}>
                    {saving ? 'Saving...' : (editingMember ? 'Update Member' : 'Add Member')}
                  </button>
                  {editingMember && (
                    <button
                      type="button"
                      className={styles.btnSecondary}
                      onClick={() => {
                        setEditingMember(null)
                        setMemberForm({ name: '', role: '', bio: '', photo_url: '', is_active: true, sort_order: 1 })
                      }}
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>

              {/* Members List */}
              <div className={styles.table}>
                <div className={styles.tableHead} style={{ gridTemplateColumns: '0.6fr 1.5fr 2fr 1fr' }}>
                  <span>Order</span>
                  <span>Name</span>
                  <span>Role</span>
                  <span>Actions</span>
                </div>
                {teamMembers.map(m => (
                  <div key={m.id} className={styles.tableRow} style={{ gridTemplateColumns: '0.6fr 1.5fr 2fr 1fr', alignItems: 'center' }}>
                    <span>#{m.sort_order}</span>
                    <span style={{ fontWeight: 'var(--fw-medium)' }}>{m.name}</span>
                    <span>{m.role}</span>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        type="button"
                        className={styles.btnSecondary}
                        style={{ padding: '0.3rem 0.6rem' }}
                        onClick={() => {
                          setEditingMember(m)
                          setMemberForm({
                            name: m.name || '',
                            role: m.role || '',
                            bio: m.bio || '',
                            photo_url: m.photo_url || '',
                            sort_order: m.sort_order || 1,
                            is_active: m.is_active ?? true,
                          })
                        }}
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        type="button"
                        className={styles.btnDanger}
                        style={{ padding: '0.3rem 0.6rem' }}
                        onClick={() => deleteTeamMember(m.id)}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: TESTIMONIALS */}
          {activeTab === 'testimonials' && (
            <div className={styles.formCard}>
              <h2>Community &amp; Partner Testimonials</h2>

              <form onSubmit={saveTestimonial} className={styles.formGrid} style={{ marginBottom: '2.5rem', background: 'var(--color-cream)', padding: '1.5rem', borderRadius: 'var(--radius-md)' }}>
                <h3 style={{ margin: 0, fontSize: 'var(--text-md)', color: 'var(--color-earth)' }}>
                  {editingTestimonial ? 'Edit Testimonial' : 'Add New Testimonial'}
                </h3>

                <div className={styles.formRow}>
                  <div className={styles.formField}>
                    <label className={styles.formLabel}>Person Name *</label>
                    <input
                      type="text"
                      className={styles.formInput}
                      value={testimonialForm.name}
                      onChange={e => setTestimonialForm({ ...testimonialForm, name: e.target.value })}
                      placeholder="e.g. Sunita Malviya"
                      required
                    />
                  </div>
                  <div className={styles.formField}>
                    <label className={styles.formLabel}>Role / Relation *</label>
                    <input
                      type="text"
                      className={styles.formInput}
                      value={testimonialForm.role}
                      onChange={e => setTestimonialForm({ ...testimonialForm, role: e.target.value })}
                      placeholder="e.g. Vocational Training Graduate"
                      required
                    />
                  </div>
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formField}>
                    <label className={styles.formLabel}>Program / Context</label>
                    <input
                      type="text"
                      className={styles.formInput}
                      value={testimonialForm.program}
                      onChange={e => setTestimonialForm({ ...testimonialForm, program: e.target.value })}
                      placeholder="e.g. Pehchan – Special Education"
                    />
                  </div>
                  <div className={styles.formField}>
                    <label className={styles.formLabel}>Category</label>
                    <select
                      className={styles.formSelect}
                      value={testimonialForm.category}
                      onChange={e => setTestimonialForm({ ...testimonialForm, category: e.target.value })}
                    >
                      <option value="general">General</option>
                      <option value="student">Student / Parent</option>
                      <option value="community">Community Member</option>
                      <option value="volunteer">Volunteer</option>
                      <option value="partner">CSR / Partner</option>
                    </select>
                  </div>
                </div>

                <div className={styles.formField}>
                  <label className={styles.formLabel}>Quote / Feedback *</label>
                  <textarea
                    className={styles.formTextarea}
                    rows={3}
                    value={testimonialForm.quote}
                    onChange={e => setTestimonialForm({ ...testimonialForm, quote: e.target.value })}
                    placeholder="Their testimonial quote..."
                    required
                  />
                </div>

                <div className={styles.formBtns}>
                  <button type="submit" className={styles.btnPrimary} disabled={saving}>
                    {saving ? 'Saving...' : (editingTestimonial ? 'Update Testimonial' : 'Add Testimonial')}
                  </button>
                  {editingTestimonial && (
                    <button
                      type="button"
                      className={styles.btnSecondary}
                      onClick={() => {
                        setEditingTestimonial(null)
                        setTestimonialForm({ name: '', role: '', program: '', quote: '', category: 'general', sort_order: 1 })
                      }}
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>

              {/* Testimonials Table */}
              <div className={styles.table}>
                <div className={styles.tableHead} style={{ gridTemplateColumns: '1.2fr 1.5fr 2.5fr 0.8fr' }}>
                  <span>Name</span>
                  <span>Role</span>
                  <span>Quote</span>
                  <span>Actions</span>
                </div>
                {testimonials.map(t => (
                  <div key={t.id} className={styles.tableRow} style={{ gridTemplateColumns: '1.2fr 1.5fr 2.5fr 0.8fr', alignItems: 'center' }}>
                    <span style={{ fontWeight: 'var(--fw-medium)' }}>{t.name}</span>
                    <span>{t.role}</span>
                    <span title={t.quote}>{(t.quote || '').slice(0, 65)}...</span>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        type="button"
                        className={styles.btnSecondary}
                        style={{ padding: '0.3rem 0.6rem' }}
                        onClick={() => {
                          setEditingTestimonial(t)
                          setTestimonialForm({
                            name: t.name || '',
                            role: t.role || '',
                            program: t.program || '',
                            quote: t.quote || '',
                            category: t.category || 'general',
                            sort_order: t.sort_order || 1,
                          })
                        }}
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        type="button"
                        className={styles.btnDanger}
                        style={{ padding: '0.3rem 0.6rem' }}
                        onClick={() => deleteTestimonial(t.id)}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: CONTACT & SOCIAL */}
          {activeTab === 'contact' && (
            <div className={styles.formCard}>
              <h2>Official Contact Information &amp; Social Links</h2>
              <form onSubmit={saveContactAndSocial} className={styles.formGrid}>
                <h3 style={{ margin: '0 0 0.5rem', color: 'var(--color-earth)', fontSize: 'var(--text-lg)' }}>
                  Contact Information
                </h3>

                <div className={styles.formRow}>
                  <div className={styles.formField}>
                    <label className={styles.formLabel}>Phone Number</label>
                    <input
                      type="text"
                      className={styles.formInput}
                      value={contactForm.phone}
                      onChange={e => setContactForm({ ...contactForm, phone: e.target.value })}
                    />
                  </div>
                  <div className={styles.formField}>
                    <label className={styles.formLabel}>Official Email</label>
                    <input
                      type="email"
                      className={styles.formInput}
                      value={contactForm.email}
                      onChange={e => setContactForm({ ...contactForm, email: e.target.value })}
                    />
                  </div>
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formField}>
                    <label className={styles.formLabel}>WhatsApp Support Number</label>
                    <input
                      type="text"
                      className={styles.formInput}
                      value={contactForm.whatsapp}
                      onChange={e => setContactForm({ ...contactForm, whatsapp: e.target.value })}
                    />
                  </div>
                  <div className={styles.formField}>
                    <label className={styles.formLabel}>Office Address</label>
                    <input
                      type="text"
                      className={styles.formInput}
                      value={contactForm.address}
                      onChange={e => setContactForm({ ...contactForm, address: e.target.value })}
                    />
                  </div>
                </div>

                <h3 style={{ margin: '1.5rem 0 0.5rem', color: 'var(--color-earth)', fontSize: 'var(--text-lg)' }}>
                  Social Media Links
                </h3>

                <div className={styles.formRow}>
                  <div className={styles.formField}>
                    <label className={styles.formLabel}>Facebook URL</label>
                    <input
                      type="url"
                      className={styles.formInput}
                      value={socialForm.facebook}
                      onChange={e => setSocialForm({ ...socialForm, facebook: e.target.value })}
                    />
                  </div>
                  <div className={styles.formField}>
                    <label className={styles.formLabel}>Instagram URL</label>
                    <input
                      type="url"
                      className={styles.formInput}
                      value={socialForm.instagram}
                      onChange={e => setSocialForm({ ...socialForm, instagram: e.target.value })}
                    />
                  </div>
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formField}>
                    <label className={styles.formLabel}>LinkedIn Profile</label>
                    <input
                      type="url"
                      className={styles.formInput}
                      value={socialForm.linkedin}
                      onChange={e => setSocialForm({ ...socialForm, linkedin: e.target.value })}
                    />
                  </div>
                  <div className={styles.formField}>
                    <label className={styles.formLabel}>WhatsApp Direct Link</label>
                    <input
                      type="url"
                      className={styles.formInput}
                      value={socialForm.whatsapp}
                      onChange={e => setSocialForm({ ...socialForm, whatsapp: e.target.value })}
                    />
                  </div>
                </div>

                <button type="submit" className={styles.btnPrimary} disabled={saving} style={{ alignSelf: 'flex-start', marginTop: '1rem' }}>
                  {saving ? 'Saving...' : 'Save Contact & Social Details'}
                </button>
              </form>
            </div>
          )}
        </>
      )}
    </AdminShell>
  )
}
