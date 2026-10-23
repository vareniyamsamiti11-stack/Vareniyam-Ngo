-- ============================================================
-- VSKS Website — New Admin Features Schema & Migration
-- Run this in the Supabase SQL Editor (Dashboard -> SQL Editor)
-- This DOES NOT drop or alter existing donations, contact_messages,
-- or volunteer_applications tables.
-- ============================================================

-- 1. Events Table
CREATE TABLE IF NOT EXISTS events (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug         TEXT UNIQUE NOT NULL,
  title        TEXT NOT NULL,
  event_date   DATE NOT NULL DEFAULT CURRENT_DATE,
  location     TEXT,
  category     TEXT DEFAULT 'General',
  short_desc   TEXT,
  full_desc    TEXT,
  cover_image  TEXT,
  status       TEXT DEFAULT 'published', -- 'draft' | 'published'
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Event Images (Multiple gallery photos per event)
CREATE TABLE IF NOT EXISTS event_images (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id     UUID REFERENCES events(id) ON DELETE CASCADE,
  image_url    TEXT NOT NULL,
  caption      TEXT,
  sort_order   INT DEFAULT 0,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Enhance Programs Table (Make sure all public fields exist)
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
ALTER TABLE programs ADD COLUMN IF NOT EXISTS subtitle TEXT;
ALTER TABLE programs ADD COLUMN IF NOT EXISTS color TEXT;

-- 4. Gallery Items Table
CREATE TABLE IF NOT EXISTS gallery_items (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url    TEXT NOT NULL,
  caption      TEXT,
  category     TEXT DEFAULT 'general',
  event_id     UUID REFERENCES events(id) ON DELETE SET NULL,
  program_slug TEXT,
  sort_order   INT DEFAULT 0,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Team Members Table
CREATE TABLE IF NOT EXISTS team_members (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name         TEXT NOT NULL,
  role         TEXT NOT NULL,
  bio          TEXT,
  photo_url    TEXT,
  sort_order   INT DEFAULT 0,
  is_active    BOOLEAN DEFAULT TRUE,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Site Content Key-Value Store (For homepage, about, impact, contact, etc.)
CREATE TABLE IF NOT EXISTS site_content (
  key          TEXT PRIMARY KEY,
  value        JSONB NOT NULL,
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Testimonials Table (Ensure existence)
CREATE TABLE IF NOT EXISTS testimonials (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name         TEXT NOT NULL,
  role         TEXT,
  quote        TEXT NOT NULL,
  avatar_url   TEXT,
  program      TEXT,
  category     TEXT DEFAULT 'general',
  is_active    BOOLEAN DEFAULT TRUE,
  sort_order   INT DEFAULT 0,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE testimonials ADD COLUMN IF NOT EXISTS program TEXT;
ALTER TABLE testimonials ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'general';

-- ============================================================
-- Row-Level Security (RLS)
-- ============================================================

ALTER TABLE events         ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_images   ENABLE ROW LEVEL SECURITY;
ALTER TABLE programs       ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_items  ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members   ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_content   ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials   ENABLE ROW LEVEL SECURITY;

-- Drop existing public read policies if re-running
DROP POLICY IF EXISTS "Public read published events" ON events;
DROP POLICY IF EXISTS "Public read event images" ON event_images;
DROP POLICY IF EXISTS "Public read active programs" ON programs;
DROP POLICY IF EXISTS "Public read gallery items" ON gallery_items;
DROP POLICY IF EXISTS "Public read active team members" ON team_members;
DROP POLICY IF EXISTS "Public read site content" ON site_content;
DROP POLICY IF EXISTS "Public read active testimonials" ON testimonials;

-- Public READ policies (anyone can read published/active content)
CREATE POLICY "Public read published events"     ON events        FOR SELECT USING (status = 'published');
CREATE POLICY "Public read event images"         ON event_images  FOR SELECT USING (TRUE);
CREATE POLICY "Public read active programs"       ON programs      FOR SELECT USING (is_active = TRUE);
CREATE POLICY "Public read gallery items"        ON gallery_items FOR SELECT USING (TRUE);
CREATE POLICY "Public read active team members"   ON team_members  FOR SELECT USING (is_active = TRUE);
CREATE POLICY "Public read site content"         ON site_content  FOR SELECT USING (TRUE);
CREATE POLICY "Public read active testimonials"  ON testimonials  FOR SELECT USING (is_active = TRUE);

-- Drop existing admin policies if re-running
DROP POLICY IF EXISTS "Admin all events" ON events;
DROP POLICY IF EXISTS "Admin all event images" ON event_images;
DROP POLICY IF EXISTS "Admin all programs" ON programs;
DROP POLICY IF EXISTS "Admin all gallery items" ON gallery_items;
DROP POLICY IF EXISTS "Admin all team members" ON team_members;
DROP POLICY IF EXISTS "Admin all site content" ON site_content;
DROP POLICY IF EXISTS "Admin all testimonials" ON testimonials;

-- Admin Full Access policies (only logged-in users with auth token can edit/insert/delete)
CREATE POLICY "Admin all events"        ON events        FOR ALL TO authenticated USING (TRUE) WITH CHECK (TRUE);
CREATE POLICY "Admin all event images"  ON event_images  FOR ALL TO authenticated USING (TRUE) WITH CHECK (TRUE);
CREATE POLICY "Admin all programs"      ON programs      FOR ALL TO authenticated USING (TRUE) WITH CHECK (TRUE);
CREATE POLICY "Admin all gallery items" ON gallery_items FOR ALL TO authenticated USING (TRUE) WITH CHECK (TRUE);
CREATE POLICY "Admin all team members"  ON team_members  FOR ALL TO authenticated USING (TRUE) WITH CHECK (TRUE);
CREATE POLICY "Admin all site content"  ON site_content  FOR ALL TO authenticated USING (TRUE) WITH CHECK (TRUE);
CREATE POLICY "Admin all testimonials"  ON testimonials  FOR ALL TO authenticated USING (TRUE) WITH CHECK (TRUE);

-- ============================================================
-- Supabase Storage Bucket ('public-uploads')
-- ============================================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('public-uploads', 'public-uploads', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Drop existing storage policies if re-running
DROP POLICY IF EXISTS "Public read uploads" ON storage.objects;
DROP POLICY IF EXISTS "Admin upload files" ON storage.objects;
DROP POLICY IF EXISTS "Admin update files" ON storage.objects;
DROP POLICY IF EXISTS "Admin delete files" ON storage.objects;

-- Storage policies
CREATE POLICY "Public read uploads" ON storage.objects
  FOR SELECT USING (bucket_id = 'public-uploads');

CREATE POLICY "Admin upload files" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'public-uploads');

CREATE POLICY "Admin update files" ON storage.objects
  FOR UPDATE TO authenticated USING (bucket_id = 'public-uploads');

CREATE POLICY "Admin delete files" ON storage.objects
  FOR DELETE TO authenticated USING (bucket_id = 'public-uploads');

-- ============================================================
-- Seed Initial Data from Hardcoded Content
-- ============================================================

-- Seed Programs
INSERT INTO programs (slug, title, subtitle, short_desc, full_desc, icon, color, sort_order, is_active) VALUES
  ('pehchan', 'Pehchan', 'School for Special Children', 'Structured special education, behaviour training and therapeutic interventions for children with Autism, ADHD, and intellectual disabilities.', 'Pehchan provides a nurturing learning environment for children with special needs, offering individualized education plans, speech therapy, occupational therapy, and behavioural interventions. Our trained educators work closely with families to ensure holistic development of each child.', 'GraduationCap', 'var(--color-teal)', 1, true),
  ('navaankur', 'Navaankur', 'Community Development Initiative', 'Facilitating community participation and grassroots development in the Khudel sector under MP Jan Abhiyan Parishad.', 'Navaankur mobilizes communities to identify local needs, build self-governance capacities, and implement sustainable development solutions. Working in partnership with the Madhya Pradesh Jan Abhiyan Parishad, we facilitate village-level planning, livelihood programs, and social welfare initiatives.', 'Users', 'var(--color-saffron)', 2, true),
  ('mental-health', 'Mental Health Awareness', 'Breaking Stigma, Building Resilience', 'Awareness sessions in schools, community groups and ICDS centres to reduce stigma and encourage open dialogue on mental wellbeing.', 'Our mental health program trains teachers, ASHA workers, and community volunteers as mental wellness champions. We conduct interactive awareness workshops across schools and communities in Indore and Dewas districts, using local language and culturally sensitive approaches.', 'Brain', 'var(--color-teal)', 3, true),
  ('suicide-prevention', 'Suicide Prevention', 'Every Life Matters', 'Community-level awareness and crisis intervention training to prevent suicide and support those in distress.', 'Working with mental health professionals, we train community workers and volunteers in suicide prevention strategies, crisis intervention, and safe messaging. We also maintain a referral network with local mental health facilities for timely support.', 'Heart', 'var(--color-error)', 4, true),
  ('substance-abuse', 'Substance Abuse Awareness', 'Prevention & Youth Counselling', 'Education and counselling sessions to prevent substance abuse among youth in vulnerable communities.', 'Through school programs, street plays, and peer counselling, we create awareness about the dangers of substance abuse. We also connect affected individuals and families with rehabilitation and mental health professionals.', 'AlertCircle', 'var(--color-earth)', 5, true),
  ('vocational-training', 'Vocational Training for Women', 'Skills for Independence', 'Skill development and livelihood training programs designed to help women achieve financial independence.', 'Our vocational center offers hands-on training in tailoring, handicrafts, digital literacy, and basic financial management. Over 60 women have graduated, with many starting home-based micro-enterprises.', 'Scissors', 'var(--color-saffron)', 6, true),
  ('swachh-bharat', 'Swachh Bharat Mission Support', 'Sanitation & Behaviour Change', 'Supporting the Swachh Bharat Abhiyan through community sanitation drives, door-to-door awareness, and toilet construction monitoring.', 'In partnership with local authorities in Dewas and Indore districts, we conduct community meetings, hygiene workshops, and school sanitation campaigns to drive sustainable behavioural change.', 'Leaf', 'var(--color-success)', 7, true),
  ('environment', 'Environmental Action', 'Greening Our Communities', 'Tree plantation drives, environmental education, and waste management campaigns for a sustainable future.', 'We actively organize plantation drives, environmental awareness sessions in schools, and community waste reduction workshops. We have planted over 150 trees and work with local youth as green ambassadors.', 'Trees', 'var(--color-teal)', 8, true),
  ('financial-awareness', 'Financial Literacy', 'Empowering Through Financial Inclusion', 'Workshops on banking, government welfare schemes, digital payments, and small savings for underserved families.', 'We demystify formal banking, Jan Dhan accounts, micro-insurance, and government welfare schemes for rural and semi-urban communities, helping families build secure financial foundations.', 'DollarSign', 'var(--color-saffron)', 9, true)
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  subtitle = EXCLUDED.subtitle,
  short_desc = EXCLUDED.short_desc,
  full_desc = EXCLUDED.full_desc,
  icon = EXCLUDED.icon,
  color = EXCLUDED.color,
  sort_order = EXCLUDED.sort_order;

-- Seed Sample Events
INSERT INTO events (slug, title, event_date, location, category, short_desc, full_desc, cover_image, status) VALUES
  ('tree-plantation-khudel-2024', 'Annual Tree Plantation Drive', CURRENT_DATE - INTERVAL '15 days', 'Khudel Sector, Indore', 'Environmental Action', 'Over 100 native saplings planted in Khudel village with community members and volunteers.', 'Our team along with local youth ambassadors and school students organized a large-scale tree plantation campaign. Each student adopted a sapling to nurture, instilling environmental responsibility.', '/Assets/Navankar Project Photos/WhatsApp Image 2026-06-11 at 3.35.26 PM.jpeg', 'published'),
  ('mental-wellness-school-workshop', 'Youth Mental Wellness Workshop', CURRENT_DATE - INTERVAL '30 days', 'Govt. Higher Secondary School, Dewas', 'Mental Health Awareness', 'Interactive mental health awareness session reaching 250+ high school students and teachers.', 'A comprehensive workshop conducted by experienced counsellors focusing on exam stress, emotional resilience, peer pressure, and seeking timely help. Students participated in mindfulness exercises and interactive Q&A.', '/Assets/heropage.jpeg', 'published'),
  ('pehchan-sports-day', 'Pehchan Inclusive Sports Day', CURRENT_DATE + INTERVAL '10 days', 'VSKS Ground, Limbodi, Indore', 'Education', 'Special annual sports meet celebrating the talents and athletic spirit of our Pehchan students.', 'An exciting event featuring adaptive games, races, arts, and award ceremonies. Parents, community volunteers, and educators join hands to celebrate every child''s unique abilities.', '/Assets/Navankar Project Photos/WhatsApp Image 2026-06-11 at 3.35.28 PM.jpeg', 'published')
ON CONFLICT (slug) DO NOTHING;

-- Seed Team Members
INSERT INTO team_members (name, role, bio, photo_url, sort_order, is_active) VALUES
  ('Soni Dharva', 'Founder & Secretary', 'Social worker with extensive grassroots experience leading education, health, and rural development initiatives in Madhya Pradesh.', '/Assets/Founder.jpeg', 1, true),
  ('Dr. Anjali Verma', 'Advisory Board – Mental Health', 'Clinical psychologist and mental health advocate guiding VSKS mental wellness campaigns.', NULL, 2, true),
  ('Ramesh Patel', 'Field Operations Lead', 'Overseeing community mobilization and grassroots coordination across Khudel and surrounding villages.', NULL, 3, true)
ON CONFLICT DO NOTHING;

-- Seed Testimonials
INSERT INTO testimonials (name, role, program, category, quote, sort_order, is_active) VALUES
  ('Priya Sharma', 'Parent of Pehchan Student', 'Pehchan – Special Education', 'student', 'My son has shown tremendous improvement since joining Pehchan. The dedicated teachers and therapy sessions have truly transformed his life. VSKS is a blessing for families like ours.', 1, true),
  ('Ramesh Patel', 'Community Member, Khudel', 'Navaankur – Community Dev', 'community', 'The Navaankur program helped our village get clean water access and better roads. VSKS listens to us and works with us — not just for us.', 2, true),
  ('Sunita Malviya', 'Vocational Training Graduate', 'Vocational Training', 'student', 'After the tailoring training, I started my own small business. I can now support my family. VSKS gave me confidence and skills to be independent.', 3, true),
  ('Dr. Anjali Verma', 'School Principal, Indore', 'Mental Health Awareness', 'partner', 'The mental health awareness session conducted by VSKS was eye-opening for our teachers and students. They handled sensitive topics with great professionalism and empathy.', 4, true),
  ('Meena Rathore', 'Volunteer, 2 years', 'Swachh Bharat Campaign', 'volunteer', 'Volunteering with VSKS has been one of the most fulfilling experiences of my life. Every weekend I spend with the team reminds me of why community service matters.', 5, true)
ON CONFLICT DO NOTHING;

-- Seed Site Content Key-Value Store
INSERT INTO site_content (key, value) VALUES
  ('homepage_hero', '{
    "tagline": "Registered NGO · Since 2018",
    "title": "Building Inclusive Communities, One Life at a Time",
    "accentWord": "Communities",
    "subtitle": "To empower marginalized communities through education, mental health advocacy, environmental action, and inclusive development — creating a society where every individual can live with dignity.",
    "coverImage": "/Assets/heropage.jpeg",
    "primaryCtaText": "Donate Now",
    "primaryCtaLink": "/get-involved",
    "secondaryCtaText": "Our Programs",
    "secondaryCtaLink": "/programs"
  }'),
  ('about_page', '{
    "story": "Vareniyam Samaj Kalyan Samiti (VSKS), based in Indore, Madhya Pradesh, is a community-based non-profit organization working to promote inclusion, dignity and well-being among vulnerable populations. Established in 2018, the organization works with individuals and communities facing social, economic and psychosocial challenges. VSKS believes that meaningful change begins within communities. Through awareness, collaboration and grassroots engagement, the organization works to build supportive environments where individuals can access information, opportunities and social support. The organization currently works in Indore and Dewas districts, focusing on mental health awareness, social inclusion, sanitation initiatives, environmental action and community empowerment.",
    "mission": "To empower marginalized communities through education, mental health advocacy, environmental action, and inclusive development — creating a society where every individual can live with dignity.",
    "vision": "A society where every individual — regardless of disability, socio-economic background, or geography — can participate fully and live with dignity, independence, and purpose.",
    "founderName": "Soni Dharva",
    "founderTitle": "Founder & Secretary",
    "founderBio": "Soni Dharva established Vareniyam Samaj Kalyan Samiti in 2018 with a deep conviction that every individual deserves access to education, mental health support, and livelihood opportunities. With a background in social work and community development, she has led the organisation from a small community initiative to a multi-program NGO touching over 10,000 lives. Under her leadership, VSKS has earned registrations under 12A, 80G, CSR-1, and is listed on NGODARPAN — reflecting her commitment to transparency and accountable governance.",
    "founderImage": "/Assets/Founder.jpeg"
  }'),
  ('impact_stats', '[
    { "value": 10000, "suffix": "+", "label": "People Sensitized", "color": "var(--color-saffron)" },
    { "value": 2500,  "suffix": "+", "label": "Students Benefited", "color": "var(--color-teal)" },
    { "value": 150,   "suffix": "+", "label": "Trees Planted", "color": "var(--color-success)" },
    { "value": 100,   "suffix": "+", "label": "Awareness Sessions", "color": "var(--color-earth)" }
  ]'),
  ('contact_info', '{
    "phone": "+91 83194 28199",
    "email": "Vreniyam.samiti11@gmail.com",
    "address": "X-16 Near Gol Garden, New Ranibag Limbodi, Khandwa Road, Indore – 452020, Madhya Pradesh",
    "whatsapp": "+91 83194 28199"
  }'),
  ('social_links', '{
    "facebook": "https://facebook.com",
    "instagram": "https://instagram.com",
    "whatsapp": "https://wa.me/918319428199",
    "linkedin": "https://linkedin.com/company/vareniyam-samaj-kalyan-samiti"
  }')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW();
