-- ═══════════════════════════════════════════════════════════════
-- Migration 0008 — Vehicle Expenses table
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS vehicle_expenses (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  expense_id      TEXT UNIQUE NOT NULL,
  vehicle_id      UUID REFERENCES vehicles(id) ON DELETE CASCADE,
  vehicle_info    TEXT,
  category        TEXT NOT NULL
                    CHECK (category IN ('repair','service','rto','insurance',
                                        'transportation','cleaning','advertising',
                                        'rent','salary','utilities','brokerage','other')),
  description     TEXT NOT NULL,
  amount          NUMERIC(12,2) NOT NULL,
  date            DATE NOT NULL DEFAULT CURRENT_DATE,
  vendor          TEXT,
  payment_method  TEXT DEFAULT 'cash',
  receipt_url     TEXT,
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_expenses_vehicle  ON vehicle_expenses(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_expenses_category ON vehicle_expenses(category);
CREATE INDEX IF NOT EXISTS idx_expenses_date     ON vehicle_expenses(date);
