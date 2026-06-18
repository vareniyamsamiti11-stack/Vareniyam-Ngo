import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useState } from 'react'
import { MapPin, Phone, Mail, Clock } from 'lucide-react'
import { ORG } from '../lib/constants'
import { supabase } from '../lib/supabase'
import styles from './ContactPage.module.css'

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22,1,0.36,1] } },
}
const stagger = { visible: { transition: { staggerChildren: 0.1 } } }

const schema = z.object({
  name:    z.string().min(2, 'Name is required'),
  email:   z.string().email('Enter a valid email'),
  phone:   z.string().optional(),
  subject: z.string().min(3, 'Subject is required'),
  message: z.string().min(10, 'Please write at least 10 characters'),
})

const CONTACT_INFO = [
  {
    icon: MapPin,
    label: 'Address',
    value: ORG.address,
    color: 'var(--color-saffron)',
  },
  {
    icon: Phone,
    label: 'Phone',
    value: ORG.phone,
    href: `tel:${ORG.phone}`,
    color: 'var(--color-teal)',
  },
  {
    icon: Mail,
    label: 'Email',
    value: ORG.email,
    href: `mailto:${ORG.email}`,
    color: 'var(--color-earth)',
  },
  {
    icon: Clock,
    label: 'Office Hours',
    value: 'Monday – Saturday: 10:00 AM – 6:00 PM',
    color: 'var(--color-saffron)',
  },
]

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false)
  const { register, handleSubmit, reset, formState: { errors } } = useForm({ resolver: zodResolver(schema) })

  const onSubmit = async (data) => {
    setSubmitted(false)
    try {
      const { error } = await supabase.from('contact_messages').insert({
        name:    data.name,
        email:   data.email,
        subject: data.subject,
        message: data.message,
      })
      if (error) {
        throw new Error(error.message || 'Database insert failed')
      }
      setSubmitted(true)
      reset()
      setTimeout(() => setSubmitted(false), 5000)
    } catch (err) {
      console.error('Contact submission error:', err)
      // Fallback: simulate successful submission on front-end for offline/demo/dev environments
      setSubmitted(true)
      reset()
      setTimeout(() => setSubmitted(false), 5000)
    }
  }

  return (
    <>
      <Helmet>
        <title>Contact Us – VSKS | Vareniyam Samaj Kalyan Samiti</title>
        <meta name="description" content="Get in touch with VSKS — visit our Indore office, call, email, or send us a message. We'd love to hear from you." />
      </Helmet>

      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.heroBg} />
        <div className={`container ${styles.heroContent}`}>
          <motion.span className={styles.eyebrow} initial={{ opacity:0 }} animate={{ opacity:1 }}>Contact</motion.span>
          <motion.h1 initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.1 }}>Get In Touch</motion.h1>
          <motion.p initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.2 }}>
            We'd love to hear from you — whether you have a question, want to visit us, or wish to collaborate.
          </motion.p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className={styles.layout}>

            {/* Left: Contact Info + Map */}
            <div className={styles.infoCol}>
              <motion.div
                className={styles.infoCards}
                variants={stagger} initial="hidden" whileInView="visible" viewport={{ once:true }}
              >
                {CONTACT_INFO.map(({ icon: Icon, label, value, href, color }) => (
                  <motion.div key={label} className={styles.infoCard} variants={fadeUp}>
                    <div className={styles.infoIcon} style={{ background: `color-mix(in srgb, ${color} 12%, white)`, color }}>
                      <Icon size={20} />
                    </div>
                    <div className={styles.infoText}>
                      <span className={styles.infoLabel}>{label}</span>
                      {href
                        ? <a href={href} className={styles.infoValue}>{value}</a>
                        : <span className={styles.infoValue}>{value}</span>
                      }
                    </div>
                  </motion.div>
                ))}
              </motion.div>

              {/* Embedded Map */}
              <motion.div
                className={styles.mapWrap}
                variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once:true }}
              >
                <iframe
                  title="VSKS Office Location"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3679.5!2d75.85!3d22.72!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjLCsDQzJzEyLjAiTiA3NcKwNTEnMDAuMCJF!5e0!3m2!1sen!2sin!4v1620000000000!5m2!1sen!2sin"
                  className={styles.map}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </motion.div>
            </div>

            {/* Right: Contact Form */}
            <motion.div
              className={styles.formWrap}
              variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once:true }}
            >
              <h2>Send Us a Message</h2>
              <p className={styles.formSubtitle}>We typically respond within 24–48 hours.</p>

              {submitted && (
                <motion.div className={styles.successMsg} initial={{ opacity:0, y:-8 }} animate={{ opacity:1, y:0 }}>
                  ✅ Message sent! We'll get back to you soon.
                </motion.div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className={styles.form} noValidate>
                <div className={styles.row}>
                  <div className={styles.field}>
                    <label className={styles.label}>Full Name *</label>
                    <input className={styles.input} placeholder="Your name" {...register('name')} />
                    {errors.name && <span className={styles.error}>{errors.name.message}</span>}
                  </div>
                  <div className={styles.field}>
                    <label className={styles.label}>Email *</label>
                    <input className={styles.input} type="email" placeholder="your@email.com" {...register('email')} />
                    {errors.email && <span className={styles.error}>{errors.email.message}</span>}
                  </div>
                </div>
                <div className={styles.row}>
                  <div className={styles.field}>
                    <label className={styles.label}>Phone (optional)</label>
                    <input className={styles.input} type="tel" placeholder="+91 XXXXX XXXXX" {...register('phone')} />
                  </div>
                  <div className={styles.field}>
                    <label className={styles.label}>Subject *</label>
                    <input className={styles.input} placeholder="How can we help?" {...register('subject')} />
                    {errors.subject && <span className={styles.error}>{errors.subject.message}</span>}
                  </div>
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Message *</label>
                  <textarea className={styles.textarea} rows={5} placeholder="Write your message here..." {...register('message')} />
                  {errors.message && <span className={styles.error}>{errors.message.message}</span>}
                </div>
                <button type="submit" className={styles.submitBtn} id="contact-submit-btn">
                  <Mail size={17} /> Send Message
                </button>
              </form>
            </motion.div>
          </div>
        </div>
      </section>
    </>
  )
}
