/**
 * POST /api/ai/run
 * Run a full agent analysis using Groq + live mock/real data
 *
 * Body: { agentId }
 */
import { NextRequest, NextResponse } from 'next/server'

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions'

const AGENT_TASKS: Record<string, string> = {
  finance_agent:    'Analyse all finance accounts in detail. List every overdue account with customer name, amount, days overdue, and finance company. Calculate total outstanding. Give a prioritised action plan with specific phone numbers to call first.',
  rto_agent:        'Check all pending RTO tasks. List every task with vehicle registration, task type, deadline, and missing documents. Identify the most critical ones. Give step-by-step action plan.',
  sales_agent:      'Analyse the complete sales pipeline. Who needs follow-up today? Which customers are closest to converting? Which vehicles are available? Give a prioritised call list.',
  accountant_agent: 'Generate complete financial summary. Calculate total income, total expenditure, estimated profit, outstanding receivables, and commission pending. Present as a business dashboard report. Label as management estimates.',
  customer_agent:   'Review all customer accounts. Who has not been contacted recently? Who is overdue? Create a priority follow-up list with reason for contact and suggested approach.',
  vehicle_agent:    'Check entire vehicle inventory. What stage is each vehicle at? Any repairs pending? Insurance expiring? RTO pending? Give lifecycle status for each active vehicle.',
  business_manager: `Generate today's complete business briefing for Nawaz Khan, KM Car Deals. Include:
1. URGENT (action needed today)
2. Financial snapshot  
3. Top 5 priority tasks
4. AI team summary
5. This week's outlook
Be specific with names, amounts, and deadlines.`,
}

export async function POST(req: NextRequest) {
  try {
    const groqKey = process.env.GROQ_API_KEY

    if (!groqKey) {
      return NextResponse.json({
        agentId: 'unknown',
        output: '🔑 Add GROQ_API_KEY to your .env.local file to enable real AI analysis.\n\nGet your free key at: https://console.groq.com',
        demo: true,
        generatedAt: new Date().toISOString(),
      })
    }

    const { agentId, context = {} } = await req.json()
    if (!agentId) return NextResponse.json({ error: 'agentId required' }, { status: 400 })

    const owner    = process.env.OWNER_NAME    || 'Nawaz Khan'
    const business = process.env.BUSINESS_NAME || 'KM Car Deals'
    const model    = process.env.GROQ_MODEL    || 'llama-3.1-70b-versatile'

    // Build context string from provided data
    let contextStr = ''
    if (Object.keys(context).length > 0) {
      contextStr = '\n\nLIVE BUSINESS DATA:\n' + JSON.stringify(context, null, 2)
    }

    const systemPrompt = `You are a senior AI business analyst for ${business}, owned by ${owner}.
This is a pre-owned cars sales & purchase business in India.
Use ₹ (INR) for currency. Use Indian number formatting.
Today: ${new Date().toLocaleDateString('en-IN')}.
Be specific, concise, and give actionable recommendations.${contextStr}`

    const userPrompt = AGENT_TASKS[agentId] || 'Provide a complete business status report.'

    const start = Date.now()
    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${groqKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.3,
        max_tokens: 2048,
      }),
    })

    if (!response.ok) {
      const err = await response.json()
      return NextResponse.json({ error: err.error?.message || 'Groq error' }, { status: 500 })
    }

    const data    = await response.json()
    const output  = data.choices?.[0]?.message?.content || 'No analysis generated.'
    const tokens  = data.usage?.total_tokens || 0
    const elapsed = Date.now() - start

    return NextResponse.json({
      agentId,
      output,
      tokensUsed:   tokens,
      durationMs:   elapsed,
      model,
      generatedAt:  new Date().toISOString(),
    })

  } catch (err: any) {
    console.error('Run agent error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
