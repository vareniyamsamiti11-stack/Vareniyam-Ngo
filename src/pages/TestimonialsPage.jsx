import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { motion, AnimatePresence } from 'framer-motion'
import { Quote, Heart } from 'lucide-react'
import { TESTIMONIALS_FULL, ORG } from '../lib/constants'
import { Link } from 'react-router-dom'
import styles from './TestimonialsPage.module.css'

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
}
const stagger = { visible: { transition: { staggerChildren: 0.08 } } }

const CATEGORY_LABELS = {
  all:        'All Stories',
  student:    'Students & Families',
  community:  'Community Members',
  volunteer:  'Volunteers',
  partner:    'Partners & Donors',
}

export default function TestimonialsPage() {
  const [activeCategory, setActiveCategory] = useState('all')

  const filtered = activeCategory === 'all'
    ? TESTIMONIALS_FULL
    : TESTIMONIALS_FULL.filter(t => t.category === activeCategory)

  const featured = TESTIMONIALS_FULL[0]

  return (
    <>
      <Helmet>
        <title>Testimonials – VSKS | Stories of Change</title>
        <meta name="description" content="Real stories from students, families, volunteers, and community members whose lives have been touched by Vareniyam Samaj Kalyan Samiti." />
      </Helmet>

      {/* ── Hero ── */}
      <section className={styles.hero}>
        <div className={styles.heroBg} />
        <div className={`container ${styles.heroContent}`}>
          <motion.span className={styles.eyebrow} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            Stories of Change
          </motion.span>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            Lives We've Touched
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            Every number behind our impact is a human story. Here are the voices of the people VSKS serves and works alongside.
          </motion.p>
        </div>
      </section>

      {/* ── Featured Quote ── */}
      <section className={styles.featuredSection}>
        <div className="container">
          <motion.div
            className={styles.featuredCard}
            variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
          >
            <Quote size={48} className={styles.featuredQuoteIcon} />
            <blockquote className={styles.featuredQuote}>
              "{featured.quote}"
            </blockquote>
            <div className={styles.featuredAuthor}>
              <div className={styles.avatarLg}>{featured.name.charAt(0)}</div>
              <div>
                <strong className={styles.authorName}>{featured.name}</strong>
                <span className={styles.authorRole}>{featured.role}</span>
                {featured.program && <span className={styles.authorProgram}>{featured.program}</span>}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Category Tabs + Grid ── */}
      <section className="section">
        <div className="container">
          <motion.div
            className={`${styles.sectionHeader} text-center`}
            variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
          >
            <span className={styles.eyebrowAlt}>All Testimonials</span>
            <h2>What People Are Saying</h2>
            <p>Filter by the type of impact VSKS has had across our programs.</p>
          </motion.div>

          {/* Category Tabs */}
          <motion.div
            className={styles.tabs}
            variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
          >
            {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
              <button
                key={key}
                className={`${styles.tab} ${activeCategory === key ? styles.tabActive : ''}`}
                onClick={() => setActiveCategory(key)}
              >
                {label}
              </button>
            ))}
          </motion.div>

          {/* Cards Grid */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeCategory}
              className={styles.grid}
              variants={stagger} initial="hidden" animate="visible"
            >
              {filtered.map(t => (
                <motion.div key={t.id} className={styles.card} variants={fadeUp}>
                  <div className={styles.cardQuoteIcon}>
                    <Quote size={16} />
                  </div>
                  <p className={styles.cardQuote}>"{t.quote}"</p>
                  <div className={styles.cardFooter}>
                    <div className={styles.avatarSm}>{t.name.charAt(0)}</div>
                    <div className={styles.cardAuthor}>
                      <strong>{t.name}</strong>
                      <span>{t.role}</span>
                      {t.program && <span className={styles.cardProgram}>{t.program}</span>}
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className={styles.ctaSection}>
        <div className="container">
          <motion.div
            className={styles.ctaBox}
            variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
          >
            <h2>Be Part of Someone's Story</h2>
            <p>Your support — whether through a donation, volunteering, or a CSR partnership — creates real, lasting change.</p>
            <div className={styles.ctaBtns}>
              <Link to="/get-involved" className={styles.btnPrimary} id="testimonials-cta-donate">
                <Heart size={18} /> Donate Now
              </Link>
              <Link to="/get-involved" className={styles.btnOutline}>
                Volunteer With Us
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  )
}
