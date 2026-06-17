import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import { IMPACT_STATS, PROGRAMS } from '../lib/constants'
import CountUp from '../components/ui/CountUp'
import styles from './ImpactPage.module.css'

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22,1,0.36,1] } },
}
const stagger = { visible: { transition: { staggerChildren: 0.1 } } }

const TIMELINE = [
  { year: '2018', title: 'Registration', desc: 'VSKS formally registered under the Madhya Pradesh Society Act — laying the legal foundation for community-driven impact.' },
  { year: '2019', title: 'Financial Awareness for Women', desc: 'Launched awareness sessions around banking, savings, and financial planning specially targeting elderly and rural women.' },
  { year: '2020', title: 'Community Groundwork', desc: 'Strengthened grassroots outreach and community mobilization across Indore and surrounding areas.' },
  { year: '2021', title: 'Apni Paatshala Program', desc: 'Launched the Apni Paatshala education initiative — bringing non-formal learning and literacy support to underserved communities.' },
  { year: '2022', title: 'SBM Khategaon Partnership', desc: 'Partnered with the Swachh Bharat Mission in Khategaon block, Dewas district — sensitizing 3,000+ households and achieving ODF status in 8 villages.' },
  { year: '2023', title: 'Scale-Up & Recognition', desc: 'Suicide prevention network expanded. 10,000+ people sensitized on mental health. CSR-1 and NGODARPAN registrations secured.' },
  { year: '2024', title: 'Mental Health Awareness & Subsidized Support', desc: 'Expanded mental health awareness campaigns across schools and ICDS centres. Introduced subsidized counselling and crisis-referral services for marginalized families.' },
  { year: '2025', title: 'Vachanshul — Continued', desc: 'Launched Vachanshul, a community reading and literacy initiative, fostering a culture of learning and knowledge-sharing. Program continues to grow.' },
  { year: '2026', title: 'Navaankur — Continued', desc: 'Navaankur community development program expanded further under MP Jan Abhiyan Parishad, deepening rural outreach, livelihood support, and self-governance capacity building.' },
]

export default function ImpactPage() {
  return (
    <>
      <Helmet>
        <title>Our Impact – VSKS | Vareniyam Samaj Kalyan Samiti</title>
        <meta name="description" content="See the real-world impact of VSKS — 10,000+ lives touched, 2,500+ students, 150+ trees planted across Madhya Pradesh." />
      </Helmet>

      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.heroBg} />
        <div className={`container ${styles.heroContent}`}>
          <motion.span className={styles.eyebrow} initial={{ opacity:0 }} animate={{ opacity:1 }}>Our Impact</motion.span>
          <motion.h1 initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.1 }}>
            Measuring What Matters
          </motion.h1>
          <motion.p initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.2 }}>
            Every number here is a real person whose life we've touched — a child who learned, a woman empowered, a community transformed.
          </motion.p>
        </div>
      </section>

      {/* Big Stats */}
      <section className={`section ${styles.statsSection}`}>
        <div className="container">
          <motion.div
            className={styles.statsGrid}
            variants={stagger} initial="hidden" whileInView="visible" viewport={{ once:true }}
          >
            {IMPACT_STATS.map((stat) => (
              <motion.div key={stat.label} className={styles.statCard} variants={fadeUp}>
                <span className={styles.statValue} style={{ color: stat.color }}>
                  <CountUp to={stat.value} />{stat.suffix}
                </span>
                <span className={styles.statLabel}>{stat.label}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Program-level Impact */}
      <section className="section">
        <div className="container">
          <motion.div className="text-center" style={{ marginBottom:'3rem' }} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once:true }}>
            <span className={styles.eyebrow}>Program Impact</span>
            <h2>Results by Initiative</h2>
          </motion.div>
          <motion.div
            className={styles.programGrid}
            variants={stagger} initial="hidden" whileInView="visible" viewport={{ once:true }}
          >
            {PROGRAMS.map((program) => (
              <motion.div
                key={program.slug}
                className={styles.programCard}
                variants={fadeUp}
                style={{ '--prog-color': program.color }}
              >
                <div className={styles.programHeader}>
                  <h3 className={styles.programName}>{program.title}</h3>
                  <p className={styles.programSub}>{program.subtitle}</p>
                </div>
                <div className={styles.programStats}>
                  {program.impactStats.map(stat => (
                    <div key={stat.label} className={styles.pStat}>
                      <span className={styles.pStatVal}>{stat.value}</span>
                      <span className={styles.pStatLbl}>{stat.label}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Timeline */}
      <section className={`section ${styles.timelineSection}`}>
        <div className="container">
          <motion.div className="text-center" style={{ marginBottom:'3rem' }} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once:true }}>
            <span className={styles.eyebrow}>Our Journey</span>
            <h2>Our Journey Since 2018</h2>
          </motion.div>
          <div className={styles.timeline}>
            {TIMELINE.map((item, i) => (
              <motion.div
                key={item.year}
                className={`${styles.timelineItem} ${i % 2 === 0 ? styles.left : styles.right}`}
                variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once:true }}
                transition={{ delay: i * 0.08 }}
              >
                <div className={styles.timelineCard}>
                  <span className={styles.timelineYear}>{item.year}</span>
                  <h3>{item.title}</h3>
                  <p>{item.desc}</p>
                </div>
                <div className={styles.timelineDot} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
