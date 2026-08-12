'use client'
import { useState, useRef, useEffect } from 'react'
import { ArrowLeft, Send, Car } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { StatusBadge } from '@/components/shared/status-badge'
import Link from 'next/link'
import { sendAgentMessage } from '@/lib/services'
import { mockVehicles } from '@/lib/mock'
import type { AgentChatMessage } from '@/types'

const INITIAL: AgentChatMessage[] = [
  { id: 'm1', agentId: 'vehicle_agent', role: 'agent', content: 'Hello Nawaz! I\'m your Vehicle Agent.\n\n🚗 **Fleet status (18 vehicles):**\n\n🟢 Listed for sale: 1 (Baleno)\n🔧 In repair: 1 (Venue — 3 days)\n🏛️ In RTO: 1 (Innova Crysta)\n✅ Delivered: 14\n\n⚠️ Insurance expiring: Kia Seltos (31 Aug)\n⚠️ RC transfer pending: Polo (7+ months!)\n\nRecommendation: Follow up on Polo RC at Pune RTO urgently.', timestamp: new Date().toISOString() }
]

export default function VehicleAgentPage() {
  const [messages, setMessages] = useState<AgentChatMessage[]>(INITIAL)
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const activeVehicles = mockVehicles.filter(v => !['completed','delivered'].includes(v.status))

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || sending) return
    const userMsg: AgentChatMessage = { id: Date.now().toString(), agentId: 'vehicle_agent', role: 'user', content: input.trim(), timestamp: new Date().toISOString() }
    setMessages(m => [...m, userMsg])
    setInput('')
    setSending(true)
    const reply = await sendAgentMessage('vehicle_agent', input.trim())
    setMessages(m => [...m, reply])
    setSending(false)
  }

  return (
    <div className="flex flex-col gap-5 pb-8 max-w-4xl">
      <div className="flex items-center gap-3">
        <Link href="/ai-agents"><Button variant="outline" size="icon"><ArrowLeft className="w-4 h-4" /></Button></Link>
        <div className="text-2xl">🔧</div>
        <div className="flex-1"><div className="flex items-center gap-2"><h1 className="text-xl font-bold">Vehicle Agent</h1><Badge variant="active">Online</Badge></div><p className="text-sm text-muted-foreground">Vehicle Operations Manager</p></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Active Vehicles Requiring Attention</CardTitle></CardHeader>
          <CardContent className="space-y-2 pt-0">
            {activeVehicles.map(v => (
              <div key={v.id} className="flex items-center gap-2.5 p-2.5 rounded-lg border hover:border-khan-red/30 transition-colors">
                <Car className="w-4 h-4 text-muted-foreground shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{v.year} {v.brand} {v.model}</p>
                  <p className="text-xs text-muted-foreground font-mono">{v.registrationNumber}</p>
                </div>
                <StatusBadge status={v.status} />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">🔧 Chat with Vehicle Agent</CardTitle></CardHeader>
          <CardContent className="flex flex-col p-4 pt-0">
            <div className="overflow-y-auto space-y-3 mb-3 min-h-[240px] max-h-[300px]">
              {messages.map(m => (
                <div key={m.id} className={`flex gap-2.5 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-sm ${m.role === 'user' ? 'khan-gradient text-white' : 'bg-muted'}`}>{m.role === 'user' ? 'NK' : '🔧'}</div>
                  <div className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm whitespace-pre-wrap ${m.role === 'user' ? 'bg-khan-red text-white rounded-tr-sm' : 'bg-muted rounded-tl-sm'}`}>{m.content}</div>
                </div>
              ))}
              {sending && <div className="flex gap-2.5"><div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center">🔧</div><div className="bg-muted rounded-2xl px-4 py-3 flex gap-1">{[0,1,2].map(i=><span key={i} className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce" style={{animationDelay:`${i*150}ms`}} />)}</div></div>}
              <div ref={bottomRef} />
            </div>
            <form onSubmit={handleSend} className="flex gap-2">
              <Input value={input} onChange={e => setInput(e.target.value)} placeholder="e.g. Show me all cars with pending work" className="flex-1" />
              <Button type="submit" variant="khan" size="icon" disabled={!input.trim() || sending}><Send className="w-4 h-4" /></Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
