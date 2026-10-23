import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { ArrowLeft, Calendar, MapPin, Tag, Images, X } from 'lucide-react'
import { supabase } from '../lib/supabase'
import styles from './EventsPage.module.css'

export default function EventDetailPage() {
  const { slug } = useParams()
  const [event, setEvent] = useState(null)
  const [images, setImages] = useState([])
  const [loading, setLoading] = useState(true)
  const [activePhoto, setActivePhoto] = useState(null)

  useEffect(() => {
    async function loadEventData() {
      setLoading(true)
      try {
        const { data: eventData, error } = await supabase
          .from('events')
          .select('*')
          .eq('slug', slug)
          .single()

        if (!error && eventData) {
          setEvent(eventData)
          // Fetch event gallery images
          const { data: imgData } = await supabase
            .from('event_images')
            .select('*')
            .eq('event_id', eventData.id)
            .order('sort_order', { ascending: true })

          setImages(imgData || [])
        }
      } catch (err) {
        console.error('Error fetching event details:', err)
      } finally {
        setLoading(false)
      }
    }
    loadEventData()
  }, [slug])

  if (loading) {
    return (
      <div className="section container text-center" style={{ padding: '5rem 0', color: 'var(--color-mid-gray)' }}>
        Loading event details...
      </div>
    )
  }

  if (!event) {
    return (
      <div className="section container text-center" style={{ padding: '5rem 0' }}>
        <h2>Event Not Found</h2>
        <p style={{ color: 'var(--color-mid-gray)', marginBottom: '1.5rem' }}>
          This event may have been removed or is currently unpublished.
        </p>
        <Link to="/events" className={styles.backBtn}>
          <ArrowLeft size={16} /> Back to all events
        </Link>
      </div>
    )
  }

  return (
    <>
      <Helmet>
        <title>{event.title} – VSKS Event</title>
        <meta name="description" content={event.short_desc || event.title} />
      </Helmet>

      <section className="section" style={{ paddingTop: '2.5rem' }}>
        <div className="container">
          <Link to="/events" className={styles.backBtn}>
            <ArrowLeft size={16} /> Back to all events
          </Link>

          <div className={styles.detailHeader}>
            <h1 className={styles.detailTitle}>{event.title}</h1>
            <div className={styles.detailMeta}>
              <span className={styles.metaItem}>
                <Calendar size={16} style={{ color: 'var(--color-saffron)' }} />
                {new Date(event.event_date).toLocaleDateString('en-IN', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </span>
              {event.location && (
                <span className={styles.metaItem}>
                  <MapPin size={16} style={{ color: 'var(--color-teal)' }} />
                  {event.location}
                </span>
              )}
              {event.category && (
                <span className={styles.metaItem}>
                  <Tag size={16} style={{ color: 'var(--color-earth)' }} />
                  {event.category}
                </span>
              )}
            </div>
          </div>

          {event.cover_image && (
            <img
              src={event.cover_image}
              alt={event.title}
              className={styles.detailCover}
            />
          )}

          <div className={styles.detailBody}>
            {event.full_desc || event.short_desc || 'No detailed description provided for this event.'}
          </div>

          {/* Event Gallery */}
          {images.length > 0 && (
            <div className={styles.gallerySection}>
              <h2 className={styles.galleryTitle}>
                <Images size={24} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '8px', color: 'var(--color-saffron)' }} />
                Event Photo Gallery
              </h2>
              <div className={styles.eventGalleryGrid}>
                {images.map(img => (
                  <img
                    key={img.id}
                    src={img.image_url}
                    alt={img.caption || event.title}
                    className={styles.eventGalleryImg}
                    loading="lazy"
                    onClick={() => setActivePhoto(img.image_url)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Lightbox Modal */}
      {activePhoto && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.85)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem',
          }}
          onClick={() => setActivePhoto(null)}
        >
          <button
            type="button"
            onClick={() => setActivePhoto(null)}
            style={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              background: 'none',
              border: 'none',
              color: 'white',
              cursor: 'pointer',
            }}
          >
            <X size={32} />
          </button>
          <img
            src={activePhoto}
            alt="Event large preview"
            style={{ maxWidth: '90vw', maxHeight: '85vh', objectFit: 'contain', borderRadius: 'var(--radius-md)' }}
          />
        </div>
      )}
    </>
  )
}
