/**
 * API CLIENT — Khan Interface
 * Connects frontend to backend (Render) or falls back to mock data
 */

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || ''

// ── Token management ──────────────────────────────────────────────────────────
export function getToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('khan_token')
}

export function setToken(token: string) {
  localStorage.setItem('khan_token', token)
}

export function clearToken() {
  localStorage.removeItem('khan_token')
}

// ── Core fetch wrapper ────────────────────────────────────────────────────────
async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken()

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  }
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(`${BASE_URL}${endpoint}`, { ...options, headers })

  if (res.status === 401) {
    clearToken()
    if (typeof window !== 'undefined') window.location.href = '/login'
    throw new Error('Session expired')
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }))
    throw new Error(err.error || `API error ${res.status}`)
  }

  return res.json()
}

// ── HTTP helpers ──────────────────────────────────────────────────────────────
export const api = {
  get:    <T>(url: string)               => apiFetch<T>(url),
  post:   <T>(url: string, body: unknown) => apiFetch<T>(url, { method: 'POST',   body: JSON.stringify(body) }),
  put:    <T>(url: string, body: unknown) => apiFetch<T>(url, { method: 'PUT',    body: JSON.stringify(body) }),
  patch:  <T>(url: string, body: unknown) => apiFetch<T>(url, { method: 'PATCH',  body: JSON.stringify(body) }),
  delete: <T>(url: string)               => apiFetch<T>(url, { method: 'DELETE' }),
}
