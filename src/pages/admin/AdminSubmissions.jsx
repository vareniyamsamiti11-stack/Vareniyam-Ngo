import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { AdminShell } from './AdminDashboard'
import styles from './AdminLayout.module.css'

const TABS = [
  { id: 'contact',    label: 'Contact Messages' },
  { id: 'volunteer',  label: 'Volunteer Applications' },
  { id: 'csr',        label: 'CSR Inquiries' },
  { id: 'donations',  label: 'Donations' },
]

export default function AdminSubmissions() {
  const [tab, setTab]   = useState('contact')
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    const tableMap = {
      contact:   'contact_messages',
      volunteer: 'volunteer_applications',
      csr:       'csr_inquiries',
      donations: 'donations',
    }
    supabase
      .from(tableMap[tab])
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data }) => { setRows(data || []); setLoading(false) })
  }, [tab])

  function renderRow(row) {
    const date = new Date(row.created_at).toLocaleDateString('en-IN')
    if (tab === 'contact') return (
      <div key={row.id} className={styles.tableRow} style={{ gridTemplateColumns:'1fr 1.5fr 1.5fr 1fr 0.7fr' }}>
        <span>{row.name}</span>
        <span>{row.email}</span>
        <span title={row.message}>{(row.subject || row.message || '').slice(0,40)}…</span>
        <span>{date}</span>
        <span><span className={`${styles.badge} ${row.read ? styles.badgeReviewed : styles.badgeNew}`}>{row.read ? 'Read' : 'New'}</span></span>
      </div>
    )
    if (tab === 'volunteer') return (
      <div key={row.id} className={styles.tableRow} style={{ gridTemplateColumns:'1fr 1.5fr 1fr 1fr 0.7fr' }}>
        <span>{row.name}</span>
        <span>{row.email}</span>
        <span>{(row.skills || []).join(', ') || '—'}</span>
        <span>{date}</span>
        <span><span className={`${styles.badge} ${styles.badgeNew}`}>{row.status || 'new'}</span></span>
      </div>
    )
    if (tab === 'csr') return (
      <div key={row.id} className={styles.tableRow} style={{ gridTemplateColumns:'1.5fr 1.5fr 1fr 1fr 0.7fr' }}>
        <span>{row.organization}</span>
        <span>{row.email}</span>
        <span>{row.budget_range || '—'}</span>
        <span>{date}</span>
        <span><span className={`${styles.badge} ${styles.badgeNew}`}>{row.status || 'new'}</span></span>
      </div>
    )
    if (tab === 'donations') return (
      <div key={row.id} className={styles.tableRow} style={{ gridTemplateColumns:'1fr 1.5fr 1fr 1fr 0.7fr' }}>
        <span>{row.donor_name}</span>
        <span>{row.donor_email}</span>
        <span>₹{Number(row.amount).toLocaleString('en-IN')}</span>
        <span>{date}</span>
        <span>
          <span className={`${styles.badge} ${(row.status === 'received' || row.status === 'success') ? styles.badgeSuccess : row.status === 'failed' ? styles.badgeReviewed : styles.badgePending}`}>
            {row.status}
          </span>
        </span>
      </div>
    )
  }

  function renderHead() {
    const heads = {
      contact:   ['Name','Email','Subject / Message','Date','Status'],
      volunteer: ['Name','Email','Skills','Date','Status'],
      csr:       ['Organisation','Email','Budget','Date','Status'],
      donations: ['Donor','Email','Amount','Date','Status'],
    }
    return (
      <div className={styles.tableHead} style={{ gridTemplateColumns:'1fr 1.5fr 1fr 1fr 0.7fr' }}>
        {heads[tab].map(h => <span key={h}>{h}</span>)}
      </div>
    )
  }

  return (
    <AdminShell active="/admin/submissions">
      <div className={styles.pageHeader}>
        <h1>Form Submissions</h1>
        <p>View all contact messages, volunteer applications, CSR inquiries, and donations.</p>
      </div>

      {/* Tabs */}
      <div style={{ display:'flex', gap:'0.5rem', marginBottom:'1.5rem', flexWrap:'wrap' }}>
        {TABS.map(({ id, label }) => (
          <button key={id}
            onClick={() => setTab(id)}
            style={{
              padding:'0.5rem 1.1rem',
              borderRadius:'var(--radius-full)',
              border:'2px solid',
              borderColor: tab===id ? 'var(--color-saffron)' : 'var(--color-warm-gray)',
              background: tab===id ? 'var(--color-saffron)' : 'var(--color-white)',
              color: tab===id ? 'white' : 'var(--color-earth)',
              fontWeight:'var(--fw-semi)',
              fontSize:'var(--text-sm)',
              fontFamily:'var(--font-body)',
              cursor:'pointer',
              transition:'all 150ms ease',
            }}
          >{label}</button>
        ))}
      </div>

      {loading ? (
        <p className={styles.empty}>Loading…</p>
      ) : rows.length === 0 ? (
        <p className={styles.empty}>No submissions yet.</p>
      ) : (
        <div className={styles.table}>
          {renderHead()}
          {rows.map(renderRow)}
        </div>
      )}
    </AdminShell>
  )
}
