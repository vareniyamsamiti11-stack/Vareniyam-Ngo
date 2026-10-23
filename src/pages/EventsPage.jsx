import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Calendar, MapPin, ArrowRight, Sparkles } from 'lucide-react'
import { useEvents } from '../hooks/useSiteContent'
import styles from './EventsPage.module.css'

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
}
const stagger = { visible: { transition: { staggerChildren: 0.08 } } }

export default function EventsPage() {
  const { events, loading } = useEvents()

  return (
    <>
      <Helmet>
        <title>Events &amp; Campaigns – VSKS | Vareniyam Samaj Kalyan Samiti</title>
        <meta name="description" content="Discover community drives, awareness workshops, sports events, and plantation campaigns organized by VSKS in Indore and Dewas." />
      </Helmet>

      {/* Hero */}
      <section className={styles.hero}>
        <div className={`container ${styles.heroContent}`}>
          <span className={styles.eyebrow}>Community in Action</span>
          <h1>Events &amp; Campaigns</h1>
          <p>
            Explore our community drives, awareness sessions, school workshops, and plantation campaigns across Indore and Dewas.
          </p>
        </div>
      </section>

      {/* Events List */}
      <section className="section">
        <div className="container">
          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--color-mid-gray)' }}>
              Loading upcoming and past events...
            </div>
          ) : events.length === 0 ? (
            <div className={styles.emptyState}>
              <Sparkles size={48} style={{ color: 'var(--color-saffron)', marginBottom: '1rem' }} />
              <h3>No public events scheduled right now.</h3>
              <p>Check back soon or follow our social channels for announcements on upcoming drives!</p>
            </div>
          ) : (
            <motion.div
              className={styles.grid}
              variants={stagger}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              {events.map(event => (
                <motion.div key={event.id} variants={fadeUp}>
                  <Link to={`/events/${event.slug}`} className={styles.card}>
                    <div className={styles.coverWrap}>
                      <img
                        src={event.cover_image || '/Assets/heropage.jpeg'}
                        alt={event.title}
                        className={styles.coverImg}
                        loading="lazy"
                      />
                      {event.category && (
                        <span className={styles.categoryTag}>{event.category}</span>
                      )}
                    </div>
                    <div className={styles.cardBody}>
                      <div className={styles.metaRow}>
                        <div className={styles.metaItem}>
                          <Calendar size={14} style={{ color: 'var(--color-saffron)' }} />
                          <span>{new Date(event.event_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                        </div>
                        {event.location && (
                          <div className={styles.metaItem}>
                            <MapPin size={14} style={{ color: 'var(--color-teal)' }} />
                            <span>{event.location}</span>
                          </div>
                        )}
                      </div>
                      <h3 className={styles.cardTitle}>{event.title}</h3>
                      <p className={styles.cardDesc}>
                        {event.short_desc || (event.full_desc || '').slice(0, 110) + '...'}
                      </p>
                      <span className={styles.learnMore}>
                        Event Details &amp; Photos <ArrowRight size={15} />
                      </span>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </section>
    </>
  )
}
