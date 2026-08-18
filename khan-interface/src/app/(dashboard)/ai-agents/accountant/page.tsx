'use client'
import { useState, useRef, useEffect } from 'react'
import { ArrowLeft, Send } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { sendAgentMessage } from '@/lib/services'
import type { AgentChatMessage } from '@/types'

const INITIAL: AgentChatMessage[] = [
  { id: 'm1', agentId: 'accountant_agent', role: 'agent', content: 'Hello Nawaz! I\'m your Accountant Agent.\n\n📊 **August 2026 Summary:**\n\nSales: ₹43,50,000\nPurchases: ₹21,00,000\nExpenses: ₹1,10,500\nCollections: ₹1,35,500\n\nEstimated Profit: ₹3,45,000\n\n⚠️ Commission pending:\nSBI: ₹28,000 | Kotak: ₹42,000\n\nNote: These are business management records, not certified accounts.', timestamp: new Date().toISOString() }
]

export default function AccountantAgentPage() {
  const [messages, setMessages] = useState<AgentChatMessage[]>(INITIAL)
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || sending) return
    const userMsg: AgentChatMessage = { id: Date.now().toString(), agentId: 'accountant_agent', role: 'user', content: input.trim(), timestamp: new Date().toISOString() }
    setMessages(m => [...m, userMsg])
    setInput('')
    setSending(true)
    const { mockTransactions, mockExpenses, mockFinanceAccounts } = await import('@/lib/mock')
    const context = {
      recentTransactions: mockTransactions.slice(0, 20).map(t => ({ date: t.date, type: t.type, amount: t.amount, description: t.description })),
      expenses:           mockExpenses.map(e => ({ category: e.category, amount: e.amount, description: e.description, date: e.date })),
      totalOutstanding:   mockFinanceAccounts.reduce((s, f) => s + f.outstandingAmount, 0),
      commissionPending:  mockFinanceAccounts.filter(f => !f.commissionReceived).reduce((s, f) => s + (f.commissionAmount || 0), 0),
    }
    const reply = await sendAgentMessage('accountant_agent', input.trim(), messages, context)
    setMessages(m => [...m, reply])
    setSending(false)
  }

  return (
    <div className="flex flex-col gap-5 pb-8 max-w-3xl">
      <div className="flex items-center gap-3">
        <Link href="/ai-agents"><Button variant="outline" size="icon"><ArrowLeft className="w-4 h-4" /></Button></Link>
        <div className="text-2xl">📊</div>
        <div className="flex-1"><div className="flex items-center gap-2"><h1 className="text-xl font-bold">Accountant Agent</h1><Badge variant="active">Completed</Badge></div><p className="text-sm text-muted-foreground">Business Accounts & Cash Flow Manager</p></div>
      </div>
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base">📊 Chat with Accountant Agent</CardTitle></CardHeader>
        <CardContent className="flex flex-col p-4 pt-0">
          <div className="overflow-y-auto space-y-3 mb-3 min-h-[350px] max-h-[450px]">
            {messages.map(m => (
              <div key={m.id} className={`flex gap-2.5 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-sm ${m.role === 'user' ? 'khan-gradient text-white' : 'bg-muted'}`}>{m.role === 'user' ? 'NK' : '📊'}</div>
                <div className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm whitespace-pre-wrap ${m.role === 'user' ? 'bg-khan-red text-white rounded-tr-sm' : 'bg-muted rounded-tl-sm'}`}>{m.content}</div>
              </div>
            ))}
            {sending && <div className="flex gap-2.5"><div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center">📊</div><div className="bg-muted rounded-2xl px-4 py-3 flex gap-1">{[0,1,2].map(i=><span key={i} className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce" style={{animationDelay:`${i*150}ms`}} />)}</div></div>}
            <div ref={bottomRef} />
          </div>
          <form onSubmit={handleSend} className="flex gap-2">
            <Input value={input} onChange={e => setInput(e.target.value)} placeholder="e.g. How much did we spend this month?" className="flex-1" />
            <Button type="submit" variant="khan" size="icon" disabled={!input.trim() || sending}><Send className="w-4 h-4" /></Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
