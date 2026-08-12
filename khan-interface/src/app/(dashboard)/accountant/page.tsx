'use client'
import { useEffect, useState } from 'react'
import { BarChart3, TrendingUp, TrendingDown, DollarSign, ShoppingCart } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PageHeader } from '@/components/shared/page-header'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { getChartData, getExpenses, getTransactions } from '@/lib/services'
import { formatCurrency } from '@/lib/utils'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'
import { mockExpenses, mockTransactions } from '@/lib/mock'

const COLORS = ['#DC2626','#16A34A','#7C3AED','#D97706','#0891B2']

export default function AccountantPage() {
  const [chart, setChart] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { getChartData().then(setChart).finally(() => setLoading(false)) }, [])

  const expenseByCategory = mockExpenses.reduce((acc, e) => {
    acc[e.category] = (acc[e.category] ?? 0) + e.amount
    return acc
  }, {} as Record<string, number>)

  const pieData = Object.entries(expenseByCategory).map(([name, value]) => ({ name: name.replace(/_/g,' '), value }))
  const totalExpenses = mockExpenses.reduce((s, e) => s + e.amount, 0)
  const income = mockTransactions.filter(t => ['vehicle_sale','customer_payment','finance_received','advance_received','commission'].includes(t.type)).reduce((s, t) => s + t.amount, 0)
  const expenditure = mockTransactions.filter(t => ['vehicle_purchase','expense'].includes(t.type)).reduce((s, t) => s + t.amount, 0)

  return (
    <div className="space-y-5 pb-8">
      <PageHeader title="Accountant" subtitle="Business accounts & cash flow overview">
        <Button variant="outline" size="sm">Export Report</Button>
        <Button variant="khan" size="sm">Add Expense</Button>
      </PageHeader>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {loading ? Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />) : [
          { label: 'Total Income',     val: formatCurrency(income),       color: 'text-green-600',  icon: TrendingUp },
          { label: 'Total Expenditure',val: formatCurrency(expenditure),  color: 'text-red-600',    icon: TrendingDown },
          { label: 'Net Profit (Est)', val: formatCurrency(income - expenditure - totalExpenses), color: 'text-blue-600', icon: DollarSign },
          { label: 'Total Expenses',   val: formatCurrency(totalExpenses),color: 'text-orange-600', icon: ShoppingCart },
        ].map(s => (
          <Card key={s.label}><CardContent className="p-4 flex items-center gap-3">
            <div className="w-9 h-9 bg-muted rounded-lg flex items-center justify-center shrink-0"><s.icon className={`w-5 h-5 ${s.color}`} /></div>
            <div><div className={`text-lg font-bold ${s.color}`}>{s.val}</div><div className="text-xs text-muted-foreground">{s.label}</div></div>
          </CardContent></Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">Monthly Revenue vs Expenses</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={chart}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="period" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                <YAxis tickFormatter={v => `₹${(v/100000).toFixed(0)}L`} tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                <Tooltip formatter={(v: number) => formatCurrency(v)} />
                <Bar dataKey="profit" name="Profit" fill="#DC2626" radius={[4,4,0,0]} />
                <Bar dataKey="expenses" name="Expenses" fill="#F97316" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">Expenses by Category</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} dataKey="value" paddingAngle={3}>
                  {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(v: number) => formatCurrency(v)} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent expenses */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base">Recent Expenses</CardTitle></CardHeader>
        <CardContent className="space-y-1.5 pt-0">
          {mockExpenses.map(e => (
            <div key={e.id} className="flex items-center justify-between py-2 border-b last:border-0 text-sm">
              <div>
                <span className="font-medium capitalize">{e.description}</span>
                <span className="text-muted-foreground ml-2 text-xs capitalize">({e.category.replace(/_/g,' ')})</span>
                {e.vehicleInfo && <span className="text-muted-foreground ml-2 text-xs">{e.vehicleInfo}</span>}
              </div>
              <div className="text-right shrink-0">
                <div className="font-bold text-red-600">{formatCurrency(e.amount)}</div>
                <div className="text-xs text-muted-foreground">{new Date(e.date).toLocaleDateString('en-IN')}</div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
