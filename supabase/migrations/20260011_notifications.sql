-- ═══════════════════════════════════════════════════════════════
-- Migration 0011 — Notifications table
-- ═══════════════════════════════════════════════════════════════
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

CREATE INDEX IF NOT EXISTS idx_notifications_read     ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_type     ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_priority ON notifications(priority);
CREATE INDEX IF NOT EXISTS idx_notifications_created  ON notifications(created_at DESC);
