'use client'
import { useEffect, useState } from 'react'
import { Shield, CheckCircle2, AlertTriangle, Clock, FileX } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { StatusBadge, PriorityBadge } from '@/components/shared/status-badge'
import { PageHeader } from '@/components/shared/page-header'
import { Skeleton } from '@/components/ui/skeleton'
import { getRTOTasks } from '@/lib/services'
import { formatDate } from '@/lib/utils'
import type { RTOTask } from '@/types'
import { motion } from 'framer-motion'

export default function RTOPage() {
  const [tasks, setTasks] = useState<RTOTask[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => { getRTOTasks().then(setTasks).finally(() => setLoading(false)) }, [])

  const filtered = filter === 'all' ? tasks : tasks.filter(t => t.status === filter || t.priority === filter)
  const pending = tasks.filter(t => !['completed','cancelled'].includes(t.status))
  const critical = tasks.filter(t => t.priority === 'critical')
  const docPending = tasks.filter(t => t.requiredDocuments.some(d => d.required && !d.received))

  return (
    <div className="space-y-5 pb-8">
      <PageHeader title="RTO Manager" subtitle={`${tasks.length} tasks · ${pending.length} pending`}>
        <Button variant="khan" size="sm">+ New RTO Task</Button>
      </PageHeader>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {loading ? Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />) : [
          { label: 'Pending',          val: pending.length,                                           color: 'text-orange-600', icon: Clock },
          { label: 'Critical',         val: critical.length,                                          color: 'text-red-600',    icon: AlertTriangle },
          { label: 'Docs Pending',     val: docPending.length,                                        color: 'text-yellow-600', icon: FileX },
          { label: 'Completed',        val: tasks.filter(t => t.status === 'completed').length,       color: 'text-green-600',  icon: CheckCircle2 },
        ].map(s => (
          <Card key={s.label}><CardContent className="p-4 flex items-center gap-3">
            <div className="w-9 h-9 bg-muted rounded-lg flex items-center justify-center shrink-0"><s.icon className={`w-5 h-5 ${s.color}`} /></div>
            <div><div className={`text-xl font-bold ${s.color}`}>{s.val}</div><div className="text-xs text-muted-foreground">{s.label}</div></div>
          </CardContent></Card>
        ))}
      </div>

      {/* Filter bar */}
      <div className="flex gap-1.5 flex-wrap">
        {['all','pending','documents_pending','submitted','in_progress','completed'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize border transition-all ${filter === f ? 'bg-khan-red text-white border-khan-red' : 'border-border hover:border-khan-red/50'}`}>
            {f.replace(/_/g,' ')}
          </button>
        ))}
      </div>

      {/* Task list */}
      {loading ? Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-36 rounded-xl" />) :
        <div className="space-y-3">
          {filtered.map((t, i) => {
            const missingDocs = t.requiredDocuments.filter(d => d.required && !d.received)
            return (
              <motion.div key={t.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Card className={`transition-all hover:shadow-md ${t.priority === 'critical' ? 'border-red-300 dark:border-red-700 bg-red-50/30 dark:bg-red-950/20' : t.priority === 'high' ? 'border-orange-200 dark:border-orange-800' : ''}`}>
                  <CardContent className="p-4">
                    <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono font-bold text-sm">{t.vehicleRegistration}</span>
                          <StatusBadge status={t.status} />
                          <PriorityBadge priority={t.priority} />
                        </div>
                        <p className="text-sm text-muted-foreground mt-0.5">{t.vehicleInfo}</p>
                        {t.customerName && <p className="text-xs text-muted-foreground">Customer: {t.customerName}</p>}
                        <div className="flex flex-wrap gap-3 mt-1 text-xs text-muted-foreground">
                          <span>Task: <span className="capitalize font-medium text-foreground">{t.taskType.replace(/_/g,' ')}</span></span>
                          <span>RTO: {t.rtoOffice}</span>
                          {t.rtoAgent && <span>Agent: {t.rtoAgent}</span>}
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        {t.expectedCompletionDate && <div className="text-xs"><span className="text-muted-foreground">Deadline: </span><span className={`font-semibold ${t.priority === 'critical' ? 'text-red-600' : ''}`}>{formatDate(t.expectedCompletionDate)}</span></div>}
                        {t.submissionDate && <div className="text-xs text-muted-foreground">Submitted: {formatDate(t.submissionDate)}</div>}
                        {t.actualCompletionDate && <div className="text-xs text-green-600">Completed: {formatDate(t.actualCompletionDate)}</div>}
                        {(t.rtoFees || t.agentFees) && (
                          <div className="text-xs text-muted-foreground mt-1">Fees: ₹{((t.rtoFees ?? 0) + (t.agentFees ?? 0)).toLocaleString('en-IN')}</div>
                        )}
                      </div>
                    </div>

                    {/* Documents */}
                    <div className="flex flex-wrap gap-1.5">
                      {t.requiredDocuments.map(d => (
                        <Badge key={d.id} variant={d.received ? 'active' : d.required ? 'overdue' : 'medium'} className="text-xs">
                          {d.received ? '✓' : '✗'} {d.name}
                        </Badge>
                      ))}
                    </div>

                    {missingDocs.length > 0 && (
                      <div className="mt-2 p-2 bg-red-50 dark:bg-red-950/40 rounded-lg text-xs text-red-700 dark:text-red-400">
                        Missing: {missingDocs.map(d => d.name).join(', ')}
                      </div>
                    )}
                    {t.notes && <p className="text-xs text-muted-foreground mt-2 bg-muted rounded p-2">{t.notes}</p>}

                    <div className="flex gap-2 mt-3">
                      <Button size="sm" variant="outline" className="text-xs h-7">Update Status</Button>
                      <Button size="sm" variant="outline" className="text-xs h-7">Add Document</Button>
                      {t.status !== 'completed' && <Button size="sm" variant="khan" className="text-xs h-7">Mark Complete</Button>}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>
      }
    </div>
  )
}
