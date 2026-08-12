'use client'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Car, Users, Wallet, CreditCard, Shield, Bell, TrendingUp, AlertCircle,
  ArrowUpRight, ArrowDownRight, Building2, Bot, Calendar, CheckCircle2,
  Clock, Zap, ChevronRight, DollarSign, Activity, BarChart3
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { PriorityBadge, StatusBadge } from '@/components/shared/status-badge'
import { getDashboardSummary, getChartData, getAgentActivities, getTodayReminders, getOverduePayments } from '@/lib/services'
import { formatCurrency, formatCurrencyFull, getGreeting, formatDate, daysAgo } from '@/lib/utils'
import { mockReminders, mockAgentActivities } from '@/lib/mock'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar
} from 'recharts'
import Link from 'next/link'
import type { AgentActivity, Reminder } from '@/types'

const fadeUp = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } }
const container = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } }

export default function DashboardPage() {
  const [summary, setSummary] = useState<any>(null)
  const [chartData, setChartData] = useState<any[]>([])
  const [activities, setActivities] = useState<AgentActivity[]>([])
  const [todayReminders, setTodayReminders] = useState<Reminder[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([getDashboardSummary(), getChartData(), getAgentActivities(), getTodayReminders()])
      .then(([s, c, a, r]) => { setSummary(s); setChartData(c); setActivities(a); setTodayReminders(r) })
      .finally(() => setLoading(false))
  }, [])

  const hour = new Date().getHours()

  const kpis = summary ? [
    { label: 'Total Vehicles',      value: summary.totalVehicles,      formatted: String(summary.totalVehicles),      icon: Car,          color: 'text-blue-600',   bg: 'bg-blue-50 dark:bg-blue-950',   change: +2, sub: `${summary.availableVehicles} available` },
    { label: 'Customers',           value: summary.totalCustomers,     formatted: String(summary.totalCustomers),     icon: Users,        color: 'text-green-600',  bg: 'bg-green-50 dark:bg-green-950', change: +3, sub: `${summary.overdueCustomers} overdue` },
    { label: 'Finance Outstanding', value: summary.financeOutstanding, formatted: formatCurrency(summary.financeOutstanding), icon: Wallet, color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-950', change: +8.4, sub: `${summary.overduePayments} overdue` },
    { label: 'Collected (Aug)',     value: summary.totalCollectedThisMonth, formatted: formatCurrency(summary.totalCollectedThisMonth), icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-950', change: +12, sub: 'This month' },
    { label: 'RTO Pending',         value: summary.rtoTasksPending,    formatted: String(summary.rtoTasksPending),    icon: Shield,       color: 'text-orange-600', bg: 'bg-orange-50 dark:bg-orange-950', change: -1, sub: `${summary.rtoTasksOverdue} overdue` },
    { label: 'Reminders Today',     value: summary.remindersToday,     formatted: String(summary.remindersToday),     icon: Bell,         color: 'text-red-600',    bg: 'bg-red-50 dark:bg-red-950',     change: 0,  sub: `${summary.remindersOverdue} overdue` },
    { label: 'Sales (Aug)',         value: summary.salesThisMonth,     formatted: formatCurrency(summary.salesThisMonth), icon: DollarSign, color: 'text-teal-600', bg: 'bg-teal-50 dark:bg-teal-950', change: +15, sub: `${summary.soldThisMonth} vehicles` },
    { label: 'Est. Profit (Aug)',   value: summary.estimatedProfitThisMonth, formatted: formatCurrency(summary.estimatedProfitThisMonth), icon: BarChart3, color: 'text-indigo-600', bg: 'bg-indigo-50 dark:bg-indigo-950', change: +6, sub: 'Estimated' },
  ] : []

  return (
    <div className="space-y-6 pb-8">
      {/* Top greeting */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">
              {getGreeting()}, <span className="text-khan-red">Nawaz</span> 👋
            </h1>
          </div>
          <p className="text-muted-foreground text-sm mt-0.5">
            KM Car Deals — Business Command Center &nbsp;·&nbsp; Wednesday, 12 August 2026
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 rounded-full bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500 status-pulse" />
            <span className="text-xs font-semibold text-red-700 dark:text-red-400">4 Critical Alerts</span>
          </div>
          <Link href="/ai-agents">
            <Button size="sm" variant="khan" className="gap-1.5">
              <Bot className="w-4 h-4" /> AI Team
            </Button>
          </Link>
        </div>
      </motion.div>

      {/* KPI Cards */}
      <motion.div variants={container} initial="hidden" animate="show"
        className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {loading
          ? Array(8).fill(0).map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)
          : kpis.map((kpi) => (
            <motion.div key={kpi.label} variants={fadeUp}>
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${kpi.bg}`}>
                      <kpi.icon className={`w-4.5 h-4.5 ${kpi.color}`} style={{ width: 18, height: 18 }} />
                    </div>
                    <div className={`flex items-center gap-0.5 text-xs font-semibold ${kpi.change > 0 ? 'text-green-600' : kpi.change < 0 ? 'text-red-600' : 'text-muted-foreground'}`}>
                      {kpi.change > 0 ? <ArrowUpRight className="w-3 h-3" /> : kpi.change < 0 ? <ArrowDownRight className="w-3 h-3" /> : null}
                      {kpi.change !== 0 && `${Math.abs(kpi.change)}%`}
                    </div>
                  </div>
                  <div className="text-xl font-bold">{kpi.formatted}</div>
                  <div className="text-xs font-medium text-foreground/80 mt-0.5">{kpi.label}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{kpi.sub}</div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
      </motion.div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Revenue chart */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Sales & Collections — Last 6 Months</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={chartData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="sales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#DC2626" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#DC2626" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="col" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#16A34A" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#16A34A" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="period" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                <YAxis tickFormatter={v => `₹${(v / 100000).toFixed(0)}L`} tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                <Tooltip formatter={(v: number, n: string) => [formatCurrencyFull(v), n === 'sales' ? 'Sales' : 'Collections']} />
                <Area type="monotone" dataKey="sales" stroke="#DC2626" fill="url(#sales)" strokeWidth={2} />
                <Area type="monotone" dataKey="collections" stroke="#16A34A" fill="url(#col)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Priority panel */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-khan-red" /> Today's Priorities
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2.5 pt-0">
            {[
              { dot: 'bg-red-500',    text: 'Call Ravi Mishra — 42d overdue', link: '/finance' },
              { dot: 'bg-red-500',    text: 'Kotak NOC for XUV700 (TS09GH)', link: '/rto' },
              { dot: 'bg-red-500',    text: 'Meena Verma — 41d overdue', link: '/finance' },
              { dot: 'bg-orange-500', text: 'Priya Mehta — 33d overdue', link: '/finance' },
              { dot: 'bg-orange-500', text: 'Abdul Hamid — Bajaj notice', link: '/finance' },
              { dot: 'bg-orange-500', text: 'HDFC NOC — Toyota Hyryder', link: '/rto' },
              { dot: 'bg-yellow-500', text: 'Farhan Siddiqui EMI — 18 Aug', link: '/payments' },
              { dot: 'bg-yellow-500', text: 'Venue delivery — Santosh Yadav', link: '/vehicles' },
              { dot: 'bg-green-500',  text: 'Baleno listing — ready for sale', link: '/vehicles' },
            ].map((p, i) => (
              <Link key={i} href={p.link}>
                <div className="flex items-center gap-2.5 hover:bg-muted px-2 py-1.5 rounded-lg transition-colors cursor-pointer group">
                  <span className={`w-2 h-2 rounded-full shrink-0 ${p.dot}`} />
                  <span className="text-xs flex-1">{p.text}</span>
                  <ChevronRight className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* AI Activity */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Bot className="w-4 h-4 text-khan-red" /> AI Team Activity
              </CardTitle>
              <Link href="/ai-agents">
                <Button size="sm" variant="ghost" className="text-xs h-7 gap-1">
                  View All <ChevronRight className="w-3 h-3" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-2 pt-0">
            {activities.slice(0, 6).map(a => (
              <div key={a.id} className="flex items-start gap-2.5 py-1">
                <div className={`mt-0.5 w-2 h-2 rounded-full shrink-0 ${
                  a.severity === 'critical' ? 'bg-red-500' : a.severity === 'high' ? 'bg-orange-500' : a.severity === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                }`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-xs font-semibold">{a.agentName}</span>
                    <span className="text-xs text-muted-foreground">·</span>
                    <span className="text-xs text-muted-foreground">{a.action}</span>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{a.detail}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Today's Reminders */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Clock className="w-4 h-4 text-khan-red" /> Due Today
              </CardTitle>
              <Link href="/calendar">
                <Button size="sm" variant="ghost" className="text-xs h-7 gap-1">
                  Calendar <ChevronRight className="w-3 h-3" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-2 pt-0">
            {todayReminders.length === 0
              ? <p className="text-sm text-muted-foreground py-4 text-center">No reminders today</p>
              : todayReminders.map(r => (
                <div key={r.id} className="flex items-center gap-2.5 p-2 rounded-lg border hover:border-khan-red/30 transition-colors">
                  <div className={`w-2 h-2 rounded-full shrink-0 ${r.priority === 'critical' ? 'bg-red-500' : r.priority === 'high' ? 'bg-orange-500' : 'bg-yellow-500'}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">{r.title}</p>
                    {r.customerName && <p className="text-xs text-muted-foreground">{r.customerName}</p>}
                  </div>
                  <PriorityBadge priority={r.priority} />
                </div>
              ))
            }
          </CardContent>
        </Card>
      </div>

      {/* Quick nav cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: 'Customers',   href: '/customers',   icon: Users,      count: '20', color: 'text-blue-600',   bg: 'bg-blue-50 dark:bg-blue-950' },
          { label: 'Vehicles',    href: '/vehicles',    icon: Car,        count: '18', color: 'text-orange-600', bg: 'bg-orange-50 dark:bg-orange-950' },
          { label: 'Finance',     href: '/finance',     icon: Wallet,     count: '10', color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-950' },
          { label: 'RTO Tasks',   href: '/rto',         icon: Shield,     count: '8',  color: 'text-red-600',    bg: 'bg-red-50 dark:bg-red-950' },
          { label: 'AI Team',     href: '/ai-agents',   icon: Bot,        count: '7',  color: 'text-indigo-600', bg: 'bg-indigo-50 dark:bg-indigo-950' },
          { label: 'Calendar',    href: '/calendar',    icon: Calendar,   count: '15', color: 'text-teal-600',   bg: 'bg-teal-50 dark:bg-teal-950' },
        ].map(({ label, href, icon: Icon, count, color, bg }) => (
          <Link key={href} href={href}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer hover:border-khan-red/30 group">
              <CardContent className="p-4 flex flex-col items-center text-center gap-2">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${bg}`}>
                  <Icon className={`w-5 h-5 ${color}`} />
                </div>
                <div>
                  <div className="text-lg font-bold group-hover:text-khan-red transition-colors">{count}</div>
                  <div className="text-xs text-muted-foreground">{label}</div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
