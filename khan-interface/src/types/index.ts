// ─── Core Domain Types ───────────────────────────────────────────────────────

export type UserRole = 'admin' | 'manager' | 'staff' | 'viewer'

export interface User {
  id: string
  name: string
  email: string
  phone: string
  role: UserRole
  avatar?: string
  createdAt: string
  lastLogin?: string
}

// ─── Customer ────────────────────────────────────────────────────────────────

export type CustomerStatus = 'active' | 'inactive' | 'pending' | 'overdue' | 'settled'

export interface Customer {
  id: string
  customerId: string
  fullName: string
  phone: string
  whatsapp?: string
  email?: string
  address: string
  pan?: string
  aadhaarRef?: string
  vehicleId?: string
  vehicleRegistration?: string
  purchaseAmount: number
  amountPaid: number
  amountPending: number
  financeCompany?: string
  financePerson?: string
  emiAmount?: number
  emiDate?: number
  totalInstallments?: number
  remainingInstallments?: number
  lastPayment?: string
  nextPayment?: string
  status: CustomerStatus
  notes?: string
  documents?: Document[]
  createdAt: string
  updatedAt: string
}

// ─── Vehicle ─────────────────────────────────────────────────────────────────

export type VehicleStatus =
  | 'available'
  | 'reserved'
  | 'sold'
  | 'purchased'
  | 'finance_pending'
  | 'payment_pending'
  | 'delivered'

export type FuelType = 'petrol' | 'diesel' | 'cng' | 'electric' | 'hybrid'
export type TransmissionType = 'manual' | 'automatic' | 'amt'

export interface Vehicle {
  id: string
  vehicleId: string
  registrationNumber: string
  brand: string
  model: string
  variant: string
  year: number
  fuel: FuelType
  transmission: TransmissionType
  kmDriven: number
  color: string
  ownership: number
  purchasePrice: number
  sellingPrice: number
  status: VehicleStatus
  customerId?: string
  financeStatus?: string
  insuranceStatus?: string
  rcStatus?: string
  rtoStatus?: string
  images?: string[]
  documents?: Document[]
  createdAt: string
  updatedAt: string
}

// ─── Transaction ─────────────────────────────────────────────────────────────

export type TransactionType =
  | 'vehicle_purchase'
  | 'vehicle_sale'
  | 'customer_payment'
  | 'finance_payment'
  | 'advance_payment'
  | 'refund'
  | 'commission'
  | 'expense'
  | 'other'

export type PaymentMethod =
  | 'cash'
  | 'bank_transfer'
  | 'upi'
  | 'cheque'
  | 'finance'
  | 'other'

export type TransactionStatus = 'pending' | 'completed' | 'failed' | 'cancelled'

export interface Transaction {
  id: string
  transactionId: string
  date: string
  customerId?: string
  customerName?: string
  vehicleId?: string
  vehicleInfo?: string
  amount: number
  paymentMethod: PaymentMethod
  referenceNumber?: string
  type: TransactionType
  status: TransactionStatus
  notes?: string
  createdBy: string
  createdAt: string
}

// ─── Finance ─────────────────────────────────────────────────────────────────

export type FinanceStatus = 'pending' | 'active' | 'partially_paid' | 'overdue' | 'completed'

export interface FinanceAccount {
  id: string
  customerId: string
  customerName: string
  vehicleId: string
  vehicleInfo: string
  financeCompany: string
  financePerson: string
  loanAmount: number
  downPayment: number
  emiAmount: number
  totalInstallments: number
  paidInstallments: number
  remainingInstallments: number
  interestRate: number
  startDate: string
  endDate: string
  nextPaymentDate: string
  outstandingAmount: number
  status: FinanceStatus
  createdAt: string
}

export interface FinancePerson {
  id: string
  name: string
  company: string
  phone: string
  email?: string
  totalAccounts: number
  totalAmount: number
  pendingAmount: number
}

// ─── Payment ─────────────────────────────────────────────────────────────────

export type PaymentStatus = 'upcoming' | 'due_today' | 'overdue' | 'paid'

export interface Payment {
  id: string
  customerId: string
  customerName: string
  vehicleInfo: string
  amount: number
  dueDate: string
  paidDate?: string
  type: 'emi' | 'advance' | 'balance' | 'other'
  status: PaymentStatus
  financeCompany?: string
  financePerson?: string
  notes?: string
}

// ─── Document ────────────────────────────────────────────────────────────────

export type DocumentCategory =
  | 'rc'
  | 'insurance'
  | 'invoice'
  | 'aadhaar'
  | 'pan'
  | 'loan'
  | 'payment_receipt'
  | 'other'

export type DocumentOwnerType = 'customer' | 'vehicle' | 'finance' | 'transaction'

export interface Document {
  id: string
  name: string
  category: DocumentCategory
  ownerType: DocumentOwnerType
  ownerId: string
  fileUrl?: string
  fileSize?: string
  uploadedAt: string
  uploadedBy: string
}

// ─── Notification ────────────────────────────────────────────────────────────

export type NotificationType =
  | 'payment_overdue'
  | 'new_customer'
  | 'vehicle_sold'
  | 'finance_received'
  | 'document_expiring'
  | 'ai_completed'
  | 'ai_attention'
  | 'reminder'
  | 'general'

export interface Notification {
  id: string
  title: string
  message: string
  type: NotificationType
  read: boolean
  createdAt: string
  link?: string
}

// ─── Calendar ────────────────────────────────────────────────────────────────

export type CalendarEventType =
  | 'payment_due'
  | 'emi_due'
  | 'finance_followup'
  | 'customer_meeting'
  | 'vehicle_delivery'
  | 'insurance_expiry'
  | 'rc_rto_task'
  | 'reminder'
  | 'business_task'

export type EventPriority = 'low' | 'medium' | 'high' | 'critical'

export interface CalendarEvent {
  id: string
  title: string
  description?: string
  type: CalendarEventType
  date: string
  time?: string
  customerId?: string
  vehicleId?: string
  financePerson?: string
  priority: EventPriority
  completed: boolean
  createdAt: string
}

// ─── AI Agents ───────────────────────────────────────────────────────────────

export type AgentStatus = 'online' | 'thinking' | 'working' | 'completed' | 'attention_required' | 'offline'

export interface AIAgent {
  id: string
  name: string
  role: string
  description: string
  status: AgentStatus
  lastActivity: string
  tasksCompleted: number
  tasksPending: number
  avatar: string
  enabled: boolean
}

export interface AIAgentTask {
  id: string
  agentId: string
  title: string
  status: 'pending' | 'running' | 'completed' | 'failed'
  startedAt?: string
  completedAt?: string
  result?: AIAgentResult
}

export interface AIAgentResult {
  summary: string
  findings: AgentFinding[]
  totalChecked: number
  alertCount: number
  timestamp: string
}

export interface AgentFinding {
  id: string
  customer?: string
  vehicle?: string
  financePerson?: string
  expectedAmount?: number
  receivedAmount?: number
  remainingAmount?: number
  dueDate?: string
  status: 'ok' | 'warning' | 'critical' | 'overdue'
  priority: 'low' | 'medium' | 'high' | 'critical'
  recommendedAction: string
  message: string
}

// ─── Web3 ────────────────────────────────────────────────────────────────────

export type WalletStatus = 'connected' | 'disconnected' | 'connecting'
export type NetworkName = 'Ethereum' | 'Polygon' | 'BSC' | 'Arbitrum'

export interface Web3Wallet {
  address: string
  network: NetworkName
  balance: string
  status: WalletStatus
}

export interface Web3Transaction {
  id: string
  hash: string
  type: string
  amount: string
  from: string
  to: string
  network: NetworkName
  status: 'confirmed' | 'pending' | 'failed'
  timestamp: string
  blockNumber?: number
}

// ─── Dashboard KPI ───────────────────────────────────────────────────────────

export interface KPIData {
  label: string
  value: string
  change: number
  changeLabel: string
  trend: 'up' | 'down' | 'neutral'
  icon: string
  color: string
}

export interface ChartDataPoint {
  month: string
  sales: number
  purchases: number
  collections: number
  outstanding: number
  revenue: number
}
