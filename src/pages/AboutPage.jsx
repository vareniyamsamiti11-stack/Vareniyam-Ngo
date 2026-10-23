import { useEffect, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import { Heart, Award, Users, MapPin, UserCheck } from 'lucide-react'
import { ORG, REGISTRATIONS } from '../lib/constants'
import { useSiteContent } from '../hooks/useSiteContent'
import { supabase } from '../lib/supabase'
import styles from './AboutPage.module.css'

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22,1,0.36,1] } },
}
const stagger = { visible: { transition: { staggerChildren: 0.1 } } }

const VALUES = [
  { icon: Heart,  title: 'Compassion',   desc: 'We lead with empathy, treating every person with dignity and kindness.' },
  { icon: Users,  title: 'Inclusion',    desc: 'We believe every voice matters — no one is left behind in our work.' },
  { icon: Award,  title: 'Integrity',    desc: 'Transparent governance and accountability guide every decision we make.' },
  { icon: MapPin, title: 'Community',    desc: 'We work with communities, not just for them — grassroots, always.' },
]

export default function AboutPage() {
  const siteContent = useSiteContent()
  const about = siteContent.about || {}
  const [teamMembers, setTeamMembers] = useState([])

  useEffect(() => {
    async function fetchTeam() {
      try {
        const { data } = await supabase
          .from('team_members')
          .select('*')
          .eq('is_active', true)
          .order('sort_order', { ascending: true })
        if (data) setTeamMembers(data)
      } catch (err) {
        console.warn('Error fetching team members:', err)
      }
    }
    fetchTeam()
  }, [])

  return (
    <>
      <Helmet>
        <title>About Us – VSKS | Vareniyam Samaj Kalyan Samiti</title>
        <meta name="description" content="Learn about VSKS — our story, mission, founder, and values. A registered NGO in Indore working since 2018." />
      </Helmet>

      {/* Page Hero */}
      <section className={styles.hero}>
        <div className={styles.heroBg} />
        <div className={`container ${styles.heroContent}`}>
          <motion.span className={styles.eyebrow} initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ duration:0.5 }}>
            Our Story
          </motion.span>
          <motion.h1 initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.6, delay:0.1 }}>
            About VSKS
          </motion.h1>
          <motion.p initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.6, delay:0.2 }}>
            {about.story || `Founded in ${ORG.founded} by ${ORG.founder}, we work at the intersection of education, mental health, environment, and community empowerment across Indore and Dewas districts.`}
          </motion.p>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="section">
        <div className="container">
          <div className={styles.missionGrid}>
            <motion.div className={styles.missionCard} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once:true }}>
              <span className={styles.cardEyebrow}>Our Mission</span>
              <h2>Why We Exist</h2>
              <p>{about.mission || ORG.mission}</p>
            </motion.div>
            <motion.div className={`${styles.missionCard} ${styles.visionCard}`} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once:true }}>
              <span className={styles.cardEyebrow} style={{ color:'var(--color-teal)' }}>Our Vision</span>
              <h2>Where We're Going</h2>
              <p>{about.vision || 'A society where every individual — regardless of disability, socio-economic background, or geography — can participate fully and live with dignity, independence, and purpose.'}</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Founder */}
      <section className={`${styles.founderSection} section`}>
        <div className="container">
          <motion.div className={styles.founderCard} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once:true }}>
            <div className={styles.founderAvatar}>
              <img
                src={about.founderImage || '/Assets/Founder.jpeg'}
                alt={about.founderName || ORG.founder}
                className={styles.founderImg}
              />
            </div>
            <div className={styles.founderInfo}>
              <span className={styles.cardEyebrow}>Leadership</span>
              <h2>{about.founderName || ORG.founder}</h2>
              <p className={styles.founderTitle}>{about.founderTitle || ORG.founderTitle}</p>
              <p>
                {about.founderBio || `Soni Dharva established Vareniyam Samaj Kalyan Samiti in 2018 with a deep conviction that every individual deserves access to education, mental health support, and livelihood opportunities. With a background in social work and community development, she has led the organisation from a small community initiative to a multi-program NGO touching over 10,000 lives.`}
              </p>
              <p>
                Under her leadership, VSKS has earned registrations under 12A, 80G, CSR-1, and is listed on NGODARPAN — reflecting her commitment to transparency and accountable governance.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Team Members */}
      {teamMembers.length > 0 && (
        <section className="section" style={{ background: 'var(--color-cream)' }}>
          <div className="container">
            <motion.div className="text-center" style={{ marginBottom: '2.5rem' }} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
              <span className={styles.eyebrow}>Our People</span>
              <h2>Team &amp; Advisory Board</h2>
              <p>Dedicated changemakers and advisors guiding our grassroots initiatives.</p>
            </motion.div>
            <motion.div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                gap: '1.5rem',
              }}
              variants={stagger}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              {teamMembers.map(m => (
                <motion.div
                  key={m.id}
                  variants={fadeUp}
                  style={{
                    background: 'var(--color-white)',
                    borderRadius: 'var(--radius-lg)',
                    padding: '1.75rem',
                    textAlign: 'center',
                    boxShadow: 'var(--shadow-card)',
                  }}
                >
                  <div
                    style={{
                      width: '84px',
                      height: '84px',
                      borderRadius: '50%',
                      background: 'rgba(232,101,26,0.1)',
                      color: 'var(--color-saffron)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 1rem',
                      overflow: 'hidden',
                      fontWeight: 'var(--fw-bold)',
                      fontSize: '1.5rem',
                    }}
                  >
                    {m.photo_url ? (
                      <img src={m.photo_url} alt={m.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      m.name.charAt(0)
                    )}
                  </div>
                  <h3 style={{ fontSize: 'var(--text-lg)', color: 'var(--color-earth)', margin: '0 0 0.25rem' }}>{m.name}</h3>
                  <p style={{ color: 'var(--color-saffron)', fontSize: 'var(--text-xs)', fontWeight: 'var(--fw-semi)', margin: '0 0 0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {m.role}
                  </p>
                  {m.bio && (
                    <p style={{ color: 'var(--color-dark)', fontSize: 'var(--text-sm)', lineHeight: 1.5, margin: 0 }}>
                      {m.bio}
                    </p>
                  )}
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>
      )}

      {/* Values */}
      <section className={`section ${styles.valuesSection}`}>
        <div className="container">
          <motion.div className="text-center" style={{ marginBottom:'3rem' }} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once:true }}>
            <span className={styles.eyebrow}>What Drives Us</span>
            <h2>Our Core Values</h2>
          </motion.div>
          <motion.div className={styles.valuesGrid} variants={stagger} initial="hidden" whileInView="visible" viewport={{ once:true }}>
            {VALUES.map(({ icon: Icon, title, desc }) => (
              <motion.div key={title} className={styles.valueCard} variants={fadeUp}>
                <div className={styles.valueIcon}><Icon size={26} /></div>
                <h3>{title}</h3>
                <p>{desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Legal & Registrations */}
      <section className="section">
        <div className="container">
          <motion.div className="text-center" style={{ marginBottom:'3rem' }} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once:true }}>
            <span className={styles.eyebrow}>Transparency</span>
            <h2>Legal Registrations</h2>
            <p>VSKS is a fully registered, compliant NGO. Donations are eligible for 80G tax deduction.</p>
          </motion.div>
          <motion.div className={styles.regGrid} variants={stagger} initial="hidden" whileInView="visible" viewport={{ once:true }}>
            {REGISTRATIONS.map(reg => (
              <motion.div key={reg.label} className={styles.regCard} variants={fadeUp}>
                <span className={styles.regLabel}>{reg.label}</span>
                <span className={styles.regValue}>{reg.value}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Address */}
      <section className={`${styles.addressSection} section--sm`}>
        <div className="container">
          <motion.div className={styles.addressCard} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once:true }}>
            <MapPin size={22} style={{ color:'var(--color-saffron)', flexShrink:0 }} />
            <div>
              <strong>Registered Office</strong>
              <p>{ORG.address}</p>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  )
}
