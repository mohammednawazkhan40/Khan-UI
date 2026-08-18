-- ═══════════════════════════════════════════════════════════════
-- Migration 0009 — RTO Tasks table
-- ═══════════════════════════════════════════════════════════════
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
                                'noc_application','duplicate_rc','ownership_transfer','other'
                              )),
  status                    TEXT DEFAULT 'pending'
                              CHECK (status IN (
                                'pending','documents_pending','submitted',
                                'in_progress','completed','overdue','cancelled'
                              )),
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

CREATE INDEX IF NOT EXISTS idx_rto_status   ON rto_tasks(status);
CREATE INDEX IF NOT EXISTS idx_rto_priority ON rto_tasks(priority);
CREATE INDEX IF NOT EXISTS idx_rto_vehicle  ON rto_tasks(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_rto_deadline ON rto_tasks(expected_completion_date);
