'use client'
import { useEffect, useState } from 'react'
import { Wallet, AlertTriangle, CheckCircle2, Clock, ChevronRight, TrendingDown } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { StatusBadge } from '@/components/shared/status-badge'
import { PageHeader } from '@/components/shared/page-header'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { getFinanceAccounts, getFinancePersons } from '@/lib/services'
import { formatCurrency, formatDate, percentage } from '@/lib/utils'
import type { FinanceAccount, FinancePerson } from '@/types'
import { motion } from 'framer-motion'

export default function FinancePage() {
  const [accounts, setAccounts] = useState<FinanceAccount[]>([])
  const [persons, setPersons] = useState<FinancePerson[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([getFinanceAccounts(), getFinancePersons()])
      .then(([a, p]) => { setAccounts(a); setPersons(p) })
      .finally(() => setLoading(false))
  }, [])

  const totalOutstanding = accounts.reduce((s, a) => s + a.outstandingAmount, 0)
  const totalPaid        = accounts.reduce((s, a) => s + a.totalPaid, 0)
  const overdue          = accounts.filter(a => a.status === 'overdue')
  const commPending      = accounts.filter(a => !a.commissionReceived).reduce((s, a) => s + (a.commissionAmount ?? 0), 0)

  return (
    <div className="space-y-5 pb-8">
      <PageHeader title="Finance Management" subtitle={`${accounts.length} finance accounts · ${overdue.length} overdue`}>
        <Button variant="khan" size="sm">+ Add Finance Record</Button>
      </PageHeader>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {loading ? Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />) : [
          { label: 'Total Outstanding', val: formatCurrency(totalOutstanding), color: 'text-red-600',    icon: TrendingDown },
          { label: 'Total Collected',   val: formatCurrency(totalPaid),        color: 'text-green-600',  icon: CheckCircle2 },
          { label: 'Overdue Accounts',  val: String(overdue.length),           color: 'text-orange-600', icon: AlertTriangle },
          { label: 'Commission Pending',val: formatCurrency(commPending),      color: 'text-purple-600', icon: Wallet },
        ].map(s => (
          <Card key={s.label}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-9 h-9 bg-muted rounded-lg flex items-center justify-center shrink-0">
                <s.icon className={`w-5 h-5 ${s.color}`} />
              </div>
              <div>
                <div className={`text-lg font-bold ${s.color}`}>{s.val}</div>
                <div className="text-xs text-muted-foreground">{s.label}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="accounts">
        <TabsList><TabsTrigger value="accounts">Accounts</TabsTrigger><TabsTrigger value="persons">Finance Persons</TabsTrigger></TabsList>

        <TabsContent value="accounts" className="space-y-2 mt-4">
          {loading ? Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />) :
            accounts.map((a, i) => (
              <motion.div key={a.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                <Card className={`hover:shadow-md transition-all ${a.status === 'overdue' ? 'border-red-200 dark:border-red-800 bg-red-50/30 dark:bg-red-950/20' : ''}`}>
                  <CardContent className="p-4">
                    <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-sm">{a.customerName}</span>
                          <StatusBadge status={a.status} />
                          {!a.commissionReceived && <Badge variant="medium">Commission Pending</Badge>}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">{a.vehicleInfo} · {a.vehicleRegistration}</p>
                        <p className="text-xs text-muted-foreground">{a.financeCompany} · {a.financePerson}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-base font-bold text-khan-red">{formatCurrency(a.outstandingAmount)}</div>
                        <div className="text-xs text-muted-foreground">outstanding</div>
                        <div className="text-xs font-medium text-muted-foreground">{formatCurrency(a.emiAmount)}/mo</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Progress value={percentage(a.paidInstallments, a.totalInstallments)} className="flex-1 h-2" />
                      <span className="text-xs text-muted-foreground whitespace-nowrap">{a.paidInstallments}/{a.totalInstallments}</span>
                    </div>
                    <div className="flex flex-wrap gap-4 mt-2 text-xs text-muted-foreground">
                      <span>Next: <span className="font-medium text-foreground">{formatDate(a.nextPaymentDate)}</span></span>
                      <span>Last: {formatDate(a.lastPaymentDate)}</span>
                      <span>Rate: {a.interestRate}%</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          }
        </TabsContent>

        <TabsContent value="persons" className="space-y-2 mt-4">
          {persons.map(p => (
            <Card key={p.id} className="hover:shadow-md transition-all">
              <CardContent className="p-4">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div>
                    <p className="font-semibold">{p.name}</p>
                    <p className="text-sm text-muted-foreground">{p.company} · {p.phone}</p>
                    <p className="text-xs text-muted-foreground mt-1">{p.totalAccounts} accounts · {p.activeAccounts} active</p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-khan-red">{formatCurrency(p.totalOutstanding)}</div>
                    <div className="text-xs text-muted-foreground">outstanding</div>
                    {p.commissionPending > 0 && (
                      <div className="text-xs font-semibold text-orange-600 mt-0.5">Comm: {formatCurrency(p.commissionPending)}</div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  )
}
