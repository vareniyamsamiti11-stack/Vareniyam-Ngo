import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { motion, AnimatePresence } from 'framer-motion'
import { PROGRAMS } from '../lib/constants'
import styles from './ProgramsPage.module.css'

const EMOJI_MAP = {
  'pehchan': '🎓', 'navaankur': '🏘️', 'mental-health': '🧠',
  'suicide-prevention': '💚', 'substance-abuse': '🚫',
  'vocational-training': '✂️', 'swachh-bharat': '🌿',
  'environment': '🌳', 'financial-awareness': '💰',
}

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22,1,0.36,1] } },
}
const stagger = { visible: { transition: { staggerChildren: 0.08 } } }

export default function ProgramsPage() {
  const [active, setActive] = useState(null)

  return (
    <>
      <Helmet>
        <title>Our Programs – VSKS | Vareniyam Samaj Kalyan Samiti</title>
        <meta name="description" content="Explore all 9 VSKS programs — from special education (Pehchan) and mental health to environment and vocational training." />
      </Helmet>

      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.heroBg} />
        <div className={`container ${styles.heroContent}`}>
          <motion.span className={styles.eyebrow} initial={{ opacity:0 }} animate={{ opacity:1 }}>What We Do</motion.span>
          <motion.h1 initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.1 }}>Our Programs</motion.h1>
          <motion.p initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.2 }}>
            Nine community-driven initiatives spanning education, mental health, environment, livelihoods and rural development.
          </motion.p>
        </div>
      </section>

      {/* Programs Grid */}
      <section className="section">
        <div className="container">
          <motion.div
            className={styles.grid}
            variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true }}
          >
            {PROGRAMS.map((program) => (
              <motion.div
                key={program.slug}
                className={`${styles.card} ${active === program.slug ? styles.cardActive : ''}`}
                variants={fadeUp}
                onClick={() => setActive(active === program.slug ? null : program.slug)}
                style={{ '--prog-color': program.color }}
              >
                <div className={styles.cardTop}>
                  <div className={styles.iconWrap}>
                    <span className={styles.emoji}>{EMOJI_MAP[program.slug]}</span>
                  </div>
                  <div className={styles.cardMeta}>
                    <h2 className={styles.cardTitle}>{program.title}</h2>
                    <p className={styles.cardSubtitle}>{program.subtitle}</p>
                  </div>
                  <span className={styles.chevron}>{active === program.slug ? '−' : '+'}</span>
                </div>

                <p className={styles.shortDesc}>{program.shortDesc}</p>

                <AnimatePresence>
                  {active === program.slug && (
                    <motion.div
                      className={styles.expanded}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.35, ease: [0.22,1,0.36,1] }}
                    >
                      <p className={styles.fullDesc}>{program.fullDesc}</p>
                      <div className={styles.impactRow}>
                        {program.impactStats.map(stat => (
                          <div key={stat.label} className={styles.impactStat}>
                            <span className={styles.impactVal}>{stat.value}</span>
                            <span className={styles.impactLbl}>{stat.label}</span>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
    </>
  )
}
