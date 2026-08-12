'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { ArrowLeft, Car, FileText, Shield, Wrench, CreditCard } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { StatusBadge } from '@/components/shared/status-badge'
import { Skeleton } from '@/components/ui/skeleton'
import { getVehicleById } from '@/lib/services'
import { formatCurrency, formatDate } from '@/lib/utils'
import type { Vehicle } from '@/types'
import Link from 'next/link'

const LIFECYCLE = [
  'purchased','inspection','documents','rto_process','repair','listed','enquiry','booked','payment_pending','finance_pending','delivered','completed'
]

export default function VehicleDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [vehicle, setVehicle] = useState<Vehicle | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => { getVehicleById(id).then(v => setVehicle(v ?? null)).finally(() => setLoading(false)) }, [id])

  if (loading) return <div className="space-y-4">{Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-32 rounded-xl" />)}</div>
  if (!vehicle) return <div className="py-16 text-center text-muted-foreground">Vehicle not found</div>

  const stageIdx = LIFECYCLE.indexOf(vehicle.lifecycleStage)

  return (
    <div className="space-y-5 pb-8 max-w-4xl">
      <div className="flex items-center gap-3">
        <Link href="/vehicles"><Button variant="outline" size="icon"><ArrowLeft className="w-4 h-4" /></Button></Link>
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl font-bold">{vehicle.year} {vehicle.brand} {vehicle.model} {vehicle.variant}</h1>
            <StatusBadge status={vehicle.status} />
          </div>
          <p className="text-sm text-muted-foreground font-mono">{vehicle.registrationNumber} · {vehicle.vehicleId}</p>
        </div>
      </div>

      {/* Lifecycle tracker */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm">Vehicle Lifecycle</CardTitle></CardHeader>
        <CardContent>
          <div className="flex gap-1 flex-wrap">
            {LIFECYCLE.map((stage, i) => (
              <div key={stage} className={`px-2 py-1 rounded text-xs font-medium capitalize ${
                i < stageIdx ? 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400'
                : i === stageIdx ? 'bg-khan-red text-white'
                : 'bg-muted text-muted-foreground'
              }`}>
                {stage.replace(/_/g, ' ')}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Vehicle Info */}
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Car className="w-4 h-4" />Vehicle Details</CardTitle></CardHeader>
          <CardContent className="text-sm space-y-2">
            {[
              ['Brand', vehicle.brand], ['Model', vehicle.model], ['Variant', vehicle.variant],
              ['Year', vehicle.year], ['Fuel', vehicle.fuel], ['Transmission', vehicle.transmission],
              ['Colour', vehicle.color], ['KM Driven', `${(vehicle.kmDriven / 1000).toFixed(0)}k km`],
              ['Ownership', `${vehicle.ownership}${vehicle.ownership === 1 ? 'st' : vehicle.ownership === 2 ? 'nd' : 'rd'} owner`],
            ].map(([k, v]) => (
              <div key={String(k)} className="flex justify-between">
                <span className="text-muted-foreground capitalize">{k}</span>
                <span className="font-medium capitalize">{String(v)}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Financials */}
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><CreditCard className="w-4 h-4" />Financials</CardTitle></CardHeader>
          <CardContent className="text-sm space-y-2">
            <div className="flex justify-between"><span className="text-muted-foreground">Purchase Price</span><span className="font-medium">{formatCurrency(vehicle.purchasePrice)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Selling Price</span><span className="font-bold text-khan-red">{formatCurrency(vehicle.sellingPrice)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Total Expenses</span><span className="text-orange-600">{formatCurrency(vehicle.totalExpenses)}</span></div>
            <div className="flex justify-between border-t pt-2 mt-2"><span className="font-semibold">Expected Profit</span><span className="font-bold text-green-600">{formatCurrency(vehicle.expectedProfit)}</span></div>
            {vehicle.sellerName && <div className="flex justify-between"><span className="text-muted-foreground">Seller</span><span>{vehicle.sellerName}</span></div>}
            {vehicle.customerName && <div className="flex justify-between"><span className="text-muted-foreground">Buyer</span><span>{vehicle.customerName}</span></div>}
            {vehicle.saleDate && <div className="flex justify-between"><span className="text-muted-foreground">Sale Date</span><span>{formatDate(vehicle.saleDate)}</span></div>}
          </CardContent>
        </Card>

        {/* Document Status */}
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><FileText className="w-4 h-4" />Document Status</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {[
              { label: 'RC Status',        val: vehicle.rcStatus },
              { label: 'Insurance',        val: vehicle.insuranceStatus },
              { label: 'RTO Status',       val: vehicle.rtoStatus },
              { label: 'Finance Status',   val: vehicle.financeStatus },
            ].map(({ label, val }) => (
              <div key={label} className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{label}</span>
                <Badge variant={val === 'transferred' || val === 'completed' || val === 'valid' ? 'active' : val === 'in_progress' ? 'pending' : 'medium'} className="capitalize">
                  {val.replace(/_/g, ' ')}
                </Badge>
              </div>
            ))}
            {vehicle.insuranceExpiry && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Insurance Expiry</span>
                <span className="font-medium">{formatDate(vehicle.insuranceExpiry)}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Notes */}
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Notes & Actions</CardTitle></CardHeader>
          <CardContent>
            {vehicle.notes && <p className="text-sm text-muted-foreground bg-muted rounded-lg p-3 mb-3">{vehicle.notes}</p>}
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="outline" className="gap-1.5"><Shield className="w-3.5 h-3.5" />RTO Task</Button>
              <Button size="sm" variant="outline" className="gap-1.5"><Wrench className="w-3.5 h-3.5" />Add Expense</Button>
              <Button size="sm" variant="khan" className="gap-1.5"><FileText className="w-3.5 h-3.5" />Upload Doc</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
