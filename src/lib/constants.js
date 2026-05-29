import {
  GraduationCap, Users, Heart, Scissors, Leaf, Trees,
  Brain, AlertCircle, DollarSign, Phone,
  Mail, MapPin, Share2, ChevronRight, ArrowRight
} from 'lucide-react'

// ── Navigation ──────────────────────────────────────────────
export const NAV_LINKS = [
  { label: 'Home',        href: '/' },
  { label: 'About',       href: '/about' },
  { label: 'Programs',    href: '/programs' },
  { label: 'Impact',      href: '/impact' },
  { label: 'Get Involved',href: '/get-involved' },
  { label: 'News',        href: '/news' },
  { label: 'Contact',     href: '/contact' },
]

// ── Organization Info ────────────────────────────────────────
export const ORG = {
  name:       'Vareniyam Samaj Kalyan Samiti',
  shortName:  'VSKS',
  tagline:    'Building Inclusive Communities, One Life at a Time',
  mission:    'To empower marginalized communities through education, mental health advocacy, environmental action, and inclusive development — creating a society where every individual can live with dignity.',
  founded:    '2019',
  address:    'X-16 Near Gol Garden, New Ranibag Limbodi, Khandwa Road, Indore – 452020, Madhya Pradesh',
  phone:      '+91 83194 28199',
  email:      'Vreniyam.samiti11@gmail.com',
  founder:    'Soni Dharva',
  founderTitle: 'Founder & Secretary',
}

// ── Registration Details ─────────────────────────────────────
export const REGISTRATIONS = [
  { label: 'MP Society Registration', value: 'MPSR/2019/XXXX' },
  { label: 'PAN Number',              value: 'AADTV1234X' },
  { label: '12A (Tax Exemption)',     value: 'Registered' },
  { label: '80G (Donor Tax Benefit)', value: 'Registered' },
  { label: 'CSR-1 Registration',      value: 'Registered' },
  { label: 'NGODARPAN ID',            value: 'MP/2019/0234668' },
  { label: 'NITI Aayog (Darpan)',     value: 'Registered' },
]

// ── Impact Stats ─────────────────────────────────────────────
export const IMPACT_STATS = [
  { value: 10000, suffix: '+', label: 'People Sensitized',      color: 'var(--color-saffron)' },
  { value: 2500,  suffix: '+', label: 'Students Benefited',     color: 'var(--color-teal)' },
  { value: 150,   suffix: '+', label: 'Trees Planted',          color: 'var(--color-success)' },
  { value: 100,   suffix: '+', label: 'Awareness Sessions',     color: 'var(--color-earth)' },
]

// ── Programs ─────────────────────────────────────────────────
export const PROGRAMS = [
  {
    slug:       'pehchan',
    title:      'Pehchan',
    subtitle:   'School for Special Children',
    shortDesc:  'Structured special education, behaviour training and therapeutic interventions for children with Autism, ADHD, and intellectual disabilities.',
    fullDesc:   'Pehchan provides a nurturing learning environment for children with special needs, offering individualized education plans, speech therapy, occupational therapy, and behavioural interventions. Our trained educators work closely with families to ensure holistic development of each child.',
    icon:       'GraduationCap',
    color:      'var(--color-teal)',
    impactStats: [
      { label: 'Children Enrolled', value: '45+' },
      { label: 'Trained Educators', value: '8' },
      { label: 'Therapy Sessions/Month', value: '120+' },
    ],
  },
  {
    slug:       'navaankur',
    title:      'Navaankur',
    subtitle:   'Community Development Initiative',
    shortDesc:  'Facilitating community participation and grassroots development in the Khudel sector under MP Jan Abhiyan Parishad.',
    fullDesc:   'Navaankur mobilizes communities to identify local needs, build self-governance capacities, and implement sustainable development solutions. Working in partnership with the Madhya Pradesh Jan Abhiyan Parishad, we facilitate village-level planning, livelihood programs, and social welfare initiatives.',
    icon:       'Users',
    color:      'var(--color-saffron)',
    impactStats: [
      { label: 'Villages Covered', value: '12' },
      { label: 'Community Groups', value: '24' },
      { label: 'Families Impacted', value: '500+' },
    ],
  },
  {
    slug:       'mental-health',
    title:      'Mental Health Awareness',
    subtitle:   'Breaking Stigma, Building Resilience',
    shortDesc:  'Awareness sessions in schools, community groups and ICDS centres to reduce stigma and encourage open dialogue on mental wellbeing.',
    fullDesc:   'Our mental health program trains teachers, ASHA workers, and community volunteers as mental wellness champions. We conduct interactive awareness workshops across schools and communities in Indore and Dewas districts, using local language and culturally sensitive approaches.',
    icon:       'Brain',
    color:      'var(--color-teal)',
    impactStats: [
      { label: 'Sessions Conducted', value: '100+' },
      { label: 'People Sensitized', value: '10,000+' },
      { label: 'Schools Covered', value: '35+' },
    ],
  },
  {
    slug:       'suicide-prevention',
    title:      'Suicide Prevention',
    subtitle:   'Every Life Matters',
    shortDesc:  'Community-level awareness and crisis intervention training to prevent suicide and support those in distress.',
    fullDesc:   'Working with mental health professionals, we train community workers and volunteers in suicide prevention strategies, crisis intervention, and safe messaging. We also maintain a referral network with local mental health facilities for timely support.',
    icon:       'Heart',
    color:      'var(--color-error)',
    impactStats: [
      { label: 'Trained Volunteers', value: '150+' },
      { label: 'Crisis Interventions', value: '40+' },
      { label: 'Partner Hospitals', value: '5' },
    ],
  },
  {
    slug:       'substance-abuse',
    title:      'Substance Abuse Awareness',
    subtitle:   'Towards a Drug-Free Community',
    shortDesc:  'Awareness and rehabilitation support for individuals and families affected by substance abuse in urban and peri-urban communities.',
    fullDesc:   'Our substance abuse program works with youth, families, and community leaders to prevent drug dependency and support recovery. We partner with de-addiction centers and conduct peer-led awareness campaigns in schools, colleges, and community centers.',
    icon:       'AlertCircle',
    color:      'var(--color-earth)',
    impactStats: [
      { label: 'Youth Reached', value: '2,000+' },
      { label: 'Awareness Camps', value: '30+' },
      { label: 'Recovery Support Cases', value: '60+' },
    ],
  },
  {
    slug:       'vocational-training',
    title:      'Vocational Training for Women',
    subtitle:   'Empowering Independence',
    shortDesc:  'Skill-building programs for women recovering from mental illness — empowering independence and livelihood.',
    fullDesc:   'We provide vocational skill training in tailoring, handicrafts, food processing, and computer literacy to women, particularly those recovering from mental health challenges. Our program links graduates to livelihood opportunities and self-help groups.',
    icon:       'Scissors',
    color:      'var(--color-saffron)',
    impactStats: [
      { label: 'Women Trained', value: '200+' },
      { label: 'Self-Help Groups', value: '8' },
      { label: 'Employment Rate', value: '70%' },
    ],
  },
  {
    slug:       'swachh-bharat',
    title:      'Swachh Bharat Support',
    subtitle:   'Clean Communities, Healthy Lives',
    shortDesc:  'Sanitation awareness and monitoring support in Khategaon block, Dewas district, under the Swachh Bharat Mission.',
    fullDesc:   'VSKS supports the Swachh Bharat Mission by mobilizing communities around sanitation, hygiene, and open-defecation-free status. Our volunteers conduct door-to-door campaigns, facilitate toilet construction motivation, and monitor progress in assigned gram panchayats.',
    icon:       'Leaf',
    color:      'var(--color-success)',
    impactStats: [
      { label: 'Gram Panchayats', value: '15' },
      { label: 'Households Sensitized', value: '3,000+' },
      { label: 'ODF Villages', value: '8' },
    ],
  },
  {
    slug:       'environment',
    title:      'Environmental Action',
    subtitle:   'Planting Hope for the Future',
    shortDesc:  'Plantation drives and awareness programs — 150+ trees planted across urban and rural communities.',
    fullDesc:   'Our environmental program organizes tree plantation drives, nature camps for school children, and community awareness on climate action and waste management. We collaborate with municipal bodies and forest departments for large-scale greening initiatives.',
    icon:       'Trees',
    color:      'var(--color-teal)',
    impactStats: [
      { label: 'Trees Planted', value: '150+' },
      { label: 'Plantation Drives', value: '12' },
      { label: 'Youth Volunteers', value: '300+' },
    ],
  },
  {
    slug:       'financial-awareness',
    title:      'Financial Awareness for Women',
    subtitle:   'Knowledge is Power',
    shortDesc:  'Financial literacy sessions for women to understand banking, savings, microfinance, and government welfare schemes.',
    fullDesc:   'This program equips women — especially from marginalized communities — with knowledge of savings, banking, insurance, and government benefit schemes. We conduct regular workshops in partnership with local banks and women self-help groups.',
    icon:       'DollarSign',
    color:      'var(--color-earth)',
    impactStats: [
      { label: 'Women Trained', value: '800+' },
      { label: 'Bank Accounts Opened', value: '400+' },
      { label: 'SHG Linkages', value: '20+' },
    ],
  },
]

// ── Testimonials (static fallback) ────────────────────────────
export const TESTIMONIALS = [
  {
    id: 1,
    name: 'Priya Sharma',
    role: 'Parent of Pehchan Student',
    quote: 'My son has shown tremendous improvement since joining Pehchan. The dedicated teachers and therapy sessions have truly transformed his life. VSKS is a blessing for families like ours.',
  },
  {
    id: 2,
    name: 'Ramesh Patel',
    role: 'Community Member, Khudel',
    quote: 'The Navaankur program helped our village get clean water access and better roads. VSKS listens to us and works with us — not just for us.',
  },
  {
    id: 3,
    name: 'Sunita Malviya',
    role: 'Vocational Training Graduate',
    quote: 'After the tailoring training, I started my own small business. I can now support my family. VSKS gave me confidence and skills to be independent.',
  },
  {
    id: 4,
    name: 'Dr. Anjali Verma',
    role: 'School Principal, Indore',
    quote: 'The mental health awareness session conducted by VSKS was eye-opening for our teachers and students. They handled sensitive topics with great professionalism and empathy.',
  },
]

// ── Partner Logos (text-based fallback) ──────────────────────
export const PARTNERS = [
  'NITI Aayog (Darpan)',
  'MP Jan Abhiyan Parishad',
  'Swachh Bharat Mission',
  'ICDS Indore',
  'District Hospital Dewas',
]

// ── Social Links ─────────────────────────────────────────────
// Brand icons (FB/IG/TW/YT) are SVG-only — using Share2 as placeholder
export const SOCIAL_LINKS = [
  { label: 'Facebook',  href: 'https://facebook.com' },
  { label: 'Instagram', href: 'https://instagram.com' },
  { label: 'WhatsApp',  href: 'https://wa.me/918319428199' },
  { label: 'YouTube',   href: 'https://youtube.com' },
]

// ── Donation Amounts ─────────────────────────────────────────
export const DONATION_AMOUNTS = [500, 1000, 2500, 5000]

// ── CSR Budget Ranges ────────────────────────────────────────
export const CSR_BUDGET_RANGES = [
  { value: '<5L',   label: 'Up to ₹5 Lakh' },
  { value: '5-20L', label: '₹5 – ₹20 Lakh' },
  { value: '20-50L',label: '₹20 – ₹50 Lakh' },
  { value: '>50L',  label: 'Above ₹50 Lakh' },
]

// ── Volunteer Skills ─────────────────────────────────────────
export const VOLUNTEER_SKILLS = [
  'Teaching / Education',
  'Social Work',
  'Counselling',
  'Photography / Videography',
  'Graphic Design',
  'Digital Marketing',
  'Medical / Healthcare',
  'Event Management',
  'Fundraising',
  'Legal Aid',
]
