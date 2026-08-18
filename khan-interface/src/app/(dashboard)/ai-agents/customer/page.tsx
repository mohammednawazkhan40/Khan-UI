'use client'
import { useState, useRef, useEffect } from 'react'
import { ArrowLeft, Send, Phone, MessageCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { sendAgentMessage } from '@/lib/services'
import { mockCustomers } from '@/lib/mock'
import type { AgentChatMessage } from '@/types'
import { daysAgo } from '@/lib/utils'

const INITIAL: AgentChatMessage[] = [
  { id: 'm1', agentId: 'customer_agent', role: 'agent', content: 'Hello Nawaz! I\'m your Customer Agent.\n\n👥 **Follow-up required today:**\n\n🔴 Abdul Hamid Sheikh — No contact 33 days\n🔴 Ravi Shankar Mishra — Payment overdue 42d\n🟠 Priya Mehta — No contact 11 days\n🟠 Meena Kumari Verma — Overdue 41d\n\nShould I prepare WhatsApp messages for the overdue customers?', timestamp: new Date().toISOString() }
]

export default function CustomerAgentPage() {
  const [messages, setMessages] = useState<AgentChatMessage[]>(INITIAL)
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const urgentCustomers = mockCustomers.filter(c => c.status === 'overdue').slice(0, 4)

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || sending) return
    const userMsg: AgentChatMessage = { id: Date.now().toString(), agentId: 'customer_agent', role: 'user', content: input.trim(), timestamp: new Date().toISOString() }
    setMessages(m => [...m, userMsg])
    setInput('')
    setSending(true)
    const { mockCustomers } = await import('@/lib/mock')
    const context = {
      customers:        mockCustomers.map(c => ({ fullName: c.fullName, phone: c.phone, status: c.status, amountPending: c.amountPending, lastContactDate: c.lastContactDate, nextFollowUpDate: c.nextFollowUpDate })),
      overdueCustomers: mockCustomers.filter(c => c.status === 'overdue').map(c => ({ fullName: c.fullName, phone: c.phone, amountPending: c.amountPending, lastContactDate: c.lastContactDate })),
    }
    const reply = await sendAgentMessage('customer_agent', input.trim(), messages, context)
    setMessages(m => [...m, reply])
    setSending(false)
  }

  return (
    <div className="flex flex-col gap-5 pb-8 max-w-4xl">
      <div className="flex items-center gap-3">
        <Link href="/ai-agents"><Button variant="outline" size="icon"><ArrowLeft className="w-4 h-4" /></Button></Link>
        <div className="text-2xl">👥</div>
        <div className="flex-1"><div className="flex items-center gap-2"><h1 className="text-xl font-bold">Customer Agent</h1><Badge variant="critical">4 Alerts</Badge></div><p className="text-sm text-muted-foreground">Customer Relationship Manager</p></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="border-red-200 dark:border-red-800 bg-red-50/30 dark:bg-red-950/20">
          <CardHeader className="pb-2"><CardTitle className="text-sm text-red-700 dark:text-red-400">Urgent Follow-ups</CardTitle></CardHeader>
          <CardContent className="space-y-2 pt-0">
            {urgentCustomers.map(c => (
              <div key={c.id} className="flex items-center gap-2 p-2 rounded-lg bg-background border border-red-100 dark:border-red-900">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{c.fullName}</p>
                  <p className="text-xs text-muted-foreground">{c.lastContactDate ? `${daysAgo(c.lastContactDate)}d since last contact` : 'Never contacted'}</p>
                </div>
                <div className="flex gap-1 shrink-0">
                  <Button size="sm" variant="outline" className="h-7 text-xs px-2"><Phone className="w-3 h-3" /></Button>
                  <Button size="sm" variant="outline" className="h-7 text-xs px-2 text-green-600 border-green-200"><MessageCircle className="w-3 h-3" /></Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">👥 Chat with Customer Agent</CardTitle></CardHeader>
          <CardContent className="flex flex-col p-4 pt-0">
            <div className="overflow-y-auto space-y-3 mb-3 min-h-[220px] max-h-[280px]">
              {messages.map(m => (
                <div key={m.id} className={`flex gap-2.5 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-sm ${m.role === 'user' ? 'khan-gradient text-white' : 'bg-muted'}`}>{m.role === 'user' ? 'NK' : '👥'}</div>
                  <div className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm whitespace-pre-wrap ${m.role === 'user' ? 'bg-khan-red text-white rounded-tr-sm' : 'bg-muted rounded-tl-sm'}`}>{m.content}</div>
                </div>
              ))}
              {sending && <div className="flex gap-2.5"><div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center">👥</div><div className="bg-muted rounded-2xl px-4 py-3 flex gap-1">{[0,1,2].map(i=><span key={i} className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce" style={{animationDelay:`${i*150}ms`}} />)}</div></div>}
              <div ref={bottomRef} />
            </div>
            <form onSubmit={handleSend} className="flex gap-2">
              <Input value={input} onChange={e => setInput(e.target.value)} placeholder="e.g. Who should I call today?" className="flex-1" />
              <Button type="submit" variant="khan" size="icon" disabled={!input.trim() || sending}><Send className="w-4 h-4" /></Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
