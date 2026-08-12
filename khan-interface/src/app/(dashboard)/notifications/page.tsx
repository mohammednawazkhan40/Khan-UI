'use client'
import { useEffect } from 'react'
import { Bell, CheckCheck } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { PageHeader } from '@/components/shared/page-header'
import { useAppStore } from '@/lib/store'
import { getNotifications, markAllNotificationsRead } from '@/lib/services'
import { timeAgo } from '@/lib/utils'
import type { NotificationType } from '@/types'

const typeIcon: Record<NotificationType, string> = {
  payment_overdue: '🔴', payment_due: '🟠', rto_due: '🏛️',
  insurance_expiry: '📋', new_lead: '👤', vehicle_sold: '🚗',
  finance_received: '💰', document_missing: '📄', ai_alert: '🤖',
  ai_completed: '✅', reminder_due: '⏰', general: 'ℹ️',
}

export default function NotificationsPage() {
  const { notifications, unreadCount, setNotifications, markRead, markAllRead } = useAppStore()

  useEffect(() => {
    getNotifications().then(setNotifications)
  }, [setNotifications])

  const handleMarkAll = async () => {
    await markAllNotificationsRead()
    markAllRead()
  }

  return (
    <div className="space-y-5 pb-8 max-w-2xl">
      <PageHeader title="Notifications" subtitle={`${unreadCount} unread`}>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" className="gap-1.5" onClick={handleMarkAll}>
            <CheckCheck className="w-4 h-4" /> Mark all read
          </Button>
        )}
      </PageHeader>

      <div className="space-y-2">
        {notifications.map(n => (
          <Card
            key={n.id}
            onClick={() => markRead(n.id)}
            className={`cursor-pointer transition-all hover:shadow-md ${!n.read ? 'border-khan-red/30 bg-khan-red/3' : ''}`}
          >
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <span className="text-xl shrink-0 mt-0.5">{typeIcon[n.type]}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 flex-wrap">
                    <p className={`text-sm font-semibold ${!n.read ? 'text-foreground' : 'text-muted-foreground'}`}>{n.title}</p>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <Badge variant={n.priority === 'critical' ? 'critical' : n.priority === 'high' ? 'high' : n.priority === 'medium' ? 'medium' : 'low'}>
                        {n.priority}
                      </Badge>
                      {!n.read && <span className="w-2 h-2 rounded-full bg-khan-red shrink-0" />}
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{n.message}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-xs text-muted-foreground">{timeAgo(n.createdAt)}</span>
                    {n.agentName && <span className="text-xs text-muted-foreground">· {n.agentName}</span>}
                    {n.actionLabel && <Button size="sm" variant="outline" className="h-6 text-xs ml-auto">{n.actionLabel}</Button>}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {notifications.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">
            <Bell className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p>No notifications</p>
          </div>
        )}
      </div>
    </div>
  )
}
