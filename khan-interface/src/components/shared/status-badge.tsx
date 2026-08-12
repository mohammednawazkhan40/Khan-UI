import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface StatusBadgeProps {
  status: string
  className?: string
}

const statusConfig: Record<string, { label: string; variant: 'active' | 'pending' | 'overdue' | 'completed' | 'high' | 'critical' | 'medium' | 'low' | 'info' }> = {
  // Customer
  active:         { label: 'Active',          variant: 'active' },
  inactive:       { label: 'Inactive',        variant: 'medium' },
  overdue:        { label: 'Overdue',         variant: 'overdue' },
  settled:        { label: 'Settled',         variant: 'completed' },
  pending:        { label: 'Pending',         variant: 'pending' },
  // Vehicle
  purchased:      { label: 'Purchased',       variant: 'info' },
  inspection:     { label: 'Inspection',      variant: 'pending' },
  documents:      { label: 'Documents',       variant: 'pending' },
  rto_process:    { label: 'RTO Process',     variant: 'medium' },
  repair:         { label: 'Repair',          variant: 'medium' },
  listed:         { label: 'Listed',          variant: 'info' },
  enquiry:        { label: 'Enquiry',         variant: 'info' },
  booked:         { label: 'Booked',          variant: 'high' },
  payment_pending:{ label: 'Pmt Pending',     variant: 'high' },
  finance_pending:{ label: 'Finance Pending', variant: 'pending' },
  delivered:      { label: 'Delivered',       variant: 'active' },
  completed:      { label: 'Completed',       variant: 'completed' },
  available:      { label: 'Available',       variant: 'active' },
  // Finance
  partially_paid: { label: 'Partial',         variant: 'medium' },
  cancelled:      { label: 'Cancelled',       variant: 'low' },
  // RTO
  documents_pending: { label: 'Docs Pending', variant: 'overdue' },
  submitted:      { label: 'Submitted',       variant: 'info' },
  in_progress:    { label: 'In Progress',     variant: 'pending' },
  // Payment
  due_today:      { label: 'Due Today',       variant: 'high' },
  upcoming:       { label: 'Upcoming',        variant: 'info' },
  paid:           { label: 'Paid',            variant: 'active' },
  partial:        { label: 'Partial',         variant: 'medium' },
  // Reminder
  snoozed:        { label: 'Snoozed',         variant: 'low' },
  // Agent
  online:         { label: 'Online',          variant: 'active' },
  thinking:       { label: 'Thinking…',       variant: 'info' },
  working:        { label: 'Working',         variant: 'pending' },
  attention_required: { label: 'Attention!',  variant: 'overdue' },
  offline:        { label: 'Offline',         variant: 'low' },
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const cfg = statusConfig[status] ?? { label: status, variant: 'info' as const }
  return <Badge variant={cfg.variant} className={cn('capitalize', className)}>{cfg.label}</Badge>
}

export function PriorityBadge({ priority, className }: { priority: string; className?: string }) {
  const map: Record<string, 'critical' | 'high' | 'medium' | 'low'> = {
    critical: 'critical', high: 'high', medium: 'medium', low: 'low',
  }
  const dots: Record<string, string> = {
    critical: '🔴', high: '🟠', medium: '🟡', low: '🟢',
  }
  return (
    <Badge variant={map[priority] ?? 'low'} className={cn('capitalize', className)}>
      {dots[priority]} {priority}
    </Badge>
  )
}
