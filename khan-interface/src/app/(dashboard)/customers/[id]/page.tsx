'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { ArrowLeft, Phone, MessageCircle, Mail, Car, CreditCard, Calendar, FileText, CheckCircle2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { StatusBadge, PriorityBadge } from '@/components/shared/status-badge'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { getCustomerById } from '@/lib/services'
import { formatCurrency, formatDate, initials, percentage } from '@/lib/utils'
import type { Customer } from '@/types'
import Link from 'next/link'

export default function CustomerDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getCustomerById(id).then(c => setCustomer(c ?? null)).finally(() => setLoading(false))
  }, [id])

  if (loading) return <div className="space-y-4">{Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-32 rounded-xl" />)}</div>
  if (!customer) return <div className="text-center py-16 text-muted-foreground">Customer not found</div>

  const paidPct = percentage(customer.amountPaid, customer.purchaseAmount)
  const emiPct  = customer.totalInstallments ? percentage((customer.paidInstallments ?? 0), customer.totalInstallments) : 0

  return (
    <div className="space-y-5 pb-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/customers"><Button variant="outline" size="icon"><ArrowLeft className="w-4 h-4" /></Button></Link>
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold ${customer.status === 'overdue' ? 'bg-red-100 text-red-700' : 'bg-muted'}`}>
            {initials(customer.fullName)}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold">{customer.fullName}</h1>
              <StatusBadge status={customer.status} />
            </div>
            <p className="text-sm text-muted-foreground">{customer.customerId} · {customer.city}, {customer.state}</p>
          </div>
        </div>
        <div className="flex gap-2 shrink-0">
          <Button size="sm" variant="outline" className="gap-1.5"><Phone className="w-4 h-4" />Call</Button>
          <Button size="sm" variant="outline" className="gap-1.5 text-green-600 border-green-200 hover:bg-green-50"><MessageCircle className="w-4 h-4" />WhatsApp</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Contact */}
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Contact Details</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex items-center gap-2"><Phone className="w-4 h-4 text-muted-foreground" /><span>{customer.phone}</span></div>
            {customer.email && <div className="flex items-center gap-2"><Mail className="w-4 h-4 text-muted-foreground" /><span>{customer.email}</span></div>}
            <div className="text-muted-foreground text-xs mt-1">{customer.address}</div>
            {customer.pan && <div className="flex gap-4 text-xs text-muted-foreground"><span>PAN: {customer.pan}</span>{customer.aadhaarRef && <span>Aadhaar: {customer.aadhaarRef}</span>}</div>}
          </CardContent>
        </Card>

        {/* Vehicle */}
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Car className="w-4 h-4" />Vehicle</CardTitle></CardHeader>
          <CardContent className="text-sm space-y-1">
            {customer.vehicleInfo ? (
              <>
                <p className="font-semibold">{customer.vehicleInfo}</p>
                {customer.vehicleRegistration && <p className="font-mono text-xs text-muted-foreground">{customer.vehicleRegistration}</p>}
                <div className="flex gap-3 text-xs text-muted-foreground mt-2">
                  <span>Paid: {formatCurrency(customer.amountPaid)}</span>
                  <span>Pending: <span className="text-red-600 font-semibold">{formatCurrency(customer.amountPending)}</span></span>
                </div>
                <Progress value={paidPct} className="mt-2 h-2" />
                <p className="text-xs text-muted-foreground">{paidPct}% paid of {formatCurrency(customer.purchaseAmount)}</p>
              </>
            ) : <p className="text-muted-foreground">No vehicle linked</p>}
          </CardContent>
        </Card>

        {/* Finance */}
        {customer.financeCompany && (
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><CreditCard className="w-4 h-4" />Finance Details</CardTitle></CardHeader>
            <CardContent className="text-sm space-y-2">
              <div className="flex justify-between"><span className="text-muted-foreground">Company</span><span className="font-medium">{customer.financeCompany}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Finance Person</span><span className="font-medium">{customer.financePerson}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">EMI</span><span className="font-bold text-khan-red">{formatCurrency(customer.emiAmount ?? 0)}/mo</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">EMI Date</span><span>{customer.emiDate}th every month</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Next Payment</span><span className="font-medium">{formatDate(customer.nextPaymentDate)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Last Payment</span><span>{formatDate(customer.lastPaymentDate)}</span></div>
              {customer.totalInstallments && (
                <>
                  <Progress value={emiPct} className="mt-1 h-2" />
                  <p className="text-xs text-muted-foreground">{customer.paidInstallments}/{customer.totalInstallments} EMIs paid · {customer.remainingInstallments} remaining</p>
                </>
              )}
            </CardContent>
          </Card>
        )}

        {/* Notes */}
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Follow-up & Notes</CardTitle></CardHeader>
          <CardContent className="text-sm space-y-2">
            {customer.nextFollowUpDate && (
              <div className="flex justify-between"><span className="text-muted-foreground">Next Follow-up</span><span className="font-medium text-khan-red">{formatDate(customer.nextFollowUpDate)}</span></div>
            )}
            {customer.lastContactDate && (
              <div className="flex justify-between"><span className="text-muted-foreground">Last Contact</span><span>{formatDate(customer.lastContactDate)}</span></div>
            )}
            {customer.notes && <p className="text-xs text-muted-foreground mt-2 p-2 bg-muted rounded-lg">{customer.notes}</p>}
            <div className="flex gap-2 mt-3">
              <Button size="sm" variant="outline" className="flex-1">Add Note</Button>
              <Button size="sm" variant="khan" className="flex-1">Add Reminder</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
