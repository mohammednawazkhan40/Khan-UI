/**
 * SERVICE LAYER — Khan Interface
 *
 * All service functions return Promises so they can be swapped out
 * for real API/backend calls without changing any component code.
 *
 * Phase 1: Returns mock data with simulated async delay.
 * Phase 2: Replace mock imports with real API calls using NEXT_PUBLIC_API_BASE_URL.
 */

import {
  mockCustomers, mockVehicles, mockFinanceAccounts, mockFinancePersons,
  mockPayments, mockRTOTasks, mockReminders, mockCalendarEvents,
  mockNotifications, mockAgents, mockAgentActivities,
  mockTransactions, mockExpenses,
  mockFinanceAgentResult, mockChatHistories,
} from '@/lib/mock'
import type {
  Customer, Vehicle, FinanceAccount, FinancePerson, Payment, Transaction,
  Expense, RTOTask, Reminder, CalendarEvent, Notification, AIAgent,
  AgentActivity, AgentResult, AgentChatMessage, AgentId,
} from '@/types'

const delay = (ms = 400) => new Promise(r => setTimeout(r, ms))

// ── Customers ────────────────────────────────────────────────────────────────
export const getCustomers         = async (): Promise<Customer[]>        => { await delay(); return mockCustomers }
export const getCustomerById      = async (id: string): Promise<Customer | undefined> => { await delay(200); return mockCustomers.find(c => c.id === id) }
export const createCustomer       = async (data: Partial<Customer>): Promise<Customer> => { await delay(); return { ...data, id: `c${Date.now()}`, customerId: `KHN-C${Date.now()}`, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() } as Customer }
export const updateCustomer       = async (id: string, data: Partial<Customer>): Promise<Customer> => { await delay(); const c = mockCustomers.find(x => x.id === id)!; return { ...c, ...data, updatedAt: new Date().toISOString() } }

// ── Vehicles ─────────────────────────────────────────────────────────────────
export const getVehicles          = async (): Promise<Vehicle[]>         => { await delay(); return mockVehicles }
export const getVehicleById       = async (id: string): Promise<Vehicle | undefined> => { await delay(200); return mockVehicles.find(v => v.id === id) }
export const createVehicle        = async (data: Partial<Vehicle>): Promise<Vehicle> => { await delay(); return { ...data, id: `v${Date.now()}`, vehicleId: `KHN-V${Date.now()}`, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() } as Vehicle }
export const updateVehicle        = async (id: string, data: Partial<Vehicle>): Promise<Vehicle> => { await delay(); const v = mockVehicles.find(x => x.id === id)!; return { ...v, ...data, updatedAt: new Date().toISOString() } }

// ── Finance ───────────────────────────────────────────────────────────────────
export const getFinanceAccounts   = async (): Promise<FinanceAccount[]>  => { await delay(); return mockFinanceAccounts }
export const getFinanceAccountById= async (id: string): Promise<FinanceAccount | undefined> => { await delay(200); return mockFinanceAccounts.find(f => f.id === id) }
export const getFinancePersons    = async (): Promise<FinancePerson[]>   => { await delay(); return mockFinancePersons }
export const getOutstandingPayments = async (): Promise<Payment[]>       => { await delay(); return mockPayments.filter(p => p.status !== 'paid') }

// ── Payments ──────────────────────────────────────────────────────────────────
export const getPayments          = async (): Promise<Payment[]>         => { await delay(); return mockPayments }
export const getOverduePayments   = async (): Promise<Payment[]>         => { await delay(); return mockPayments.filter(p => p.status === 'overdue') }

// ── Transactions ─────────────────────────────────────────────────────────────
export const getTransactions      = async (): Promise<Transaction[]>     => { await delay(); return mockTransactions }
export const createTransaction    = async (data: Partial<Transaction>): Promise<Transaction> => { await delay(); return { ...data, id: `txn${Date.now()}`, transactionId: `KHN-TXN-${Date.now()}`, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() } as Transaction }

// ── Expenses ──────────────────────────────────────────────────────────────────
export const getExpenses          = async (): Promise<Expense[]>         => { await delay(); return mockExpenses }

// ── RTO ───────────────────────────────────────────────────────────────────────
export const getRTOTasks          = async (): Promise<RTOTask[]>         => { await delay(); return mockRTOTasks }
export const getRTOTaskById       = async (id: string): Promise<RTOTask | undefined> => { await delay(200); return mockRTOTasks.find(r => r.id === id) }
export const createRTOTask        = async (data: Partial<RTOTask>): Promise<RTOTask> => { await delay(); return { ...data, id: `rto${Date.now()}`, taskId: `KHN-RTO-${Date.now()}`, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() } as RTOTask }

// ── Reminders ─────────────────────────────────────────────────────────────────
export const getReminders         = async (): Promise<Reminder[]>        => { await delay(); return mockReminders }
export const getTodayReminders    = async (): Promise<Reminder[]>        => { await delay(); return mockReminders.filter(r => r.status === 'due_today' || r.status === 'overdue') }
export const createReminder       = async (data: Partial<Reminder>): Promise<Reminder> => { await delay(); return { ...data, id: `rem${Date.now()}`, reminderId: `KHN-REM-${Date.now()}`, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() } as Reminder }

// ── Calendar ──────────────────────────────────────────────────────────────────
export const getCalendarEvents    = async (): Promise<CalendarEvent[]>   => { await delay(); return mockCalendarEvents }
export const createCalendarEvent  = async (data: Partial<CalendarEvent>): Promise<CalendarEvent> => { await delay(); return { ...data, id: `ev${Date.now()}`, createdAt: new Date().toISOString() } as CalendarEvent }

// ── Notifications ─────────────────────────────────────────────────────────────
export const getNotifications     = async (): Promise<Notification[]>    => { await delay(); return mockNotifications }
export const markNotificationRead = async (id: string): Promise<void>    => { await delay(100) }
export const markAllNotificationsRead = async (): Promise<void>          => { await delay(200) }

// ── AI Agents ─────────────────────────────────────────────────────────────────
export const getAgents            = async (): Promise<AIAgent[]>         => { await delay(); return mockAgents }
export const getAgentById         = async (id: AgentId): Promise<AIAgent | undefined> => { await delay(200); return mockAgents.find(a => a.id === id) }
export const getAgentActivities   = async (): Promise<AgentActivity[]>   => { await delay(); return mockAgentActivities }
export const runAgent             = async (id: AgentId): Promise<AgentResult> => { await delay(2000); return mockFinanceAgentResult }
export const getAgentChatHistory  = async (id: AgentId): Promise<AgentChatMessage[]> => { await delay(200); return mockChatHistories[id] ?? [] }
export const sendAgentMessage     = async (id: AgentId, message: string): Promise<AgentChatMessage> => {
  await delay(1500)
  return {
    id: `msg${Date.now()}`, agentId: id, role: 'agent',
    content: `I'm analysing your request: "${message}"\n\nBased on current business data, I'll provide detailed analysis shortly. This feature will connect to a real LLM when you provide API keys in the .env file.`,
    timestamp: new Date().toISOString(),
  }
}

// ── Dashboard Summary ─────────────────────────────────────────────────────────
export const getDashboardSummary  = async () => {
  await delay(300)
  const overdue = mockPayments.filter(p => p.status === 'overdue')
  const totalOutstanding = mockFinanceAccounts.reduce((s, f) => s + f.outstandingAmount, 0)
  return {
    totalVehicles:            mockVehicles.length,
    availableVehicles:        mockVehicles.filter(v => ['available','listed','repair'].includes(v.status)).length,
    soldThisMonth:            3,
    totalCustomers:           mockCustomers.length,
    activeCustomers:          mockCustomers.filter(c => c.status === 'active').length,
    overdueCustomers:         mockCustomers.filter(c => c.status === 'overdue').length,
    totalOutstanding,
    totalCollectedThisMonth:  135500,
    pendingPayments:          mockPayments.filter(p => p.status !== 'paid').length,
    overduePayments:          overdue.length,
    financeOutstanding:       totalOutstanding,
    rtoTasksPending:          mockRTOTasks.filter(r => !['completed','cancelled'].includes(r.status)).length,
    rtoTasksOverdue:          mockRTOTasks.filter(r => r.status === 'overdue').length,
    remindersToday:           mockReminders.filter(r => r.status === 'due_today').length,
    remindersOverdue:         mockReminders.filter(r => r.status === 'overdue').length,
    salesThisMonth:           4350000,
    purchasesThisMonth:       2100000,
    estimatedProfitThisMonth: 345000,
  }
}

export const getChartData = async () => {
  await delay(400)
  return [
    { period: 'Mar', sales: 2800000, purchases: 1800000, collections: 180000, outstanding: 6200000, expenses: 85000, profit: 215000 },
    { period: 'Apr', sales: 3200000, purchases: 2100000, collections: 210000, outstanding: 6800000, expenses: 92000, profit: 258000 },
    { period: 'May', sales: 2600000, purchases: 1600000, collections: 195000, outstanding: 7100000, expenses: 78000, profit: 188000 },
    { period: 'Jun', sales: 3800000, purchases: 2400000, collections: 225000, outstanding: 7500000, expenses: 105000, profit: 310000 },
    { period: 'Jul', sales: 4100000, purchases: 2600000, collections: 248000, outstanding: 7800000, expenses: 98000, profit: 345000 },
    { period: 'Aug', sales: 4350000, purchases: 2100000, collections: 135500, outstanding: 7825000, expenses: 110500, profit: 310000 },
  ]
}
