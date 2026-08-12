'use client'
import { useEffect, useState } from 'react'
import { Bot, Zap, Activity, Play, MessageSquare, ChevronRight } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { StatusBadge } from '@/components/shared/status-badge'
import { PageHeader } from '@/components/shared/page-header'
import { Skeleton } from '@/components/ui/skeleton'
import { getAgents, getAgentActivities } from '@/lib/services'
import { timeAgo } from '@/lib/utils'
import type { AIAgent, AgentActivity } from '@/types'
import Link from 'next/link'
import { motion } from 'framer-motion'

const statusDot: Record<string, string> = {
  online: 'bg-green-500', thinking: 'bg-blue-500 status-pulse', working: 'bg-orange-500 status-pulse',
  completed: 'bg-green-500', attention_required: 'bg-red-500 status-pulse', offline: 'bg-gray-400',
}

const agentPaths: Record<string, string> = {
  rto_agent: '/ai-agents/rto', finance_agent: '/ai-agents/finance',
  sales_agent: '/ai-agents/sales', accountant_agent: '/ai-agents/accountant',
  customer_agent: '/ai-agents/customer', vehicle_agent: '/ai-agents/vehicle',
  business_manager: '/ai-agents/manager',
}

export default function AITeamPage() {
  const [agents, setAgents] = useState<AIAgent[]>([])
  const [activities, setActivities] = useState<AgentActivity[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([getAgents(), getAgentActivities()])
      .then(([a, ac]) => { setAgents(a); setActivities(ac) })
      .finally(() => setLoading(false))
  }, [])

  const totalAlerts = agents.reduce((s, a) => s + a.alertCount, 0)
  const totalCompleted = agents.reduce((s, a) => s + a.tasksCompleted, 0)

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <span className="text-khan-red">AI</span> Team
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Your AI employees — monitoring KM Car Deals 24/7
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="px-3 py-1.5 rounded-full bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 status-pulse" />
            <span className="text-xs font-semibold text-green-700 dark:text-green-400">{agents.filter(a => a.status !== 'offline').length} agents active</span>
          </div>
          <Button variant="khan" size="sm" className="gap-1.5"><Zap className="w-4 h-4" />Run All Agents</Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'AI Agents',          val: agents.length,    color: 'text-blue-600' },
          { label: 'Tasks Today',         val: agents.reduce((s,a) => s + a.tasksPending, 0), color: 'text-orange-600' },
          { label: 'Completed Total',     val: totalCompleted,  color: 'text-green-600' },
          { label: 'Active Alerts',       val: totalAlerts,     color: 'text-red-600' },
        ].map(s => (
          <Card key={s.label}><CardContent className="p-4">
            <div className={`text-2xl font-bold ${s.color}`}>{s.val}</div>
            <div className="text-xs text-muted-foreground mt-0.5">{s.label}</div>
          </CardContent></Card>
        ))}
      </div>

      {/* Agent cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {loading
          ? Array(7).fill(0).map((_, i) => <Skeleton key={i} className="h-64 rounded-xl" />)
          : agents.map((agent, i) => (
          <motion.div key={agent.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
            <Card className={`hover:shadow-lg transition-all group ${agent.status === 'attention_required' ? 'border-red-200 dark:border-red-800' : ''}`}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="text-3xl">{agent.emoji}</div>
                    <div className="relative">
                      <span className={`absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full ${statusDot[agent.status] ?? 'bg-gray-400'}`} />
                    </div>
                  </div>
                  <Badge variant={agent.status === 'attention_required' ? 'critical' : agent.status === 'online' ? 'active' : agent.status === 'working' ? 'pending' : 'info'}>
                    {agent.status.replace(/_/g, ' ')}
                  </Badge>
                </div>

                <h3 className="font-bold text-sm leading-tight">{agent.name}</h3>
                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{agent.role}</p>

                <div className="mt-3 space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Tasks today</span>
                    <span className="font-semibold text-orange-600">{agent.tasksPending}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Completed</span>
                    <span className="font-semibold text-green-600">{agent.tasksCompleted}</span>
                  </div>
                  {agent.alertCount > 0 && (
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Alerts</span>
                      <span className="font-semibold text-red-600">{agent.alertCount}</span>
                    </div>
                  )}
                </div>

                <p className="text-xs text-muted-foreground mt-2 leading-relaxed truncate">{agent.lastActivity}</p>

                <div className="flex gap-2 mt-4">
                  <Link href={agentPaths[agent.id] ?? '/ai-agents'} className="flex-1">
                    <Button size="sm" variant="khan" className="w-full gap-1 text-xs h-8">
                      <MessageSquare className="w-3.5 h-3.5" />Open
                    </Button>
                  </Link>
                  <Button size="sm" variant="outline" className="gap-1 text-xs h-8 px-2.5">
                    <Play className="w-3.5 h-3.5" />Run
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Activity feed */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Activity className="w-4 h-4 text-khan-red" />AI Activity Feed
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 pt-0">
          {activities.map(a => (
            <div key={a.id} className="flex items-start gap-3 py-2 border-b last:border-0">
              <span className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${a.severity === 'critical' ? 'bg-red-500' : a.severity === 'high' ? 'bg-orange-500' : a.severity === 'medium' ? 'bg-yellow-500' : 'bg-green-500'}`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-sm font-semibold">{a.agentName}</span>
                  <span className="text-xs text-muted-foreground">·</span>
                  <span className="text-xs text-muted-foreground">{a.action}</span>
                  <span className="text-xs text-muted-foreground ml-auto">{timeAgo(a.timestamp)}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">{a.detail}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
