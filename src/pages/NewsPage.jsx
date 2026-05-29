import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import { Calendar, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import styles from './NewsPage.module.css'

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22,1,0.36,1] } },
}
const stagger = { visible: { transition: { staggerChildren: 0.09 } } }

const NEWS = [
  {
    id: 1,
    date: 'April 20, 2024',
    category: 'Environment',
    title: 'VSKS Plants 50 Trees on Earth Day Across Indore',
    excerpt: 'To mark Earth Day 2024, VSKS organized plantation drives at three locations in Indore, adding 50 trees to our running total of 150+ saplings planted since 2019.',
    color: 'var(--color-teal)',
  },
  {
    id: 2,
    date: 'March 8, 2024',
    category: 'Women Empowerment',
    title: 'Vocational Training Graduation Ceremony — 40 Women Receive Certificates',
    excerpt: "On International Women\u2019s Day, VSKS celebrated the graduation of 40 women from our tailoring and handicraft training program. Many have already started their own micro-enterprises.",
    color: 'var(--color-saffron)',
  },
  {
    id: 3,
    date: 'February 15, 2024',
    category: 'Mental Health',
    title: 'Mental Health Awareness Camp Reaches 1,200 Students in Dewas',
    excerpt: 'Our team conducted a two-day mental health awareness camp at four schools in Dewas district, sensitizing over 1,200 students and 80 teachers on stress, anxiety, and seeking help.',
    color: 'var(--color-teal)',
  },
  {
    id: 4,
    date: 'January 26, 2024',
    category: 'Community',
    title: 'Navaankur Community Centers Complete Infrastructure in 5 Villages',
    excerpt: 'Working under the MP Jan Abhiyan Parishad, Navaankur facilitated the completion of village infrastructure — clean water access, drainage, and community halls — in 5 Khudel villages.',
    color: 'var(--color-earth)',
  },
  {
    id: 5,
    date: 'December 3, 2023',
    category: 'Special Education',
    title: 'Pehchan Celebrates Annual Day — Children Showcase Remarkable Progress',
    excerpt: 'On World Disability Day, Pehchan school for special children held its Annual Day event. Parents, educators, and community members witnessed the extraordinary growth of 45 enrolled children.',
    color: 'var(--color-saffron)',
  },
  {
    id: 6,
    date: 'October 10, 2023',
    category: 'Mental Health',
    title: 'World Mental Health Day — VSKS Reaches Milestone of 10,000 Sensitized',
    excerpt: 'On World Mental Health Day 2023, VSKS crossed the milestone of 10,000 individuals sensitized on mental health across Indore and Dewas districts since 2020.',
    color: 'var(--color-teal)',
  },
  {
    id: 7,
    date: 'August 15, 2023',
    category: 'Recognition',
    title: 'VSKS Listed on NITI Aayog NGODARPAN — A Mark of Transparency',
    excerpt: 'VSKS has been officially listed on the NITI Aayog NGODARPAN portal, reaffirming our commitment to transparent governance and accountability in all our operations.',
    color: 'var(--color-earth)',
  },
  {
    id: 8,
    date: 'June 5, 2023',
    category: 'Environment',
    title: 'World Environment Day: Awareness Drive in 6 Schools',
    excerpt: 'On World Environment Day, VSKS conducted nature and sustainability awareness sessions in 6 schools in Indore, engaging 900+ students with interactive activities on climate and waste.',
    color: 'var(--color-teal)',
  },
]

export default function NewsPage() {
  const [featured, ...rest] = NEWS

  return (
    <>
      <Helmet>
        <title>News & Updates – VSKS | Vareniyam Samaj Kalyan Samiti</title>
        <meta name="description" content="Latest news, achievements and updates from VSKS — milestones, events, and stories of community impact." />
      </Helmet>

      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.heroBg} />
        <div className={`container ${styles.heroContent}`}>
          <motion.span className={styles.eyebrow} initial={{ opacity:0 }} animate={{ opacity:1 }}>Latest Updates</motion.span>
          <motion.h1 initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.1 }}>News &amp; Stories</motion.h1>
          <motion.p initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.2 }}>
            Stay updated with our milestones, events, and the stories of change happening on the ground.
          </motion.p>
        </div>
      </section>

      <section className="section">
        <div className="container">

          {/* Featured Article */}
          <motion.div
            className={styles.featured}
            style={{ '--cat-color': featured.color }}
            variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once:true }}
          >
            <div className={styles.featuredInner}>
              <div className={styles.featuredText}>
                <div className={styles.meta}>
                  <span className={styles.category} style={{ color: featured.color, background: `color-mix(in srgb, ${featured.color} 10%, white)` }}>
                    {featured.category}
                  </span>
                  <span className={styles.date}><Calendar size={14} />{featured.date}</span>
                </div>
                <h2 className={styles.featuredTitle}>{featured.title}</h2>
                <p className={styles.featuredExcerpt}>{featured.excerpt}</p>
                <button className={styles.readMore}>Read Full Story <ArrowRight size={15} /></button>
              </div>
              <div className={styles.featuredImg}>
                <div className={styles.imgPlaceholder} style={{ background: `color-mix(in srgb, ${featured.color} 15%, white)` }}>
                  <span>🌳</span>
                  <p>Earth Day 2024</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Grid */}
          <motion.div
            className={styles.grid}
            variants={stagger} initial="hidden" whileInView="visible" viewport={{ once:true }}
          >
            {rest.map(article => (
              <motion.article
                key={article.id}
                className={styles.card}
                style={{ '--cat-color': article.color }}
                variants={fadeUp}
              >
                <div className={styles.cardTop}>
                  <span className={styles.category} style={{ color: article.color, background: `color-mix(in srgb, ${article.color} 10%, white)` }}>
                    {article.category}
                  </span>
                  <span className={styles.date}><Calendar size={13} />{article.date}</span>
                </div>
                <h3 className={styles.cardTitle}>{article.title}</h3>
                <p className={styles.cardExcerpt}>{article.excerpt}</p>
                <button className={styles.cardLink}>Read more <ArrowRight size={13} /></button>
              </motion.article>
            ))}
          </motion.div>

        </div>
      </section>
    </>
  )
}
