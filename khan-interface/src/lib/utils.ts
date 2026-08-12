import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// ── Currency ─────────────────────────────────────────────────────────────────
export function formatCurrency(amount: number): string {
  if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(2)}Cr`
  if (amount >= 100000)   return `₹${(amount / 100000).toFixed(2)}L`
  return new Intl.NumberFormat('en-IN', {
    style: 'currency', currency: 'INR', maximumFractionDigits: 0,
  }).format(amount)
}

export function formatCurrencyFull(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency', currency: 'INR', maximumFractionDigits: 0,
  }).format(amount)
}

// ── Date ─────────────────────────────────────────────────────────────────────
export function formatDate(iso: string | undefined, opts?: Intl.DateTimeFormatOptions): string {
  if (!iso) return '—'
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric', ...opts,
  }).format(new Date(iso))
}

export function formatDateShort(iso: string | undefined): string {
  if (!iso) return '—'
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit', month: 'short',
  }).format(new Date(iso))
}

export function formatDateTime(iso: string | undefined): string {
  if (!iso) return '—'
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  }).format(new Date(iso))
}

export function daysUntil(iso: string | undefined): number {
  if (!iso) return 0
  const diff = new Date(iso).getTime() - Date.now()
  return Math.ceil(diff / 86400000)
}

export function daysAgo(iso: string | undefined): number {
  if (!iso) return 0
  const diff = Date.now() - new Date(iso).getTime()
  return Math.floor(diff / 86400000)
}

export function isOverdue(iso: string | undefined): boolean {
  if (!iso) return false
  return new Date(iso) < new Date()
}

export function isDueToday(iso: string | undefined): boolean {
  if (!iso) return false
  const d = new Date(iso)
  const t = new Date()
  return d.getDate() === t.getDate() && d.getMonth() === t.getMonth() && d.getFullYear() === t.getFullYear()
}

export function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1)   return 'just now'
  if (mins < 60)  return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24)   return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  if (days < 30)  return `${days}d ago`
  return formatDate(iso)
}

// ── Greeting ─────────────────────────────────────────────────────────────────
export function getGreeting(): string {
  const h = new Date().getHours()
  if (h < 12) return 'Good Morning'
  if (h < 17) return 'Good Afternoon'
  if (h < 21) return 'Good Evening'
  return 'Good Night'
}

// ── Text ─────────────────────────────────────────────────────────────────────
export function truncate(str: string, n = 40): string {
  return str.length > n ? str.slice(0, n) + '…' : str
}

export function initials(name: string): string {
  return name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()
}

export function slugify(str: string): string {
  return str.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '')
}

// ── Numbers ──────────────────────────────────────────────────────────────────
export function percentage(part: number, total: number): number {
  if (!total) return 0
  return Math.round((part / total) * 100)
}

export function clamp(val: number, min: number, max: number): number {
  return Math.min(Math.max(val, min), max)
}
