-- ═══════════════════════════════════════════════════════════════════════════
-- KHAN INTERFACE — SUPABASE SCHEMA
-- KM Car Deals — Nawaz Khan
--
-- PASTE THIS ENTIRE FILE into Supabase → SQL Editor → Run
-- Tables are created in correct dependency order (no forward references)
-- ═══════════════════════════════════════════════════════════════════════════

-- ── 1. Extensions ─────────────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ── 2. Updated-at trigger function ───────────────────────────────────────────
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ── 3. Users ──────────────────────────────────────────────────────────────────
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

-- ── 4. Vehicles (no FK to customers yet) ─────────────────────────────────────
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
  purchase_price      NUMERIC(12,2) NOT NULL DEFAULT 0,
  selling_price       NUMERIC(12,2),
  expected_profit     NUMERIC(12,2),
  total_expenses      NUMERIC(12,2) DEFAULT 0,
  seller_name         TEXT,
  seller_phone        TEXT,
  status              TEXT DEFAULT 'purchased',
  customer_id         UUID,               -- FK added later after customers table
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

-- ── 5. Customers (references vehicles) ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS customers (
  id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id             TEXT UNIQUE NOT NULL,
  full_name               TEXT NOT NULL,
  phone                   TEXT NOT NULL,
  whatsapp                TEXT,
  email                   TEXT,
  address                 TEXT,
  city                    TEXT,
  state                   TEXT,
  pan                     TEXT,
  aadhaar_ref             TEXT,
  status                  TEXT DEFAULT 'active'
                            CHECK (status IN ('active','pending','overdue','settled','inactive')),
  source                  TEXT DEFAULT 'walk_in',
  vehicle_id              UUID REFERENCES vehicles(id) ON DELETE SET NULL,
  vehicle_registration    TEXT,
  vehicle_info            TEXT,
  purchase_amount         NUMERIC(12,2) DEFAULT 0,
  amount_paid             NUMERIC(12,2) DEFAULT 0,
  amount_pending          NUMERIC(12,2) DEFAULT 0,
  finance_company         TEXT,
  finance_person          TEXT,
  finance_person_phone    TEXT,
  emi_amount              NUMERIC(10,2),
  emi_date                INTEGER,
  total_installments      INTEGER,
  paid_installments       INTEGER DEFAULT 0,
  remaining_installments  INTEGER,
  last_payment_date       DATE,
  next_payment_date       DATE,
  last_payment_amount     NUMERIC(10,2),
  last_contact_date       DATE,
  next_follow_up_date     DATE,
  notes                   TEXT,
  created_at              TIMESTAMPTZ DEFAULT NOW(),
  updated_at              TIMESTAMPTZ DEFAULT NOW()
);

-- ── 6. Add FK from vehicles → customers (now that customers exists) ───────────
ALTER TABLE vehicles
  ADD CONSTRAINT fk_vehicles_customer
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL;

-- ── 7. Finance Accounts ───────────────────────────────────────────────────────
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
  status                  TEXT DEFAULT 'active'
                            CHECK (status IN ('pending','active','partially_paid',
                                              'overdue','completed','cancelled')),
  notes                   TEXT,
  created_at              TIMESTAMPTZ DEFAULT NOW(),
  updated_at              TIMESTAMPTZ DEFAULT NOW()
);

-- ── 8. Payments ───────────────────────────────────────────────────────────────
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
  type              TEXT NOT NULL
                      CHECK (type IN ('emi','advance','balance','full_payment',
                                      'finance_commission','refund','other')),
  method            TEXT CHECK (method IN ('cash','bank_transfer','upi',
                                           'cheque','finance','other')),
  status            TEXT DEFAULT 'upcoming'
                      CHECK (status IN ('upcoming','due_today','overdue',
                                        'paid','partial','cancelled')),
  due_date          DATE NOT NULL,
  paid_date         DATE,
  reference_number  TEXT,
  finance_company   TEXT,
  finance_person    TEXT,
  notes             TEXT,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

-- ── 9. Transactions ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS transactions (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  transaction_id    TEXT UNIQUE NOT NULL,
  date              DATE NOT NULL DEFAULT CURRENT_DATE,
  type              TEXT NOT NULL
                      CHECK (type IN (
                        'vehicle_purchase','vehicle_sale','customer_payment',
                        'finance_received','advance_received','expense',
                        'commission','refund','brokerage','rto_expense',
                        'repair_expense','insurance_expense','transportation','other'
                      )),
  amount            NUMERIC(12,2) NOT NULL,
  method            TEXT DEFAULT 'cash'
                      CHECK (method IN ('cash','bank_transfer','upi',
                                        'cheque','finance','other')),
  status            TEXT DEFAULT 'completed'
                      CHECK (status IN ('pending','completed','failed','cancelled')),
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

-- ── 10. RTO Tasks ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS rto_tasks (
  id                        UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id                   TEXT UNIQUE NOT NULL,
  vehicle_id                UUID REFERENCES vehicles(id) ON DELETE SET NULL,
  vehicle_registration      TEXT NOT NULL,
  vehicle_info              TEXT,
  customer_id               UUID REFERENCES customers(id) ON DELETE SET NULL,
  customer_name             TEXT,
  task_type                 TEXT NOT NULL
                              CHECK (task_type IN (
                                'rc_transfer','rc_renewal','address_change',
                                'hypothecation_addition','hypothecation_removal',
                                'noc_application','duplicate_rc',
                                'ownership_transfer','other'
                              )),
  status                    TEXT DEFAULT 'pending'
                              CHECK (status IN ('pending','documents_pending',
                                                'submitted','in_progress',
                                                'completed','overdue','cancelled')),
  priority                  TEXT DEFAULT 'medium'
                              CHECK (priority IN ('low','medium','high','critical')),
  rto_office                TEXT,
  rto_agent                 TEXT,
  rto_agent_phone           TEXT,
  submission_date           DATE,
  expected_completion_date  DATE,
  actual_completion_date    DATE,
  chassis_number            TEXT,
  engine_number             TEXT,
  rto_fees                  NUMERIC(10,2),
  agent_fees                NUMERIC(10,2),
  required_documents        JSONB DEFAULT '[]',
  notes                     TEXT,
  created_at                TIMESTAMPTZ DEFAULT NOW(),
  updated_at                TIMESTAMPTZ DEFAULT NOW()
);

-- ── 11. Reminders ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS reminders (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reminder_id     TEXT UNIQUE NOT NULL,
  title           TEXT NOT NULL,
  description     TEXT,
  due_date        DATE NOT NULL,
  due_time        TIME,
  priority        TEXT DEFAULT 'medium'
                    CHECK (priority IN ('low','medium','high','critical')),
  status          TEXT DEFAULT 'upcoming'
                    CHECK (status IN ('upcoming','due_today','overdue',
                                      'completed','snoozed','cancelled')),
  repeat          TEXT DEFAULT 'none'
                    CHECK (repeat IN ('none','daily','weekly','monthly')),
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
  completed_by    TEXT,
  whatsapp_sent   BOOLEAN DEFAULT false,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ── 12. Notifications ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notifications (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title         TEXT NOT NULL,
  message       TEXT NOT NULL,
  type          TEXT NOT NULL
                  CHECK (type IN (
                    'payment_overdue','payment_due','rto_due','insurance_expiry',
                    'new_lead','vehicle_sold','finance_received','document_missing',
                    'ai_alert','ai_completed','reminder_due','general'
                  )),
  priority      TEXT DEFAULT 'medium'
                  CHECK (priority IN ('low','medium','high','critical')),
  read          BOOLEAN DEFAULT false,
  agent_id      TEXT,
  agent_name    TEXT,
  related_type  TEXT,
  related_id    UUID,
  action_label  TEXT,
  action_url    TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ── 13. AI Agent Logs ─────────────────────────────────────────────────────────
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

-- ── 14. WhatsApp Messages ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS whatsapp_messages (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  to_number     TEXT NOT NULL,
  to_name       TEXT,
  message       TEXT NOT NULL,
  status        TEXT DEFAULT 'pending',
  twilio_sid    TEXT,
  related_type  TEXT,
  related_id    UUID,
  sent_by       TEXT DEFAULT 'system',
  sent_at       TIMESTAMPTZ,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ── 15. Indexes ───────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_customers_status     ON customers(status);
CREATE INDEX IF NOT EXISTS idx_customers_phone      ON customers(phone);
CREATE INDEX IF NOT EXISTS idx_customers_name       ON customers(full_name);
CREATE INDEX IF NOT EXISTS idx_vehicles_status      ON vehicles(status);
CREATE INDEX IF NOT EXISTS idx_vehicles_reg         ON vehicles(registration_number);
CREATE INDEX IF NOT EXISTS idx_finance_status       ON finance_accounts(status);
CREATE INDEX IF NOT EXISTS idx_finance_customer     ON finance_accounts(customer_id);
CREATE INDEX IF NOT EXISTS idx_finance_next_pay     ON finance_accounts(next_payment_date);
CREATE INDEX IF NOT EXISTS idx_payments_status      ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_due         ON payments(due_date);
CREATE INDEX IF NOT EXISTS idx_transactions_date    ON transactions(date);
CREATE INDEX IF NOT EXISTS idx_transactions_type    ON transactions(type);
CREATE INDEX IF NOT EXISTS idx_rto_status           ON rto_tasks(status);
CREATE INDEX IF NOT EXISTS idx_rto_priority         ON rto_tasks(priority);
CREATE INDEX IF NOT EXISTS idx_rto_deadline         ON rto_tasks(expected_completion_date);
CREATE INDEX IF NOT EXISTS idx_reminders_due        ON reminders(due_date);
CREATE INDEX IF NOT EXISTS idx_reminders_status     ON reminders(status);
CREATE INDEX IF NOT EXISTS idx_notifications_read   ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications(created_at DESC);

-- ── 16. Auto-updated_at triggers ─────────────────────────────────────────────
DO $$
DECLARE t TEXT;
BEGIN
  FOR t IN SELECT unnest(ARRAY[
    'users','vehicles','customers','finance_accounts',
    'payments','transactions','rto_tasks','reminders'
  ])
  LOOP
    EXECUTE format(
      'DROP TRIGGER IF EXISTS trg_%I_updated_at ON %I;
       CREATE TRIGGER trg_%I_updated_at
       BEFORE UPDATE ON %I
       FOR EACH ROW EXECUTE FUNCTION set_updated_at();',
      t, t, t, t
    );
  END LOOP;
END $$;

-- ── 17. Row Level Security ────────────────────────────────────────────────────
-- Backend uses service_role key → bypasses RLS automatically
-- Anon/public access is blocked by default
ALTER TABLE users             ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers         ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles          ENABLE ROW LEVEL SECURITY;
ALTER TABLE finance_accounts  ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments          ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions      ENABLE ROW LEVEL SECURITY;
ALTER TABLE rto_tasks         ENABLE ROW LEVEL SECURITY;
ALTER TABLE reminders         ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications     ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_agent_logs     ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_messages ENABLE ROW LEVEL SECURITY;

-- ── 18. Seed admin user ───────────────────────────────────────────────────────
-- Default password is: nawaz1234
-- CHANGE THIS after first login via Settings page
-- Hash generated with bcrypt rounds=10
INSERT INTO users (name, email, password, role)
VALUES (
  'Nawaz Khan',
  'nawaz@kmcardeals.com',
  '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.',
  'admin'
)
ON CONFLICT (email) DO NOTHING;

-- ── Done ─────────────────────────────────────────────────────────────────────
SELECT
  'Khan Interface database ready!' AS status,
  COUNT(*) AS tables_created
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE';
