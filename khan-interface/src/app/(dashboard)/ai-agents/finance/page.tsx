'use client'
import { useState, useRef, useEffect } from 'react'
import { ArrowLeft, Send, Play, Bot, User, RefreshCw, CheckCircle, XCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { PriorityBadge } from '@/components/shared/status-badge'
import Link from 'next/link'
import { getAgentById, getAgentChatHistory, runAgent, sendAgentMessage } from '@/lib/services'
import { formatCurrency, formatDate, timeAgo } from '@/lib/utils'
import { mockFinanceAgentResult } from '@/lib/mock'
import type { AIAgent, AgentChatMessage } from '@/types'
import { motion, AnimatePresence } from 'framer-motion'

export default function FinanceAgentPage() {
  const [agent, setAgent] = useState<AIAgent | null>(null)
  const [messages, setMessages] = useState<AgentChatMessage[]>([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [running, setRunning] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [approved, setApproved] = useState<Record<string, boolean>>({})
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    Promise.all([getAgentById('finance_agent'), getAgentChatHistory('finance_agent')])
      .then(([a, m]) => { setAgent(a ?? null); setMessages(m) })
  }, [])

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || sending) return
    const userMsg: AgentChatMessage = { id: Date.now().toString(), agentId: 'finance_agent', role: 'user', content: input.trim(), timestamp: new Date().toISOString() }
    setMessages(m => [...m, userMsg])
    setInput('')
    setSending(true)
    const reply = await sendAgentMessage('finance_agent', input.trim())
    setMessages(m => [...m, reply])
    setSending(false)
  }

  const handleRun = async () => {
    setRunning(true)
    await runAgent('finance_agent')
    setRunning(false)
    setShowResults(true)
  }

  return (
    <div className="flex flex-col gap-5 pb-8 h-full max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/ai-agents"><Button variant="outline" size="icon"><ArrowLeft className="w-4 h-4" /></Button></Link>
        <div className="text-2xl">💰</div>
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl font-bold">Finance Agent</h1>
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 status-pulse" />
              <span className="text-xs font-medium text-red-700 dark:text-red-400">Attention Required</span>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">Finance & Receivables Manager</p>
        </div>
        <Button variant="khan" size="sm" onClick={handleRun} loading={running} className="gap-1.5 shrink-0">
          <Play className="w-4 h-4" />{running ? 'Running…' : 'Run Finance Check'}
        </Button>
      </div>

      {/* Results */}
      <AnimatePresence>
        {showResults && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
            <Card className="border-khan-red/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 text-khan-red" />Finance Check Results
                  <Badge variant="critical">{mockFinanceAgentResult.criticalCount} Critical</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 pt-0">
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="p-2 rounded-lg bg-muted"><div className="text-lg font-bold">{mockFinanceAgentResult.totalChecked}</div><div className="text-xs text-muted-foreground">Checked</div></div>
                  <div className="p-2 rounded-lg bg-red-50 dark:bg-red-950"><div className="text-lg font-bold text-red-600">{mockFinanceAgentResult.criticalCount}</div><div className="text-xs text-muted-foreground">Critical</div></div>
                  <div className="p-2 rounded-lg bg-orange-50 dark:bg-orange-950"><div className="text-lg font-bold text-orange-600">{mockFinanceAgentResult.alertCount}</div><div className="text-xs text-muted-foreground">Alerts</div></div>
                </div>
                {mockFinanceAgentResult.findings.map(f => (
                  <div key={f.id} className={`p-3 rounded-lg border ${f.severity === 'critical' ? 'border-red-200 bg-red-50/50 dark:bg-red-950/30 dark:border-red-800' : f.severity === 'high' ? 'border-orange-200 bg-orange-50/50 dark:bg-orange-950/30 dark:border-orange-800' : 'border-border bg-muted/30'}`}>
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <span className="font-semibold text-sm">{f.title}</span>
                      <PriorityBadge priority={f.severity} />
                    </div>
                    <p className="text-xs text-muted-foreground">{f.description}</p>
                    {f.outstandingAmount && <p className="text-sm font-bold text-khan-red mt-1">{formatCurrency(f.outstandingAmount)} outstanding</p>}
                    {f.dueDate && <p className="text-xs text-muted-foreground">Due: {formatDate(f.dueDate)}</p>}
                    <p className="text-xs mt-1.5 font-medium">→ {f.recommendedAction}</p>
                    {f.requiresApproval && !approved[f.id] && (
                      <div className="flex gap-2 mt-2">
                        <Button size="sm" variant="khan" className="h-7 text-xs gap-1" onClick={() => setApproved(a => ({ ...a, [f.id]: true }))}>
                          <CheckCircle className="w-3 h-3" />Approve
                        </Button>
                        <Button size="sm" variant="outline" className="h-7 text-xs gap-1">
                          <XCircle className="w-3 h-3" />Reject
                        </Button>
                      </div>
                    )}
                    {approved[f.id] && <Badge variant="active" className="mt-2 text-xs">✓ Approved</Badge>}
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat */}
      <Card className="flex-1 flex flex-col">
        <CardHeader className="pb-2 shrink-0">
          <CardTitle className="text-base flex items-center gap-2"><Bot className="w-4 h-4 text-khan-red" />Chat with Finance Agent</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col p-4 pt-0 min-h-0">
          <div className="flex-1 overflow-y-auto space-y-3 mb-3 min-h-[300px] max-h-[400px]">
            {messages.map(m => (
              <div key={m.id} className={`flex gap-2.5 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-sm ${m.role === 'user' ? 'khan-gradient text-white' : 'bg-muted'}`}>
                  {m.role === 'user' ? 'NK' : '💰'}
                </div>
                <div className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm whitespace-pre-wrap ${m.role === 'user' ? 'bg-khan-red text-white rounded-tr-sm' : 'bg-muted rounded-tl-sm'}`}>
                  {m.content}
                </div>
              </div>
            ))}
            {sending && (
              <div className="flex gap-2.5">
                <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-sm">💰</div>
                <div className="bg-muted rounded-2xl rounded-tl-sm px-3.5 py-2.5 flex gap-1">
                  {[0,1,2].map(i => <span key={i} className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: `${i*150}ms` }} />)}
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>
          <form onSubmit={handleSend} className="flex gap-2 shrink-0">
            <Input value={input} onChange={e => setInput(e.target.value)} placeholder="Ask Finance Agent anything… e.g. Who owes me money?" className="flex-1" />
            <Button type="submit" variant="khan" size="icon" disabled={!input.trim() || sending}><Send className="w-4 h-4" /></Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
