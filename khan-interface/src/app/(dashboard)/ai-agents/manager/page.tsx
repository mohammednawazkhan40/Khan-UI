'use client'
import { useState, useRef, useEffect } from 'react'
import { ArrowLeft, Send, Zap } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { getAgentChatHistory, sendAgentMessage } from '@/lib/services'
import type { AgentChatMessage } from '@/types'

export default function BusinessManagerPage() {
  const [messages, setMessages] = useState<AgentChatMessage[]>([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    getAgentChatHistory('business_manager').then(setMessages)
  }, [])
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || sending) return
    const userMsg: AgentChatMessage = { id: Date.now().toString(), agentId: 'business_manager', role: 'user', content: input.trim(), timestamp: new Date().toISOString() }
    setMessages(m => [...m, userMsg])
    setInput('')
    setSending(true)
    // Pass full business context
    const { mockCustomers, mockFinanceAccounts, mockRTOTasks, mockReminders, mockPayments } = await import('@/lib/mock')
    const context = {
      customers:        mockCustomers.length,
      overdueCustomers: mockCustomers.filter(c => c.status === 'overdue').map(c => ({ fullName: c.fullName, phone: c.phone })),
      totalOutstanding: mockFinanceAccounts.reduce((s, f) => s + f.outstandingAmount, 0),
      overdueAccounts:  mockFinanceAccounts.filter(f => f.status === 'overdue').map(f => ({ customerName: f.customerName, outstandingAmount: f.outstandingAmount })),
      rtoTasks:         mockRTOTasks.filter(r => !['completed','cancelled'].includes(r.status)).length,
      todayReminders:   mockReminders.filter(r => r.status === 'due_today').length,
      overduePayments:  mockPayments.filter(p => p.status === 'overdue').length,
    }
    const reply = await sendAgentMessage('business_manager', input.trim(), messages, context)
    setMessages(m => [...m, reply])
    setSending(false)
  }

  return (
    <div className="flex flex-col gap-5 pb-8 h-full max-w-3xl">
      <div className="flex items-center gap-3">
        <Link href="/ai-agents"><Button variant="outline" size="icon"><ArrowLeft className="w-4 h-4" /></Button></Link>
        <div className="text-2xl">🎯</div>
        <div className="flex-1">
          <div className="flex items-center gap-2"><h1 className="text-xl font-bold">Business Manager</h1><Badge variant="active">Online</Badge></div>
          <p className="text-sm text-muted-foreground">Executive AI Assistant for Nawaz Khan</p>
        </div>
        <Button variant="khan" size="sm" className="gap-1.5 shrink-0"><Zap className="w-4 h-4" />Run Briefing</Button>
      </div>

      <Card className="flex-1 flex flex-col">
        <CardHeader className="pb-2 shrink-0"><CardTitle className="text-base">🎯 Chat with Business Manager</CardTitle></CardHeader>
        <CardContent className="flex-1 flex flex-col p-4 pt-0 min-h-0">
          <div className="flex-1 overflow-y-auto space-y-3 mb-3 min-h-[400px] max-h-[500px]">
            {messages.map(m => (
              <div key={m.id} className={`flex gap-2.5 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-sm ${m.role === 'user' ? 'khan-gradient text-white' : 'bg-muted'}`}>
                  {m.role === 'user' ? 'NK' : '🎯'}
                </div>
                <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm whitespace-pre-wrap leading-relaxed ${m.role === 'user' ? 'bg-khan-red text-white rounded-tr-sm' : 'bg-muted rounded-tl-sm'}`}>
                  {m.content}
                </div>
              </div>
            ))}
            {sending && (
              <div className="flex gap-2.5">
                <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center">🎯</div>
                <div className="bg-muted rounded-2xl rounded-tl-sm px-4 py-3 flex gap-1">
                  {[0,1,2].map(i => <span key={i} className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: `${i*150}ms` }} />)}
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>
          <form onSubmit={handleSend} className="flex gap-2 shrink-0">
            <Input value={input} onChange={e => setInput(e.target.value)} placeholder="Ask Business Manager anything about KM Car Deals…" className="flex-1" />
            <Button type="submit" variant="khan" size="icon" disabled={!input.trim() || sending}><Send className="w-4 h-4" /></Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
