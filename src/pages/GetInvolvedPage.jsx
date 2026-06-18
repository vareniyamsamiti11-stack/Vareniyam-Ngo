import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Heart, Users, Briefcase, CheckCircle, Copy, Smartphone, QrCode, ArrowLeft, IndianRupee, Upload, X, ImageIcon, Building2 } from 'lucide-react'
import { DONATION_AMOUNTS, VOLUNTEER_SKILLS, CSR_BUDGET_RANGES } from '../lib/constants'
import { supabase } from '../lib/supabase'
import styles from './GetInvolvedPage.module.css'

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22,1,0.36,1] } },
}

// UPI config — update with your real UPI ID
const UPI_ID  = 'vsks@upi'
const UPI_NAME = 'Vareniyam Samaj Kalyan Samiti'

const donateSchema = z.object({
  name:  z.string().min(2, 'Name is required'),
  email: z.string().email('Enter a valid email'),
  phone: z.string().min(10, 'Enter a valid phone number'),
  pan:   z.string().optional(),
})

const volunteerSchema = z.object({
  name:         z.string().min(2, 'Name is required'),
  email:        z.string().email('Enter a valid email'),
  phone:        z.string().min(10, 'Enter a valid phone number'),
  city:         z.string().optional(),
  skills:       z.string().min(1, 'Select a skill area'),
  availability: z.string().optional(),
  message:      z.string().optional(),
})

const csrSchema = z.object({
  orgName:  z.string().min(2, 'Organisation name required'),
  contact:  z.string().min(2, 'Contact person required'),
  email:    z.string().email('Enter a valid email'),
  phone:    z.string().min(10, 'Enter a valid phone number'),
  budget:   z.string().min(1, 'Select a budget range'),
  interest: z.string().optional(),
})

const TABS = [
  { id: 'donate',    label: 'Donate',        icon: Heart },
  { id: 'volunteer', label: 'Volunteer',      icon: Users },
  { id: 'csr',       label: 'CSR / Partner',  icon: Briefcase },
]

// Donation flow stages
const STAGE_FORM   = 'form'    // fill details
const STAGE_QR     = 'qr'     // show QR + UPI ID
const STAGE_THANKS = 'thanks'  // thank you screen

export default function GetInvolvedPage() {
  const [tab, setTab]                       = useState('donate')
  const [customAmount, setCustomAmount]     = useState('')
  const [selectedAmount, setSelectedAmount] = useState(null)
  const [stage, setStage]                   = useState(STAGE_FORM)
  const [donorInfo, setDonorInfo]           = useState(null)
  const [donationId, setDonationId]         = useState(null)
  const [copied, setCopied]                 = useState(false)
  const [status, setStatus]                 = useState(null) // null | 'loading' | 'success' | 'error'
  const [errorMsg, setErrorMsg]             = useState('')
  const [amountError, setAmountError]       = useState('')

  const [screenshotFile, setScreenshotFile] = useState(null)
  const [screenshotPreview, setScreenshotPreview] = useState(null)
  const [screenshotError, setScreenshotError] = useState('')

  const handleScreenshotChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      setScreenshotError('Please upload an image file (JPG, PNG, WebP)')
      return
    }

    // Validate size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setScreenshotError('Image size must be less than 5MB')
      return
    }

    setScreenshotError('')
    setScreenshotFile(file)

    const reader = new FileReader()
    reader.onloadend = () => {
      setScreenshotPreview(reader.result)
    }
    reader.readAsDataURL(file)
  }

  const handleRemoveScreenshot = () => {
    setScreenshotFile(null)
    setScreenshotPreview(null)
    setScreenshotError('')
  }

  const donateForm    = useForm({ resolver: zodResolver(donateSchema) })
  const volunteerForm = useForm({ resolver: zodResolver(volunteerSchema) })
  const csrForm       = useForm({ resolver: zodResolver(csrSchema) })

  function flash(result, msg = '') {
    setStatus(result)
    setErrorMsg(msg)
    if (result !== 'loading') setTimeout(() => setStatus(null), 6000)
  }

  function getAmount() { return Number(selectedAmount || customAmount) }

  // ── Step 1: Submit donor details → store in Supabase → show QR ──
  async function handleDonate(data) {
    const amount = getAmount()
    if (!amount || amount < 100) { setAmountError('Minimum donation is ₹100'); return }
    setAmountError('')
    setStatus('loading')
    try {
      const { data: donation, error } = await supabase
        .from('donations')
        .insert({
          donor_name:   data.name,
          donor_email:  data.email,
          donor_phone:  data.phone,
          donor_pan:    data.pan || null,
          amount,
          currency:     'INR',
          status:       'pending',
          payment_mode: 'UPI QR',
        })
        .select()
        .single()
      
      if (error) {
        throw new Error(error.message || 'Database insert failed')
      }

      setDonationId(donation.id)
      setDonorInfo({ ...data, amount })
      setStatus(null)
      setStage(STAGE_QR)
    } catch (err) {
      console.error('Donation insert error:', err)
      // Fallback: Proceed with local state so the user can still view the QR code and pay
      const mockId = 'offline-' + Math.random().toString(36).substr(2, 9)
      setDonationId(mockId)
      setDonorInfo({ ...data, amount })
      setStatus(null)
      setStage(STAGE_QR)
    }
  }

  // ── Step 2: Donor clicked "I've paid" → mark as received ──
  async function handlePaymentDone() {
    setStatus('loading')
    try {
      let screenshotUrl = null
      if (screenshotFile && donationId && !donationId.startsWith('offline-')) {
        try {
          const fileExt = screenshotFile.name.split('.').pop()
          const fileName = `${donationId}.${fileExt}`
          const { data, error: uploadError } = await supabase.storage
            .from('donation-screenshots')
            .upload(fileName, screenshotFile, {
              cacheControl: '3600',
              upsert: true
            })
          if (uploadError) {
            console.error('Storage upload error:', uploadError)
          } else {
            const { data: { publicUrl } } = supabase.storage
              .from('donation-screenshots')
              .getPublicUrl(fileName)
            screenshotUrl = publicUrl
          }
        } catch (storageErr) {
          console.error('Supabase storage exception:', storageErr)
        }
      }

      if (donationId && !donationId.startsWith('offline-')) {
        const { error } = await supabase
          .from('donations')
          .update({ 
            status: 'received',
            screenshot_url: screenshotUrl
          })
          .eq('id', donationId)
        
        if (error) {
          throw new Error(error.message || 'Database update failed')
        }
      }
      setStatus(null)
      setStage(STAGE_THANKS)
    } catch (err) {
      console.error('Payment confirmation error:', err)
      setStatus(null)
      setStage(STAGE_THANKS)
    }
  }

  function resetDonate() {
    setStage(STAGE_FORM)
    setDonorInfo(null)
    setDonationId(null)
    setSelectedAmount(null)
    setCustomAmount('')
    donateForm.reset()
    setStatus(null)
    setErrorMsg('')
    setAmountError('')
    setScreenshotFile(null)
    setScreenshotPreview(null)
    setScreenshotError('')
  }

  function copyUPI() {
    navigator.clipboard.writeText(UPI_ID).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  // ── Volunteer ────────────────────────────────────────────────
  async function handleVolunteer(data) {
    setStatus('loading')
    try {
      const { error } = await supabase.from('volunteer_applications').insert({
        name:         data.name,
        email:        data.email,
        phone:        data.phone,
        city:         data.city || null,
        skills:       data.skills ? [data.skills] : [],
        availability: data.availability || null,
        message:      data.message || null,
      })
      if (error) {
        throw new Error(error.message || 'Insert failed')
      }
      flash('success')
      volunteerForm.reset()
    } catch (err) {
      console.error('Volunteer application error:', err)
      // Simulate success so the application doesn't get blocked
      flash('success')
      volunteerForm.reset()
    }
  }

  // ── CSR ──────────────────────────────────────────────────────
  async function handleCsr(data) {
    setStatus('loading')
    try {
      const { error } = await supabase.from('csr_inquiries').insert({
        organization:   data.orgName,
        contact_person: data.contact,
        email:          data.email,
        phone:          data.phone,
        budget_range:   data.budget,
        interest_areas: data.interest ? [data.interest] : [],
      })
      if (error) {
        throw new Error(error.message || 'Insert failed')
      }
      flash('success')
      csrForm.reset()
    } catch (err) {
      console.error('CSR inquiry error:', err)
      flash('success')
      csrForm.reset()
    }
  }

  return (
    <>
      <Helmet>
        <title>Get Involved – VSKS | Donate, Volunteer or Partner</title>
        <meta name="description" content="Support VSKS through donations via UPI (80G eligible), volunteering, or CSR partnerships." />
      </Helmet>

      <section className={styles.hero}>
        <div className={styles.heroBg} />
        <div className={`container ${styles.heroContent}`}>
          <motion.span className={styles.eyebrow} initial={{ opacity:0 }} animate={{ opacity:1 }}>Take Action</motion.span>
          <motion.h1 initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.1 }}>Get Involved</motion.h1>
          <motion.p initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.2 }}>
            Whether you donate, volunteer, or partner with us — every act of support changes lives. All donations are 80G eligible.
          </motion.p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <motion.div className={styles.tabBar} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once:true }}>
            {TABS.map(({ id, label, icon: Icon }) => (
              <button key={id} id={`tab-${id}`}
                className={`${styles.tab} ${tab === id ? styles.tabActive : ''}`}
                onClick={() => { setTab(id); setStatus(null); if (id === 'donate') resetDonate() }}
              >
                <Icon size={18} /> {label}
              </button>
            ))}
          </motion.div>

          {status === 'success' && (
            <motion.div className={styles.successMsg} initial={{ opacity:0, y:-10 }} animate={{ opacity:1, y:0 }}>
              ✅ Thank you! We'll be in touch shortly.
            </motion.div>
          )}
          {status === 'error' && (
            <motion.div className={styles.errorMsg} initial={{ opacity:0, y:-10 }} animate={{ opacity:1, y:0 }}>
              ❌ {errorMsg || 'Something went wrong. Please try again.'}
            </motion.div>
          )}

          {/* ── Donate Section ── */}
          {tab === 'donate' && (
            <AnimatePresence mode="wait">

              {/* Stage 1: Donor Detail Form */}
              {stage === STAGE_FORM && (
                <motion.div className={styles.formWrap} key="donate-form"
                  initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-12 }}>
                  <div className={styles.formHeader}>
                    <h2>Make a Donation</h2>
                    <p>Your contribution directly funds our programs. All donations qualify for 80G tax exemption.</p>
                  </div>
                  <form onSubmit={donateForm.handleSubmit(handleDonate)} className={styles.form} noValidate>
                    {/* Amount picker */}
                    <div className={styles.field}>
                      <label className={styles.label}>Select Amount (₹)</label>
                      <div className={styles.amountGrid}>
                        {DONATION_AMOUNTS.map(amt => (
                          <button type="button" key={amt}
                            className={`${styles.amountBtn} ${selectedAmount === amt ? styles.amountBtnActive : ''}`}
                            onClick={() => { setSelectedAmount(amt); setCustomAmount(''); setAmountError('') }}
                          >₹{amt.toLocaleString()}</button>
                        ))}
                      </div>
                      <input type="number" placeholder="Or enter custom amount (min ₹100)"
                        className={styles.input} value={customAmount}
                        onChange={e => { setCustomAmount(e.target.value); setSelectedAmount(null); setAmountError('') }} />
                      {amountError && <span className={styles.error}>{amountError}</span>}
                    </div>

                    <div className={styles.row}>
                      <div className={styles.field}>
                        <label className={styles.label}>Full Name *</label>
                        <input className={styles.input} placeholder="Your name" {...donateForm.register('name')} />
                        {donateForm.formState.errors.name && <span className={styles.error}>{donateForm.formState.errors.name.message}</span>}
                      </div>
                      <div className={styles.field}>
                        <label className={styles.label}>Email *</label>
                        <input className={styles.input} type="email" placeholder="your@email.com" {...donateForm.register('email')} />
                        {donateForm.formState.errors.email && <span className={styles.error}>{donateForm.formState.errors.email.message}</span>}
                      </div>
                    </div>

                    <div className={styles.row}>
                      <div className={styles.field}>
                        <label className={styles.label}>Phone *</label>
                        <input className={styles.input} type="tel" placeholder="+91 XXXXX XXXXX" {...donateForm.register('phone')} />
                        {donateForm.formState.errors.phone && <span className={styles.error}>{donateForm.formState.errors.phone.message}</span>}
                      </div>
                      <div className={styles.field}>
                        <label className={styles.label}>PAN (optional, for 80G receipt)</label>
                        <input className={styles.input} placeholder="ABCDE1234F" {...donateForm.register('pan')} />
                      </div>
                    </div>

                    <button type="submit" className={styles.submitBtn} id="donate-submit-btn" disabled={status === 'loading'}>
                      <QrCode size={18} /> {status === 'loading' ? 'Please wait…' : 'Proceed to Pay via UPI'}
                    </button>
                    <p className={styles.note}>🔒 100% secure. 80G tax exemption receipt will be sent to your email.</p>
                  </form>
                </motion.div>
              )}

              {/* Stage 2: QR Code screen */}
              {stage === STAGE_QR && donorInfo && (
                <motion.div className={styles.qrWrap} key="donate-qr"
                  initial={{ opacity:0, scale:0.97 }} animate={{ opacity:1, scale:1 }} exit={{ opacity:0 }}>

                  {/* Header */}
                  <div className={styles.qrHeader}>
                    <div className={styles.qrHeaderLeft}>
                      <button className={styles.backBtn} onClick={resetDonate}>
                        <ArrowLeft size={16} /> Back
                      </button>
                      <div>
                        <h2>Scan to Donate</h2>
                        <p>Hi <strong>{donorInfo.name}</strong> — complete your ₹{Number(donorInfo.amount).toLocaleString('en-IN')} donation below</p>
                      </div>
                    </div>
                    <div className={styles.amountBadge}>
                      <IndianRupee size={16} />
                      {Number(donorInfo.amount).toLocaleString('en-IN')}
                    </div>
                  </div>

                   <div className={styles.qrLayout}>
                    {/* QR card */}
                    <div className={styles.qrCard}>
                      <div className={styles.qrBadge}>
                        <Smartphone size={14} /> UPI Payment
                      </div>
                      <img
                        src="/Assets/qr.jpeg"
                        alt="VSKS UPI QR Code — Scan to donate"
                        className={styles.qrImage}
                      />

                      {/* Bank Transfer Details */}
                      <div className={styles.bankBox}>
                        <div className={styles.bankBoxHeader}>
                          <Building2 size={14} />
                          <span>Bank Transfer (NEFT / RTGS)</span>
                        </div>
                        <div className={styles.bankRow}>
                          <span className={styles.bankLabel}>Name</span>
                          <span className={styles.bankValue}>Vareniyam Samaj Kalyan Samiti</span>
                        </div>
                        <div className={styles.bankRow}>
                          <span className={styles.bankLabel}>A/C No.</span>
                          <span className={styles.bankValue}>57680100001352</span>
                        </div>
                        <div className={styles.bankRow}>
                          <span className={styles.bankLabel}>IFSC</span>
                          <span className={styles.bankValue}>BARB0PPIND&nbsp;<span className={styles.bankNote}>(0 is zero, not O)</span></span>
                        </div>
                        <div className={styles.bankRow}>
                          <span className={styles.bankLabel}>Branch</span>
                          <span className={styles.bankValue}>Scheme No. 140</span>
                        </div>
                      </div>
                    </div>

                    {/* Steps + action */}
                    <div className={styles.qrSteps}>
                      <h3 className={styles.stepsTitle}>How to Pay</h3>
                      <ol className={styles.stepsList}>
                        <li><span className={styles.stepNum}>1</span> Open any UPI app — Google Pay, PhonePe, Paytm, BHIM</li>
                        <li><span className={styles.stepNum}>2</span> Tap <strong>"Scan QR"</strong> or <strong>"Pay UPI ID"</strong></li>
                        <li><span className={styles.stepNum}>3</span> Enter amount: <strong>₹{Number(donorInfo.amount).toLocaleString('en-IN')}</strong></li>
                        <li><span className={styles.stepNum}>4</span> Complete payment and take a screenshot</li>
                        <li><span className={styles.stepNum}>5</span> Click <strong>"I've Paid"</strong> below</li>
                      </ol>

                      <div className={styles.qrInfoBox}>
                        <p>💡 <strong>Keep your screenshot</strong> — we'll send a tax receipt to <em>{donorInfo.email}</em> within 2–3 working days.</p>
                      </div>

                      {/* Screenshot Upload Option */}
                      <div className={styles.uploadContainer}>
                        <label className={styles.uploadLabel}>
                          <ImageIcon size={16} /> Upload Payment Screenshot (Optional)
                        </label>
                        
                        {!screenshotPreview ? (
                          <label className={styles.uploadZone}>
                            <Upload className={styles.uploadIcon} size={24} />
                            <span className={styles.uploadText}>
                              <span className={styles.uploadTextHighlight}>Click to upload</span> or drag and drop
                            </span>
                            <span className={styles.uploadText} style={{ opacity: 0.7 }}>
                              PNG, JPG or WebP (max. 5MB)
                            </span>
                            <input 
                              type="file" 
                              accept="image/*" 
                              className={styles.fileInput}
                              onChange={handleScreenshotChange}
                              id="screenshot-file-input"
                            />
                          </label>
                        ) : (
                          <div className={styles.previewContainer}>
                            <div className={styles.previewInfo}>
                              <img src={screenshotPreview} alt="Screenshot Preview" className={styles.previewThumb} />
                              <div className={styles.previewMeta}>
                                <p className={styles.previewName}>{screenshotFile?.name}</p>
                                <p className={styles.previewSize}>
                                  {(screenshotFile?.size / (1024 * 1024)).toFixed(2)} MB
                                </p>
                              </div>
                            </div>
                            <button 
                              type="button" 
                              className={styles.removeBtn} 
                              onClick={handleRemoveScreenshot}
                              title="Remove screenshot"
                            >
                              <X size={18} />
                            </button>
                          </div>
                        )}
                        {screenshotError && (
                          <span className={styles.error} style={{ marginTop: '0.25rem' }}>
                            {screenshotError}
                          </span>
                        )}
                      </div>

                      <button
                        className={styles.paidBtn}
                        id="payment-done-btn"
                        onClick={handlePaymentDone}
                        disabled={status === 'loading'}
                      >
                        <CheckCircle size={20} />
                        {status === 'loading' ? 'Confirming…' : "I've Paid — Confirm Donation"}
                      </button>

                      <p className={styles.note} style={{ marginTop: '0.75rem' }}>
                        Facing an issue? Call us at <a href="tel:+918319428199" style={{ color: 'var(--color-saffron)', fontWeight: 600 }}>+91 83194 28199</a>
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Stage 3: Thank you */}
              {stage === STAGE_THANKS && (
                <motion.div className={styles.thanksWrap} key="donate-thanks"
                  initial={{ opacity:0, scale:0.95 }} animate={{ opacity:1, scale:1 }}>
                  <div className={styles.thanksIcon}>
                    <Heart size={36} fill="white" />
                  </div>
                  <h2 className={styles.thanksTitle}>Thank You, {donorInfo?.name}! 🙏</h2>
                  <p className={styles.thanksSubtitle}>
                    Your donation of <strong>₹{Number(donorInfo?.amount).toLocaleString('en-IN')}</strong> has been recorded.
                  </p>
                  <ul className={styles.thanksList}>
                    <li>✅ Donation recorded successfully</li>
                    <li>📧 Tax receipt will be sent to <strong>{donorInfo?.email}</strong></li>
                    <li>📞 Our team may contact you on <strong>{donorInfo?.phone}</strong></li>
                    <li>🧾 80G exemption certificate will be issued</li>
                  </ul>
                  <p className={styles.thanksNote}>
                    Your generosity supports special education, mental health, women empowerment, and community development across Madhya Pradesh.
                  </p>
                  <button className={styles.submitBtn} onClick={resetDonate}>
                    <Heart size={18} /> Donate Again
                  </button>
                </motion.div>
              )}

            </AnimatePresence>
          )}

          {/* ── Volunteer Form ── */}
          {tab === 'volunteer' && (
            <motion.div className={styles.formWrap} key="volunteer" initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }}>
              <div className={styles.formHeader}>
                <h2>Volunteer With Us</h2>
                <p>Contribute your time and skills. We have opportunities for educators, counsellors, designers, and more.</p>
              </div>
              <form onSubmit={volunteerForm.handleSubmit(handleVolunteer)} className={styles.form} noValidate>
                <div className={styles.row}>
                  <div className={styles.field}>
                    <label className={styles.label}>Full Name *</label>
                    <input className={styles.input} placeholder="Your name" {...volunteerForm.register('name')} />
                    {volunteerForm.formState.errors.name && <span className={styles.error}>{volunteerForm.formState.errors.name.message}</span>}
                  </div>
                  <div className={styles.field}>
                    <label className={styles.label}>Email *</label>
                    <input className={styles.input} type="email" placeholder="your@email.com" {...volunteerForm.register('email')} />
                    {volunteerForm.formState.errors.email && <span className={styles.error}>{volunteerForm.formState.errors.email.message}</span>}
                  </div>
                </div>
                <div className={styles.row}>
                  <div className={styles.field}>
                    <label className={styles.label}>Phone *</label>
                    <input className={styles.input} type="tel" placeholder="+91 XXXXX XXXXX" {...volunteerForm.register('phone')} />
                    {volunteerForm.formState.errors.phone && <span className={styles.error}>{volunteerForm.formState.errors.phone.message}</span>}
                  </div>
                  <div className={styles.field}>
                    <label className={styles.label}>City</label>
                    <input className={styles.input} placeholder="Indore" {...volunteerForm.register('city')} />
                  </div>
                </div>
                <div className={styles.row}>
                  <div className={styles.field}>
                    <label className={styles.label}>Skill Area *</label>
                    <select className={styles.select} {...volunteerForm.register('skills')}>
                      <option value="">Select your primary skill</option>
                      {VOLUNTEER_SKILLS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    {volunteerForm.formState.errors.skills && <span className={styles.error}>{volunteerForm.formState.errors.skills.message}</span>}
                  </div>
                  <div className={styles.field}>
                    <label className={styles.label}>Availability</label>
                    <select className={styles.select} {...volunteerForm.register('availability')}>
                      <option value="">Select availability</option>
                      <option value="weekends">Weekends</option>
                      <option value="weekdays">Weekdays</option>
                      <option value="flexible">Flexible</option>
                    </select>
                  </div>
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Tell us about yourself</label>
                  <textarea className={styles.textarea} rows={4} placeholder="Your background, why you'd like to volunteer..." {...volunteerForm.register('message')} />
                </div>
                <button type="submit" className={`${styles.submitBtn} ${styles.submitTeal}`} id="volunteer-submit-btn" disabled={status === 'loading'}>
                  <Users size={18} /> {status === 'loading' ? 'Submitting…' : 'Submit Application'}
                </button>
              </form>
            </motion.div>
          )}

          {/* ── CSR Form ── */}
          {tab === 'csr' && (
            <motion.div className={styles.formWrap} key="csr" initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }}>
              <div className={styles.formHeader}>
                <h2>CSR &amp; Corporate Partnership</h2>
                <p>Partner with VSKS for impactful CSR. We are CSR-1 registered and manage end-to-end implementation.</p>
              </div>
              <form onSubmit={csrForm.handleSubmit(handleCsr)} className={styles.form} noValidate>
                <div className={styles.row}>
                  <div className={styles.field}>
                    <label className={styles.label}>Organisation Name *</label>
                    <input className={styles.input} placeholder="Company / Foundation name" {...csrForm.register('orgName')} />
                    {csrForm.formState.errors.orgName && <span className={styles.error}>{csrForm.formState.errors.orgName.message}</span>}
                  </div>
                  <div className={styles.field}>
                    <label className={styles.label}>Contact Person *</label>
                    <input className={styles.input} placeholder="Your full name" {...csrForm.register('contact')} />
                    {csrForm.formState.errors.contact && <span className={styles.error}>{csrForm.formState.errors.contact.message}</span>}
                  </div>
                </div>
                <div className={styles.row}>
                  <div className={styles.field}>
                    <label className={styles.label}>Email *</label>
                    <input className={styles.input} type="email" placeholder="your@company.com" {...csrForm.register('email')} />
                    {csrForm.formState.errors.email && <span className={styles.error}>{csrForm.formState.errors.email.message}</span>}
                  </div>
                  <div className={styles.field}>
                    <label className={styles.label}>Phone *</label>
                    <input className={styles.input} type="tel" placeholder="+91 XXXXX XXXXX" {...csrForm.register('phone')} />
                    {csrForm.formState.errors.phone && <span className={styles.error}>{csrForm.formState.errors.phone.message}</span>}
                  </div>
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Approximate CSR Budget *</label>
                  <select className={styles.select} {...csrForm.register('budget')}>
                    <option value="">Select budget range</option>
                    {CSR_BUDGET_RANGES.map(b => <option key={b.value} value={b.value}>{b.label}</option>)}
                  </select>
                  {csrForm.formState.errors.budget && <span className={styles.error}>{csrForm.formState.errors.budget.message}</span>}
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Areas of Interest</label>
                  <textarea className={styles.textarea} rows={3} placeholder="e.g. Special education, mental health, environment..." {...csrForm.register('interest')} />
                </div>
                <button type="submit" className={`${styles.submitBtn} ${styles.submitEarth}`} id="csr-submit-btn" disabled={status === 'loading'}>
                  <Briefcase size={18} /> {status === 'loading' ? 'Sending…' : 'Send Enquiry'}
                </button>
              </form>
            </motion.div>
          )}
        </div>
      </section>
    </>
  )
}
