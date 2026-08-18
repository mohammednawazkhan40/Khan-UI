'use client'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Users, Car, Wallet, CreditCard, Shield, Bell, ArrowLeftRight,
  Plus, Trash2, Edit2, Save, X, ChevronDown, ChevronRight, Search,
  CheckCircle2, AlertCircle, RefreshCw, UserPlus, CarFront, Banknote,
  FileText, Clock, Database
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { api, getToken, setToken, clearToken } from '@/lib/api/client'
import { formatCurrency } from '@/lib/utils'

type Tab = 'overview' | 'customers' | 'vehicles' | 'finance' | 'payments' | 'transactions' | 'rto' | 'reminders'

const tabs: { id: Tab; label: string; icon: any }[] = [
  { id: 'overview',     label: 'Overview',     icon: Database },
  { id: 'customers',    label: 'Customers',    icon: Users },
  { id: 'vehicles',     label: 'Vehicles',     icon: Car },
  { id: 'finance',      label: 'Finance',      icon: Wallet },
  { id: 'payments',     label: 'Payments',     icon: CreditCard },
  { id: 'transactions', label: 'Transactions', icon: ArrowLeftRight },
  { id: 'rto',          label: 'RTO Tasks',    icon: Shield },
  { id: 'reminders',    label: 'Reminders',    icon: Bell },
]

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<Tab>('overview')
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [loginForm, setLoginForm] = useState({ email: 'nawaz@kmcardeals.com', password: 'nawaz1234' })
  const [loginLoading, setLoginLoading] = useState(false)
  const [loginError, setLoginError] = useState('')

  useEffect(() => {
    const token = getToken()
    if (token) setIsLoggedIn(true)
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoginLoading(true)
    setLoginError('')
    try {
      const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || ''
      const res = await fetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginForm),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Login failed')
      setToken(data.token)
      setIsLoggedIn(true)
    } catch (err: any) {
      setLoginError(err.message)
    } finally {
      setLoginLoading(false)
    }
  }

  const handleLogout = () => {
    clearToken()
    setIsLoggedIn(false)
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm">
          <Card>
            <CardHeader className="text-center">
              <div className="w-12 h-12 mx-auto khan-gradient rounded-xl flex items-center justify-center mb-2">
                <span className="text-white font-black text-lg">K</span>
              </div>
              <CardTitle className="text-lg">Admin Portal</CardTitle>
              <p className="text-xs text-muted-foreground">Sign in to manage data</p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-3">
                <Input
                  type="email"
                  value={loginForm.email}
                  onChange={e => setLoginForm(f => ({ ...f, email: e.target.value }))}
                  placeholder="Email"
                  required
                />
                <Input
                  type="password"
                  value={loginForm.password}
                  onChange={e => setLoginForm(f => ({ ...f, password: e.target.value }))}
                  placeholder="Password"
                  required
                />
                {loginError && (
                  <div className="flex items-center gap-2 text-xs text-red-600">
                    <AlertCircle className="w-3 h-3" /> {loginError}
                  </div>
                )}
                <Button type="submit" variant="khan" className="w-full" loading={loginLoading}>
                  Sign In
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black">Admin Portal</h1>
          <p className="text-sm text-muted-foreground">Data Entry & Management</p>
        </div>
        <Button variant="outline" size="sm" onClick={handleLogout}>
          <X className="w-3 h-3 mr-1" /> Logout
        </Button>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 overflow-x-auto pb-1 border-b">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-t-lg text-sm font-medium transition-colors whitespace-nowrap ${
              activeTab === t.id
                ? 'bg-khan-red text-white'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            }`}
          >
            <t.icon className="w-3.5 h-3.5" />
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <motion.div key={activeTab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
        {activeTab === 'overview' && <OverviewTab />}
        {activeTab === 'customers' && <CustomersTab />}
        {activeTab === 'vehicles' && <VehiclesTab />}
        {activeTab === 'finance' && <FinanceTab />}
        {activeTab === 'payments' && <PaymentsTab />}
        {activeTab === 'transactions' && <TransactionsTab />}
        {activeTab === 'rto' && <RTOTab />}
        {activeTab === 'reminders' && <RemindersTab />}
      </motion.div>
    </div>
  )
}

// ── OVERVIEW TAB ─────────────────────────────────────────────────────────────
function OverviewTab() {
  const [summary, setSummary] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/api/dashboard/summary')
      .then(setSummary)
      .catch(() => setSummary(null))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <Card><CardContent className="p-8 text-center text-muted-foreground">Loading...</CardContent></Card>

  const stats = [
    { label: 'Total Vehicles', value: summary?.totalVehicles || 0, icon: Car, color: 'text-blue-600' },
    { label: 'Total Customers', value: summary?.totalCustomers || 0, icon: Users, color: 'text-green-600' },
    { label: 'Finance Outstanding', value: formatCurrency(summary?.totalOutstanding || 0), icon: Wallet, color: 'text-purple-600' },
    { label: 'Collected This Month', value: formatCurrency(summary?.totalCollectedThisMonth || 0), icon: Banknote, color: 'text-emerald-600' },
    { label: 'RTO Pending', value: summary?.rtoTasksPending || 0, icon: Shield, color: 'text-orange-600' },
    { label: 'Reminders Today', value: summary?.remindersToday || 0, icon: Bell, color: 'text-red-600' },
    { label: 'Overdue Payments', value: summary?.overduePayments || 0, icon: AlertCircle, color: 'text-red-600' },
    { label: 'Overdue Customers', value: summary?.overdueCustomers || 0, icon: AlertCircle, color: 'text-red-600' },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {stats.map(s => (
        <Card key={s.label}>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <s.icon className={`w-4 h-4 ${s.color}`} />
              <span className="text-xs text-muted-foreground">{s.label}</span>
            </div>
            <div className="text-xl font-bold">{s.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

// ── GENERIC CRUD TABLE ──────────────────────────────────────────────────────
function CrudTable({
  endpoint,
  columns,
  emptyMsg,
  renderForm,
}: {
  endpoint: string
  columns: { key: string; label: string; render?: (val: any, row: any) => React.ReactNode }[]
  emptyMsg: string
  renderForm: (onSave: () => void, editItem?: any | null, onCancel?: () => void) => React.ReactNode
}) {
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editItem, setEditItem] = useState<any | null>(null)
  const [search, setSearch] = useState('')

  const fetchItems = async () => {
    setLoading(true)
    try {
      const res = await api.get<{ data: any[] }>(endpoint)
      setItems(res.data || [])
    } catch { setItems([]) }
    setLoading(false)
  }

  useEffect(() => { fetchItems() }, [endpoint])

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this item?')) return
    try {
      await api.delete(`${endpoint}/${id}`)
      setItems(items.filter(i => i.id !== id))
    } catch {}
  }

  const handleSave = () => {
    setShowForm(false)
    setEditItem(null)
    fetchItems()
  }

  const filtered = items.filter(item => {
    if (!search) return true
    const s = search.toLowerCase()
    return Object.values(item).some(v => String(v).toLowerCase().includes(s))
  })

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search..."
            className="pl-9 h-9"
          />
        </div>
        <Button size="sm" variant="khan" onClick={() => { setEditItem(null); setShowForm(true) }}>
          <Plus className="w-3.5 h-3.5 mr-1" /> Add New
        </Button>
      </div>

      {showForm && (
        <Card className="border-khan-red/30">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">{editItem ? 'Edit' : 'Add New'} Entry</CardTitle>
              <Button size="sm" variant="ghost" onClick={() => { setShowForm(false); setEditItem(null) }}>
                <X className="w-3 h-3" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {renderForm(handleSave, editItem, () => { setShowForm(false); setEditItem(null) })}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center text-muted-foreground">Loading...</div>
          ) : filtered.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <Database className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p>{emptyMsg}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    {columns.map(c => (
                      <th key={c.key} className="px-3 py-2 text-left text-xs font-semibold text-muted-foreground">{c.label}</th>
                    ))}
                    <th className="px-3 py-2 text-right text-xs font-semibold text-muted-foreground w-20">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(item => (
                    <tr key={item.id} className="border-b hover:bg-muted/30 transition-colors">
                      {columns.map(c => (
                        <td key={c.key} className="px-3 py-2">
                          {c.render ? c.render((item as any)[c.key], item) : String((item as any)[c.key] ?? '-')}
                        </td>
                      ))}
                      <td className="px-3 py-2 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => { setEditItem(item); setShowForm(true) }}
                            className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="p-1 rounded hover:bg-red-50 text-muted-foreground hover:text-red-600 transition-colors"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
      <div className="text-xs text-muted-foreground text-right">{filtered.length} items</div>
    </div>
  )
}

// ── CUSTOMERS TAB ───────────────────────────────────────────────────────────
function CustomersTab() {
  return (
    <CrudTable
      endpoint="/api/customers"
      emptyMsg="No customers yet. Add your first customer above."
      columns={[
        { key: 'customer_id', label: 'ID' },
        { key: 'full_name', label: 'Name' },
        { key: 'phone', label: 'Phone' },
        { key: 'vehicle_registration', label: 'Vehicle' },
        { key: 'amount_pending', label: 'Pending', render: (v) => formatCurrency(v || 0) },
        { key: 'status', label: 'Status', render: (v) => (
          <Badge variant={v === 'overdue' ? 'overdue' : v === 'active' ? 'active' : 'secondary'}>{v || 'new'}</Badge>
        )},
      ]}
      renderForm={(onSave, edit, onCancel) => <CustomerForm onSave={onSave} editItem={edit} onCancel={onCancel!} />}
    />
  )
}

function CustomerForm({ onSave, editItem, onCancel }: { onSave: () => void; editItem?: any; onCancel: () => void }) {
  const [form, setForm] = useState({
    full_name: editItem?.full_name || '',
    phone: editItem?.phone || '',
    whatsapp: editItem?.whatsapp || '',
    email: editItem?.email || '',
    vehicle_registration: editItem?.vehicle_registration || '',
    vehicle_info: editItem?.vehicle_info || '',
    amount_pending: editItem?.amount_pending || 0,
    status: editItem?.status || 'active',
    notes: editItem?.notes || '',
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (editItem) {
        await api.put(`/api/customers/${editItem.id}`, form)
      } else {
        await api.post('/api/customers', form)
      }
      onSave()
    } catch {}
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-3">
      <Input placeholder="Full Name *" value={form.full_name} onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))} required />
      <Input placeholder="Phone *" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} required />
      <Input placeholder="WhatsApp" value={form.whatsapp} onChange={e => setForm(f => ({ ...f, whatsapp: e.target.value }))} />
      <Input placeholder="Email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
      <Input placeholder="Vehicle Registration" value={form.vehicle_registration} onChange={e => setForm(f => ({ ...f, vehicle_registration: e.target.value }))} />
      <Input placeholder="Vehicle Info (e.g. Maruti Swift 2022)" value={form.vehicle_info} onChange={e => setForm(f => ({ ...f, vehicle_info: e.target.value }))} />
      <Input type="number" placeholder="Amount Pending" value={form.amount_pending || ''} onChange={e => setForm(f => ({ ...f, amount_pending: Number(e.target.value) }))} />
      <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors">
        <option value="active">Active</option>
        <option value="overdue">Overdue</option>
        <option value="completed">Completed</option>
        <option value="pending">Pending</option>
      </select>
      <Input placeholder="Notes" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} className="col-span-2" />
      <div className="col-span-2 flex gap-2 justify-end">
        <Button type="button" variant="outline" size="sm" onClick={onCancel}>Cancel</Button>
        <Button type="submit" variant="khan" size="sm" loading={loading}>
          <Save className="w-3 h-3 mr-1" /> {editItem ? 'Update' : 'Save'}
        </Button>
      </div>
    </form>
  )
}

// ── VEHICLES TAB ────────────────────────────────────────────────────────────
function VehiclesTab() {
  return (
    <CrudTable
      endpoint="/api/vehicles"
      emptyMsg="No vehicles yet. Add your first vehicle above."
      columns={[
        { key: 'vehicle_id', label: 'ID' },
        { key: 'registration_number', label: 'Registration' },
        { key: 'brand', label: 'Brand' },
        { key: 'model', label: 'Model' },
        { key: 'year', label: 'Year' },
        { key: 'purchase_price', label: 'Purchase', render: (v) => formatCurrency(v || 0) },
        { key: 'selling_price', label: 'Selling', render: (v) => formatCurrency(v || 0) },
        { key: 'status', label: 'Status', render: (v) => (
          <Badge variant={v === 'sold' ? 'default' : v === 'delivered' ? 'secondary' : 'outline'}>{v || 'available'}</Badge>
        )},
      ]}
      renderForm={(onSave, edit, onCancel) => <VehicleForm onSave={onSave} editItem={edit} onCancel={onCancel!} />}
    />
  )
}

function VehicleForm({ onSave, editItem, onCancel }: { onSave: () => void; editItem?: any; onCancel: () => void }) {
  const [form, setForm] = useState({
    registration_number: editItem?.registration_number || '',
    brand: editItem?.brand || '',
    model: editItem?.model || '',
    year: editItem?.year || new Date().getFullYear(),
    fuel: editItem?.fuel || 'petrol',
    km_driven: editItem?.km_driven || 0,
    purchase_price: editItem?.purchase_price || 0,
    selling_price: editItem?.selling_price || 0,
    status: editItem?.status || 'available',
    lifecycle_stage: editItem?.lifecycle_stage || 'listed',
    notes: editItem?.notes || '',
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (editItem) {
        await api.put(`/api/vehicles/${editItem.id}`, form)
      } else {
        await api.post('/api/vehicles', form)
      }
      onSave()
    } catch {}
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-3">
      <Input placeholder="Registration Number *" value={form.registration_number} onChange={e => setForm(f => ({ ...f, registration_number: e.target.value }))} required />
      <Input placeholder="Brand *" value={form.brand} onChange={e => setForm(f => ({ ...f, brand: e.target.value }))} required />
      <Input placeholder="Model *" value={form.model} onChange={e => setForm(f => ({ ...f, model: e.target.value }))} required />
      <Input type="number" placeholder="Year" value={form.year} onChange={e => setForm(f => ({ ...f, year: Number(e.target.value) }))} />
      <select value={form.fuel} onChange={e => setForm(f => ({ ...f, fuel: e.target.value }))}
        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors">
        <option value="petrol">Petrol</option>
        <option value="diesel">Diesel</option>
        <option value="cng">CNG</option>
        <option value="electric">Electric</option>
        <option value="hybrid">Hybrid</option>
      </select>
      <Input type="number" placeholder="KM Driven" value={form.km_driven || ''} onChange={e => setForm(f => ({ ...f, km_driven: Number(e.target.value) }))} />
      <Input type="number" placeholder="Purchase Price" value={form.purchase_price || ''} onChange={e => setForm(f => ({ ...f, purchase_price: Number(e.target.value) }))} />
      <Input type="number" placeholder="Selling Price" value={form.selling_price || ''} onChange={e => setForm(f => ({ ...f, selling_price: Number(e.target.value) }))} />
      <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors">
        <option value="available">Available</option>
        <option value="listed">Listed</option>
        <option value="repair">In Repair</option>
        <option value="booked">Booked</option>
        <option value="sold">Sold</option>
        <option value="delivered">Delivered</option>
      </select>
      <select value={form.lifecycle_stage} onChange={e => setForm(f => ({ ...f, lifecycle_stage: e.target.value }))}
        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors">
        <option value="listed">Listed</option>
        <option value="inspection">Inspection</option>
        <option value="repair">Repair</option>
        <option value="rto">RTO Processing</option>
        <option value="ready">Ready for Sale</option>
        <option value="sold">Sold</option>
        <option value="delivered">Delivered</option>
      </select>
      <Input placeholder="Notes" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} className="col-span-2" />
      <div className="col-span-2 flex gap-2 justify-end">
        <Button type="button" variant="outline" size="sm" onClick={onCancel}>Cancel</Button>
        <Button type="submit" variant="khan" size="sm" loading={loading}>
          <Save className="w-3 h-3 mr-1" /> {editItem ? 'Update' : 'Save'}
        </Button>
      </div>
    </form>
  )
}

// ── FINANCE TAB ─────────────────────────────────────────────────────────────
function FinanceTab() {
  return (
    <CrudTable
      endpoint="/api/finance"
      emptyMsg="No finance accounts yet."
      columns={[
        { key: 'finance_id', label: 'ID' },
        { key: 'customer_name', label: 'Customer' },
        { key: 'finance_company', label: 'Finance Co.' },
        { key: 'loan_amount', label: 'Loan', render: (v) => formatCurrency(v || 0) },
        { key: 'outstanding_amount', label: 'Outstanding', render: (v) => formatCurrency(v || 0) },
        { key: 'emi_amount', label: 'EMI', render: (v) => formatCurrency(v || 0) },
        { key: 'status', label: 'Status', render: (v) => (
          <Badge variant={v === 'overdue' ? 'overdue' : v === 'completed' ? 'completed' : 'secondary'}>{v || 'active'}</Badge>
        )},
      ]}
      renderForm={(onSave, edit, onCancel) => <FinanceForm onSave={onSave} editItem={edit} onCancel={onCancel!} />}
    />
  )
}

function FinanceForm({ onSave, editItem, onCancel }: { onSave: () => void; editItem?: any; onCancel: () => void }) {
  const [form, setForm] = useState({
    customer_name: editItem?.customer_name || '',
    customer_id: editItem?.customer_id || '',
    finance_company: editItem?.finance_company || '',
    loan_amount: editItem?.loan_amount || 0,
    emi_amount: editItem?.emi_amount || 0,
    total_installments: editItem?.total_installments || 0,
    interest_rate: editItem?.interest_rate || 0,
    loan_start_date: editItem?.loan_start_date || '',
    status: editItem?.status || 'active',
    commission_amount: editItem?.commission_amount || 0,
    notes: editItem?.notes || '',
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (editItem) {
        await api.put(`/api/finance/${editItem.id}`, form)
      } else {
        await api.post('/api/finance', form)
      }
      onSave()
    } catch {}
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-3">
      <Input placeholder="Customer Name *" value={form.customer_name} onChange={e => setForm(f => ({ ...f, customer_name: e.target.value }))} required />
      <Input placeholder="Finance Company *" value={form.finance_company} onChange={e => setForm(f => ({ ...f, finance_company: e.target.value }))} required />
      <Input type="number" placeholder="Loan Amount *" value={form.loan_amount || ''} onChange={e => setForm(f => ({ ...f, loan_amount: Number(e.target.value) }))} required />
      <Input type="number" placeholder="EMI Amount *" value={form.emi_amount || ''} onChange={e => setForm(f => ({ ...f, emi_amount: Number(e.target.value) }))} required />
      <Input type="number" placeholder="Total Installments" value={form.total_installments || ''} onChange={e => setForm(f => ({ ...f, total_installments: Number(e.target.value) }))} />
      <Input type="number" placeholder="Interest Rate %" value={form.interest_rate || ''} onChange={e => setForm(f => ({ ...f, interest_rate: Number(e.target.value) }))} />
      <Input type="date" placeholder="Loan Start Date" value={form.loan_start_date} onChange={e => setForm(f => ({ ...f, loan_start_date: e.target.value }))} />
      <Input type="number" placeholder="Commission Amount" value={form.commission_amount || ''} onChange={e => setForm(f => ({ ...f, commission_amount: Number(e.target.value) }))} />
      <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors">
        <option value="active">Active</option>
        <option value="overdue">Overdue</option>
        <option value="completed">Completed</option>
        <option value="defaulted">Defaulted</option>
      </select>
      <Input placeholder="Notes" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} className="col-span-2" />
      <div className="col-span-2 flex gap-2 justify-end">
        <Button type="button" variant="outline" size="sm" onClick={onCancel}>Cancel</Button>
        <Button type="submit" variant="khan" size="sm" loading={loading}>
          <Save className="w-3 h-3 mr-1" /> {editItem ? 'Update' : 'Save'}
        </Button>
      </div>
    </form>
  )
}

// ── PAYMENTS TAB ────────────────────────────────────────────────────────────
function PaymentsTab() {
  return (
    <CrudTable
      endpoint="/api/payments"
      emptyMsg="No payment records yet."
      columns={[
        { key: 'payment_id', label: 'ID' },
        { key: 'customer_name', label: 'Customer' },
        { key: 'amount', label: 'Amount', render: (v) => formatCurrency(v || 0) },
        { key: 'due_date', label: 'Due Date' },
        { key: 'paid_date', label: 'Paid Date' },
        { key: 'status', label: 'Status', render: (v) => (
          <Badge variant={v === 'overdue' ? 'overdue' : v === 'paid' ? 'completed' : v === 'due_today' ? 'overdue' : 'secondary'}>{v || 'upcoming'}</Badge>
        )},
      ]}
      renderForm={(onSave, edit, onCancel) => <PaymentForm onSave={onSave} editItem={edit} onCancel={onCancel!} />}
    />
  )
}

function PaymentForm({ onSave, editItem, onCancel }: { onSave: () => void; editItem?: any; onCancel: () => void }) {
  const [form, setForm] = useState({
    customer_name: editItem?.customer_name || '',
    customer_id: editItem?.customer_id || '',
    amount: editItem?.amount || 0,
    due_date: editItem?.due_date || '',
    paid_date: editItem?.paid_date || '',
    method: editItem?.method || 'cash',
    status: editItem?.status || 'upcoming',
    notes: editItem?.notes || '',
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (editItem) {
        await api.put(`/api/payments/${editItem.id}`, form)
      } else {
        await api.post('/api/payments', form)
      }
      onSave()
    } catch {}
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-3">
      <Input placeholder="Customer Name *" value={form.customer_name} onChange={e => setForm(f => ({ ...f, customer_name: e.target.value }))} required />
      <Input type="number" placeholder="Amount *" value={form.amount || ''} onChange={e => setForm(f => ({ ...f, amount: Number(e.target.value) }))} required />
      <Input type="date" placeholder="Due Date *" value={form.due_date} onChange={e => setForm(f => ({ ...f, due_date: e.target.value }))} required />
      <Input type="date" placeholder="Paid Date" value={form.paid_date} onChange={e => setForm(f => ({ ...f, paid_date: e.target.value }))} />
      <select value={form.method} onChange={e => setForm(f => ({ ...f, method: e.target.value }))}
        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors">
        <option value="cash">Cash</option>
        <option value="upi">UPI</option>
        <option value="bank_transfer">Bank Transfer</option>
        <option value="cheque">Cheque</option>
      </select>
      <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors">
        <option value="upcoming">Upcoming</option>
        <option value="due_today">Due Today</option>
        <option value="overdue">Overdue</option>
        <option value="paid">Paid</option>
      </select>
      <Input placeholder="Notes" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} className="col-span-2" />
      <div className="col-span-2 flex gap-2 justify-end">
        <Button type="button" variant="outline" size="sm" onClick={onCancel}>Cancel</Button>
        <Button type="submit" variant="khan" size="sm" loading={loading}>
          <Save className="w-3 h-3 mr-1" /> {editItem ? 'Update' : 'Save'}
        </Button>
      </div>
    </form>
  )
}

// ── TRANSACTIONS TAB ────────────────────────────────────────────────────────
function TransactionsTab() {
  return (
    <CrudTable
      endpoint="/api/transactions"
      emptyMsg="No transactions yet."
      columns={[
        { key: 'transaction_id', label: 'ID' },
        { key: 'date', label: 'Date' },
        { key: 'type', label: 'Type', render: (v) => <Badge variant="outline">{v}</Badge> },
        { key: 'amount', label: 'Amount', render: (v) => formatCurrency(v || 0) },
        { key: 'method', label: 'Method' },
        { key: 'customer_name', label: 'Customer' },
        { key: 'status', label: 'Status', render: (v) => (
          <Badge variant={v === 'completed' ? 'default' : 'secondary'}>{v || 'pending'}</Badge>
        )},
      ]}
      renderForm={(onSave, edit, onCancel) => <TransactionForm onSave={onSave} editItem={edit} onCancel={onCancel!} />}
    />
  )
}

function TransactionForm({ onSave, editItem, onCancel }: { onSave: () => void; editItem?: any; onCancel: () => void }) {
  const [form, setForm] = useState({
    date: editItem?.date || new Date().toISOString().slice(0, 10),
    type: editItem?.type || 'vehicle_sale',
    amount: editItem?.amount || 0,
    method: editItem?.method || 'cash',
    customer_name: editItem?.customer_name || '',
    description: editItem?.description || '',
    reference_number: editItem?.reference_number || '',
    status: editItem?.status || 'completed',
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await api.post('/api/transactions', form)
      onSave()
    } catch {}
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-3">
      <Input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} required />
      <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors">
        <option value="vehicle_sale">Vehicle Sale</option>
        <option value="vehicle_purchase">Vehicle Purchase</option>
        <option value="customer_payment">Customer Payment</option>
        <option value="expense">Expense</option>
        <option value="emi_payment">EMI Payment</option>
        <option value="commission">Commission</option>
        <option value="refund">Refund</option>
        <option value="other">Other</option>
      </select>
      <Input type="number" placeholder="Amount *" value={form.amount || ''} onChange={e => setForm(f => ({ ...f, amount: Number(e.target.value) }))} required />
      <select value={form.method} onChange={e => setForm(f => ({ ...f, method: e.target.value }))}
        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors">
        <option value="cash">Cash</option>
        <option value="upi">UPI</option>
        <option value="bank_transfer">Bank Transfer</option>
        <option value="cheque">Cheque</option>
      </select>
      <Input placeholder="Customer Name" value={form.customer_name} onChange={e => setForm(f => ({ ...f, customer_name: e.target.value }))} />
      <Input placeholder="Reference Number" value={form.reference_number} onChange={e => setForm(f => ({ ...f, reference_number: e.target.value }))} />
      <Input placeholder="Description *" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="col-span-2" required />
      <div className="col-span-2 flex gap-2 justify-end">
        <Button type="button" variant="outline" size="sm" onClick={onCancel}>Cancel</Button>
        <Button type="submit" variant="khan" size="sm" loading={loading}>
          <Save className="w-3 h-3 mr-1" /> Save Transaction
        </Button>
      </div>
    </form>
  )
}

// ── RTO TAB ─────────────────────────────────────────────────────────────────
function RTOTab() {
  return (
    <CrudTable
      endpoint="/api/rto"
      emptyMsg="No RTO tasks yet."
      columns={[
        { key: 'task_id', label: 'ID' },
        { key: 'vehicle_registration', label: 'Vehicle' },
        { key: 'task_type', label: 'Type' },
        { key: 'rto_office', label: 'RTO Office' },
        { key: 'expected_completion_date', label: 'Deadline' },
        { key: 'priority', label: 'Priority', render: (v) => (
          <Badge variant={v === 'critical' ? 'critical' : v === 'high' ? 'high' : 'secondary'}>{v || 'medium'}</Badge>
        )},
        { key: 'status', label: 'Status', render: (v) => (
          <Badge variant={v === 'completed' ? 'default' : 'outline'}>{v || 'pending'}</Badge>
        )},
      ]}
      renderForm={(onSave, edit, onCancel) => <RTOForm onSave={onSave} editItem={edit} onCancel={onCancel!} />}
    />
  )
}

function RTOForm({ onSave, editItem, onCancel }: { onSave: () => void; editItem?: any; onCancel: () => void }) {
  const [form, setForm] = useState({
    vehicle_registration: editItem?.vehicle_registration || '',
    customer_name: editItem?.customer_name || '',
    task_type: editItem?.task_type || 'rc_transfer',
    rto_office: editItem?.rto_office || '',
    expected_completion_date: editItem?.expected_completion_date || '',
    priority: editItem?.priority || 'medium',
    status: editItem?.status || 'pending',
    notes: editItem?.notes || '',
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (editItem) {
        await api.put(`/api/rto/${editItem.id}`, form)
      } else {
        await api.post('/api/rto', form)
      }
      onSave()
    } catch {}
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-3">
      <Input placeholder="Vehicle Registration *" value={form.vehicle_registration} onChange={e => setForm(f => ({ ...f, vehicle_registration: e.target.value }))} required />
      <Input placeholder="Customer Name" value={form.customer_name} onChange={e => setForm(f => ({ ...f, customer_name: e.target.value }))} />
      <select value={form.task_type} onChange={e => setForm(f => ({ ...f, task_type: e.target.value }))}
        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors">
        <option value="rc_transfer">RC Transfer</option>
        <option value="noc">NOC</option>
        <option value="insurance">Insurance</option>
        <option value="fitness">Fitness Certificate</option>
        <option value="hypothecation">Hypothecation</option>
        <option value="other">Other</option>
      </select>
      <Input placeholder="RTO Office" value={form.rto_office} onChange={e => setForm(f => ({ ...f, rto_office: e.target.value }))} />
      <Input type="date" placeholder="Deadline" value={form.expected_completion_date} onChange={e => setForm(f => ({ ...f, expected_completion_date: e.target.value }))} />
      <select value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}
        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors">
        <option value="low">Low</option>
        <option value="medium">Medium</option>
        <option value="high">High</option>
        <option value="critical">Critical</option>
      </select>
      <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors">
        <option value="pending">Pending</option>
        <option value="in_progress">In Progress</option>
        <option value="completed">Completed</option>
        <option value="cancelled">Cancelled</option>
      </select>
      <Input placeholder="Notes" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} className="col-span-2" />
      <div className="col-span-2 flex gap-2 justify-end">
        <Button type="button" variant="outline" size="sm" onClick={onCancel}>Cancel</Button>
        <Button type="submit" variant="khan" size="sm" loading={loading}>
          <Save className="w-3 h-3 mr-1" /> {editItem ? 'Update' : 'Save'}
        </Button>
      </div>
    </form>
  )
}

// ── REMINDERS TAB ───────────────────────────────────────────────────────────
function RemindersTab() {
  return (
    <CrudTable
      endpoint="/api/reminders"
      emptyMsg="No reminders yet."
      columns={[
        { key: 'reminder_id', label: 'ID' },
        { key: 'title', label: 'Title' },
        { key: 'customer_name', label: 'Customer' },
        { key: 'due_date', label: 'Due Date' },
        { key: 'priority', label: 'Priority', render: (v) => (
          <Badge variant={v === 'critical' ? 'critical' : v === 'high' ? 'high' : 'secondary'}>{v || 'medium'}</Badge>
        )},
        { key: 'status', label: 'Status', render: (v) => (
          <Badge variant={v === 'completed' ? 'completed' : v === 'overdue' ? 'overdue' : 'outline'}>{v || 'upcoming'}</Badge>
        )},
      ]}
      renderForm={(onSave, edit, onCancel) => <ReminderForm onSave={onSave} editItem={edit} onCancel={onCancel!} />}
    />
  )
}

function ReminderForm({ onSave, editItem, onCancel }: { onSave: () => void; editItem?: any; onCancel: () => void }) {
  const [form, setForm] = useState({
    title: editItem?.title || '',
    description: editItem?.description || '',
    customer_name: editItem?.customer_name || '',
    customer_id: editItem?.customer_id || '',
    due_date: editItem?.due_date || '',
    priority: editItem?.priority || 'medium',
    status: editItem?.status || 'upcoming',
    repeat: editItem?.repeat || 'none',
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (editItem) {
        await api.put(`/api/reminders/${editItem.id}`, form)
      } else {
        await api.post('/api/reminders', form)
      }
      onSave()
    } catch {}
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-3">
      <Input placeholder="Title *" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required className="col-span-2" />
      <Input placeholder="Customer Name" value={form.customer_name} onChange={e => setForm(f => ({ ...f, customer_name: e.target.value }))} />
      <Input type="date" placeholder="Due Date *" value={form.due_date} onChange={e => setForm(f => ({ ...f, due_date: e.target.value }))} required />
      <select value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}
        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors">
        <option value="low">Low</option>
        <option value="medium">Medium</option>
        <option value="high">High</option>
        <option value="critical">Critical</option>
      </select>
      <select value={form.repeat} onChange={e => setForm(f => ({ ...f, repeat: e.target.value }))}
        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors">
        <option value="none">No Repeat</option>
        <option value="daily">Daily</option>
        <option value="weekly">Weekly</option>
        <option value="monthly">Monthly</option>
      </select>
      <Input placeholder="Description" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="col-span-2" />
      <div className="col-span-2 flex gap-2 justify-end">
        <Button type="button" variant="outline" size="sm" onClick={onCancel}>Cancel</Button>
        <Button type="submit" variant="khan" size="sm" loading={loading}>
          <Save className="w-3 h-3 mr-1" /> {editItem ? 'Update' : 'Save'}
        </Button>
      </div>
    </form>
  )
}
