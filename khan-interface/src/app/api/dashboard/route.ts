/**
 * GET /api/dashboard
 * Returns AI-generated daily briefing when GROQ_API_KEY is set
 */
import { NextRequest, NextResponse } from 'next/server'

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions'

export async function POST(req: NextRequest) {
  try {
    const groqKey = process.env.GROQ_API_KEY
    const { summary } = await req.json()

    if (!groqKey) {
      return NextResponse.json({
        briefing: null,
        demo: true,
      })
    }

    const owner    = process.env.OWNER_NAME    || 'Nawaz Khan'
    const business = process.env.BUSINESS_NAME || 'KM Car Deals'
    const model    = process.env.GROQ_MODEL    || 'llama-3.1-8b-instant'

    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${groqKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: [{
          role: 'system',
          content: `You are the Business Manager AI for ${business}, owned by ${owner}. Generate a very short 2-3 sentence morning briefing based on this data. Be specific about urgent items.`,
        }, {
          role: 'user',
          content: `Business snapshot: ${JSON.stringify(summary)}. Give a 2-3 sentence briefing highlighting the most urgent item.`,
        }],
        temperature: 0.3,
        max_tokens: 150,
      }),
    })

    if (!response.ok) return NextResponse.json({ briefing: null })
    const data = await response.json()

    return NextResponse.json({
      briefing: data.choices?.[0]?.message?.content || null,
      generatedAt: new Date().toISOString(),
    })

  } catch {
    return NextResponse.json({ briefing: null })
  }
}
