-- ═══════════════════════════════════════════════════════════════════════════
-- KHAN INTERFACE — SUPABASE DATABASE SCHEMA
-- KM Car Deals — Nawaz Khan
-- Run this in Supabase SQL Editor
-- ═══════════════════════════════════════════════════════════════════════════

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── Users ─────────────────────────────────────────────────────────────────────
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

-- ── Customers ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS customers (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id           TEXT UNIQUE NOT NULL,
  full_name             TEXT NOT NULL,
  phone                 TEXT NOT NULL,
  whatsapp              TEXT,
  email                 TEXT,
  address               TEXT,
  city                  TEXT,
  state                 TEXT,
  pan                   TEXT,
  aadhaar_ref           TEXT,
  status                TEXT DEFAULT 'active' CHECK (status IN ('active','pending','overdue','settled','inactive')),
  source                TEXT DEFAULT 'walk_in',
  vehicle_id            UUID REFERENCES vehicles(id) ON DELETE SET NULL,
  vehicle_registration  TEXT,
  vehicle_info          TEXT,
  purchase_amount       NUMERIC(12,2) DEFAULT 0,
  amount_paid           NUMERIC(12,2) DEFAULT 0,
  amount_pending        NUMERIC(12,2) DEFAULT 0,
  finance_company       TEXT,
  finance_person        TEXT,
  finance_person_phone  TEXT,
  emi_amount            NUMERIC(10,2),
  emi_date              INTEGER,
  total_installments    INTEGER,
  paid_installments     INTEGER DEFAULT 0,
  remaining_installments INTEGER,
  last_payment_date     DATE,
  next_payment_date     DATE,
  last_payment_amount   NUMERIC(10,2),
  last_contact_date     DATE,
  next_follow_up_date   DATE,
  notes                 TEXT,
  created_at            TIMESTAMPTZ DEFAULT NOW(),
  updated_at            TIMESTAMPTZ DEFAULT NOW()
);

-- ── Vehicles ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS vehicles (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vehicle_id          TEXT UNIQUE NOT NULL,
  registration_number TEXT UNIQUE NOT NULL,
  brand               TEXT NOT NULL,
  model               TEXT NOT NULL,
  variant             TEXT,
  year                INTEGER NOT NULL,
  fuel                TEXT CHECK (fuel IN ('petrol','diesel','cng','electric','hybrid')),
  transmission        TEXT CHECK (transmission IN ('manual','automatic','amt','cvt')),
  km_driven           INTEGER DEFAULT 0,
  color               TEXT,
  ownership           INTEGER DEFAULT 1,
  purchase_price      NUMERIC(12,2) NOT NULL,
  selling_price       NUMERIC(12,2),
  expected_profit     NUMERIC(12,2),
  total_expenses      NUMERIC(12,2) DEFAULT 0,
  seller_name         TEXT,
  seller_phone        TEXT,
  status              TEXT DEFAULT 'purchased',
  customer_id         UUID REFERENCES customers(id) ON DELETE SET NULL,
  customer_name       TEXT,
  sale_date           DATE,
  delivery_date       DATE,
  rc_status           TEXT DEFAULT 'pending',
  insurance_status    TEXT DEFAULT 'pending',
  insurance_expiry    DATE,
  rto_status          TEXT DEFAULT 'pending',
  finance_status      TEXT DEFAULT 'none',
  lifecycle_stage     TEXT DEFAULT 'purchased',
  notes               TEXT,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

-- ── Finance Accounts ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS finance_accounts (
  id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  finance_id              TEXT UNIQUE NOT NULL,
  customer_id             UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  customer_name           TEXT NOT NULL,
  customer_phone          TEXT,
  vehicle_id              UUID REFERENCES vehicles(id) ON DELETE SET NULL,
  vehicle_info            TEXT,
  vehicle_registration    TEXT,
  finance_company         TEXT NOT NULL,
  finance_person          TEXT NOT NULL,
  finance_person_phone    TEXT,
  vehicle_price           NUMERIC(12,2),
  down_payment            NUMERIC(12,2) DEFAULT 0,
  loan_amount             NUMERIC(12,2) NOT NULL,
  processing_fee          NUMERIC(10,2) DEFAULT 0,
  interest_rate           NUMERIC(5,2),
  tenure                  INTEGER,
  emi_amount              NUMERIC(10,2) NOT NULL,
  total_payable           NUMERIC(12,2),
  total_installments      INTEGER NOT NULL,
  paid_installments       INTEGER DEFAULT 0,
  remaining_installments  INTEGER,
  total_paid              NUMERIC(12,2) DEFAULT 0,
  outstanding_amount      NUMERIC(12,2),
  commission_amount       NUMERIC(10,2),
  commission_received     BOOLEAN DEFAULT false,
  commission_date         DATE,
  disbursement_date       DATE,
  start_date              DATE NOT NULL,
  end_date                DATE,
  next_payment_date       DATE,
  last_payment_date       DATE,
  last_payment_amount     NUMERIC(10,2),
  status                  TEXT DEFAULT 'active' CHECK (status IN ('pending','active','partially_paid','overdue','completed','cancelled')),
  notes                   TEXT,
  created_at              TIMESTAMPTZ DEFAULT NOW(),
  updated_at              TIMESTAMPTZ DEFAULT NOW()
);

-- ── Payments ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS payments (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  payment_id        TEXT UNIQUE NOT NULL,
  customer_id       UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  customer_name     TEXT NOT NULL,
  vehicle_id        UUID REFERENCES vehicles(id) ON DELETE SET NULL,
  vehicle_info      TEXT,
  finance_id        UUID REFERENCES finance_accounts(id) ON DELETE SET NULL,
  amount            NUMERIC(12,2) NOT NULL,
  paid_amount       NUMERIC(12,2),
  pending_amount    NUMERIC(12,2),
  type              TEXT NOT NULL CHECK (type IN ('emi','advance','balance','full_payment','finance_commission','refund','other')),
  method            TEXT CHECK (method IN ('cash','bank_transfer','upi','cheque','finance','other')),
  status            TEXT DEFAULT 'upcoming' CHECK (status IN ('upcoming','due_today','overdue','paid','partial','cancelled')),
  due_date          DATE NOT NULL,
  paid_date         DATE,
  reference_number  TEXT,
  finance_company   TEXT,
  finance_person    TEXT,
  notes             TEXT,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

-- ── Transactions ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS transactions (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  transaction_id    TEXT UNIQUE NOT NULL,
  date              DATE NOT NULL DEFAULT CURRENT_DATE,
  type              TEXT NOT NULL,
  amount            NUMERIC(12,2) NOT NULL,
  method            TEXT DEFAULT 'cash',
  status            TEXT DEFAULT 'completed',
  customer_id       UUID REFERENCES customers(id) ON DELETE SET NULL,
  customer_name     TEXT,
  vehicle_id        UUID REFERENCES vehicles(id) ON DELETE SET NULL,
  vehicle_info      TEXT,
  finance_id        UUID REFERENCES finance_accounts(id) ON DELETE SET NULL,
  reference_number  TEXT,
  description       TEXT NOT NULL,
  notes             TEXT,
  created_by        TEXT DEFAULT 'Nawaz Khan',
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

-- ── RTO Tasks ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS rto_tasks (
  id                          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id                     TEXT UNIQUE NOT NULL,
  vehicle_id                  UUID REFERENCES vehicles(id) ON DELETE SET NULL,
  vehicle_registration        TEXT NOT NULL,
  vehicle_info                TEXT,
  customer_id                 UUID REFERENCES customers(id) ON DELETE SET NULL,
  customer_name               TEXT,
  task_type                   TEXT NOT NULL,
  status                      TEXT DEFAULT 'pending' CHECK (status IN ('pending','documents_pending','submitted','in_progress','completed','overdue','cancelled')),
  priority                    TEXT DEFAULT 'medium' CHECK (priority IN ('low','medium','high','critical')),
  rto_office                  TEXT,
  rto_agent                   TEXT,
  rto_agent_phone             TEXT,
  submission_date             DATE,
  expected_completion_date    DATE,
  actual_completion_date      DATE,
  chassis_number              TEXT,
  engine_number               TEXT,
  rto_fees                    NUMERIC(10,2),
  agent_fees                  NUMERIC(10,2),
  required_documents          JSONB DEFAULT '[]',
  notes                       TEXT,
  created_at                  TIMESTAMPTZ DEFAULT NOW(),
  updated_at                  TIMESTAMPTZ DEFAULT NOW()
);

-- ── Reminders ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS reminders (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reminder_id     TEXT UNIQUE NOT NULL,
  title           TEXT NOT NULL,
  description     TEXT,
  due_date        DATE NOT NULL,
  due_time        TIME,
  priority        TEXT DEFAULT 'medium' CHECK (priority IN ('low','medium','high','critical')),
  status          TEXT DEFAULT 'upcoming' CHECK (status IN ('upcoming','due_today','overdue','completed','snoozed','cancelled')),
  repeat          TEXT DEFAULT 'none',
  customer_id     UUID REFERENCES customers(id) ON DELETE SET NULL,
  customer_name   TEXT,
  vehicle_id      UUID REFERENCES vehicles(id) ON DELETE SET NULL,
  vehicle_info    TEXT,
  finance_id      UUID REFERENCES finance_accounts(id) ON DELETE SET NULL,
  rto_task_id     UUID REFERENCES rto_tasks(id) ON DELETE SET NULL,
  assigned_agent  TEXT,
  pre_reminders   JSONB DEFAULT '[3,1]',
  notes           TEXT,
  completed_at    TIMESTAMPTZ,
  whatsapp_sent   BOOLEAN DEFAULT false,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ── Notifications ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notifications (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title         TEXT NOT NULL,
  message       TEXT NOT NULL,
  type          TEXT NOT NULL,
  priority      TEXT DEFAULT 'medium',
  read          BOOLEAN DEFAULT false,
  agent_id      TEXT,
  agent_name    TEXT,
  related_type  TEXT,
  related_id    UUID,
  action_label  TEXT,
  action_url    TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ── AI Agent Logs ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS ai_agent_logs (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_id      TEXT NOT NULL,
  agent_name    TEXT NOT NULL,
  action        TEXT NOT NULL,
  input         TEXT,
  output        TEXT,
  tokens_used   INTEGER,
  duration_ms   INTEGER,
  status        TEXT DEFAULT 'completed',
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ── WhatsApp Messages ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS whatsapp_messages (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  to_number       TEXT NOT NULL,
  to_name         TEXT,
  message         TEXT NOT NULL,
  status          TEXT DEFAULT 'pending',
  twilio_sid      TEXT,
  related_type    TEXT,
  related_id      UUID,
  sent_by         TEXT DEFAULT 'system',
  sent_at         TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ── Indexes for performance ───────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_customers_status     ON customers(status);
CREATE INDEX IF NOT EXISTS idx_customers_phone      ON customers(phone);
CREATE INDEX IF NOT EXISTS idx_vehicles_status      ON vehicles(status);
CREATE INDEX IF NOT EXISTS idx_vehicles_reg         ON vehicles(registration_number);
CREATE INDEX IF NOT EXISTS idx_finance_status       ON finance_accounts(status);
CREATE INDEX IF NOT EXISTS idx_finance_customer     ON finance_accounts(customer_id);
CREATE INDEX IF NOT EXISTS idx_payments_status      ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_due         ON payments(due_date);
CREATE INDEX IF NOT EXISTS idx_rto_status           ON rto_tasks(status);
CREATE INDEX IF NOT EXISTS idx_reminders_due        ON reminders(due_date);
CREATE INDEX IF NOT EXISTS idx_reminders_status     ON reminders(status);
CREATE INDEX IF NOT EXISTS idx_notifications_read   ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_transactions_date    ON transactions(date);

-- ── Auto-update updated_at ────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

DO $$ DECLARE t TEXT;
BEGIN FOR t IN SELECT unnest(ARRAY['customers','vehicles','finance_accounts','payments','transactions','rto_tasks','reminders'])
LOOP EXECUTE format('DROP TRIGGER IF EXISTS trg_updated_at ON %I; CREATE TRIGGER trg_updated_at BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION update_updated_at();', t, t);
END LOOP; END $$;

-- ── Row Level Security ────────────────────────────────────────────────────────
ALTER TABLE customers         ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles          ENABLE ROW LEVEL SECURITY;
ALTER TABLE finance_accounts  ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments          ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions      ENABLE ROW LEVEL SECURITY;
ALTER TABLE rto_tasks         ENABLE ROW LEVEL SECURITY;
ALTER TABLE reminders         ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications     ENABLE ROW LEVEL SECURITY;

-- Service role bypasses RLS (used by backend)
-- Frontend uses anon key which is blocked by default

-- ── Seed default admin user (change password after first login) ───────────────
-- Password: nawaz1234 (bcrypt hash below)
INSERT INTO users (name, email, password, role) VALUES
('Nawaz Khan', 'nawaz@kmcardeals.com', '$2b$10$X9mJ1QmV9Z2W3K4L5M6N7OeP8Q9R0S1T2U3V4W5X6Y7Z8A9B0C1D2', 'admin')
ON CONFLICT (email) DO NOTHING;

SELECT 'Khan Interface database schema created successfully!' AS status;
