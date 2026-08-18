'use client'
import { useState, useRef, useEffect } from 'react'
import { ArrowLeft, Send, Play, AlertTriangle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { getAgentChatHistory, sendAgentMessage, getRTOTasks } from '@/lib/services'
import { formatDate } from '@/lib/utils'
import type { AgentChatMessage, RTOTask } from '@/types'

export default function RTOAgentPage() {
  const [messages, setMessages] = useState<AgentChatMessage[]>([])
  const [tasks, setTasks] = useState<RTOTask[]>([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    Promise.all([getAgentChatHistory('rto_agent'), getRTOTasks()]).then(([m, t]) => { setMessages(m); setTasks(t) })
  }, [])
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const pending = tasks.filter(t => !['completed','cancelled'].includes(t.status))
  const critical = tasks.filter(t => t.priority === 'critical')

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || sending) return
    const userMsg: AgentChatMessage = { id: Date.now().toString(), agentId: 'rto_agent', role: 'user', content: input.trim(), timestamp: new Date().toISOString() }
    setMessages(m => [...m, userMsg])
    setInput('')
    setSending(true)
    const { mockRTOTasks, mockVehicles } = await import('@/lib/mock')
    const context = {
      rtoTasks:     mockRTOTasks.filter(t => !['completed','cancelled'].includes(t.status)).map(t => ({ vehicleRegistration: t.vehicleRegistration, taskType: t.taskType, status: t.status, priority: t.priority, expectedCompletionDate: t.expectedCompletionDate, notes: t.notes })),
      criticalTasks: mockRTOTasks.filter(t => t.priority === 'critical').map(t => ({ vehicleRegistration: t.vehicleRegistration, taskType: t.taskType, expectedCompletionDate: t.expectedCompletionDate })),
      vehicles:     mockVehicles.filter(v => v.rtoStatus !== 'completed').map(v => ({ registrationNumber: v.registrationNumber, brand: v.brand, model: v.model, rtoStatus: v.rtoStatus })),
    }
    const reply = await sendAgentMessage('rto_agent', input.trim(), messages, context)
    setMessages(m => [...m, reply])
    setSending(false)
  }

  return (
    <div className="flex flex-col gap-5 pb-8 max-w-4xl">
      <div className="flex items-center gap-3">
        <Link href="/ai-agents"><Button variant="outline" size="icon"><ArrowLeft className="w-4 h-4" /></Button></Link>
        <div className="text-2xl">🏛️</div>
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap"><h1 className="text-xl font-bold">RTO Agent</h1><Badge variant={critical.length > 0 ? 'critical' : 'active'}>{critical.length > 0 ? 'Attention Required' : 'Online'}</Badge></div>
          <p className="text-sm text-muted-foreground">Vehicle Registration & RTO Operations Manager</p>
        </div>
        <Button variant="khan" size="sm" className="gap-1.5 shrink-0"><Play className="w-4 h-4" />Run RTO Check</Button>
      </div>

      {/* Quick status */}
      <div className="grid grid-cols-3 gap-3">
        {[{ label:'Pending Tasks', val: pending.length, color:'text-orange-600' }, { label:'Critical', val: critical.length, color:'text-red-600' }, { label:'Completed', val: tasks.filter(t=>t.status==='completed').length, color:'text-green-600' }].map(s => (
          <Card key={s.label}><CardContent className="p-3 text-center"><div className={`text-2xl font-bold ${s.color}`}>{s.val}</div><div className="text-xs text-muted-foreground">{s.label}</div></CardContent></Card>
        ))}
      </div>

      {/* Critical alerts */}
      {critical.length > 0 && (
        <Card className="border-red-200 dark:border-red-800 bg-red-50/30 dark:bg-red-950/20">
          <CardHeader className="pb-2"><CardTitle className="text-sm text-red-700 dark:text-red-400 flex items-center gap-2"><AlertTriangle className="w-4 h-4" />Critical RTO Tasks</CardTitle></CardHeader>
          <CardContent className="space-y-2 pt-0">
            {critical.map(t => (
              <div key={t.id} className="p-2.5 rounded-lg bg-background border border-red-200 dark:border-red-800">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="font-mono font-bold text-sm">{t.vehicleRegistration}</span>
                    <span className="text-xs text-muted-foreground ml-2">{t.vehicleInfo}</span>
                  </div>
                  {t.expectedCompletionDate && <span className="text-xs text-red-600 font-semibold shrink-0">Deadline: {formatDate(t.expectedCompletionDate)}</span>}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">{t.notes}</p>
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {t.requiredDocuments.filter(d => !d.received && d.required).map(d => (
                    <Badge key={d.id} variant="critical" className="text-xs">Missing: {d.name}</Badge>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Chat */}
      <Card className="flex-1 flex flex-col">
        <CardHeader className="pb-2"><CardTitle className="text-base">🏛️ Chat with RTO Agent</CardTitle></CardHeader>
        <CardContent className="flex flex-col p-4 pt-0">
          <div className="overflow-y-auto space-y-3 mb-3 min-h-[280px] max-h-[350px]">
            {messages.map(m => (
              <div key={m.id} className={`flex gap-2.5 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-sm ${m.role === 'user' ? 'khan-gradient text-white' : 'bg-muted'}`}>{m.role === 'user' ? 'NK' : '🏛️'}</div>
                <div className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm whitespace-pre-wrap ${m.role === 'user' ? 'bg-khan-red text-white rounded-tr-sm' : 'bg-muted rounded-tl-sm'}`}>{m.content}</div>
              </div>
            ))}
            {sending && <div className="flex gap-2.5"><div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center">🏛️</div><div className="bg-muted rounded-2xl px-4 py-3 flex gap-1">{[0,1,2].map(i=><span key={i} className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce" style={{animationDelay:`${i*150}ms`}} />)}</div></div>}
            <div ref={bottomRef} />
          </div>
          <form onSubmit={handleSend} className="flex gap-2">
            <Input value={input} onChange={e => setInput(e.target.value)} placeholder="e.g. What RTO work is due this week?" className="flex-1" />
            <Button type="submit" variant="khan" size="icon" disabled={!input.trim() || sending}><Send className="w-4 h-4" /></Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
