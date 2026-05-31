-- Twinkle Stars Kindergarten Database Schema

CREATE TABLE IF NOT EXISTS admissions (
  id SERIAL PRIMARY KEY,
  child_name VARCHAR(255) NOT NULL,
  age VARCHAR(50) NOT NULL,
  program VARCHAR(100) NOT NULL,
  parent_name VARCHAR(255) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  email VARCHAR(255) NOT NULL,
  message TEXT,
  start_date DATE,
  status VARCHAR(50) DEFAULT 'new',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS programs (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(100) NOT NULL UNIQUE,
  age_range VARCHAR(100) NOT NULL,
  description TEXT,
  icon VARCHAR(10) DEFAULT '⭐',
  sort_order INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS schedule_items (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  sort_order INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS daycare_facilities (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  sort_order INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS gallery (
  id SERIAL PRIMARY KEY,
  image_url TEXT NOT NULL,
  caption VARCHAR(255),
  sort_order INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS announcements (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  body TEXT,
  active BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS settings (
  key VARCHAR(100) PRIMARY KEY,
  value JSONB NOT NULL
);

-- Seed programs (Preschool only — Daycare has its own page)
INSERT INTO programs (name, slug, age_range, description, icon, sort_order) VALUES
  ('Little Comets', 'little-comets', 'Age: 1.5–2 yrs', 'Gentle introduction to learning through sensory play, songs, and cosmic exploration.', '☄️', 1),
  ('Bright Stars', 'bright-stars', 'Age: 2.5–3.5 yrs', 'Building foundational skills through creative play, early literacy, and social development.', '⭐', 2),
  ('SuperNovas', 'supernovas', 'Age: 3.5–5 yrs', 'Preparing little explorers for school with structured learning and confidence-building.', '💫', 3)
ON CONFLICT (slug) DO NOTHING;

-- Seed schedule
INSERT INTO schedule_items (title, description, sort_order) VALUES
  ('Welcome Circle and Songs', '', 1),
  ('Story Time', '', 2),
  ('Art and Messy Play', '', 3),
  ('Outdoor Exploration', '', 4),
  ('Healthy Snack Time', '', 5),
  ('Music and Movement', '', 6);

-- Seed daycare facilities
INSERT INTO daycare_facilities (title, description, sort_order) VALUES
  ('Full Time Care', '', 1),
  ('Part Time Care', '', 2),
  ('Holiday Care', '', 3),
  ('Tuition', '', 4),
  ('Projector and Toy Room', '', 5),
  ('AC & Power', '', 6),
  ('AC Transport', '', 7),
  ('CCTV', '', 8);

-- Seed gallery
INSERT INTO gallery (image_url, caption, sort_order) VALUES
  ('https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=600&q=80', 'Happy learning moments', 1),
  ('https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=600&q=80', 'Creative art time', 2),
  ('https://images.unsplash.com/photo-1560421337-19d275b5e265?w=600&q=80', 'Outdoor adventures', 3),
  ('https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600&q=80', 'Story time magic', 4),
  ('https://images.unsplash.com/photo-1544776193-352d25ca82cd?w=600&q=80', 'Music and movement', 5),
  ('https://images.unsplash.com/photo-1516627145497-ae6968895b74?w=600&q=80', 'Playful discovery', 6);

-- Seed settings
INSERT INTO settings (key, value) VALUES
  ('site', '{"slogan":"Knowledge is Power","hero_tagline":"Knowledge is Power","mission_quote":"Nurturing Minds, Building Future","mission":"To provide a safe, joyful, and stimulating cosmic learning environment where every child discovers their unique potential through play, exploration, and caring guidance.","vision":"To be the brightest star in early childhood education — shaping confident, curious, and compassionate young minds ready to explore the universe of knowledge.","daycare_quote":"Where every child finds a SPARK","phone":"+91 12345 67890","email":"info@twinklestars.com","address":"123 Starlight Avenue, Galaxy City","school_hours":"9:30 AM – 12:30 PM","daycare_hours":"8:00 AM – 8:00 PM"}'::jsonb)
ON CONFLICT (key) DO NOTHING;
