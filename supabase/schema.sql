-- ============================================================
-- VSKS Website — Supabase Database Schema
-- Run this in the Supabase SQL Editor (Dashboard → SQL Editor)
-- ============================================================

-- 1. Programs
CREATE TABLE IF NOT EXISTS programs (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug         TEXT UNIQUE NOT NULL,
  title        TEXT NOT NULL,
  short_desc   TEXT,
  full_desc    TEXT,
  icon         TEXT,
  cover_image  TEXT,
  impact_stats JSONB,
  is_active    BOOLEAN DEFAULT TRUE,
  sort_order   INT DEFAULT 0,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

-- 2. News Posts
CREATE TABLE IF NOT EXISTS news_posts (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug         TEXT UNIQUE NOT NULL,
  title        TEXT NOT NULL,
  excerpt      TEXT,
  content      TEXT,
  cover_image  TEXT,
  category     TEXT DEFAULT 'news',
  published    BOOLEAN DEFAULT FALSE,
  published_at TIMESTAMPTZ,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Donations
CREATE TABLE IF NOT EXISTS donations (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  donor_name   TEXT NOT NULL,
  donor_email  TEXT NOT NULL,
  donor_phone  TEXT,
  donor_pan    TEXT,
  amount       NUMERIC(10,2) NOT NULL,
  currency     TEXT DEFAULT 'INR',
  payment_mode TEXT DEFAULT 'UPI QR',   -- e.g. 'UPI QR', 'Bank Transfer'
  status       TEXT DEFAULT 'pending',  -- 'pending' | 'received'
  receipt_sent BOOLEAN DEFAULT FALSE,
  screenshot_url TEXT,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Volunteer Applications
CREATE TABLE IF NOT EXISTS volunteer_applications (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name         TEXT NOT NULL,
  email        TEXT NOT NULL,
  phone        TEXT,
  city         TEXT,
  skills       TEXT[],
  availability TEXT,
  message      TEXT,
  status       TEXT DEFAULT 'new',
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- 5. CSR Inquiries
CREATE TABLE IF NOT EXISTS csr_inquiries (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization   TEXT NOT NULL,
  contact_person TEXT NOT NULL,
  email          TEXT NOT NULL,
  phone          TEXT,
  budget_range   TEXT,
  interest_areas TEXT[],
  message        TEXT,
  status         TEXT DEFAULT 'new',
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Contact Messages
CREATE TABLE IF NOT EXISTS contact_messages (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT NOT NULL,
  email      TEXT NOT NULL,
  subject    TEXT,
  message    TEXT NOT NULL,
  read       BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Testimonials
CREATE TABLE IF NOT EXISTS testimonials (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT NOT NULL,
  role       TEXT,
  quote      TEXT NOT NULL,
  avatar_url TEXT,
  is_active  BOOLEAN DEFAULT TRUE,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Newsletter Subscribers
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email      TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Site Settings
CREATE TABLE IF NOT EXISTS site_settings (
  key   TEXT PRIMARY KEY,
  value JSONB
);

-- ============================================================
-- Row-Level Security (RLS)
-- ============================================================

ALTER TABLE programs               ENABLE ROW LEVEL SECURITY;
ALTER TABLE news_posts             ENABLE ROW LEVEL SECURITY;
ALTER TABLE donations              ENABLE ROW LEVEL SECURITY;
ALTER TABLE volunteer_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE csr_inquiries          ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages       ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials           ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Public READ policies
CREATE POLICY "Public read active programs"   ON programs      FOR SELECT USING (is_active = TRUE);
CREATE POLICY "Public read published news"    ON news_posts    FOR SELECT USING (published = TRUE);
CREATE POLICY "Public read active testimonials" ON testimonials FOR SELECT USING (is_active = TRUE);

-- Anonymous INSERT policies (form submissions)
CREATE POLICY "Anon submit contact"    ON contact_messages       FOR INSERT TO anon WITH CHECK (TRUE);
CREATE POLICY "Anon submit volunteer"  ON volunteer_applications  FOR INSERT TO anon WITH CHECK (TRUE);
CREATE POLICY "Anon submit csr"        ON csr_inquiries           FOR INSERT TO anon WITH CHECK (TRUE);
CREATE POLICY "Anon create donation"   ON donations               FOR INSERT TO anon WITH CHECK (TRUE);
CREATE POLICY "Anon update pending donation" ON donations         FOR UPDATE TO anon USING (status = 'pending') WITH CHECK (status = 'received');
CREATE POLICY "Anon subscribe newsletter" ON newsletter_subscribers FOR INSERT TO anon WITH CHECK (TRUE);

-- Admin full access (authenticated = admin)
CREATE POLICY "Admin all programs"     ON programs               FOR ALL TO authenticated USING (TRUE) WITH CHECK (TRUE);
CREATE POLICY "Admin all news"         ON news_posts             FOR ALL TO authenticated USING (TRUE) WITH CHECK (TRUE);
CREATE POLICY "Admin all donations"    ON donations              FOR ALL TO authenticated USING (TRUE) WITH CHECK (TRUE);
CREATE POLICY "Admin all volunteers"   ON volunteer_applications FOR ALL TO authenticated USING (TRUE) WITH CHECK (TRUE);
CREATE POLICY "Admin all csr"          ON csr_inquiries          FOR ALL TO authenticated USING (TRUE) WITH CHECK (TRUE);
CREATE POLICY "Admin all contact"      ON contact_messages       FOR ALL TO authenticated USING (TRUE) WITH CHECK (TRUE);
CREATE POLICY "Admin all testimonials" ON testimonials           FOR ALL TO authenticated USING (TRUE) WITH CHECK (TRUE);
CREATE POLICY "Admin all newsletter"   ON newsletter_subscribers FOR ALL TO authenticated USING (TRUE) WITH CHECK (TRUE);

-- ============================================================
-- Seed Initial Data
-- ============================================================

INSERT INTO programs (slug, title, short_desc, icon, sort_order) VALUES
  ('pehchan',            'Pehchan — School for Special Children',    'Structured special education for children with Autism, ADHD, and intellectual disabilities.', 'GraduationCap', 1),
  ('navaankur',          'Navaankur Community Development',          'Facilitating grassroots development in Khudel sector under MP Jan Abhiyan Parishad.',         'Users',         2),
  ('mental-health',      'Mental Health Awareness',                  'Awareness sessions in schools and ICDS centres to reduce stigma and build resilience.',         'Brain',          3),
  ('vocational-training','Vocational Training for Women',            'Skill-building programs empowering women with livelihood opportunities.',                        'Scissors',       4),
  ('swachh-bharat',      'Swachh Bharat Mission Support',            'Sanitation awareness and monitoring in Khategaon block, Dewas district.',                       'Leaf',           5),
  ('environment',        'Environmental Action',                     'Plantation drives and awareness — 150+ trees planted across communities.',                       'Trees',          6)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO site_settings (key, value) VALUES
  ('impact_stats', '{"people_sensitized": 10000, "students_benefited": 2500, "trees_planted": 150, "sessions_conducted": 100}')
ON CONFLICT (key) DO NOTHING;
