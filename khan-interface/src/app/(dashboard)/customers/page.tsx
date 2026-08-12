'use client'
import { useEffect, useState } from 'react'
import { Search, Plus, Filter, Phone, MessageCircle, ChevronRight } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { StatusBadge } from '@/components/shared/status-badge'
import { PageHeader } from '@/components/shared/page-header'
import { Skeleton } from '@/components/ui/skeleton'
import { getCustomers } from '@/lib/services'
import { formatCurrency, formatDate, initials } from '@/lib/utils'
import type { Customer } from '@/types'
import Link from 'next/link'
import { motion } from 'framer-motion'

const STATUS_FILTERS = ['all', 'active', 'overdue', 'pending', 'settled']

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => {
    getCustomers().then(setCustomers).finally(() => setLoading(false))
  }, [])

  const filtered = customers.filter(c => {
    const matchSearch = !search || c.fullName.toLowerCase().includes(search.toLowerCase()) || c.phone.includes(search) || (c.vehicleRegistration ?? '').toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'all' || c.status === statusFilter
    return matchSearch && matchStatus
  })

  return (
    <div className="space-y-5 pb-8">
      <PageHeader title="Customers" subtitle={`${customers.length} total customers`}>
        <Button variant="khan" size="sm" className="gap-1.5">
          <Plus className="w-4 h-4" /> Add Customer
        </Button>
      </PageHeader>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search name, phone, registration…" className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {STATUS_FILTERS.map(s => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all capitalize border ${statusFilter === s ? 'bg-khan-red text-white border-khan-red' : 'border-border hover:border-khan-red/50 hover:bg-muted'}`}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Customers', val: customers.length, color: 'text-blue-600' },
          { label: 'Active', val: customers.filter(c => c.status === 'active').length, color: 'text-green-600' },
          { label: 'Overdue', val: customers.filter(c => c.status === 'overdue').length, color: 'text-red-600' },
          { label: 'Total Outstanding', val: formatCurrency(customers.reduce((s, c) => s + c.amountPending, 0)), color: 'text-purple-600' },
        ].map(s => (
          <Card key={s.label}>
            <CardContent className="p-4">
              <div className={`text-xl font-bold ${s.color}`}>{s.val}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{s.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Customer list */}
      {loading ? (
        <div className="space-y-2">{Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}</div>
      ) : (
        <div className="space-y-2">
          {filtered.map((c, i) => (
            <motion.div key={c.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
              <Link href={`/customers/${c.id}`}>
                <Card className="hover:shadow-md hover:border-khan-red/30 transition-all cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      {/* Avatar */}
                      <div className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 font-bold text-sm ${c.status === 'overdue' ? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400' : 'bg-muted text-muted-foreground'}`}>
                        {initials(c.fullName)}
                      </div>
                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-sm">{c.fullName}</span>
                          <span className="text-xs text-muted-foreground">{c.customerId}</span>
                          <StatusBadge status={c.status} />
                        </div>
                        <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1 text-xs text-muted-foreground">
                          <span>{c.phone}</span>
                          {c.vehicleInfo && <span className="truncate max-w-[180px]">{c.vehicleInfo}</span>}
                          {c.vehicleRegistration && <span className="font-mono">{c.vehicleRegistration}</span>}
                        </div>
                      </div>
                      {/* Finance */}
                      <div className="hidden sm:block text-right shrink-0">
                        {c.amountPending > 0 ? (
                          <>
                            <div className={`text-sm font-bold ${c.status === 'overdue' ? 'text-red-600' : 'text-foreground'}`}>{formatCurrency(c.amountPending)}</div>
                            <div className="text-xs text-muted-foreground">outstanding</div>
                          </>
                        ) : (
                          <Badge variant="active">Settled</Badge>
                        )}
                      </div>
                      {/* EMI */}
                      <div className="hidden md:block text-right shrink-0 pl-4">
                        {c.emiAmount && (
                          <>
                            <div className="text-sm font-semibold">{formatCurrency(c.emiAmount)}/mo</div>
                            <div className="text-xs text-muted-foreground">{c.financeCompany}</div>
                          </>
                        )}
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0 hidden sm:block" />
                    </div>
                    {/* Progress */}
                    {c.totalInstallments && (
                      <div className="mt-3 flex items-center gap-2">
                        <Progress value={Math.round(((c.totalInstallments - (c.remainingInstallments ?? 0)) / c.totalInstallments) * 100)} className="flex-1 h-1.5" />
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {c.paidInstallments ?? 0}/{c.totalInstallments} EMIs
                        </span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
          {filtered.length === 0 && (
            <div className="text-center py-16 text-muted-foreground text-sm">No customers found</div>
          )}
        </div>
      )}
    </div>
  )
}
