import { useState, useEffect, useRef } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, Heart, ChevronDown, Images } from 'lucide-react'
import {
  NAV_LINKS, PROGRAM_CATEGORIES, PROGRAMS,
  GALLERY_CATEGORIES, ORG
} from '../../lib/constants'
import styles from './Navbar.module.css'

const PROGRAM_MAP = Object.fromEntries(PROGRAMS.map(p => [p.slug, p]))

const PROG_EMOJI = {
  'pehchan': '🎓', 'navaankur': '🏘️', 'mental-health': '🧠',
  'suicide-prevention': '💚', 'substance-abuse': '🚫',
  'vocational-training': '✂️', 'swachh-bharat': '🌿',
  'environment': '🌳', 'financial-awareness': '💰',
}

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  // Single state: which desktop dropdown is open (by dropdownType) or null
  const [openDropdown, setOpenDropdown] = useState(null)
  // Single state: which mobile accordion is open (by dropdownType) or null
  const [mobileAccordion, setMobileAccordion] = useState(null)
  const navRef = useRef(null)
  const location = useLocation()

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    setMobileOpen(false)
    setOpenDropdown(null)
    setMobileAccordion(null)
  }, [location])

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])

  // Close desktop dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (navRef.current && !navRef.current.contains(e.target)) {
        setOpenDropdown(null)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // ── Dropdown content renderers ─────────────────────────────
  function renderProgramsDropdown() {
    return (
      <motion.div
        className={styles.dropdown}
        initial={{ opacity: 0, y: 8, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 8, scale: 0.97 }}
        transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
      >
        <Link to="/programs" className={styles.dropdownAllLink} id="dropdown-all-programs">
          View All Programs →
        </Link>
        <div className={styles.dropdownGrid}>
          {PROGRAM_CATEGORIES.map(cat => (
            <div key={cat.id} className={styles.dropdownCategory}>
              <div className={styles.catHeader}>
                <span className={styles.catEmoji}>{cat.emoji}</span>
                <span className={styles.catLabel}>{cat.label}</span>
              </div>
              <ul className={styles.catPrograms}>
                {cat.programs.map(slug => {
                  const prog = PROGRAM_MAP[slug]
                  if (!prog) return null
                  return (
                    <li key={slug}>
                      <Link
                        to={`/programs/${slug}`}
                        className={styles.dropdownItem}
                        id={`dropdown-${cat.id}-${slug}`}
                      >
                        <span className={styles.dropdownItemEmoji}>{PROG_EMOJI[slug]}</span>
                        <span className={styles.dropdownItemText}>
                          <span className={styles.dropdownItemTitle}>{prog.title}</span>
                          <span className={styles.dropdownItemSub}>{prog.subtitle}</span>
                        </span>
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
        </div>
      </motion.div>
    )
  }

  function renderGalleryDropdown() {
    return (
      <motion.div
        className={`${styles.dropdown} ${styles.galleryDropdown}`}
        initial={{ opacity: 0, y: 8, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 8, scale: 0.97 }}
        transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className={styles.galleryDropdownHeader}>
          <Images size={15} />
          <span>Browse Gallery by Category</span>
        </div>
        <ul className={styles.galleryList}>
          {GALLERY_CATEGORIES.map(cat => (
            <li key={cat.id}>
              <Link
                to={`/gallery/${cat.id}`}
                className={styles.galleryDropdownItem}
                id={`dropdown-gallery-${cat.id}`}
              >
                <span className={styles.galleryItemEmoji}>{cat.emoji}</span>
                <span className={styles.galleryItemText}>
                  <span className={styles.galleryItemTitle}>{cat.fullLabel}</span>
                  <span className={styles.galleryItemCount}>
                    {cat.photos.length > 0 ? `${cat.photos.length} photos` : 'Coming soon'}
                  </span>
                </span>
                <ChevronDown size={13} style={{ transform: 'rotate(-90deg)', color: 'var(--color-mid-gray)', flexShrink: 0 }} />
              </Link>
            </li>
          ))}
        </ul>
      </motion.div>
    )
  }

  // ── Mobile accordion content renderers ─────────────────────
  function renderMobileProgramsAccordion() {
    return (
      <motion.div
        className={styles.mobileDropdownContent}
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
        exit={{ opacity: 0, height: 0 }}
        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      >
        <Link to="/programs" className={styles.mobileAllPrograms}>View All Programs →</Link>
        {PROGRAM_CATEGORIES.map(cat => (
          <div key={cat.id} className={styles.mobileCatGroup}>
            <div className={styles.mobileCatHeader}>
              <span>{cat.emoji}</span>
              <span>{cat.label}</span>
            </div>
            {cat.programs.map(slug => {
              const prog = PROGRAM_MAP[slug]
              if (!prog) return null
              return (
                <Link
                  key={slug}
                  to={`/programs/${slug}`}
                  className={styles.mobileCatItem}
                  id={`mobile-prog-${cat.id}-${slug}`}
                >
                  <span>{PROG_EMOJI[slug]}</span>
                  <span>{prog.title}</span>
                </Link>
              )
            })}
          </div>
        ))}
      </motion.div>
    )
  }

  function renderMobileGalleryAccordion() {
    return (
      <motion.div
        className={styles.mobileDropdownContent}
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
        exit={{ opacity: 0, height: 0 }}
        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      >
        {GALLERY_CATEGORIES.map(cat => (
          <Link
            key={cat.id}
            to={`/gallery/${cat.id}`}
            className={styles.mobileCatItem}
            id={`mobile-gallery-${cat.id}`}
          >
            <span>{cat.emoji}</span>
            <span>{cat.fullLabel}</span>
          </Link>
        ))}
      </motion.div>
    )
  }

  return (
    <>
      <header className={`${styles.navbar} ${scrolled ? styles.scrolled : ''}`}>
        <div className={`container ${styles.inner}`}>
          {/* Logo */}
          <Link to="/" className={styles.logo} aria-label="VSKS Home">
            <div className={styles.logoMark}>
              <span className={styles.logoV}>V</span>
            </div>
            <div className={styles.logoText}>
              <span className={styles.logoName}>{ORG.shortName}</span>
              <span className={styles.logoTagline}>Samaj Kalyan Samiti</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className={styles.desktopNav} aria-label="Main navigation" ref={navRef}>
            {NAV_LINKS.map(link => {
              if (link.hasDropdown) {
                const isOpen = openDropdown === link.dropdownType
                const isActive = location.pathname.startsWith(link.href)
                return (
                  <div
                    key={link.href}
                    className={styles.dropdownWrapper}
                    onMouseEnter={() => setOpenDropdown(link.dropdownType)}
                    onMouseLeave={() => setOpenDropdown(null)}
                  >
                    <button
                      className={`${styles.navLink} ${styles.dropdownTrigger} ${isActive ? styles.navLinkActive : ''}`}
                      onClick={() => setOpenDropdown(isOpen ? null : link.dropdownType)}
                      aria-haspopup="true"
                      aria-expanded={isOpen}
                      id={`${link.dropdownType}-dropdown-btn`}
                    >
                      {link.label}
                      <ChevronDown
                        size={14}
                        className={`${styles.chevronIcon} ${isOpen ? styles.chevronOpen : ''}`}
                      />
                    </button>
                    <AnimatePresence>
                      {isOpen && (
                        link.dropdownType === 'programs'
                          ? renderProgramsDropdown()
                          : renderGalleryDropdown()
                      )}
                    </AnimatePresence>
                  </div>
                )
              }

              return (
                <NavLink
                  key={link.href}
                  to={link.href}
                  end={link.href === '/'}
                  className={({ isActive }) =>
                    `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`
                  }
                >
                  {link.label}
                </NavLink>
              )
            })}
          </nav>

          {/* Donate CTA + Hamburger */}
          <div className={styles.actions}>
            <Link to="/get-involved" className={styles.donateBtn} id="nav-donate-btn">
              <Heart size={15} />
              Donate
            </Link>
            <button
              className={styles.hamburger}
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
              aria-expanded={mobileOpen}
            >
              <Menu size={22} />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              className={styles.mobileOverlay}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              className={styles.mobileMenu}
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
              <button
                className={styles.closeBtn}
                onClick={() => setMobileOpen(false)}
                aria-label="Close menu"
              >
                <X size={24} />
              </button>

              <div className={styles.mobileLogo}>
                <span className={styles.logoV}>V</span>
                <span className={styles.logoName}>{ORG.shortName}</span>
              </div>

              <nav className={styles.mobileNav} aria-label="Mobile navigation">
                {NAV_LINKS.map((link, i) => {
                  if (link.hasDropdown) {
                    const isAccordionOpen = mobileAccordion === link.dropdownType
                    const isActive = location.pathname.startsWith(link.href)
                    return (
                      <motion.div
                        key={link.href}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.06 }}
                      >
                        <button
                          className={`${styles.mobileNavLink} ${styles.mobileDropdownTrigger} ${isActive ? styles.mobileNavLinkActive : ''}`}
                          onClick={() => setMobileAccordion(isAccordionOpen ? null : link.dropdownType)}
                          id={`mobile-${link.dropdownType}-accordion`}
                        >
                          <span>{link.label}</span>
                          <ChevronDown
                            size={16}
                            className={`${styles.chevronIcon} ${isAccordionOpen ? styles.chevronOpen : ''}`}
                          />
                        </button>
                        <AnimatePresence>
                          {isAccordionOpen && (
                            link.dropdownType === 'programs'
                              ? renderMobileProgramsAccordion()
                              : renderMobileGalleryAccordion()
                          )}
                        </AnimatePresence>
                      </motion.div>
                    )
                  }

                  return (
                    <motion.div
                      key={link.href}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.06 }}
                    >
                      <NavLink
                        to={link.href}
                        end={link.href === '/'}
                        className={({ isActive }) =>
                          `${styles.mobileNavLink} ${isActive ? styles.mobileNavLinkActive : ''}`
                        }
                      >
                        {link.label}
                      </NavLink>
                    </motion.div>
                  )
                })}
              </nav>

              <Link to="/get-involved" className={styles.mobileDonateBtn}>
                <Heart size={16} />
                Donate Now
              </Link>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
