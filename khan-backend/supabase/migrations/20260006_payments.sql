-- ═══════════════════════════════════════════════════════════════
-- Migration 0006 — Payments table
-- ═══════════════════════════════════════════════════════════════
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
  method            TEXT CHECK (method IN ('cash','bank_transfer','upi','cheque','finance','other')),
  status            TEXT DEFAULT 'upcoming'
                      CHECK (status IN ('upcoming','due_today','overdue','paid','partial','cancelled')),
  due_date          DATE NOT NULL,
  paid_date         DATE,
  reference_number  TEXT,
  finance_company   TEXT,
  finance_person    TEXT,
  receipt_url       TEXT,
  notes             TEXT,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payments_status     ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_due        ON payments(due_date);
CREATE INDEX IF NOT EXISTS idx_payments_customer   ON payments(customer_id);
CREATE INDEX IF NOT EXISTS idx_payments_finance    ON payments(finance_id);
