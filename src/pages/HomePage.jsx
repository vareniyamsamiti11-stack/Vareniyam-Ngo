import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import { ArrowRight, Heart, Users, GraduationCap, Leaf, ChevronDown, Mail, Calendar } from 'lucide-react'
import { PARTNERS, ORG } from '../lib/constants'
import { useSiteContent, usePrograms, useTestimonials, useEvents } from '../hooks/useSiteContent'
import { supabase } from '../lib/supabase'
import CountUp from '../components/ui/CountUp'
import styles from './HomePage.module.css'

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22,1,0.36,1] } },
}
const stagger = { visible: { transition: { staggerChildren: 0.1 } } }

export default function HomePage() {
  const [nlEmail, setNlEmail]   = useState('')
  const [nlStatus, setNlStatus] = useState(null)
  const siteContent = useSiteContent()
  const { programs } = usePrograms()
  const { testimonials } = useTestimonials()
  const { events } = useEvents()

  const hero = siteContent.hero
  const impactStats = siteContent.impactStats

  async function handleNewsletter(e) {
    e.preventDefault()
    if (!nlEmail) return
    try {
      await supabase.from('newsletter_subscribers').insert({ email: nlEmail })
      setNlStatus('success'); setNlEmail('')
      setTimeout(() => setNlStatus(null), 4000)
    } catch { setNlStatus('error') }
  }
  return (
    <>
      <Helmet>
        <title>VSKS – Vareniyam Samaj Kalyan Samiti | Indore NGO</title>
        <meta name="description" content="VSKS is an Indore-based NGO working in special education, mental health, environmental action, and community development since 2018." />
      </Helmet>

      {/* ── Hero ── */}
      <section className={styles.hero}>
        <div className={styles.heroBg} aria-hidden="true" />

        {/* Text column */}
        <div className={`container ${styles.heroInner}`}>
          <div className={styles.heroContent}>
            <motion.div
              className={styles.heroTag}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {hero.tagline || `Registered NGO · Since ${ORG.founded}`}
            </motion.div>
            <motion.h1
              className={styles.heroTitle}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
            >
              {hero.title || (
                <>
                  Building Inclusive<br />
                  <span className={styles.heroAccent}>{hero.accentWord || 'Communities'}</span>,<br />
                  One Life at a Time
                </>
              )}
            </motion.h1>
            <motion.p
              className={styles.heroSubtitle}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.25 }}
            >
              {hero.subtitle || ORG.mission}
            </motion.p>
            <motion.div
              className={styles.heroCtas}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Link to={hero.primaryCtaLink || '/get-involved'} className={styles.btnPrimary} id="hero-donate-btn">
                <Heart size={18} /> {hero.primaryCtaText || 'Donate Now'}
              </Link>
              <Link to={hero.secondaryCtaLink || '/programs'} className={styles.btnSecondary}>
                {hero.secondaryCtaText || 'Our Programs'} <ArrowRight size={16} />
              </Link>
            </motion.div>
          </div>

          {/* Image column */}
          <motion.div
            className={styles.heroImageWrap}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.22,1,0.36,1] }}
          >
            <div className={styles.heroImageFrame}>
              <img
                src={hero.coverImage || '/Assets/heropage.jpeg'}
                alt="VSKS volunteers working with the community"
                className={styles.heroImage}
                loading="eager"
              />
              <div className={styles.heroImageOverlay} />
              {/* Floating impact badge */}
              <motion.div
                className={styles.heroBadge}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7, duration: 0.5 }}
              >
                <span className={styles.heroBadgeValue}>10,000+</span>
                <span className={styles.heroBadgeLabel}>Lives Impacted</span>
              </motion.div>
            </div>
          </motion.div>
        </div>

        <a href="#impact" className={styles.scrollDown} aria-label="Scroll down">
          <ChevronDown size={22} />
        </a>
      </section>

      {/* ── Impact Stats ── */}
      <section id="impact" className={`${styles.statsSection} section--sm`}>
        <div className="container">
          <div className={styles.statsGrid}>
            {(impactStats || []).map((stat, i) => (
              <motion.div
                key={stat.label}
                className={styles.statCard}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <span className={styles.statValue} style={{ color: stat.color }}>
                  <CountUp to={stat.value} />{stat.suffix}
                </span>
                <span className={styles.statLabel}>{stat.label}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Programs Teaser ── */}
      <section className="section">
        <div className="container">
          <motion.div
            className={`${styles.sectionHeader} text-center`}
            variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
          >
            <span className={styles.eyebrow}>What We Do</span>
            <h2>Our Programs</h2>
            <p>Nine focused initiatives addressing the most pressing needs of marginalized communities.</p>
          </motion.div>

          <motion.div
            className={styles.programGrid}
            variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true }}
          >
            {(programs || []).slice(0, 6).map(program => (
              <motion.div key={program.slug} className={styles.programCard} variants={fadeUp}>
                <div className={styles.programIconWrap} style={{ '--prog-color': program.color || 'var(--color-teal)' }}>
                  {program.slug === 'pehchan'
                    ? <img src="/Assets/phenchan logo.jpeg" alt="Pehchan Logo" style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '8px' }} />
                    : program.slug === 'navaankur'
                    ? <img src="/naavankur logo.jpeg" alt="Navaankur Logo" style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '8px' }} />
                    : <span className={styles.programEmoji}>{getProgramEmoji(program.slug)}</span>
                  }
                </div>
                <h3 className={styles.programTitle}>{program.title}</h3>
                <p className={styles.programDesc}>{program.short_desc || program.shortDesc}</p>
                <Link to={`/programs`} className={styles.programLink}>
                  Learn more <ArrowRight size={14} />
                </Link>
              </motion.div>
            ))}
          </motion.div>

          <div className="text-center" style={{ marginTop: '2.5rem' }}>
            <Link to="/programs" className={styles.btnOutline}>
              View All Programs <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Events Teaser (If published events exist) ── */}
      {events && events.length > 0 && (
        <section className="section" style={{ background: 'var(--color-cream)', borderTop: '1px solid var(--color-warm-gray)' }}>
          <div className="container">
            <motion.div
              className={`${styles.sectionHeader} text-center`}
              variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
            >
              <span className={styles.eyebrow}>Community Action</span>
              <h2>Upcoming &amp; Recent Events</h2>
              <p>Join us at our workshops, awareness drives, and grassroots community campaigns.</p>
            </motion.div>

            <motion.div
              className={styles.programGrid}
              variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true }}
            >
              {events.slice(0, 3).map(event => (
                <motion.div key={event.id} className={styles.programCard} variants={fadeUp} style={{ padding: 0, overflow: 'hidden' }}>
                  <img
                    src={event.cover_image || '/Assets/heropage.jpeg'}
                    alt={event.title}
                    style={{ width: '100%', height: '160px', objectFit: 'cover' }}
                  />
                  <div style={{ padding: '1.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: 'var(--text-xs)', color: 'var(--color-saffron)', marginBottom: '0.4rem', fontWeight: 'var(--fw-semi)' }}>
                      <Calendar size={13} />
                      <span>{new Date(event.event_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    </div>
                    <h3 className={styles.programTitle} style={{ fontSize: 'var(--text-lg)', margin: '0 0 0.5rem' }}>{event.title}</h3>
                    <p className={styles.programDesc} style={{ margin: '0 0 1rem' }}>
                      {event.short_desc || (event.full_desc || '').slice(0, 90) + '...'}
                    </p>
                    <Link to={`/events/${event.slug}`} className={styles.programLink}>
                      Event Details &amp; Photos <ArrowRight size={14} />
                    </Link>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            <div className="text-center" style={{ marginTop: '2.5rem' }}>
              <Link to="/events" className={styles.btnOutline}>
                View All Events <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ── Mission Quote ── */}
      <section className={styles.missionSection}>
        <div className="container">
          <motion.blockquote
            className={styles.missionQuote}
            variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
          >
            <span className={styles.quoteMarks}>"</span>
            Every individual deserves to live with dignity — regardless of disability, poverty, or circumstance.
            <span className={styles.quoteMarks}>"</span>
            <footer className={styles.quoteAuthor}>
              — {siteContent.about?.founderName || ORG.founder}, {siteContent.about?.founderTitle || ORG.founderTitle}
            </footer>
          </motion.blockquote>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="section">
        <div className="container">
          <motion.div
            className={`${styles.sectionHeader} text-center`}
            variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
          >
            <span className={styles.eyebrow}>Stories of Change</span>
            <h2>Lives We've Touched</h2>
          </motion.div>
          <motion.div
            className={styles.testimonialGrid}
            variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true }}
          >
            {(testimonials || []).slice(0, 3).map((t, idx) => (
              <motion.div key={t.id || idx} className={styles.testimonialCard} variants={fadeUp}>
                <p className={styles.quote}>"{t.quote}"</p>
                <div className={styles.testimonialAuthor}>
                  <div className={styles.avatar}>{(t.name || 'V').charAt(0)}</div>
                  <div>
                    <strong>{t.name}</strong>
                    <span>{t.role}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Partners ── */}
      <section className={`${styles.partnersSection} section--sm`}>
        <div className="container">
          <p className={styles.partnersLabel}>Supported &amp; Recognized By</p>
          <div className={styles.partnersRow}>
            {PARTNERS.map(p => (
              <span key={p} className={styles.partnerBadge}>{p}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Newsletter ── */}
      <section className={styles.newsletterSection}>
        <div className="container">
          <motion.div
            className={styles.newsletterBox}
            variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
          >
            <Mail size={32} className={styles.nlIcon} />
            <h2>Stay Connected</h2>
            <p>Get updates on our programs, events, and impact stories — straight to your inbox.</p>
            {nlStatus === 'success' && <p className={styles.nlSuccess}>✅ Thank you for subscribing!</p>}
            {nlStatus === 'error'   && <p className={styles.nlError}>Something went wrong. Please try again.</p>}
            <form onSubmit={handleNewsletter} className={styles.nlForm}>
              <input
                type="email"
                value={nlEmail}
                onChange={e => setNlEmail(e.target.value)}
                placeholder="Enter your email address"
                className={styles.nlInput}
                required
                id="newsletter-email"
              />
              <button type="submit" className={styles.nlBtn} id="newsletter-submit-btn">
                Subscribe
              </button>
            </form>
            <p className={styles.nlNote}>No spam. Unsubscribe anytime.</p>
          </motion.div>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className={styles.ctaSection}>
        <div className="container">
          <motion.div
            className={styles.ctaBox}
            variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
          >
            <h2>Ready to Make a Difference?</h2>
            <p>Join thousands of supporters transforming lives across Madhya Pradesh.</p>
            <div className={styles.ctaBtns}>
              <Link to="/get-involved" className={styles.btnWhite} id="cta-donate-btn">
                <Heart size={18} /> Donate Now
              </Link>
              <Link to="/get-involved" className={styles.btnWhiteOutline}>
                Volunteer With Us
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  )
}

function getProgramEmoji(slug) {
  const map = {
    'mental-health': '🧠',
    'suicide-prevention': '💚',
    'substance-abuse': '🚫',
    'vocational-training': '✂️',
    'swachh-bharat': '🌿',
    'environment': '🌳',
    'financial-awareness': '💰',
  }
  return map[slug] || '❤️'
}
