const router = require('express').Router()
const auth   = require('../middleware/auth')
const { supabase } = require('../db/supabase')

router.get('/summary', auth, async (req, res, next) => {
  try {
    const [
      { data: customers },
      { data: vehicles },
      { data: finance },
      { data: payments },
      { data: rto },
      { data: reminders },
    ] = await Promise.all([
      supabase.from('customers').select('id,status,amount_pending'),
      supabase.from('vehicles').select('id,status'),
      supabase.from('finance_accounts').select('id,status,outstanding_amount'),
      supabase.from('payments').select('id,status,amount,due_date'),
      supabase.from('rto_tasks').select('id,status,priority'),
      supabase.from('reminders').select('id,status,priority,due_date'),
    ])

    const today = new Date().toISOString().slice(0, 10)

    res.json({
      totalVehicles:              vehicles?.length ?? 0,
      availableVehicles:          vehicles?.filter(v => ['listed','available','repair'].includes(v.status)).length ?? 0,
      totalCustomers:             customers?.length ?? 0,
      overdueCustomers:           customers?.filter(c => c.status === 'overdue').length ?? 0,
      totalOutstanding:           finance?.reduce((s, f) => s + (f.outstanding_amount || 0), 0) ?? 0,
      overduePayments:            payments?.filter(p => p.status === 'overdue').length ?? 0,
      paymentsToday:              payments?.filter(p => p.due_date === today).length ?? 0,
      rtoTasksPending:            rto?.filter(r => !['completed','cancelled'].includes(r.status)).length ?? 0,
      rtoTasksCritical:           rto?.filter(r => r.priority === 'critical' && r.status !== 'completed').length ?? 0,
      remindersToday:             reminders?.filter(r => r.status === 'due_today').length ?? 0,
      remindersOverdue:           reminders?.filter(r => r.status === 'overdue').length ?? 0,
      totalCollectedThisMonth:    payments?.filter(p => p.status === 'paid' && p.due_date?.startsWith(today.slice(0,7))).reduce((s, p) => s + (p.paid_amount || 0), 0) ?? 0,
    })
  } catch (err) { next(err) }
})

// Monthly chart data
router.get('/chart', auth, async (req, res, next) => {
  try {
    const { data: txns } = await supabase.from('transactions')
      .select('date,type,amount').gte('date', new Date(Date.now() - 180*86400000).toISOString().slice(0,10))

    const months = {}
    txns?.forEach(t => {
      const m = t.date?.slice(0, 7)
      if (!m) return
      if (!months[m]) months[m] = { period: m, sales: 0, purchases: 0, collections: 0, expenses: 0, profit: 0 }
      if (t.type === 'vehicle_sale')      months[m].sales      += t.amount
      if (t.type === 'vehicle_purchase')  months[m].purchases  += t.amount
      if (t.type === 'customer_payment')  months[m].collections += t.amount
      if (t.type === 'expense')           months[m].expenses   += t.amount
    })

    const chart = Object.values(months).sort((a, b) => a.period.localeCompare(b.period))
    chart.forEach(m => { m.profit = m.sales - m.purchases - m.expenses })

    res.json(chart)
  } catch (err) { next(err) }
})

module.exports = router
