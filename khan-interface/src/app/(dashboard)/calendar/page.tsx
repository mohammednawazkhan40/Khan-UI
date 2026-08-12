'use client'
import { useEffect, useState } from 'react'
import { Calendar, Clock, Bell, Plus, ChevronLeft, ChevronRight } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { PriorityBadge } from '@/components/shared/status-badge'
import { PageHeader } from '@/components/shared/page-header'
import { getCalendarEvents, getReminders } from '@/lib/services'
import { formatDate, formatDateTime } from '@/lib/utils'
import type { CalendarEvent, Reminder } from '@/types'

const EVENT_COLORS: Record<string, string> = {
  payment_due: 'bg-red-500', emi_due: 'bg-orange-500', finance_followup: 'bg-purple-500',
  customer_meeting: 'bg-blue-500', vehicle_delivery: 'bg-green-500',
  insurance_expiry: 'bg-yellow-500', rto_task: 'bg-indigo-500',
  reminder: 'bg-pink-500', business_task: 'bg-gray-500',
}

export default function CalendarPage() {
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [reminders, setReminders] = useState<Reminder[]>([])

  useEffect(() => {
    Promise.all([getCalendarEvents(), getReminders()]).then(([e, r]) => { setEvents(e); setReminders(r) })
  }, [])

  const byDate = events.reduce((acc, ev) => {
    const d = ev.date.slice(0, 10)
    if (!acc[d]) acc[d] = []
    acc[d].push(ev)
    return acc
  }, {} as Record<string, CalendarEvent[]>)

  const sortedDates = Object.keys(byDate).sort()
  const overdue = reminders.filter(r => r.status === 'overdue')
  const dueToday = reminders.filter(r => r.status === 'due_today')

  return (
    <div className="space-y-5 pb-8">
      <PageHeader title="Calendar & Reminders" subtitle={`${events.length} events · ${reminders.length} reminders`}>
        <Button variant="outline" size="sm" className="gap-1.5"><Bell className="w-4 h-4" />Add Reminder</Button>
        <Button variant="khan" size="sm" className="gap-1.5"><Plus className="w-4 h-4" />Add Event</Button>
      </PageHeader>

      {/* Urgent reminders */}
      {(overdue.length > 0 || dueToday.length > 0) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {overdue.length > 0 && (
            <Card className="border-red-200 dark:border-red-800 bg-red-50/30 dark:bg-red-950/20">
              <CardHeader className="pb-2"><CardTitle className="text-sm text-red-700 dark:text-red-400">Overdue Reminders</CardTitle></CardHeader>
              <CardContent className="space-y-2 pt-0">
                {overdue.map(r => (
                  <div key={r.id} className="flex items-center gap-2 text-sm">
                    <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{r.title}</p>
                      {r.customerName && <p className="text-xs text-muted-foreground">{r.customerName}</p>}
                    </div>
                    <Button size="sm" variant="outline" className="h-6 text-xs shrink-0">Done</Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
          {dueToday.length > 0 && (
            <Card className="border-orange-200 dark:border-orange-800 bg-orange-50/30 dark:bg-orange-950/20">
              <CardHeader className="pb-2"><CardTitle className="text-sm text-orange-700 dark:text-orange-400">Due Today</CardTitle></CardHeader>
              <CardContent className="space-y-2 pt-0">
                {dueToday.map(r => (
                  <div key={r.id} className="flex items-center gap-2 text-sm">
                    <span className="w-2 h-2 rounded-full bg-orange-500 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{r.title}</p>
                      {r.dueTime && <p className="text-xs text-muted-foreground">{r.dueTime}</p>}
                    </div>
                    <PriorityBadge priority={r.priority} />
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* All reminders list */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><Bell className="w-4 h-4" />All Reminders</CardTitle></CardHeader>
        <CardContent className="space-y-2 pt-0">
          {reminders.map(r => (
            <div key={r.id} className="flex items-center gap-3 p-2.5 rounded-lg border hover:border-khan-red/30 transition-colors">
              <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${r.priority === 'critical' ? 'bg-red-500' : r.priority === 'high' ? 'bg-orange-500' : r.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'}`} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{r.title}</p>
                <div className="flex gap-2 text-xs text-muted-foreground flex-wrap">
                  <span>{formatDate(r.dueDate)}{r.dueTime && ` at ${r.dueTime}`}</span>
                  {r.customerName && <span>{r.customerName}</span>}
                  {r.vehicleInfo && <span>{r.vehicleInfo}</span>}
                </div>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <PriorityBadge priority={r.priority} />
                <Badge variant={r.status === 'completed' ? 'active' : r.status === 'overdue' ? 'overdue' : r.status === 'due_today' ? 'high' : 'info'} className="capitalize text-xs">
                  {r.status.replace(/_/g,' ')}
                </Badge>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Events by date */}
      <div className="space-y-4">
        <h2 className="text-base font-semibold">Upcoming Events</h2>
        {sortedDates.map(date => (
          <div key={date}>
            <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">{formatDate(date + 'T00:00:00Z')}</p>
            <div className="space-y-1.5">
              {byDate[date].map(ev => (
                <div key={ev.id} className="flex items-center gap-3 p-3 rounded-xl border hover:shadow-sm transition-all">
                  <div className={`w-3 h-3 rounded-full shrink-0 ${EVENT_COLORS[ev.type] ?? 'bg-gray-400'}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{ev.title}</p>
                    <div className="flex gap-2 text-xs text-muted-foreground flex-wrap">
                      {ev.startTime && <span>{ev.startTime}</span>}
                      {ev.customerName && <span>{ev.customerName}</span>}
                      <span className="capitalize">{ev.type.replace(/_/g,' ')}</span>
                    </div>
                  </div>
                  <PriorityBadge priority={ev.priority} />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
