import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import { Heart, Award, Users, MapPin } from 'lucide-react'
import { ORG, REGISTRATIONS } from '../lib/constants'
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
  return (
    <>
      <Helmet>
        <title>About Us – VSKS | Vareniyam Samaj Kalyan Samiti</title>
        <meta name="description" content="Learn about VSKS — our story, mission, founder, and values. A registered NGO in Indore working since 2019." />
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
            Founded in {ORG.founded} by {ORG.founder}, we work at the intersection of education, mental health, environment, and community empowerment.
          Vareniyam Samaj Kalyan Samiti (VSKS), based in Indore, Madhya Pradesh, is a com- 
munity-based non-profit organization working to promote inclusion, dignity and well- 
being among vulnerable populations. Established in 2018, the organization works 
with individuals and communities facing social, economic and psychosocial chal- 
lenges. 
VSKS believes that meaningful change begins within communities. Through awareness, 
collaboration and grassroots engagement, the organization works to build supportive 
environments where individuals can access information, opportunities and social sup- 
port. 
The organization currently works in Indore and Dewas districts, focusing on mental 
health awareness, social inclusion, sanitation initiatives, environmental action and 
community empowerment.</motion.p>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="section">
        <div className="container">
          <div className={styles.missionGrid}>
            <motion.div className={styles.missionCard} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once:true }}>
              <span className={styles.cardEyebrow}>Our Mission</span>
              <h2>Why We Exist</h2>
              <p>{ORG.mission}</p>
            </motion.div>
            <motion.div className={`${styles.missionCard} ${styles.visionCard}`} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once:true }}>
              <span className={styles.cardEyebrow} style={{ color:'var(--color-teal)' }}>Our Vision</span>
              <h2>Where We're Going</h2>
              <p>A society where every individual — regardless of disability, socio-economic background, or geography — can participate fully and live with dignity, independence, and purpose.</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Founder */}
      <section className={`${styles.founderSection} section`}>
        <div className="container">
          <motion.div className={styles.founderCard} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once:true }}>
            <div className={styles.founderAvatar}>
              <img src="/Assets/Founder.jpeg" alt={ORG.founder} className={styles.founderImg} />
            </div>
            <div className={styles.founderInfo}>
              <span className={styles.cardEyebrow}>Leadership</span>
              <h2>{ORG.founder}</h2>
              <p className={styles.founderTitle}>{ORG.founderTitle}</p>
              <p>
                Soni Dharva established Vareniyam Samaj Kalyan Samiti in 2019 with a deep conviction that every individual deserves access to education, mental health support, and livelihood opportunities. With a background in social work and community development, she has led the organisation from a small community initiative to a multi-program NGO touching over 10,000 lives.
              </p>
              <p>
                Under her leadership, VSKS has earned registrations under 12A, 80G, CSR-1, and is listed on NGODARPAN — reflecting her commitment to transparency and accountable governance.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

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
