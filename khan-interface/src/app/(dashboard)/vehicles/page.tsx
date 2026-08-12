'use client'
import { useEffect, useState } from 'react'
import { Search, Plus, Car, Fuel, Gauge, ChevronRight } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { StatusBadge } from '@/components/shared/status-badge'
import { PageHeader } from '@/components/shared/page-header'
import { Skeleton } from '@/components/ui/skeleton'
import { getVehicles } from '@/lib/services'
import { formatCurrency } from '@/lib/utils'
import type { Vehicle } from '@/types'
import Link from 'next/link'
import { motion } from 'framer-motion'

const LIFECYCLE = ['purchased','inspection','documents','rto_process','repair','listed','enquiry','booked','payment_pending','finance_pending','delivered','completed']

const statusFilters = ['all', 'listed', 'repair', 'rto_process', 'delivered', 'available', 'booked']

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')

  useEffect(() => { getVehicles().then(setVehicles).finally(() => setLoading(false)) }, [])

  const filtered = vehicles.filter(v => {
    const q = search.toLowerCase()
    const matchSearch = !search || v.registrationNumber.toLowerCase().includes(q) || `${v.brand} ${v.model}`.toLowerCase().includes(q) || v.color.toLowerCase().includes(q)
    const matchFilter = filter === 'all' || v.status === filter
    return matchSearch && matchFilter
  })

  const available = vehicles.filter(v => ['listed','available','repair'].includes(v.status))

  return (
    <div className="space-y-5 pb-8">
      <PageHeader title="Vehicles" subtitle={`${vehicles.length} vehicles · ${available.length} available`}>
        <Button variant="khan" size="sm" className="gap-1.5"><Plus className="w-4 h-4" />Add Vehicle</Button>
      </PageHeader>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total',     val: vehicles.length,                                                         color: 'text-foreground' },
          { label: 'For Sale',  val: vehicles.filter(v => ['listed','available'].includes(v.status)).length,  color: 'text-green-600' },
          { label: 'In Repair', val: vehicles.filter(v => v.status === 'repair').length,                      color: 'text-orange-600' },
          { label: 'In RTO',    val: vehicles.filter(v => v.status === 'rto_process').length,                 color: 'text-red-600' },
        ].map(s => (
          <Card key={s.label}><CardContent className="p-4"><div className={`text-xl font-bold ${s.color}`}>{s.val}</div><div className="text-xs text-muted-foreground">{s.label}</div></CardContent></Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search registration, brand, model…" className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {statusFilters.map(s => (
            <button key={s} onClick={() => setFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize border transition-all ${filter === s ? 'bg-khan-red text-white border-khan-red' : 'border-border hover:border-khan-red/50'}`}>
              {s.replace(/_/g, ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {loading
        ? <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">{Array(6).fill(0).map((_, i) => <Skeleton key={i} className="h-48 rounded-xl" />)}</div>
        : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filtered.map((v, i) => (
              <motion.div key={v.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                <Link href={`/vehicles/${v.id}`}>
                  <Card className="hover:shadow-md hover:border-khan-red/30 transition-all cursor-pointer group overflow-hidden">
                    {/* Image placeholder */}
                    <div className="h-36 bg-gradient-to-br from-muted to-muted/60 flex items-center justify-center relative">
                      <Car className="w-16 h-16 text-muted-foreground/30" />
                      <div className="absolute top-2 left-2"><StatusBadge status={v.status} /></div>
                      <div className="absolute top-2 right-2 bg-background/80 backdrop-blur rounded-lg px-2 py-1 text-xs font-mono font-bold">{v.registrationNumber}</div>
                    </div>
                    <CardContent className="p-3">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-semibold text-sm">{v.year} {v.brand} {v.model}</p>
                          <p className="text-xs text-muted-foreground">{v.variant}</p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0 group-hover:text-khan-red transition-colors mt-0.5" />
                      </div>
                      <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                        <span className="capitalize">{v.fuel}</span>
                        <span>·</span>
                        <span>{(v.kmDriven / 1000).toFixed(0)}k km</span>
                        <span>·</span>
                        <span>{v.ownership}{v.ownership === 1 ? 'st' : v.ownership === 2 ? 'nd' : 'rd'} owner</span>
                      </div>
                      <div className="flex items-center justify-between mt-2 pt-2 border-t">
                        <span className="text-xs text-muted-foreground">Buy: {formatCurrency(v.purchasePrice)}</span>
                        <span className="text-sm font-bold text-khan-red">{formatCurrency(v.sellingPrice)}</span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
    </div>
  )
}
