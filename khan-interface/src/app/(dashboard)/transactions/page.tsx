'use client'
import { useEffect, useState } from 'react'
import { ArrowLeftRight } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { PageHeader } from '@/components/shared/page-header'
import { Skeleton } from '@/components/ui/skeleton'
import { getTransactions } from '@/lib/services'
import { formatCurrency, formatDate } from '@/lib/utils'
import type { Transaction } from '@/types'

const typeColors: Record<string, string> = {
  vehicle_purchase: 'text-red-600', vehicle_sale: 'text-green-600',
  customer_payment: 'text-blue-600', finance_received: 'text-purple-600',
  advance_received: 'text-teal-600', expense: 'text-orange-600',
  commission: 'text-yellow-600',
}

export default function TransactionsPage() {
  const [txns, setTxns] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { getTransactions().then(t => setTxns([...t].sort((a,b) => b.date.localeCompare(a.date)))).finally(() => setLoading(false)) }, [])

  return (
    <div className="space-y-5 pb-8">
      <PageHeader title="Transactions" subtitle={`${txns.length} transactions`}>
        <Button variant="khan" size="sm">+ Add Transaction</Button>
      </PageHeader>

      {loading ? Array(6).fill(0).map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />) : (
        <div className="space-y-1.5">
          {txns.map(t => (
            <Card key={t.id} className="hover:shadow-sm transition-shadow">
              <CardContent className="p-3.5 flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0`}>
                  <ArrowLeftRight className={`w-4 h-4 ${typeColors[t.type] ?? 'text-muted-foreground'}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{t.description}</p>
                  <div className="flex gap-2 text-xs text-muted-foreground flex-wrap">
                    <span>{formatDate(t.date)}</span>
                    {t.customerName && <span>{t.customerName}</span>}
                    <span className="capitalize">{t.method.replace(/_/g,' ')}</span>
                    {t.referenceNumber && <span className="font-mono">{t.referenceNumber}</span>}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className={`font-bold ${['vehicle_sale','customer_payment','finance_received','advance_received','commission'].includes(t.type) ? 'text-green-600' : 'text-red-600'}`}>
                    {['vehicle_sale','customer_payment','finance_received','advance_received','commission'].includes(t.type) ? '+' : '-'}{formatCurrency(t.amount)}
                  </div>
                  <Badge variant={t.status === 'completed' ? 'active' : 'pending'} className="text-xs">{t.status}</Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
