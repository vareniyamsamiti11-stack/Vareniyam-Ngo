import { useParams, Link, useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import { ArrowLeft, Users, Target, Heart } from 'lucide-react'
import { PROGRAMS, PROGRAM_CATEGORIES } from '../lib/constants'
import styles from './ProgramDetailPage.module.css'

const EMOJI_MAP = {
  'pehchan': '🎓', 'navaankur': '🏘️', 'mental-health': '🧠',
  'suicide-prevention': '💚', 'substance-abuse': '🚫',
  'vocational-training': '✂️', 'swachh-bharat': '🌿',
  'environment': '🌳', 'financial-awareness': '💰',
}

// Find which category a program belongs to
function getCategory(slug) {
  return PROGRAM_CATEGORIES.find(c => c.programs.includes(slug))
}

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
}
const stagger = { visible: { transition: { staggerChildren: 0.09 } } }

export default function ProgramDetailPage() {
  const { slug } = useParams()
  const navigate = useNavigate()

  const program = PROGRAMS.find(p => p.slug === slug)

  if (!program) {
    return (
      <div className={styles.notFound}>
        <h2>Program not found</h2>
        <Link to="/programs" className={styles.backLink}>
          ← Back to all programs
        </Link>
      </div>
    )
  }

  const category = getCategory(slug)
  const emoji = EMOJI_MAP[slug] || '📋'

  // Related programs — same category, exclude current
  const related = category
    ? category.programs
        .filter(s => s !== slug)
        .map(s => PROGRAMS.find(p => p.slug === s))
        .filter(Boolean)
    : []

  return (
    <>
      <Helmet>
        <title>{program.title} – VSKS | Vareniyam Samaj Kalyan Samiti</title>
        <meta name="description" content={program.shortDesc} />
      </Helmet>

      {/* Hero */}
      <section className={styles.hero} style={{ '--prog-color': program.color }}>
        <div className={styles.heroBg} />
        <div className={`container ${styles.heroInner}`}>
          {/* Back button */}
          <motion.button
            className={styles.backBtn}
            onClick={() => navigate('/programs')}
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
            id={`back-btn-${slug}`}
          >
            <ArrowLeft size={16} />
            All Programs
          </motion.button>

          <motion.div
            className={styles.heroContent}
            initial="hidden"
            animate="visible"
            variants={stagger}
          >
            {category && (
              <motion.span className={styles.categoryBadge} variants={fadeUp}>
                <span>{category.emoji}</span>
                {category.label}
              </motion.span>
            )}

            <motion.div className={styles.heroEmoji} variants={fadeUp}>
              {emoji}
            </motion.div>

            <motion.h1 variants={fadeUp}>{program.title}</motion.h1>
            <motion.p className={styles.heroSubtitle} variants={fadeUp}>
              {program.subtitle}
            </motion.p>
            <motion.p className={styles.heroDesc} variants={fadeUp}>
              {program.shortDesc}
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Stats Banner */}
      <section className={styles.statsBanner} style={{ '--prog-color': program.color }}>
        <div className="container">
          <motion.div
            className={styles.statsRow}
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {program.impactStats.map(stat => (
              <motion.div key={stat.label} className={styles.statItem} variants={fadeUp}>
                <span className={styles.statValue}>{stat.value}</span>
                <span className={styles.statLabel}>{stat.label}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Full Description */}
      <section className="section">
        <div className={`container ${styles.detailGrid}`}>
          <motion.div
            className={styles.descBlock}
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <span className={styles.sectionLabel}>About This Program</span>
            <p className={styles.fullDesc}>{program.fullDesc}</p>
          </motion.div>

          <motion.div
            className={styles.sidebar}
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <motion.div className={styles.sideCard} variants={fadeUp}>
              <div className={styles.sideCardIcon} style={{ background: `color-mix(in srgb, ${program.color} 12%, white)` }}>
                <Target size={20} style={{ color: program.color }} />
              </div>
              <h3>Our Goal</h3>
              <p>Empowering communities through {program.title.toLowerCase()} — creating lasting impact one life at a time.</p>
            </motion.div>

            <motion.div className={styles.sideCard} variants={fadeUp}>
              <div className={styles.sideCardIcon} style={{ background: `color-mix(in srgb, ${program.color} 12%, white)` }}>
                <Users size={20} style={{ color: program.color }} />
              </div>
              <h3>Who We Serve</h3>
              <p>Marginalized individuals, families, and communities across Madhya Pradesh who need support and opportunity.</p>
            </motion.div>

            <motion.div className={styles.sideCard} variants={fadeUp}>
              <div className={styles.sideCardIcon} style={{ background: `color-mix(in srgb, ${program.color} 12%, white)` }}>
                <Heart size={20} style={{ color: program.color }} />
              </div>
              <h3>Get Involved</h3>
              <p>You can support this program by volunteering, donating, or partnering with us for community change.</p>
              <Link to="/get-involved" className={styles.involvedBtn} style={{ background: program.color }} id={`involve-btn-${slug}`}>
                Support This Program
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Related Programs */}
      {related.length > 0 && (
        <section className={styles.relatedSection}>
          <div className="container">
            <motion.div
              className={styles.relatedHeader}
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <span className={styles.sectionLabel}>More in {category?.label}</span>
              <h2>Related Programs</h2>
            </motion.div>

            <motion.div
              className={styles.relatedGrid}
              variants={stagger}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              {related.map(rel => (
                <motion.div key={rel.slug} variants={fadeUp}>
                  <Link
                    to={`/programs/${rel.slug}`}
                    className={styles.relatedCard}
                    style={{ '--rel-color': rel.color }}
                    id={`related-${rel.slug}`}
                  >
                    <span className={styles.relatedEmoji}>{EMOJI_MAP[rel.slug]}</span>
                    <div>
                      <h3>{rel.title}</h3>
                      <p>{rel.subtitle}</p>
                    </div>
                    <ArrowLeft size={16} className={styles.relatedArrow} />
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className={styles.ctaSection} style={{ '--prog-color': program.color }}>
        <div className="container">
          <motion.div
            className={styles.ctaBox}
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <h2>Want to make a difference?</h2>
            <p>Join us in our mission to build inclusive communities across Madhya Pradesh.</p>
            <div className={styles.ctaButtons}>
              <Link to="/get-involved" className={styles.ctaPrimary} id={`cta-donate-${slug}`}>
                <Heart size={16} /> Donate Now
              </Link>
              <Link to="/programs" className={styles.ctaSecondary} id={`cta-all-programs-${slug}`}>
                ← All Programs
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  )
}
