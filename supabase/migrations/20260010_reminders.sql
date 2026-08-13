-- ═══════════════════════════════════════════════════════════════
-- Migration 0010 — Reminders table
-- ═══════════════════════════════════════════════════════════════
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
                    CHECK (status IN ('upcoming','due_today','overdue','completed','snoozed','cancelled')),
  repeat          TEXT DEFAULT 'none'
                    CHECK (repeat IN ('none','daily','weekly','monthly')),
  -- Linkages
  customer_id     UUID REFERENCES customers(id) ON DELETE SET NULL,
  customer_name   TEXT,
  vehicle_id      UUID REFERENCES vehicles(id) ON DELETE SET NULL,
  vehicle_info    TEXT,
  finance_id      UUID REFERENCES finance_accounts(id) ON DELETE SET NULL,
  rto_task_id     UUID REFERENCES rto_tasks(id) ON DELETE SET NULL,
  assigned_agent  TEXT,
  -- Pre-reminder days [7, 3, 1]
  pre_reminders   JSONB DEFAULT '[3,1]',
  notes           TEXT,
  -- Completion
  completed_at    TIMESTAMPTZ,
  completed_by    TEXT,
  -- Notifications
  whatsapp_sent   BOOLEAN DEFAULT false,
  sms_sent        BOOLEAN DEFAULT false,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reminders_due      ON reminders(due_date);
CREATE INDEX IF NOT EXISTS idx_reminders_status   ON reminders(status);
CREATE INDEX IF NOT EXISTS idx_reminders_priority ON reminders(priority);
CREATE INDEX IF NOT EXISTS idx_reminders_customer ON reminders(customer_id);
