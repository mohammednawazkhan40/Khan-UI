-- ═══════════════════════════════════════════════════════════════
-- Migration 0007 — Transactions table
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS transactions (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  transaction_id    TEXT UNIQUE NOT NULL,
  date              DATE NOT NULL DEFAULT CURRENT_DATE,
  type              TEXT NOT NULL
                      CHECK (type IN (
                        'vehicle_purchase','vehicle_sale','customer_payment',
                        'finance_received','advance_received','expense','commission',
                        'refund','brokerage','rto_expense','repair_expense',
                        'insurance_expense','transportation','other'
                      )),
  amount            NUMERIC(12,2) NOT NULL,
  method            TEXT DEFAULT 'cash'
                      CHECK (method IN ('cash','bank_transfer','upi','cheque','finance','other')),
  status            TEXT DEFAULT 'completed'
                      CHECK (status IN ('pending','completed','failed','cancelled')),
  -- Linkages
  customer_id       UUID REFERENCES customers(id) ON DELETE SET NULL,
  customer_name     TEXT,
  vehicle_id        UUID REFERENCES vehicles(id) ON DELETE SET NULL,
  vehicle_info      TEXT,
  finance_id        UUID REFERENCES finance_accounts(id) ON DELETE SET NULL,
  -- Reference
  reference_number  TEXT,
  bank_name         TEXT,
  cheque_number     TEXT,
  upi_id            TEXT,
  -- Meta
  description       TEXT NOT NULL,
  notes             TEXT,
  created_by        TEXT DEFAULT 'Nawaz Khan',
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_transactions_date     ON transactions(date);
CREATE INDEX IF NOT EXISTS idx_transactions_type     ON transactions(type);
CREATE INDEX IF NOT EXISTS idx_transactions_customer ON transactions(customer_id);
