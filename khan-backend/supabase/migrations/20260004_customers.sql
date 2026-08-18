-- ═══════════════════════════════════════════════════════════════
-- Migration 0004 — Customers table
-- ═══════════════════════════════════════════════════════════════
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
  aadhaar_ref             TEXT,    -- masked ref only, never full Aadhaar
  status                  TEXT DEFAULT 'active'
                            CHECK (status IN ('active','pending','overdue','settled','inactive')),
  source                  TEXT DEFAULT 'walk_in',
  -- Vehicle linkage
  vehicle_id              UUID REFERENCES vehicles(id) ON DELETE SET NULL,
  vehicle_registration    TEXT,
  vehicle_info            TEXT,
  -- Financials
  purchase_amount         NUMERIC(12,2) DEFAULT 0,
  amount_paid             NUMERIC(12,2) DEFAULT 0,
  amount_pending          NUMERIC(12,2) DEFAULT 0,
  -- Finance details
  finance_company         TEXT,
  finance_person          TEXT,
  finance_person_phone    TEXT,
  emi_amount              NUMERIC(10,2),
  emi_date                INTEGER,        -- day of month
  total_installments      INTEGER,
  paid_installments       INTEGER DEFAULT 0,
  remaining_installments  INTEGER,
  last_payment_date       DATE,
  next_payment_date       DATE,
  last_payment_amount     NUMERIC(10,2),
  -- Follow-up
  last_contact_date       DATE,
  next_follow_up_date     DATE,
  follow_up_notes         TEXT,
  -- Meta
  tags                    JSONB DEFAULT '[]',
  notes                   TEXT,
  created_at              TIMESTAMPTZ DEFAULT NOW(),
  updated_at              TIMESTAMPTZ DEFAULT NOW()
);

-- Now add FK from vehicles to customers
ALTER TABLE vehicles
  ADD CONSTRAINT fk_vehicles_customer
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_customers_status  ON customers(status);
CREATE INDEX IF NOT EXISTS idx_customers_phone   ON customers(phone);
CREATE INDEX IF NOT EXISTS idx_customers_name    ON customers(full_name);
CREATE INDEX IF NOT EXISTS idx_customers_vehicle ON customers(vehicle_id);
