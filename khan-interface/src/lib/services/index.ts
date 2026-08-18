/**
 * SERVICE LAYER — Khan Interface
 *
 * When NEXT_PUBLIC_API_BASE_URL is set → uses real backend (Render)
 * When not set → uses mock data (demo mode)
 *
 * This means: zero changes to any component when switching to real backend.
 */

import { api, getToken } from '@/lib/api/client'
import type {
  Customer, Vehicle, FinanceAccount, FinancePerson, Payment, Transaction,
  Expense, RTOTask, Reminder, CalendarEvent, Notification, AIAgent,
  AgentActivity, AgentResult, AgentChatMessage, AgentId,
} from '@/types'

// Detect if real backend is configured
const USE_API = Boolean(process.env.NEXT_PUBLIC_API_BASE_URL)

// ── Lazy mock imports (only loaded in demo mode) ──────────────────────────────
async function getMock() {
  return import('@/lib/mock')
}

const delay = (ms = 400) => new Promise(r => setTimeout(r, ms))

// ── Auth ──────────────────────────────────────────────────────────────────────
export async function login(email: string, password: string) {
  if (USE_API) {
    const res = await api.post<{ token: string; user: any }>('/api/auth/login', { email, password })
    const { setToken } = await import('@/lib/api/client')
    setToken(res.token)
    return res
  }
  // Mock login — accept any credentials in demo mode
  await delay(800)
  return { token: 'demo_token', user: { name: 'Nawaz Khan', email, role: 'admin' } }
}

export async function logout() {
  const { clearToken } = await import('@/lib/api/client')
  clearToken()
}

// ── Customers ─────────────────────────────────────────────────────────────────
export async function getCustomers(params?: { status?: string; search?: string }): Promise<Customer[]> {
  if (USE_API) {
    const q = new URLSearchParams(params as Record<string,string>).toString()
    const res = await api.get<{ data: Customer[] }>(`/api/customers${q ? '?' + q : ''}`)
    return res.data
  }
  await delay()
  const mock = await getMock()
  return mock.mockCustomers
}

export async function getCustomerById(id: string): Promise<Customer | undefined> {
  if (USE_API) {
    return api.get<Customer>(`/api/customers/${id}`)
  }
  await delay(200)
  const mock = await getMock()
  return mock.mockCustomers.find(c => c.id === id)
}

export async function createCustomer(data: Partial<Customer>): Promise<Customer> {
  if (USE_API) return api.post<Customer>('/api/customers', data)
  await delay()
  const mock = await getMock()
  return { ...data, id: `c${Date.now()}`, customerId: `KHN-C${Date.now()}`, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() } as Customer
}

export async function updateCustomer(id: string, data: Partial<Customer>): Promise<Customer> {
  if (USE_API) return api.put<Customer>(`/api/customers/${id}`, data)
  await delay()
  const mock = await getMock()
  const c = mock.mockCustomers.find(x => x.id === id)!
  return { ...c, ...data, updatedAt: new Date().toISOString() }
}

export async function deleteCustomer(id: string): Promise<void> {
  if (USE_API) { await api.delete(`/api/customers/${id}`); return }
  await delay()
}

// ── Vehicles ──────────────────────────────────────────────────────────────────
export async function getVehicles(params?: { status?: string; search?: string }): Promise<Vehicle[]> {
  if (USE_API) {
    const q = new URLSearchParams(params as Record<string,string>).toString()
    const res = await api.get<{ data: Vehicle[] }>(`/api/vehicles${q ? '?' + q : ''}`)
    return res.data
  }
  await delay()
  const mock = await getMock()
  return mock.mockVehicles
}

export async function getVehicleById(id: string): Promise<Vehicle | undefined> {
  if (USE_API) return api.get<Vehicle>(`/api/vehicles/${id}`)
  await delay(200)
  const mock = await getMock()
  return mock.mockVehicles.find(v => v.id === id)
}

export async function createVehicle(data: Partial<Vehicle>): Promise<Vehicle> {
  if (USE_API) return api.post<Vehicle>('/api/vehicles', data)
  await delay()
  return { ...data, id: `v${Date.now()}`, vehicleId: `KHN-V${Date.now()}`, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() } as Vehicle
}

export async function updateVehicle(id: string, data: Partial<Vehicle>): Promise<Vehicle> {
  if (USE_API) return api.put<Vehicle>(`/api/vehicles/${id}`, data)
  await delay()
  const mock = await getMock()
  const v = mock.mockVehicles.find(x => x.id === id)!
  return { ...v, ...data, updatedAt: new Date().toISOString() }
}

// ── Finance ───────────────────────────────────────────────────────────────────
export async function getFinanceAccounts(): Promise<FinanceAccount[]> {
  if (USE_API) {
    const res = await api.get<{ data: FinanceAccount[] }>('/api/finance')
    return res.data
  }
  await delay()
  const mock = await getMock()
  return mock.mockFinanceAccounts
}

export async function getFinanceAccountById(id: string): Promise<FinanceAccount | undefined> {
  if (USE_API) return api.get<FinanceAccount>(`/api/finance/${id}`)
  await delay(200)
  const mock = await getMock()
  return mock.mockFinanceAccounts.find(f => f.id === id)
}

export async function recordFinancePayment(
  financeId: string, amount: number, method: string, reference?: string
): Promise<any> {
  if (USE_API) {
    return api.post(`/api/finance/${financeId}/record-payment`, {
      amount, method, reference, date: new Date().toISOString().slice(0, 10)
    })
  }
  await delay(600)
  return { message: 'Payment recorded (demo)' }
}

export async function getFinancePersons(): Promise<FinancePerson[]> {
  await delay()
  const mock = await getMock()
  return mock.mockFinancePersons
}

// ── Payments ──────────────────────────────────────────────────────────────────
export async function getPayments(status?: string): Promise<Payment[]> {
  if (USE_API) {
    const res = await api.get<{ data: Payment[] }>(`/api/payments${status ? '?status=' + status : ''}`)
    return res.data
  }
  await delay()
  const mock = await getMock()
  return status ? mock.mockPayments.filter(p => p.status === status) : mock.mockPayments
}

export async function getOverduePayments(): Promise<Payment[]> {
  return getPayments('overdue')
}

export async function getOutstandingPayments(): Promise<Payment[]> {
  if (USE_API) {
    const res = await api.get<{ data: Payment[] }>('/api/payments')
    return res.data.filter(p => p.status !== 'paid')
  }
  await delay()
  const mock = await getMock()
  return mock.mockPayments.filter(p => p.status !== 'paid')
}

// ── Transactions ──────────────────────────────────────────────────────────────
export async function getTransactions(): Promise<Transaction[]> {
  if (USE_API) {
    const res = await api.get<{ data: Transaction[] }>('/api/transactions')
    return res.data
  }
  await delay()
  const mock = await getMock()
  return mock.mockTransactions
}

export async function createTransaction(data: Partial<Transaction>): Promise<Transaction> {
  if (USE_API) return api.post<Transaction>('/api/transactions', data)
  await delay()
  return { ...data, id: `txn${Date.now()}`, transactionId: `KHN-TXN-${Date.now()}`, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() } as Transaction
}

export async function getExpenses(): Promise<Expense[]> {
  await delay()
  const mock = await getMock()
  return mock.mockExpenses
}

// ── RTO ───────────────────────────────────────────────────────────────────────
export async function getRTOTasks(status?: string): Promise<RTOTask[]> {
  if (USE_API) {
    const res = await api.get<{ data: RTOTask[] }>(`/api/rto${status ? '?status=' + status : ''}`)
    return res.data
  }
  await delay()
  const mock = await getMock()
  return mock.mockRTOTasks
}

export async function getRTOTaskById(id: string): Promise<RTOTask | undefined> {
  if (USE_API) return api.get<RTOTask>(`/api/rto/${id}`)
  await delay(200)
  const mock = await getMock()
  return mock.mockRTOTasks.find(r => r.id === id)
}

export async function createRTOTask(data: Partial<RTOTask>): Promise<RTOTask> {
  if (USE_API) return api.post<RTOTask>('/api/rto', data)
  await delay()
  return { ...data, id: `rto${Date.now()}`, taskId: `KHN-RTO-${Date.now()}`, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() } as RTOTask
}

export async function updateRTOTask(id: string, data: Partial<RTOTask>): Promise<RTOTask> {
  if (USE_API) return api.put<RTOTask>(`/api/rto/${id}`, data)
  await delay()
  const mock = await getMock()
  const r = mock.mockRTOTasks.find(x => x.id === id)!
  return { ...r, ...data, updatedAt: new Date().toISOString() }
}

// ── Reminders ─────────────────────────────────────────────────────────────────
export async function getReminders(): Promise<Reminder[]> {
  if (USE_API) {
    const res = await api.get<{ data: Reminder[] }>('/api/reminders')
    return res.data
  }
  await delay()
  const mock = await getMock()
  return mock.mockReminders
}

export async function getTodayReminders(): Promise<Reminder[]> {
  if (USE_API) {
    const res = await api.get<{ data: Reminder[] }>('/api/reminders?status=due_today')
    return res.data
  }
  await delay()
  const mock = await getMock()
  return mock.mockReminders.filter(r => r.status === 'due_today' || r.status === 'overdue')
}

export async function createReminder(data: Partial<Reminder>): Promise<Reminder> {
  if (USE_API) return api.post<Reminder>('/api/reminders', data)
  await delay()
  return { ...data, id: `rem${Date.now()}`, reminderId: `KHN-REM-${Date.now()}`, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() } as Reminder
}

export async function completeReminder(id: string): Promise<Reminder> {
  if (USE_API) return api.patch<Reminder>(`/api/reminders/${id}/complete`, {})
  await delay()
  const mock = await getMock()
  const r = mock.mockReminders.find(x => x.id === id)!
  return { ...r, status: 'completed' as const, completedAt: new Date().toISOString() }
}

// ── Calendar ──────────────────────────────────────────────────────────────────
export async function getCalendarEvents(): Promise<CalendarEvent[]> {
  await delay()
  const mock = await getMock()
  return mock.mockCalendarEvents
}

export async function createCalendarEvent(data: Partial<CalendarEvent>): Promise<CalendarEvent> {
  await delay()
  return { ...data, id: `ev${Date.now()}`, createdAt: new Date().toISOString() } as CalendarEvent
}

// ── Notifications ─────────────────────────────────────────────────────────────
export async function getNotifications(): Promise<Notification[]> {
  if (USE_API) {
    const res = await api.get<{ data: Notification[] }>('/api/notifications')
    return res.data
  }
  await delay()
  const mock = await getMock()
  return mock.mockNotifications
}

export async function markNotificationRead(id: string): Promise<void> {
  if (USE_API) await api.patch(`/api/notifications/${id}/read`, {})
  await delay(100)
}

export async function markAllNotificationsRead(): Promise<void> {
  if (USE_API) await api.patch('/api/notifications/mark-all-read', {})
  await delay(200)
}

// ── WhatsApp ──────────────────────────────────────────────────────────────────
export async function sendWhatsApp(customerId: string, type: string, notes?: string) {
  if (USE_API) {
    return api.post('/api/whatsapp/follow-up', { customerId, type, notes })
  }
  await delay(800)
  return { success: true, mock: true, message: 'WhatsApp message sent (demo mode)' }
}

export async function sendPaymentReminder(customerId: string, amount: number, dueDate: string, financeCompany: string) {
  if (USE_API) {
    return api.post('/api/whatsapp/payment-reminder', { customerId, amount, dueDate, financeCompany })
  }
  await delay(800)
  return { success: true, mock: true, message: 'Payment reminder sent (demo mode)' }
}

// ── AI Agents ─────────────────────────────────────────────────────────────────
export async function getAgents(): Promise<AIAgent[]> {
  await delay()
  const mock = await getMock()
  return mock.mockAgents
}

export async function getAgentById(id: AgentId): Promise<AIAgent | undefined> {
  await delay(200)
  const mock = await getMock()
  return mock.mockAgents.find(a => a.id === id)
}

export async function getAgentActivities(): Promise<AgentActivity[]> {
  await delay()
  const mock = await getMock()
  return mock.mockAgentActivities
}

export async function runAgent(id: AgentId): Promise<AgentResult> {
  // Build live context from current mock/real data
  const [customers, finance, rto, vehicles, payments, reminders] = await Promise.all([
    getCustomers(),
    getFinanceAccounts(),
    getRTOTasks(),
    getVehicles(),
    getPayments(),
    getReminders(),
  ])

  const context = {
    customers,
    overdueCustomers:   customers.filter(c => c.status === 'overdue'),
    financeAccounts:    finance,
    overdueAccounts:    finance.filter(f => f.status === 'overdue'),
    totalOutstanding:   finance.reduce((s, f) => s + f.outstandingAmount, 0),
    rtoTasks:           rto.filter(r => !['completed','cancelled'].includes(r.status)),
    criticalTasks:      rto.filter(r => r.priority === 'critical' && r.status !== 'completed'),
    vehicles,
    availableVehicles:  vehicles.filter(v => ['listed','available'].includes(v.status)),
    overduePayments:    payments.filter(p => p.status === 'overdue'),
    todayReminders:     reminders.filter(r => r.status === 'due_today'),
  }

  try {
    const res = await fetch('/api/ai/run', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ agentId: id, context }),
    })
    if (!res.ok) throw new Error('API error')
    const data = await res.json()
    return {
      summary:      data.output,
      findings:     [],
      totalChecked: customers.length + finance.length + rto.length,
      alertCount:   context.overdueAccounts.length + context.criticalTasks.length,
      criticalCount: context.overdueAccounts.length,
      generatedAt:  data.generatedAt || new Date().toISOString(),
      recommendations: [],
    }
  } catch {
    await delay(1000)
    const mock = await getMock()
    return mock.mockFinanceAgentResult
  }
}

export async function getAgentChatHistory(id: AgentId): Promise<AgentChatMessage[]> {
  await delay(200)
  const mock = await getMock()
  return mock.mockChatHistories[id] ?? []
}

export async function sendAgentMessage(
  id: AgentId,
  message: string,
  history: AgentChatMessage[] = [],
  context?: Record<string, unknown>
): Promise<AgentChatMessage> {
  // Always hit our Next.js API route — it holds the Groq key server-side
  try {
    const res = await fetch('/api/ai/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ agentId: id, message, history, context: context || {} }),
    })
    if (!res.ok) throw new Error('API error')
    const data = await res.json()
    return { ...data, agentId: id, role: 'agent' as const }
  } catch {
    await delay(600)
    return {
      id: `msg${Date.now()}`, agentId: id, role: 'agent' as const,
      content: `⚠️ Could not reach AI service. Make sure the app is running and GROQ_API_KEY is set in .env.local`,
      timestamp: new Date().toISOString(),
    }
  }
}

// ── Dashboard ─────────────────────────────────────────────────────────────────
export async function getDashboardSummary() {
  if (USE_API) return api.get('/api/dashboard/summary')
  await delay(300)
  const mock = await getMock()
  const overdue = mock.mockPayments.filter(p => p.status === 'overdue')
  const totalOutstanding = mock.mockFinanceAccounts.reduce((s, f) => s + f.outstandingAmount, 0)
  return {
    totalVehicles:            mock.mockVehicles.length,
    availableVehicles:        mock.mockVehicles.filter(v => ['available','listed','repair'].includes(v.status)).length,
    soldThisMonth:            3,
    totalCustomers:           mock.mockCustomers.length,
    activeCustomers:          mock.mockCustomers.filter(c => c.status === 'active').length,
    overdueCustomers:         mock.mockCustomers.filter(c => c.status === 'overdue').length,
    totalOutstanding,
    totalCollectedThisMonth:  135500,
    pendingPayments:          mock.mockPayments.filter(p => p.status !== 'paid').length,
    overduePayments:          overdue.length,
    financeOutstanding:       totalOutstanding,
    rtoTasksPending:          mock.mockRTOTasks.filter(r => !['completed','cancelled'].includes(r.status)).length,
    rtoTasksOverdue:          mock.mockRTOTasks.filter(r => r.status === 'overdue').length,
    remindersToday:           mock.mockReminders.filter(r => r.status === 'due_today').length,
    remindersOverdue:         mock.mockReminders.filter(r => r.status === 'overdue').length,
    salesThisMonth:           4350000,
    purchasesThisMonth:       2100000,
    estimatedProfitThisMonth: 345000,
  }
}

export async function getChartData() {
  if (USE_API) return api.get('/api/dashboard/chart')
  await delay(400)
  return [
    { period: 'Mar', sales: 2800000, purchases: 1800000, collections: 180000, outstanding: 6200000, expenses: 85000,  profit: 215000 },
    { period: 'Apr', sales: 3200000, purchases: 2100000, collections: 210000, outstanding: 6800000, expenses: 92000,  profit: 258000 },
    { period: 'May', sales: 2600000, purchases: 1600000, collections: 195000, outstanding: 7100000, expenses: 78000,  profit: 188000 },
    { period: 'Jun', sales: 3800000, purchases: 2400000, collections: 225000, outstanding: 7500000, expenses: 105000, profit: 310000 },
    { period: 'Jul', sales: 4100000, purchases: 2600000, collections: 248000, outstanding: 7800000, expenses: 98000,  profit: 345000 },
    { period: 'Aug', sales: 4350000, purchases: 2100000, collections: 135500, outstanding: 7825000, expenses: 110500, profit: 310000 },
  ]
}
