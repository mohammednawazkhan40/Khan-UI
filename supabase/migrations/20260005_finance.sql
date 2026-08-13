-- ═══════════════════════════════════════════════════════════════
-- Migration 0005 — Finance Accounts table
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS finance_accounts (
  id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  finance_id              TEXT UNIQUE NOT NULL,
  customer_id             UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  customer_name           TEXT NOT NULL,
  customer_phone          TEXT,
  vehicle_id              UUID REFERENCES vehicles(id) ON DELETE SET NULL,
  vehicle_info            TEXT,
  vehicle_registration    TEXT,
  -- Finance company
  finance_company         TEXT NOT NULL,
  finance_person          TEXT NOT NULL,
  finance_person_phone    TEXT,
  -- Loan details
  vehicle_price           NUMERIC(12,2),
  down_payment            NUMERIC(12,2) DEFAULT 0,
  loan_amount             NUMERIC(12,2) NOT NULL,
  processing_fee          NUMERIC(10,2) DEFAULT 0,
  interest_rate           NUMERIC(5,2),
  tenure                  INTEGER,           -- months
  emi_amount              NUMERIC(10,2) NOT NULL,
  total_payable           NUMERIC(12,2),
  -- Progress
  total_installments      INTEGER NOT NULL,
  paid_installments       INTEGER DEFAULT 0,
  remaining_installments  INTEGER,
  total_paid              NUMERIC(12,2) DEFAULT 0,
  outstanding_amount      NUMERIC(12,2),
  -- Commission
  commission_amount       NUMERIC(10,2),
  commission_received     BOOLEAN DEFAULT false,
  commission_date         DATE,
  -- Dates
  disbursement_date       DATE,
  start_date              DATE NOT NULL,
  end_date                DATE,
  next_payment_date       DATE,
  last_payment_date       DATE,
  last_payment_amount     NUMERIC(10,2),
  -- Status
  status                  TEXT DEFAULT 'active'
                            CHECK (status IN ('pending','active','partially_paid','overdue','completed','cancelled')),
  notes                   TEXT,
  created_at              TIMESTAMPTZ DEFAULT NOW(),
  updated_at              TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_finance_status   ON finance_accounts(status);
CREATE INDEX IF NOT EXISTS idx_finance_customer ON finance_accounts(customer_id);
CREATE INDEX IF NOT EXISTS idx_finance_company  ON finance_accounts(finance_company);
CREATE INDEX IF NOT EXISTS idx_finance_next_pay ON finance_accounts(next_payment_date);
