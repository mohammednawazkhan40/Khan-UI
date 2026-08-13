-- ═══════════════════════════════════════════════════════════════
-- Migration 0003 — Vehicles table (must come BEFORE customers)
-- ═══════════════════════════════════════════════════════════════
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
  seller_address      TEXT,
  status              TEXT DEFAULT 'purchased',
  customer_id         UUID,  -- FK added later after customers table
  customer_name       TEXT,
  sale_date           DATE,
  delivery_date       DATE,
  rc_status           TEXT DEFAULT 'pending',
  insurance_status    TEXT DEFAULT 'pending',
  insurance_expiry    DATE,
  rto_status          TEXT DEFAULT 'pending',
  finance_status      TEXT DEFAULT 'none',
  lifecycle_stage     TEXT DEFAULT 'purchased',
  images              JSONB DEFAULT '[]',
  notes               TEXT,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_vehicles_status ON vehicles(status);
CREATE INDEX IF NOT EXISTS idx_vehicles_reg    ON vehicles(registration_number);
CREATE INDEX IF NOT EXISTS idx_vehicles_brand  ON vehicles(brand);
