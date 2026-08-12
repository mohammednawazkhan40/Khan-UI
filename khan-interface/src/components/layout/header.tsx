'use client'
import { Bell, Search, Plus, Menu, Moon, Sun, Zap } from 'lucide-react'
import { useAppStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useTheme } from 'next-themes'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { getNotifications } from '@/lib/services'

export function Header() {
  const { toggleSidebar, setSearchOpen, setQuickAddOpen } = useAppStore()
  const { theme, setTheme } = useTheme()
  const [unread, setUnread] = useState(0)

  useEffect(() => {
    getNotifications().then(n => setUnread(n.filter(x => !x.read).length))
  }, [])

  // Ctrl+K global search
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        setSearchOpen(true)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [setSearchOpen])

  return (
    <header className="sticky top-0 z-20 h-14 bg-background/95 backdrop-blur border-b flex items-center gap-3 px-4">
      {/* Mobile menu */}
      <button
        onClick={toggleSidebar}
        className="lg:hidden p-2 rounded-md hover:bg-muted transition-colors"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Search */}
      <button
        onClick={() => setSearchOpen(true)}
        className="flex items-center gap-2 flex-1 max-w-sm h-9 px-3 rounded-lg border bg-muted/50 text-muted-foreground text-sm hover:bg-muted transition-colors"
      >
        <Search className="w-4 h-4 shrink-0" />
        <span className="flex-1 text-left hidden sm:block">Search customers, vehicles, RTO…</span>
        <kbd className="hidden sm:inline-flex items-center gap-1 rounded border bg-background px-1.5 py-0.5 text-xs font-mono text-muted-foreground">
          ⌘K
        </kbd>
      </button>

      <div className="ml-auto flex items-center gap-1.5">
        {/* Quick Add */}
        <Button size="sm" variant="khan" onClick={() => setQuickAddOpen(true)} className="gap-1.5 hidden sm:flex">
          <Plus className="w-4 h-4" />
          Add
        </Button>
        <Button size="icon" variant="khan" onClick={() => setQuickAddOpen(true)} className="sm:hidden">
          <Plus className="w-4 h-4" />
        </Button>

        {/* Theme */}
        <Button
          size="icon"
          variant="ghost"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        >
          <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        </Button>

        {/* Notifications */}
        <Link href="/notifications">
          <Button size="icon" variant="ghost" className="relative">
            <Bell className="w-4 h-4" />
            {unread > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 khan-gradient rounded-full text-white text-[10px] font-bold flex items-center justify-center">
                {unread > 9 ? '9+' : unread}
              </span>
            )}
          </Button>
        </Link>

        {/* AI Status */}
        <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800">
          <span className="w-2 h-2 rounded-full bg-green-500 status-pulse" />
          <span className="text-xs font-medium text-green-700 dark:text-green-400">AI Active</span>
        </div>
      </div>
    </header>
  )
}
