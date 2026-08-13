/**
 * CRON SCHEDULER — Khan Interface
 * Automated daily tasks for KM Car Deals
 */
const cron   = require('node-cron')
const { supabase } = require('../db/supabase')
const { sendPaymentReminder } = require('../services/whatsapp')
const { runAgent } = require('../services/groq')

// ── Update payment statuses daily at 6 AM ────────────────────────────────
cron.schedule('0 6 * * *', async () => {
  console.log('⏰ Running daily payment status update...')
  const today = new Date().toISOString().slice(0, 10)

  // Mark overdue
  const { data: overdue } = await supabase.from('payments')
    .select('id').eq('status', 'upcoming').lt('due_date', today)
  if (overdue?.length) {
    await supabase.from('payments').update({ status: 'overdue' })
      .in('id', overdue.map(p => p.id))
    console.log(`  ✅ Marked ${overdue.length} payments as overdue`)
  }

  // Mark due today
  const { data: dueToday } = await supabase.from('payments')
    .select('id').eq('status', 'upcoming').eq('due_date', today)
  if (dueToday?.length) {
    await supabase.from('payments').update({ status: 'due_today' })
      .in('id', dueToday.map(p => p.id))
  }

  // Update customer statuses
  const { data: overdueCustomers } = await supabase.from('finance_accounts')
    .select('customer_id').eq('status', 'overdue')
  if (overdueCustomers?.length) {
    await supabase.from('customers').update({ status: 'overdue' })
      .in('id', overdueCustomers.map(c => c.customer_id))
  }

  // Update reminders
  const { data: overdueRems } = await supabase.from('reminders')
    .select('id').eq('status', 'upcoming').lt('due_date', today)
  if (overdueRems?.length) {
    await supabase.from('reminders').update({ status: 'overdue' })
      .in('id', overdueRems.map(r => r.id))
  }

  // Create notification
  const totalAlerts = (overdue?.length || 0) + (dueToday?.length || 0)
  if (totalAlerts > 0) {
    await supabase.from('notifications').insert({
      title: `Daily Finance Check — ${totalAlerts} alerts`,
      message: `${overdue?.length || 0} overdue + ${dueToday?.length || 0} due today`,
      type: 'payment_overdue', priority: overdue?.length > 0 ? 'high' : 'medium',
    })
  }
})

// ── Run Business Manager briefing daily at 7 AM ──────────────────────────
cron.schedule('0 7 * * *', async () => {
  console.log('🤖 Running Business Manager daily briefing...')
  try {
    const result = await runAgent('business_manager')
    await supabase.from('notifications').insert({
      title: 'Morning Briefing Ready',
      message: `Business Manager has analysed ${result.context.customersAnalysed} customers, ${result.context.financeAnalysed} finance accounts, and ${result.context.rtoAnalysed} RTO tasks.`,
      type: 'ai_completed', priority: 'low',
      agent_id: 'business_manager', agent_name: 'Business Manager',
    })
    console.log('  ✅ Morning briefing generated')
  } catch (err) {
    console.error('  ❌ Morning briefing failed:', err.message)
  }
})

// ── Send WhatsApp reminders at 9 AM ──────────────────────────────────────
cron.schedule('0 9 * * *', async () => {
  if (!process.env.TWILIO_ACCOUNT_SID) {
    console.log('⏭️  Skipping WhatsApp reminders — Twilio not configured')
    return
  }
  console.log('📱 Sending WhatsApp payment reminders...')

  const today = new Date().toISOString().slice(0, 10)
  const threeDaysLater = new Date(Date.now() + 3 * 86400000).toISOString().slice(0, 10)

  const { data: reminders } = await supabase.from('reminders')
    .select('*').in('status', ['due_today','upcoming']).lte('due_date', threeDaysLater)
    .eq('whatsapp_sent', false)

  for (const rem of (reminders || [])) {
    if (!rem.customer_id) continue
    const { data: customer } = await supabase.from('customers')
      .select('phone,whatsapp,full_name').eq('id', rem.customer_id).single()
    if (!customer) continue

    const phone = customer.whatsapp || customer.phone
    if (!phone) continue

    await sendPaymentReminder(
      phone, customer.full_name,
      rem.title, rem.due_date, 'KM Car Deals'
    )

    await supabase.from('reminders').update({ whatsapp_sent: true }).eq('id', rem.id)
    console.log(`  ✅ Sent to ${customer.full_name}`)

    // Rate limit — 1 per second
    await new Promise(r => setTimeout(r, 1000))
  }
})

// ── Run Finance Agent analysis every 6 hours ────────────────────────────
cron.schedule('0 */6 * * *', async () => {
  if (!process.env.GROQ_API_KEY) return
  try {
    await runAgent('finance_agent')
    console.log('✅ Finance Agent auto-run completed')
  } catch (err) {
    console.error('Finance Agent auto-run failed:', err.message)
  }
})

console.log('✅ Cron scheduler started')
module.exports = {}
