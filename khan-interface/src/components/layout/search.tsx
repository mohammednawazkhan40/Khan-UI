'use client'
import { useEffect, useState } from 'react'
import { useAppStore } from '@/lib/store'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Search, Car, Users, Wallet, Shield, ArrowRight } from 'lucide-react'
import { mockCustomers, mockVehicles, mockFinanceAccounts, mockRTOTasks } from '@/lib/mock'
import Link from 'next/link'

export function GlobalSearch() {
  const { searchOpen, setSearchOpen } = useAppStore()
  const [query, setQuery] = useState('')

  const results = query.length > 1 ? [
    ...mockCustomers
      .filter(c => c.fullName.toLowerCase().includes(query.toLowerCase()) || c.phone.includes(query))
      .slice(0, 3)
      .map(c => ({ type: 'customer', label: c.fullName, sub: c.phone, href: `/customers`, icon: Users })),
    ...mockVehicles
      .filter(v => v.registrationNumber.toLowerCase().includes(query.toLowerCase()) || `${v.brand} ${v.model}`.toLowerCase().includes(query.toLowerCase()))
      .slice(0, 3)
      .map(v => ({ type: 'vehicle', label: `${v.brand} ${v.model}`, sub: v.registrationNumber, href: `/vehicles`, icon: Car })),
    ...mockFinanceAccounts
      .filter(f => f.customerName.toLowerCase().includes(query.toLowerCase()) || f.financeCompany.toLowerCase().includes(query.toLowerCase()))
      .slice(0, 2)
      .map(f => ({ type: 'finance', label: f.customerName, sub: f.financeCompany, href: `/finance`, icon: Wallet })),
    ...mockRTOTasks
      .filter(r => r.vehicleRegistration.toLowerCase().includes(query.toLowerCase()))
      .slice(0, 2)
      .map(r => ({ type: 'rto', label: r.vehicleRegistration, sub: r.taskType.replace(/_/g,' '), href: `/rto`, icon: Shield })),
  ] : []

  useEffect(() => { if (!searchOpen) setQuery('') }, [searchOpen])

  return (
    <Dialog open={searchOpen} onOpenChange={setSearchOpen}>
      <DialogContent className="max-w-lg p-0 gap-0 overflow-hidden">
        <div className="flex items-center gap-3 px-4 py-3 border-b">
          <Search className="w-4 h-4 text-muted-foreground shrink-0" />
          <Input
            autoFocus
            placeholder="Search customers, vehicles, RTO, finance…"
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="border-0 shadow-none focus-visible:ring-0 px-0 h-auto text-base"
          />
        </div>
        {results.length > 0 ? (
          <div className="py-2 max-h-72 overflow-y-auto">
            {results.map((r, i) => (
              <Link key={i} href={r.href} onClick={() => setSearchOpen(false)}>
                <div className="flex items-center gap-3 px-4 py-2.5 hover:bg-muted cursor-pointer transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                    <r.icon className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{r.label}</p>
                    <p className="text-xs text-muted-foreground capitalize">{r.sub}</p>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-muted-foreground" />
                </div>
              </Link>
            ))}
          </div>
        ) : query.length > 1 ? (
          <div className="py-10 text-center text-sm text-muted-foreground">No results for "{query}"</div>
        ) : (
          <div className="py-8 text-center text-sm text-muted-foreground">
            Type to search across all records
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
