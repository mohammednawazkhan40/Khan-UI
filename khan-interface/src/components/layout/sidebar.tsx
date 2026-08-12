'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, Users, Car, ArrowLeftRight, Wallet, CreditCard,
  Bot, Calendar, BarChart3, FileText, Globe, Bell, Settings,
  ChevronLeft, ChevronRight, LogOut, User, Building2, FileStack,
  Shield, Wrench, TrendingUp, X,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAppStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

const navItems = [
  { href: '/dashboard',     label: 'Command Center', icon: LayoutDashboard, badge: null },
  { href: '/customers',     label: 'Customers',       icon: Users,           badge: null },
  { href: '/vehicles',      label: 'Vehicles',        icon: Car,             badge: null },
  { href: '/transactions',  label: 'Transactions',    icon: ArrowLeftRight,  badge: null },
  { href: '/finance',       label: 'Finance',         icon: Wallet,          badge: '4' },
  { href: '/payments',      label: 'Payments',        icon: CreditCard,      badge: null },
  { href: '/rto',           label: 'RTO Manager',     icon: Shield,          badge: '2' },
  { href: '/sales',         label: 'Sales',           icon: TrendingUp,      badge: null },
  { href: '/accountant',    label: 'Accountant',      icon: BarChart3,       badge: null },
  { href: '/ai-agents',     label: 'AI Team',         icon: Bot,             badge: null },
  { href: '/calendar',      label: 'Calendar',        icon: Calendar,        badge: null },
  { href: '/documents',     label: 'Documents',       icon: FileStack,       badge: null },
  { href: '/notifications', label: 'Notifications',   icon: Bell,            badge: null },
  { href: '/web3',          label: 'Web3',            icon: Globe,           badge: null },
  { href: '/settings',      label: 'Settings',        icon: Settings,        badge: null },
]

export function Sidebar() {
  const pathname = usePathname()
  const { sidebarOpen, toggleSidebar } = useAppStore()

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            className="fixed inset-0 z-30 bg-black/50 lg:hidden"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={toggleSidebar}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        animate={{ width: sidebarOpen ? 240 : 68 }}
        transition={{ duration: 0.25, ease: 'easeInOut' }}
        className={cn(
          'fixed left-0 top-0 z-40 h-full bg-card border-r flex flex-col overflow-hidden',
          'lg:relative lg:z-auto',
          !sidebarOpen && 'lg:flex hidden'
        )}
      >
        {/* Logo */}
        <div className="flex h-14 items-center border-b px-3 shrink-0">
          <Link href="/dashboard" className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 khan-gradient rounded-lg flex items-center justify-center shrink-0">
              <span className="text-white font-black text-sm">K</span>
            </div>
            <AnimatePresence>
              {sidebarOpen && (
                <motion.div
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  className="overflow-hidden whitespace-nowrap"
                >
                  <span className="font-black text-khan-red">KHAN</span>
                  <span className="font-bold text-foreground ml-1 text-sm">INTERFACE</span>
                </motion.div>
              )}
            </AnimatePresence>
          </Link>
          <button
            onClick={toggleSidebar}
            className="ml-auto p-1 rounded-md hover:bg-muted transition-colors shrink-0 hidden lg:flex"
          >
            {sidebarOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
        </div>

        {/* Business name */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="px-3 py-2 border-b"
            >
              <div className="flex items-center gap-2 bg-khan-red/5 rounded-lg px-2.5 py-1.5">
                <Building2 className="w-3.5 h-3.5 text-khan-red shrink-0" />
                <span className="text-xs font-semibold text-khan-red truncate">KM CAR DEALS</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-2 px-1.5 space-y-0.5">
          {navItems.map(({ href, label, icon: Icon, badge }) => {
            const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href))
            return (
              <Link
                key={href}
                href={href}
                title={!sidebarOpen ? label : undefined}
                className={cn(
                  'flex items-center gap-3 px-2.5 py-2 rounded-lg text-sm font-medium transition-all group relative',
                  active
                    ? 'bg-khan-red text-white shadow-sm'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                <Icon className={cn('w-4.5 h-4.5 shrink-0', active ? 'text-white' : 'text-muted-foreground group-hover:text-foreground')} style={{ width: 18, height: 18 }} />
                <AnimatePresence>
                  {sidebarOpen && (
                    <motion.span
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="truncate flex-1"
                    >
                      {label}
                    </motion.span>
                  )}
                </AnimatePresence>
                {sidebarOpen && badge && (
                  <span className={cn('text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center', active ? 'bg-white/20 text-white' : 'bg-khan-red text-white')}>
                    {badge}
                  </span>
                )}
              </Link>
            )
          })}
        </nav>

        {/* User */}
        <div className="border-t p-2 shrink-0">
          <div className={cn('flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-muted transition-colors cursor-pointer', !sidebarOpen && 'justify-center')}>
            <div className="w-8 h-8 khan-gradient rounded-full flex items-center justify-center shrink-0">
              <span className="text-white text-xs font-bold">NK</span>
            </div>
            <AnimatePresence>
              {sidebarOpen && (
                <motion.div
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="flex-1 min-w-0"
                >
                  <p className="text-sm font-semibold truncate">Nawaz Khan</p>
                  <p className="text-xs text-muted-foreground">Admin</p>
                </motion.div>
              )}
            </AnimatePresence>
            {sidebarOpen && (
              <Link href="/login">
                <button className="p-1 rounded hover:bg-destructive/10 hover:text-destructive transition-colors">
                  <LogOut className="w-4 h-4" />
                </button>
              </Link>
            )}
          </div>
        </div>
      </motion.aside>
    </>
  )
}
