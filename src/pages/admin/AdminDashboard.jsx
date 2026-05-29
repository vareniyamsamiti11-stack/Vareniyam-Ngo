import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { LayoutDashboard, Newspaper, Inbox, LogOut, Users, Heart, MessageSquare, Briefcase } from 'lucide-react'
import styles from './AdminLayout.module.css'

export function AdminShell({ children, active }) {
  const navigate = useNavigate()
  const NAV = [
    { label: 'Dashboard',   href: '/admin',             icon: LayoutDashboard },
    { label: 'News CMS',    href: '/admin/news',         icon: Newspaper },
    { label: 'Submissions', href: '/admin/submissions',  icon: Inbox },
  ]
  async function handleLogout() {
    await supabase.auth.signOut()
    navigate('/admin/login')
  }
  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar}>
        <div className={styles.sidebarLogo}>
          <div className={styles.logoMark}>V</div>
          <span className={styles.logoName}>VSKS Admin</span>
        </div>
        <nav className={styles.sidebarNav}>
          {NAV.map(({ label, href, icon: Icon }) => (
            <Link key={href} to={href} className={`${styles.navItem} ${active === href ? styles.navActive : ''}`}>
              <Icon size={18} /> {label}
            </Link>
          ))}
        </nav>
        <button className={styles.logoutBtn} onClick={handleLogout}>
          <LogOut size={16} /> Sign Out
        </button>
      </aside>
      <main className={styles.content}>{children}</main>
    </div>
  )
}

export default function AdminDashboard() {
  const [counts, setCounts] = useState({ contacts: 0, volunteers: 0, csr: 0, donations: 0 })
  const [recentContacts, setRecentContacts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const [c, v, csr, d, rc] = await Promise.all([
        supabase.from('contact_messages').select('id', { count: 'exact', head: true }),
        supabase.from('volunteer_applications').select('id', { count: 'exact', head: true }),
        supabase.from('csr_inquiries').select('id', { count: 'exact', head: true }),
        supabase.from('donations').select('id', { count: 'exact', head: true }).eq('status', 'received'),
        supabase.from('contact_messages').select('*').order('created_at', { ascending: false }).limit(5),
      ])
      setCounts({ contacts: c.count || 0, volunteers: v.count || 0, csr: csr.count || 0, donations: d.count || 0 })
      setRecentContacts(rc.data || [])
      setLoading(false)
    }
    load()
  }, [])

  const STATS = [
    { label: 'Contact Messages', value: counts.contacts,  icon: MessageSquare, color: 'var(--color-teal)' },
    { label: 'Volunteer Applications', value: counts.volunteers, icon: Users, color: 'var(--color-saffron)' },
    { label: 'CSR Inquiries',    value: counts.csr,       icon: Briefcase,     color: 'var(--color-earth)' },
    { label: 'Successful Donations', value: counts.donations, icon: Heart,    color: 'var(--color-success)' },
  ]

  return (
    <AdminShell active="/admin">
      <div className={styles.pageHeader}>
        <h1>Dashboard</h1>
        <p>Welcome back — here's what's happening at VSKS.</p>
      </div>

      {loading ? (
        <div className={styles.loading}>Loading…</div>
      ) : (
        <>
          <div className={styles.statsGrid}>
            {STATS.map(({ label, value, icon: Icon, color }) => (
              <div key={label} className={styles.statCard}>
                <div className={styles.statIcon} style={{ background: `color-mix(in srgb, ${color} 12%, white)`, color }}>
                  <Icon size={22} />
                </div>
                <div>
                  <p className={styles.statValue}>{value}</p>
                  <p className={styles.statLabel}>{label}</p>
                </div>
              </div>
            ))}
          </div>

          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2>Recent Contact Messages</h2>
              <Link to="/admin/submissions" className={styles.viewAll}>View all →</Link>
            </div>
            {recentContacts.length === 0 ? (
              <p className={styles.empty}>No messages yet.</p>
            ) : (
              <div className={styles.table}>
                <div className={styles.tableHead}>
                  <span>Name</span><span>Email</span><span>Subject</span><span>Date</span>
                </div>
                {recentContacts.map(msg => (
                  <div key={msg.id} className={styles.tableRow}>
                    <span>{msg.name}</span>
                    <span>{msg.email}</span>
                    <span>{msg.subject || '—'}</span>
                    <span>{new Date(msg.created_at).toLocaleDateString('en-IN')}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </AdminShell>
  )
}
