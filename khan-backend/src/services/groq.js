/**
 * GROQ LLM SERVICE — Khan Interface
 * Free Llama 3.1 70B via Groq Cloud
 * https://console.groq.com — free API key
 */
const Groq   = require('groq-sdk')
const { supabase } = require('../db/supabase')

const groq = process.env.GROQ_API_KEY ? new Groq({ apiKey: process.env.GROQ_API_KEY }) : null
const MODEL = process.env.GROQ_MODEL || 'llama-3.1-70b-versatile'

const OWNER    = process.env.OWNER_NAME    || 'Nawaz Khan'
const BUSINESS = process.env.BUSINESS_NAME || 'KM Car Deals'

// ── Fetch live business data for agent context ─────────────────────────────
async function fetchBusinessContext(agentId) {
  const ctx = {}

  if (['finance_agent','business_manager','accountant_agent'].includes(agentId)) {
    const { data } = await supabase.from('finance_accounts').select('*').order('created_at', { ascending: false }).limit(50)
    ctx.financeAccounts = data || []
    ctx.overdue         = (data || []).filter(f => f.status === 'overdue')
    ctx.totalOutstanding = (data || []).reduce((s, f) => s + (f.outstanding_amount || 0), 0)
  }

  if (['customer_agent','sales_agent','business_manager'].includes(agentId)) {
    const { data } = await supabase.from('customers').select('*').order('created_at', { ascending: false }).limit(50)
    ctx.customers     = data || []
    ctx.overdueCustomers = (data || []).filter(c => c.status === 'overdue')
    ctx.pendingCustomers = (data || []).filter(c => c.status === 'pending')
  }

  if (['rto_agent','vehicle_agent','business_manager'].includes(agentId)) {
    const { data: rto } = await supabase.from('rto_tasks').select('*').neq('status', 'completed')
    const { data: veh } = await supabase.from('vehicles').select('*').order('created_at', { ascending: false }).limit(30)
    ctx.rtoTasks = rto || []
    ctx.vehicles = veh || []
    ctx.criticalRTO = (rto || []).filter(r => r.priority === 'critical')
  }

  if (['accountant_agent','business_manager'].includes(agentId)) {
    const { data } = await supabase.from('transactions').select('*').order('date', { ascending: false }).limit(100)
    ctx.transactions = data || []
  }

  if (['business_manager'].includes(agentId)) {
    const { data: pay } = await supabase.from('payments').select('*').eq('status', 'overdue')
    const { data: rem } = await supabase.from('reminders').select('*').in('status', ['due_today','overdue'])
    ctx.overduePayments = pay || []
    ctx.todayReminders  = rem || []
  }

  return ctx
}

// ── Agent system prompts ───────────────────────────────────────────────────
function getSystemPrompt(agentId, ctx) {
  const base = `You are an AI agent for ${BUSINESS}, owned by ${OWNER}. 
You ONLY respond with information relevant to this business. 
Be concise, direct, and actionable. Use INR (₹) for currency. Use Indian number formatting.
Always end with a clear recommended action.`

  const prompts = {
    finance_agent: `${base}
You are the Finance Agent — Finance & Receivables Manager for ${BUSINESS}.

LIVE BUSINESS DATA:
- Total finance accounts: ${ctx.financeAccounts?.length || 0}
- Overdue accounts: ${ctx.overdue?.length || 0}
- Total outstanding: ₹${((ctx.totalOutstanding || 0) / 100000).toFixed(2)} Lakhs

Overdue accounts:
${ctx.overdue?.map(f => `- ${f.customer_name}: ₹${f.outstanding_amount?.toLocaleString('en-IN')} (${f.finance_company}) — ${f.status}`).join('\n') || 'None'}

Your job: Track EMI payments, identify overdue accounts, calculate outstanding amounts, recommend follow-up actions.
Never make up data. Only report what's in the provided context.`,

    rto_agent: `${base}
You are the RTO Agent — Vehicle Registration & RTO Operations Manager.

LIVE BUSINESS DATA:
- Pending RTO tasks: ${ctx.rtoTasks?.length || 0}
- Critical tasks: ${ctx.criticalRTO?.length || 0}

Critical RTO tasks:
${ctx.criticalRTO?.map(r => `- ${r.vehicle_registration}: ${r.task_type} | ${r.rto_office} | Deadline: ${r.expected_completion_date || 'TBD'} | Missing docs: ${JSON.stringify(r.required_documents || [])}`).join('\n') || 'None'}

Your job: Monitor RC transfers, document submissions, RTO deadlines. Alert about missing documents.`,

    sales_agent: `${base}
You are the Sales Agent — Vehicle Sales & Customer Conversion Manager.

LIVE BUSINESS DATA:
- Total customers: ${ctx.customers?.length || 0}
- Pending deals: ${ctx.pendingCustomers?.length || 0}

Pending customers:
${ctx.pendingCustomers?.map(c => `- ${c.full_name} (${c.phone}): ${c.vehicle_info || 'No vehicle'} — ${c.notes || ''}`).join('\n') || 'None'}

Your job: Monitor sales pipeline, identify follow-up opportunities, track deliveries.`,

    accountant_agent: `${base}
You are the Accountant Agent — Business Accounts & Cash Flow Manager.

LIVE BUSINESS DATA:
- Total transactions analysed: ${ctx.transactions?.length || 0}
- Total finance outstanding: ₹${((ctx.totalOutstanding || 0) / 100000).toFixed(2)} Lakhs

Recent transactions summary:
${ctx.transactions?.slice(0, 10).map(t => `- ${t.date}: ${t.type} ₹${t.amount?.toLocaleString('en-IN')} — ${t.description}`).join('\n') || 'None'}

Your job: Calculate profit/loss, track expenses, generate financial summaries. 
IMPORTANT: Clearly label all calculations as business management estimates, not certified accounts.`,

    customer_agent: `${base}
You are the Customer Agent — Customer Relationship Manager.

LIVE BUSINESS DATA:
- Total customers: ${ctx.customers?.length || 0}
- Overdue customers: ${ctx.overdueCustomers?.length || 0}

Overdue customers needing urgent contact:
${ctx.overdueCustomers?.map(c => `- ${c.full_name} (${c.phone}): ₹${c.amount_pending?.toLocaleString('en-IN')} pending — Last contact: ${c.last_contact_date || 'Never'}`).join('\n') || 'None'}

Your job: Track customer follow-ups, identify who needs to be called, manage relationships.`,

    vehicle_agent: `${base}
You are the Vehicle Agent — Vehicle Operations Manager.

LIVE BUSINESS DATA:
- Total vehicles: ${ctx.vehicles?.length || 0}
- In stock/repair: ${ctx.vehicles?.filter(v => ['listed','repair','available'].includes(v.status)).length || 0}

Vehicles requiring attention:
${ctx.vehicles?.filter(v => !['delivered','completed'].includes(v.status)).map(v => `- ${v.registration_number}: ${v.brand} ${v.model} (${v.year}) — Status: ${v.status} — ${v.notes || ''}`).join('\n') || 'None'}

Your job: Monitor vehicle lifecycle from purchase to delivery. Track repairs, RTO, insurance.`,

    business_manager: `${base}
You are the Business Manager — Executive AI Assistant for ${OWNER}.

COMPLETE LIVE BUSINESS SNAPSHOT:
- Total customers: ${ctx.customers?.length || 0} (${ctx.overdueCustomers?.length || 0} overdue)
- Finance outstanding: ₹${((ctx.totalOutstanding || 0) / 100000).toFixed(2)} Lakhs
- Overdue payments: ${ctx.overduePayments?.length || 0}
- RTO tasks pending: ${ctx.rtoTasks?.length || 0} (${ctx.criticalRTO?.length || 0} critical)
- Today's reminders: ${ctx.todayReminders?.length || 0}

Top overdue accounts:
${ctx.overdue?.slice(0, 4).map(f => `- ${f.customer_name}: ₹${f.outstanding_amount?.toLocaleString('en-IN')} — ${f.finance_company}`).join('\n') || 'None'}

Your job: Provide morning briefings, coordinate all agents, prioritise daily tasks, give strategic business insights.`,
  }

  return prompts[agentId] || `${base}\nYou are an AI assistant for ${BUSINESS}.`
}

// ── Run a full agent analysis ─────────────────────────────────────────────
async function runAgent(agentId) {
  if (!groq) return { error: 'AI not configured — add GROQ_API_KEY to .env', agentId }
  const start = Date.now()
  const ctx   = await fetchBusinessContext(agentId)

  const agentPrompts = {
    finance_agent:    'Analyse all finance accounts. Identify overdue payments, calculate total outstanding, list accounts needing urgent attention, and provide prioritised follow-up recommendations.',
    rto_agent:        'Check all pending RTO tasks. Identify critical deadlines, missing documents, and overdue tasks. Provide a prioritised action list.',
    sales_agent:      'Analyse the sales pipeline. Identify customers needing follow-up, pending deliveries, and conversion opportunities.',
    accountant_agent: 'Generate a financial summary. Calculate total income, expenses, and estimated profit. Identify commission pending and cash flow issues.',
    customer_agent:   'Review all customer accounts. Identify who needs to be called today, overdue contacts, and relationship management priorities.',
    vehicle_agent:    'Check all vehicles. Report on lifecycle stage, repair status, insurance expiry, and RTO pending work.',
    business_manager: `Generate the daily business briefing for ${OWNER}. Include urgent tasks, financial snapshot, and top 5 priority actions for today.`,
  }

  const systemPrompt = getSystemPrompt(agentId, ctx)
  const userPrompt   = agentPrompts[agentId] || 'Analyse the current business situation and provide a status report.'

  const completion = await groq.chat.completions.create({
    model:       MODEL,
    messages:    [{ role: 'system', content: systemPrompt }, { role: 'user', content: userPrompt }],
    temperature: 0.3,
    max_tokens:  1500,
  })

  const output   = completion.choices[0]?.message?.content || 'No response generated'
  const duration = Date.now() - start
  const tokens   = completion.usage?.total_tokens || 0

  // Log to Supabase
  await supabase.from('ai_agent_logs').insert({
    agent_id: agentId, agent_name: agentId.replace(/_/g, ' '),
    action: 'run_analysis', input: userPrompt,
    output, tokens_used: tokens, duration_ms: duration, status: 'completed',
  })

  return {
    agentId, output, tokensUsed: tokens, durationMs: duration,
    generatedAt: new Date().toISOString(),
    context: {
      customersAnalysed:  ctx.customers?.length || 0,
      financeAnalysed:    ctx.financeAccounts?.length || 0,
      rtoAnalysed:        ctx.rtoTasks?.length || 0,
      vehiclesAnalysed:   ctx.vehicles?.length || 0,
    },
  }
}

// ── Chat with an agent ────────────────────────────────────────────────────
async function chatWithAgent(agentId, message, history = []) {
  if (!groq) return { id: `msg_${Date.now()}`, agentId, role: 'agent', content: 'AI not configured — add GROQ_API_KEY to .env', timestamp: new Date().toISOString() }
  const start = Date.now()
  const ctx   = await fetchBusinessContext(agentId)
  const systemPrompt = getSystemPrompt(agentId, ctx)

  // Build message history (last 10 turns)
  const messages = [
    { role: 'system', content: systemPrompt },
    ...history.slice(-10).map(m => ({ role: m.role, content: m.content })),
    { role: 'user', content: message },
  ]

  const completion = await groq.chat.completions.create({
    model: MODEL, messages, temperature: 0.4, max_tokens: 800,
  })

  const reply    = completion.choices[0]?.message?.content || 'I could not process that request.'
  const tokens   = completion.usage?.total_tokens || 0
  const duration = Date.now() - start

  // Log
  await supabase.from('ai_agent_logs').insert({
    agent_id: agentId, agent_name: agentId.replace(/_/g, ' '),
    action: 'chat', input: message, output: reply,
    tokens_used: tokens, duration_ms: duration, status: 'completed',
  })

  return {
    id: `msg_${Date.now()}`, agentId, role: 'agent',
    content: reply, timestamp: new Date().toISOString(),
    tokensUsed: tokens, durationMs: duration,
  }
}

// ── Get all agents status ─────────────────────────────────────────────────
async function getAgentStatus() {
  const { data: logs } = await supabase.from('ai_agent_logs')
    .select('agent_id,agent_name,created_at,status').order('created_at', { ascending: false }).limit(100)

  const agents = ['rto_agent','finance_agent','sales_agent','accountant_agent','customer_agent','vehicle_agent','business_manager']
  return agents.map(id => {
    const agentLogs = (logs || []).filter(l => l.agent_id === id)
    const lastRun   = agentLogs[0]
    return {
      id,
      name:           id.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
      lastRunAt:      lastRun?.created_at,
      tasksCompleted: agentLogs.filter(l => l.status === 'completed').length,
      status:         lastRun ? 'online' : 'idle',
    }
  })
}

module.exports = { runAgent, chatWithAgent, getAgentStatus }
