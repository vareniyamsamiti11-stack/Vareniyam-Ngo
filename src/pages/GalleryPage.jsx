import { useState, useCallback } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, X, ChevronLeft, ChevronRight, ZoomIn, Images } from 'lucide-react'
import { GALLERY_CATEGORIES } from '../lib/constants'
import styles from './GalleryPage.module.css'

// Build a safe URL for photos with spaces/special chars
function photoUrl(folder, filename) {
  return `/Assets/${encodeURIComponent(folder)}/${encodeURIComponent(filename)}`
}

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
}
const stagger = { visible: { transition: { staggerChildren: 0.05 } } }

export default function GalleryPage() {
  const { category } = useParams()
  const navigate = useNavigate()
  const [lightboxIndex, setLightboxIndex] = useState(null)

  const cat = GALLERY_CATEGORIES.find(c => c.id === category)

  // Lightbox navigation
  const openLightbox = useCallback((idx) => setLightboxIndex(idx), [])
  const closeLightbox = useCallback(() => setLightboxIndex(null), [])
  const prevPhoto = useCallback(() => {
    if (!cat) return
    setLightboxIndex(i => (i - 1 + cat.photos.length) % cat.photos.length)
  }, [cat])
  const nextPhoto = useCallback(() => {
    if (!cat) return
    setLightboxIndex(i => (i + 1) % cat.photos.length)
  }, [cat])

  // Keyboard navigation for lightbox
  const handleKeyDown = useCallback((e) => {
    if (lightboxIndex === null) return
    if (e.key === 'Escape') closeLightbox()
    if (e.key === 'ArrowLeft') prevPhoto()
    if (e.key === 'ArrowRight') nextPhoto()
  }, [lightboxIndex, closeLightbox, prevPhoto, nextPhoto])

  if (!cat) {
    return (
      <div className={styles.notFound}>
        <Images size={48} style={{ color: 'var(--color-mid-gray)' }} />
        <h2>Gallery category not found</h2>
        <Link to="/gallery/navankar-project" className={styles.backLink}>← Back to Gallery</Link>
      </div>
    )
  }

  const hasPhotos = cat.photos.length > 0

  return (
    <>
      <Helmet>
        <title>{cat.fullLabel} – Gallery | VSKS</title>
        <meta name="description" content={`Browse ${cat.photos.length} photos from ${cat.fullLabel} — Vareniyam Samaj Kalyan Samiti.`} />
      </Helmet>

      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.heroBg} />
        <div className={`container ${styles.heroInner}`}>
          <motion.button
            className={styles.backBtn}
            onClick={() => navigate(-1)}
            initial={{ opacity: 0, x: -14 }}
            animate={{ opacity: 1, x: 0 }}
            id="gallery-back-btn"
          >
            <ArrowLeft size={15} /> Back
          </motion.button>

          <motion.div
            className={styles.heroContent}
            initial="hidden"
            animate="visible"
            variants={stagger}
          >
            <motion.span className={styles.eyebrow} variants={fadeUp}>
              <Images size={13} /> Photo Gallery
            </motion.span>
            <motion.div className={styles.heroEmoji} variants={fadeUp}>{cat.emoji}</motion.div>
            <motion.h1 variants={fadeUp}>{cat.fullLabel}</motion.h1>
            {hasPhotos && (
              <motion.p className={styles.photoCount} variants={fadeUp}>
                {cat.photos.length} photos
              </motion.p>
            )}
          </motion.div>

          {/* Category switcher tabs */}
          <motion.div
            className={styles.catTabs}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            {GALLERY_CATEGORIES.map(c => (
              <Link
                key={c.id}
                to={`/gallery/${c.id}`}
                className={`${styles.catTab} ${c.id === category ? styles.catTabActive : ''}`}
                id={`gallery-tab-${c.id}`}
              >
                <span>{c.emoji}</span>
                <span>{c.label}</span>
                {c.photos.length > 0 && (
                  <span className={styles.tabCount}>{c.photos.length}</span>
                )}
              </Link>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Photo Grid */}
      <section className="section">
        <div className="container">
          {hasPhotos ? (
            <motion.div
              className={styles.photoGrid}
              variants={stagger}
              initial="hidden"
              animate="visible"
            >
              {cat.photos.map((photo, idx) => (
                <motion.div
                  key={photo}
                  className={styles.photoCard}
                  variants={fadeUp}
                  onClick={() => openLightbox(idx)}
                  id={`photo-${idx}`}
                >
                  <img
                    src={photoUrl(cat.folder, photo)}
                    alt={`${cat.label} photo ${idx + 1}`}
                    className={styles.photo}
                    loading="lazy"
                  />
                  <div className={styles.photoOverlay}>
                    <ZoomIn size={22} />
                  </div>
                  <span className={styles.photoNum}>{idx + 1}</span>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              className={styles.emptyState}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <span className={styles.emptyEmoji}>{cat.emoji}</span>
              <h2>Photos Coming Soon</h2>
              <p>We're preparing the photos for <strong>{cat.fullLabel}</strong>. Check back soon!</p>
              <div className={styles.emptyLinks}>
                {GALLERY_CATEGORIES.filter(c => c.photos.length > 0).map(c => (
                  <Link key={c.id} to={`/gallery/${c.id}`} className={styles.emptyLink}>
                    {c.emoji} {c.label}
                  </Link>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </section>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxIndex !== null && hasPhotos && (
          <motion.div
            className={styles.lightbox}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={closeLightbox}
            onKeyDown={handleKeyDown}
            tabIndex={0}
            role="dialog"
            aria-label="Photo lightbox"
            id="gallery-lightbox"
          >
            {/* Close */}
            <button className={styles.lightboxClose} onClick={closeLightbox} aria-label="Close lightbox">
              <X size={22} />
            </button>

            {/* Counter */}
            <div className={styles.lightboxCounter}>
              {lightboxIndex + 1} / {cat.photos.length}
            </div>

            {/* Prev */}
            <button
              className={`${styles.lightboxNav} ${styles.lightboxPrev}`}
              onClick={(e) => { e.stopPropagation(); prevPhoto() }}
              aria-label="Previous photo"
            >
              <ChevronLeft size={28} />
            </button>

            {/* Image */}
            <motion.div
              className={styles.lightboxImageWrap}
              onClick={e => e.stopPropagation()}
              key={lightboxIndex}
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.94 }}
              transition={{ duration: 0.22 }}
            >
              <img
                src={photoUrl(cat.folder, cat.photos[lightboxIndex])}
                alt={`${cat.label} photo ${lightboxIndex + 1}`}
                className={styles.lightboxImage}
              />
            </motion.div>

            {/* Next */}
            <button
              className={`${styles.lightboxNav} ${styles.lightboxNext}`}
              onClick={(e) => { e.stopPropagation(); nextPhoto() }}
              aria-label="Next photo"
            >
              <ChevronRight size={28} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
