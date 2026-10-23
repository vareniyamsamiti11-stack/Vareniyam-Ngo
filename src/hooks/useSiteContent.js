import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { ORG, IMPACT_STATS, PROGRAMS, TESTIMONIALS_FULL } from '../lib/constants'

/**
 * Hook to retrieve site content from Supabase with fallback to hardcoded constants
 */
export function useSiteContent() {
  const [content, setContent] = useState({
    hero: {
      tagline: 'Registered NGO · Since 2018',
      title: 'Building Inclusive Communities, One Life at a Time',
      accentWord: 'Communities',
      subtitle: ORG.mission,
      coverImage: '/Assets/heropage.jpeg',
      primaryCtaText: 'Donate Now',
      primaryCtaLink: '/get-involved',
      secondaryCtaText: 'Our Programs',
      secondaryCtaLink: '/programs',
    },
    about: {
      story: `Vareniyam Samaj Kalyan Samiti (VSKS), based in Indore, Madhya Pradesh, is a community-based non-profit organization working to promote inclusion, dignity and well-being among vulnerable populations. Established in 2018, the organization works with individuals and communities facing social, economic and psychosocial challenges. VSKS believes that meaningful change begins within communities. Through awareness, collaboration and grassroots engagement, the organization works to build supportive environments where individuals can access information, opportunities and social support. The organization currently works in Indore and Dewas districts, focusing on mental health awareness, social inclusion, sanitation initiatives, environmental action and community empowerment.`,
      mission: ORG.mission,
      vision: 'A society where every individual — regardless of disability, socio-economic background, or geography — can participate fully and live with dignity, independence, and purpose.',
      founderName: ORG.founder,
      founderTitle: ORG.founderTitle,
      founderBio: `Soni Dharva established Vareniyam Samaj Kalyan Samiti in 2018 with a deep conviction that every individual deserves access to education, mental health support, and livelihood opportunities. With a background in social work and community development, she has led the organisation from a small community initiative to a multi-program NGO touching over 10,000 lives. Under her leadership, VSKS has earned registrations under 12A, 80G, CSR-1, and is listed on NGODARPAN — reflecting her commitment to transparency and accountable governance.`,
      founderImage: '/Assets/Founder.jpeg',
    },
    impactStats: IMPACT_STATS,
    contact: {
      phone: ORG.phone,
      email: ORG.email,
      address: ORG.address,
      whatsapp: '+91 83194 28199',
    },
    social: {
      facebook: 'https://facebook.com',
      instagram: 'https://instagram.com',
      whatsapp: 'https://wa.me/918319428199',
      linkedin: 'https://linkedin.com/company/vareniyam-samaj-kalyan-samiti',
    },
    loading: true,
  })

  useEffect(() => {
    async function fetchSiteData() {
      try {
        const { data, error } = await supabase.from('site_content').select('*')
        if (!error && data && data.length > 0) {
          setContent(prev => {
            const updated = { ...prev, loading: false }
            for (const row of data) {
              if (row.key === 'homepage_hero' && row.value) updated.hero = { ...prev.hero, ...row.value }
              if (row.key === 'about_page' && row.value) updated.about = { ...prev.about, ...row.value }
              if (row.key === 'impact_stats' && Array.isArray(row.value)) updated.impactStats = row.value
              if (row.key === 'contact_info' && row.value) updated.contact = { ...prev.contact, ...row.value }
              if (row.key === 'social_links' && row.value) updated.social = { ...prev.social, ...row.value }
            }
            return updated
          })
        } else {
          setContent(prev => ({ ...prev, loading: false }))
        }
      } catch (err) {
        console.warn('Could not load dynamic site content, using defaults:', err)
        setContent(prev => ({ ...prev, loading: false }))
      }
    }
    fetchSiteData()
  }, [])

  return content
}

/**
 * Hook to retrieve active programs from Supabase with fallback to constants
 */
export function usePrograms() {
  const [programs, setPrograms] = useState(PROGRAMS)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchPrograms() {
      try {
        const { data, error } = await supabase
          .from('programs')
          .select('*')
          .eq('is_active', true)
          .order('sort_order', { ascending: true })
        if (!error && data && data.length > 0) {
          setPrograms(data)
        }
      } catch (err) {
        console.warn('Using default programs:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchPrograms()
  }, [])

  return { programs, loading }
}

/**
 * Hook to retrieve published events from Supabase
 */
export function useEvents() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchEvents() {
      try {
        const { data, error } = await supabase
          .from('events')
          .select('*')
          .eq('status', 'published')
          .order('event_date', { ascending: false })
        if (!error && data) {
          setEvents(data)
        }
      } catch (err) {
        console.warn('Error fetching events:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchEvents()
  }, [])

  return { events, loading }
}

/**
 * Hook to retrieve active testimonials from Supabase with fallback
 */
export function useTestimonials() {
  const [testimonials, setTestimonials] = useState(TESTIMONIALS_FULL)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchTestimonials() {
      try {
        const { data, error } = await supabase
          .from('testimonials')
          .select('*')
          .eq('is_active', true)
          .order('sort_order', { ascending: true })
        if (!error && data && data.length > 0) {
          setTestimonials(data)
        }
      } catch (err) {
        console.warn('Using default testimonials:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchTestimonials()
  }, [])

  return { testimonials, loading }
}
