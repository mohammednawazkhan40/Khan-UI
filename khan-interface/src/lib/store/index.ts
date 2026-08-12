import { create } from 'zustand'
import type { Notification } from '@/types'

interface AppState {
  sidebarOpen: boolean
  setSidebarOpen: (v: boolean) => void
  toggleSidebar: () => void

  theme: 'light' | 'dark' | 'system'
  setTheme: (t: 'light' | 'dark' | 'system') => void

  notifications: Notification[]
  unreadCount: number
  setNotifications: (n: Notification[]) => void
  markRead: (id: string) => void
  markAllRead: () => void

  searchOpen: boolean
  setSearchOpen: (v: boolean) => void

  quickAddOpen: boolean
  setQuickAddOpen: (v: boolean) => void
}

export const useAppStore = create<AppState>((set, get) => ({
  sidebarOpen: true,
  setSidebarOpen: (v) => set({ sidebarOpen: v }),
  toggleSidebar: () => set(s => ({ sidebarOpen: !s.sidebarOpen })),

  theme: 'light',
  setTheme: (theme) => set({ theme }),

  notifications: [],
  unreadCount: 0,
  setNotifications: (notifications) => set({
    notifications,
    unreadCount: notifications.filter(n => !n.read).length,
  }),
  markRead: (id) => set(s => {
    const notifications = s.notifications.map(n => n.id === id ? { ...n, read: true } : n)
    return { notifications, unreadCount: notifications.filter(n => !n.read).length }
  }),
  markAllRead: () => set(s => ({
    notifications: s.notifications.map(n => ({ ...n, read: true })),
    unreadCount: 0,
  })),

  searchOpen: false,
  setSearchOpen: (v) => set({ searchOpen: v }),

  quickAddOpen: false,
  setQuickAddOpen: (v) => set({ quickAddOpen: v }),
}))
