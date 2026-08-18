/**
 * POST /api/ai/chat
 * Server-side Groq LLM chat — API key never exposed to browser
 *
 * Body: { agentId, message, history, context }
 */
import { NextRequest, NextResponse } from 'next/server'

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions'

// ── Agent system prompts ──────────────────────────────────────────────────────
function buildSystemPrompt(agentId: string, context: any) {
  const owner    = process.env.OWNER_NAME    || 'Nawaz Khan'
  const business = process.env.BUSINESS_NAME || 'KM Car Deals'

  const base = `You are a specialized AI agent for ${business}, owned by ${owner}.
Business type: Multi-brand Pre-Owned Cars Sales & Purchase.
Location: India. Always use ₹ (INR) for currency. Use Indian number formatting (Lakhs, Crores).
Be concise, direct, and give actionable advice. Today's date: ${new Date().toLocaleDateString('en-IN')}.`

  const prompts: Record<string, string> = {
    finance_agent: `${base}
You are the Finance Agent — Finance & Receivables Manager.
You track EMI payments, identify overdue accounts, calculate outstanding amounts.

${context ? `LIVE BUSINESS DATA:
- Total finance accounts: ${context.financeAccounts?.length || 0}
- Overdue accounts: ${context.overdueAccounts?.length || 0}
- Total outstanding: ₹${((context.totalOutstanding || 0)/100000).toFixed(2)} Lakhs
- Overdue accounts: ${context.overdueAccounts?.map((f: any) => `${f.customerName}: ₹${f.outstandingAmount?.toLocaleString('en-IN')} (${f.financeCompany})`).join(', ') || 'None'}` : ''}

Analyse the data and give specific, actionable advice. Prioritise by urgency.`,

    rto_agent: `${base}
You are the RTO Agent — Vehicle Registration & RTO Operations Manager.
You track RC transfers, document submissions, RTO deadlines, missing documents.

${context ? `LIVE RTO DATA:
- Pending tasks: ${context.rtoTasks?.length || 0}
- Critical tasks: ${context.criticalTasks?.map((t: any) => `${t.vehicleRegistration}: ${t.taskType} (deadline: ${t.expectedCompletionDate})`).join(', ') || 'None'}` : ''}`,

    sales_agent: `${base}
You are the Sales Agent — Vehicle Sales & Customer Conversion Manager.
You monitor leads, follow-ups, bookings, deliveries, and conversion opportunities.

${context ? `LIVE SALES DATA:
- Total customers: ${context.customers?.length || 0}
- Pending deals: ${context.pendingCustomers?.length || 0}
- Overdue: ${context.overdueCustomers?.length || 0}
- Available vehicles: ${context.availableVehicles?.length || 0}` : ''}`,

    accountant_agent: `${base}
You are the Accountant Agent — Business Accounts & Cash Flow Manager.
You calculate profit/loss, track expenses, generate financial summaries.
IMPORTANT: Always label calculations as business management estimates, not certified accounts.

${context ? `LIVE FINANCIAL DATA:
- Total outstanding: ₹${((context.totalOutstanding || 0)/100000).toFixed(2)} Lakhs
- Recent transactions: ${context.recentTransactions?.slice(0,5).map((t: any) => `${t.type}: ₹${t.amount?.toLocaleString('en-IN')}`).join(', ') || 'None'}` : ''}`,

    customer_agent: `${base}
You are the Customer Agent — Customer Relationship Manager.
You track follow-ups, identify who needs to be called, manage customer relationships.

${context ? `LIVE CUSTOMER DATA:
- Total customers: ${context.customers?.length || 0}
- Overdue customers: ${context.overdueCustomers?.map((c: any) => `${c.fullName} (${c.phone}): ₹${c.amountPending?.toLocaleString('en-IN')} pending`).join(', ') || 'None'}` : ''}`,

    vehicle_agent: `${base}
You are the Vehicle Agent — Vehicle Operations Manager.
You monitor vehicle lifecycle from purchase to delivery, repairs, insurance, RTO.

${context ? `LIVE VEHICLE DATA:
- Total vehicles: ${context.vehicles?.length || 0}
- Requiring attention: ${context.vehicles?.filter((v: any) => !['delivered','completed'].includes(v.status)).map((v: any) => `${v.registrationNumber}: ${v.status}`).join(', ') || 'None'}` : ''}`,

    business_manager: `${base}
You are the Business Manager — Executive AI Assistant for ${owner}.
You provide morning briefings, coordinate all agents, prioritise daily tasks.

${context ? `COMPLETE BUSINESS SNAPSHOT:
- Customers: ${context.customers?.length || 0} total, ${context.overdueCustomers?.length || 0} overdue
- Finance outstanding: ₹${((context.totalOutstanding || 0)/100000).toFixed(2)} Lakhs
- RTO pending: ${context.rtoTasks?.length || 0}
- Today's reminders: ${context.todayReminders?.length || 0}
- Overdue payments: ${context.overduePayments?.length || 0}` : ''}`,
  }

  return prompts[agentId] || `${base}\nYou are a helpful AI assistant for ${business}.`
}

export async function POST(req: NextRequest) {
  try {
    const groqKey = process.env.GROQ_API_KEY

    // ── No API key — return helpful demo response ─────────────────────────
    if (!groqKey) {
      return NextResponse.json({
        id: `msg_${Date.now()}`,
        role: 'agent',
        content: `🔑 **Groq API Key Not Set**\n\nTo enable real AI responses:\n\n1. Go to **https://console.groq.com** → sign up free\n2. Create an API key (starts with \`gsk_\`)\n3. Add to your \`.env.local\` file:\n\`\`\`\nGROQ_API_KEY=gsk_your_key_here\n\`\`\`\n4. Restart the dev server\n\nGroq is **100% free** and gives you Llama 3.1 70B — one of the most powerful open-source models. Once connected, I will read your real business data and give intelligent answers.`,
        timestamp: new Date().toISOString(),
        demo: true,
      })
    }

    const { agentId, message, history = [], context = {} } = await req.json()

    if (!agentId || !message) {
      return NextResponse.json({ error: 'agentId and message are required' }, { status: 400 })
    }

    const systemPrompt = buildSystemPrompt(agentId, context)
    const model = process.env.GROQ_MODEL || 'openai/gpt-oss-120b'

    // Build messages array (last 10 turns for context)
    const messages = [
      { role: 'system', content: systemPrompt },
      ...history.slice(-10).map((m: any) => ({ role: m.role === 'agent' ? 'assistant' : 'user', content: m.content })),
      { role: 'user', content: message },
    ]

    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${groqKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: 0.4,
        max_tokens: 1024,
        stream: false,
      }),
    })

    if (!response.ok) {
      const err = await response.json()
      console.error('Groq API error:', err)
      return NextResponse.json({ error: err.error?.message || 'Groq API error' }, { status: 500 })
    }

    const data = await response.json()
    const content = data.choices?.[0]?.message?.content || 'No response generated.'
    const tokens  = data.usage?.total_tokens || 0

    return NextResponse.json({
      id:         `msg_${Date.now()}`,
      agentId,
      role:       'agent',
      content,
      timestamp:  new Date().toISOString(),
      tokensUsed: tokens,
      model,
    })

  } catch (err: any) {
    console.error('Chat API error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
