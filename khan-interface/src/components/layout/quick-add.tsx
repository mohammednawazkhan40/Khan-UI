'use client'
import { useAppStore } from '@/lib/store'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Car, Users, CreditCard, Wallet, Shield, Bell, FileText, ArrowLeftRight, Plus } from 'lucide-react'
import Link from 'next/link'

const quickActions = [
  { label: 'Add Customer',    icon: Users,          href: '/customers',    color: 'bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400' },
  { label: 'Add Vehicle',     icon: Car,            href: '/vehicles',     color: 'bg-orange-50 text-orange-600 dark:bg-orange-950 dark:text-orange-400' },
  { label: 'Add Payment',     icon: CreditCard,     href: '/payments',     color: 'bg-green-50 text-green-600 dark:bg-green-950 dark:text-green-400' },
  { label: 'Add Finance',     icon: Wallet,         href: '/finance',      color: 'bg-purple-50 text-purple-600 dark:bg-purple-950 dark:text-purple-400' },
  { label: 'Add RTO Task',    icon: Shield,         href: '/rto',          color: 'bg-red-50 text-red-600 dark:bg-red-950 dark:text-red-400' },
  { label: 'Add Reminder',    icon: Bell,           href: '/calendar',     color: 'bg-yellow-50 text-yellow-600 dark:bg-yellow-950 dark:text-yellow-400' },
  { label: 'Add Transaction', icon: ArrowLeftRight, href: '/transactions', color: 'bg-teal-50 text-teal-600 dark:bg-teal-950 dark:text-teal-400' },
  { label: 'Add Document',    icon: FileText,       href: '/documents',    color: 'bg-slate-50 text-slate-600 dark:bg-slate-950 dark:text-slate-400' },
]

export function QuickAdd() {
  const { quickAddOpen, setQuickAddOpen } = useAppStore()

  return (
    <Dialog open={quickAddOpen} onOpenChange={setQuickAddOpen}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5 text-khan-red" />
            Quick Add
          </DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-2 pt-2">
          {quickActions.map(({ label, icon: Icon, href, color }) => (
            <Link key={href} href={href} onClick={() => setQuickAddOpen(false)}>
              <button className="w-full flex items-center gap-3 p-3 rounded-xl border hover:border-khan-red/40 hover:bg-muted/50 transition-all group text-left">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${color}`}>
                  <Icon className="w-4.5 h-4.5" style={{ width: 18, height: 18 }} />
                </div>
                <span className="text-sm font-medium leading-tight">{label}</span>
              </button>
            </Link>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
