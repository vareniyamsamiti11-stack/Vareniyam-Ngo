import { Link } from 'react-router-dom'
import { Heart, MapPin, Phone, Mail } from 'lucide-react'
import { ORG, NAV_LINKS, REGISTRATIONS } from '../../lib/constants'
import styles from './Footer.module.css'

const QUICK_LINKS = [
  { label: 'About Us',     href: '/about' },
  { label: 'Our Programs', href: '/programs' },
  { label: 'Impact',       href: '/impact' },
  { label: 'Get Involved', href: '/get-involved' },
  { label: 'News',         href: '/news' },
  { label: 'Contact',      href: '/contact' },
]

// Inline SVG brand icons — lucide-react doesn't include brand icons
const IconFacebook  = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/></svg>
const IconInstagram = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg>
const IconWhatsApp  = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
const IconYoutube   = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M22.54 6.42a2.78 2.78 0 00-1.94-1.96C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 00-1.94 1.96A29 29 0 001 12a29 29 0 00.46 5.58A2.78 2.78 0 003.4 19.54C5.12 20 12 20 12 20s6.88 0 8.6-.46a2.78 2.78 0 001.94-1.96A29 29 0 0023 12a29 29 0 00-.46-5.58zM9.75 15.02V8.98L15.5 12l-5.75 3.02z"/></svg>

const SOCIAL = [
  { Icon: IconFacebook,  href: 'https://facebook.com',           label: 'Facebook' },
  { Icon: IconInstagram, href: 'https://instagram.com',          label: 'Instagram' },
  { Icon: IconWhatsApp,  href: 'https://wa.me/918319428199',     label: 'WhatsApp' },
  { Icon: IconYoutube,   href: 'https://youtube.com',            label: 'YouTube' },
]

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.grid}`}>

        {/* Col 1: Brand */}
        <div className={styles.brand}>
          <div className={styles.logo}>
            <div className={styles.logoMark}><span>V</span></div>
            <div>
              <p className={styles.logoName}>{ORG.shortName}</p>
              <p className={styles.logoSub}>Samaj Kalyan Samiti</p>
            </div>
          </div>
          <p className={styles.mission}>{ORG.tagline}</p>
          <div className={styles.regBadges}>
            <span className={styles.badge}>12A</span>
            <span className={styles.badge}>80G</span>
            <span className={styles.badge}>CSR-1</span>
            <span className={styles.badge}>NGODARPAN</span>
          </div>
          <p className={styles.ngoId}>NGODARPAN: MP/2019/0234668</p>
        </div>

        {/* Col 2: Quick Links */}
        <div className={styles.col}>
          <h3 className={styles.colTitle}>Quick Links</h3>
          <ul className={styles.linkList}>
            {QUICK_LINKS.map(l => (
              <li key={l.href}>
                <Link to={l.href} className={styles.footerLink}>{l.label}</Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Col 3: Contact */}
        <div className={styles.col}>
          <h3 className={styles.colTitle}>Contact Us</h3>
          <ul className={styles.contactList}>
            <li className={styles.contactItem}>
              <MapPin size={16} className={styles.contactIcon} />
              <span>{ORG.address}</span>
            </li>
            <li className={styles.contactItem}>
              <Phone size={16} className={styles.contactIcon} />
              <a href={`tel:${ORG.phone}`} className={styles.footerLink}>{ORG.phone}</a>
            </li>
            <li className={styles.contactItem}>
              <Mail size={16} className={styles.contactIcon} />
              <a href={`mailto:${ORG.email}`} className={styles.footerLink}>{ORG.email}</a>
            </li>
          </ul>
        </div>

        {/* Col 4: Social & Donate */}
        <div className={styles.col}>
          <h3 className={styles.colTitle}>Connect With Us</h3>
          <div className={styles.socialRow}>
            {SOCIAL.map(({ Icon, href, label }) => (
              <a key={label} href={href} className={styles.socialBtn} aria-label={label} target="_blank" rel="noopener noreferrer">
                <Icon size={18} />
              </a>
            ))}
          </div>
          <Link to="/get-involved" className={styles.donateBtn}>
            <Heart size={15} />
            Donate Now
          </Link>
          <p className={styles.taxNote}>Your donation is eligible for 80G tax deduction under Income Tax Act.</p>
        </div>

      </div>

      <div className={styles.bottom}>
        <div className="container">
          <div className={styles.bottomInner}>
            <p className={styles.copyright}>
              © {new Date().getFullYear()} Vareniyam Samaj Kalyan Samiti. All rights reserved.
            </p>
            <p className={styles.love}>Made with <Heart size={12} className={styles.heartIcon} /> for the community</p>
          </div>
        </div>
      </div>
    </footer>
  )
}
