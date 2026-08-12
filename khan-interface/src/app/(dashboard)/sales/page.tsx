'use client'
import { useEffect, useState } from 'react'
import { TrendingUp, UserCheck, Car, Clock, DollarSign } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { PageHeader } from '@/components/shared/page-header'
import { Skeleton } from '@/components/ui/skeleton'
import { mockCustomers, mockVehicles } from '@/lib/mock'
import { formatCurrency, formatDate } from '@/lib/utils'
import { motion } from 'framer-motion'

export default function SalesPage() {
  const [loading, setLoading] = useState(true)
  useEffect(() => { setTimeout(() => setLoading(false), 500) }, [])

  const pendingDeliveries = mockCustomers.filter(c => c.status === 'pending')
  const activeCustomers   = mockCustomers.filter(c => c.status === 'active')
  const overdueCustomers  = mockCustomers.filter(c => c.status === 'overdue')
  const availableVehicles = mockVehicles.filter(v => ['listed','available'].includes(v.status))

  const followUps = [
    { name: 'Imran Khan Pathan',    reason: 'Finance approval awaited', phone: '9134567890', priority: 'high',     vehicle: 'MG Hector Sharp' },
    { name: 'Sana Fatima Qureshi',  reason: 'HDFC approval pending',    phone: '9967012345', priority: 'high',     vehicle: 'Hyundai Venue S+' },
    { name: 'Santosh Yadav',        reason: 'Delivery to schedule',     phone: '9387654321', priority: 'high',     vehicle: 'Hyundai Creta SX' },
    { name: 'Priya Mehta',          reason: 'Payment follow-up',        phone: '9823456781', priority: 'critical', vehicle: 'Hyundai i20 Asta' },
    { name: 'Abdul Hamid Sheikh',   reason: 'Bajaj Finance — overdue',  phone: '9234567890', priority: 'critical', vehicle: 'Ford EcoSport' },
    { name: 'Ravi Shankar Mishra',  reason: 'Bajaj Finance — escalated',phone: '9823401234', priority: 'critical', vehicle: 'Honda Amaze CVT' },
    { name: 'Meena Kumari Verma',   reason: 'SBI notice expected',      phone: '9734567890', priority: 'critical', vehicle: 'Maruti Ertiga CNG' },
  ]

  const priorityColor: Record<string, string> = { critical: 'bg-red-500', high: 'bg-orange-500', medium: 'bg-yellow-500' }

  return (
    <div className="space-y-5 pb-8">
      <PageHeader title="Sales" subtitle="Manage leads, follow-ups & deliveries">
        <Button variant="khan" size="sm">+ Add Lead</Button>
      </PageHeader>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {loading ? Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />) : [
          { label: 'Pending Delivery', val: pendingDeliveries.length,  color: 'text-orange-600', icon: Clock },
          { label: 'Active Sales',     val: activeCustomers.length,    color: 'text-green-600',  icon: UserCheck },
          { label: 'Overdue',          val: overdueCustomers.length,   color: 'text-red-600',    icon: TrendingUp },
          { label: 'Available Stock',  val: availableVehicles.length,  color: 'text-blue-600',   icon: Car },
        ].map(s => (
          <Card key={s.label}><CardContent className="p-4 flex items-center gap-3">
            <div className="w-9 h-9 bg-muted rounded-lg flex items-center justify-center"><s.icon className={`w-5 h-5 ${s.color}`} /></div>
            <div><div className={`text-xl font-bold ${s.color}`}>{s.val}</div><div className="text-xs text-muted-foreground">{s.label}</div></div>
          </CardContent></Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Follow-up list */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Customer Follow-Ups Today</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 pt-0">
            {followUps.map((f, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                className="flex items-center gap-3 p-2.5 rounded-lg border hover:border-khan-red/30 transition-colors">
                <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${priorityColor[f.priority] ?? 'bg-yellow-500'}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{f.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{f.reason} · {f.vehicle}</p>
                </div>
                <div className="flex gap-1 shrink-0">
                  <Button size="sm" variant="outline" className="h-7 text-xs px-2">Call</Button>
                  <Button size="sm" variant="outline" className="h-7 text-xs px-2 text-green-600 border-green-200">WA</Button>
                </div>
              </motion.div>
            ))}
          </CardContent>
        </Card>

        {/* Available vehicles */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Available for Sale</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 pt-0">
            {availableVehicles.map(v => (
              <div key={v.id} className="flex items-center gap-3 p-2.5 rounded-lg border hover:border-khan-red/30 transition-colors">
                <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                  <Car className="w-5 h-5 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold">{v.year} {v.brand} {v.model}</p>
                  <p className="text-xs text-muted-foreground font-mono">{v.registrationNumber} · {(v.kmDriven/1000).toFixed(0)}k km</p>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-sm font-bold text-khan-red">{formatCurrency(v.sellingPrice)}</div>
                  <Badge variant={v.status === 'listed' ? 'active' : 'medium'} className="text-xs capitalize">{v.status}</Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
