'use client'
import { useEffect, useState } from 'react'
import { CreditCard, AlertTriangle, Clock, CheckCircle2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { StatusBadge } from '@/components/shared/status-badge'
import { PageHeader } from '@/components/shared/page-header'
import { Skeleton } from '@/components/ui/skeleton'
import { getPayments } from '@/lib/services'
import { formatCurrency, formatDate, daysAgo } from '@/lib/utils'
import type { Payment } from '@/types'
import { motion } from 'framer-motion'

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => { getPayments().then(setPayments).finally(() => setLoading(false)) }, [])

  const filtered = filter === 'all' ? payments : payments.filter(p => p.status === filter)

  return (
    <div className="space-y-5 pb-8">
      <PageHeader title="Payments" subtitle={`${payments.length} payment records`}>
        <Button variant="khan" size="sm">+ Add Payment</Button>
      </PageHeader>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {loading ? Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />) : [
          { label: 'Overdue',   val: payments.filter(p => p.status === 'overdue').length,   color: 'text-red-600',    icon: AlertTriangle },
          { label: 'Due Today', val: payments.filter(p => p.status === 'due_today').length, color: 'text-orange-600', icon: Clock },
          { label: 'Upcoming',  val: payments.filter(p => p.status === 'upcoming').length,  color: 'text-blue-600',   icon: CreditCard },
          { label: 'Paid',      val: payments.filter(p => p.status === 'paid').length,      color: 'text-green-600',  icon: CheckCircle2 },
        ].map(s => (
          <Card key={s.label}><CardContent className="p-4 flex items-center gap-3">
            <div className="w-9 h-9 bg-muted rounded-lg flex items-center justify-center"><s.icon className={`w-5 h-5 ${s.color}`} /></div>
            <div><div className={`text-xl font-bold ${s.color}`}>{s.val}</div><div className="text-xs text-muted-foreground">{s.label}</div></div>
          </CardContent></Card>
        ))}
      </div>

      <div className="flex gap-1.5 flex-wrap">
        {['all','overdue','due_today','upcoming','paid'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize border transition-all ${filter === f ? 'bg-khan-red text-white border-khan-red' : 'border-border hover:border-khan-red/50'}`}>
            {f.replace(/_/g,' ')}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {loading ? Array(6).fill(0).map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />) :
          filtered.map((p, i) => (
            <motion.div key={p.id} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
              <Card className={`hover:shadow-md transition-all ${p.status === 'overdue' ? 'border-red-200 dark:border-red-800 bg-red-50/30 dark:bg-red-950/20' : ''}`}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-sm">{p.customerName}</span>
                        <StatusBadge status={p.status} />
                        <Badge variant="outline" className="capitalize text-xs">{p.type.replace(/_/g,' ')}</Badge>
                      </div>
                      <div className="flex flex-wrap gap-3 text-xs text-muted-foreground mt-0.5">
                        {p.vehicleInfo && <span>{p.vehicleInfo}</span>}
                        {p.financeCompany && <span>{p.financeCompany}</span>}
                        <span>Due: <span className="font-medium text-foreground">{formatDate(p.dueDate)}</span></span>
                        {p.status === 'overdue' && <span className="text-red-600 font-medium">{daysAgo(p.dueDate)}d overdue</span>}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className={`text-base font-bold ${p.status === 'overdue' ? 'text-red-600' : 'text-foreground'}`}>{formatCurrency(p.amount)}</div>
                      {p.status === 'paid' && p.paidDate && <div className="text-xs text-green-600">Paid {formatDate(p.paidDate)}</div>}
                    </div>
                    <div className="flex gap-1.5 shrink-0">
                      {p.status !== 'paid' && <Button size="sm" variant="khan" className="h-7 text-xs">Mark Paid</Button>}
                      <Button size="sm" variant="outline" className="h-7 text-xs">Remind</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))
        }
      </div>
    </div>
  )
}
