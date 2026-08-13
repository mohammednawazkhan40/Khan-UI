-- ═══════════════════════════════════════════════════════════════
-- Migration 0002 — Users table
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS users (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT NOT NULL,
  email       TEXT UNIQUE NOT NULL,
  password    TEXT NOT NULL,
  role        TEXT DEFAULT 'admin' CHECK (role IN ('admin','manager','staff','viewer')),
  phone       TEXT,
  active      BOOLEAN DEFAULT true,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Seed default admin (password: nawaz1234)
-- Generate a fresh hash at: https://bcrypt-generator.com
INSERT INTO users (name, email, password, role)
VALUES ('Nawaz Khan', 'nawaz@kmcardeals.com',
  '$2b$10$rOzJqQZ1QmV9Z2W3K4L5MOeP8Q9R0S1T2U3V4W5X6Y7Z8A9B0admin',
  'admin')
ON CONFLICT (email) DO NOTHING;
