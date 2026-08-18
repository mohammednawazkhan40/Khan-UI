const router = require('express').Router()
const auth   = require('../middleware/auth')
const { supabase } = require('../db/supabase')

const TABLE = 'finance_accounts'

router.get('/', auth, async (req, res, next) => {
  try {
    const { status } = req.query
    let q = supabase.from(TABLE).select('*').order('created_at', { ascending: false })
    if (status && status !== 'all') q = q.eq('status', status)
    const { data, error } = await q
    if (error) return res.status(400).json({ error: error.message })

    // Summary stats
    const totalOutstanding  = data.reduce((s, f) => s + (f.outstanding_amount || 0), 0)
    const totalCollected    = data.reduce((s, f) => s + (f.total_paid || 0), 0)
    const overdueCount      = data.filter(f => f.status === 'overdue').length
    const commissionPending = data.filter(f => !f.commission_received)
      .reduce((s, f) => s + (f.commission_amount || 0), 0)

    res.json({ data, summary: { totalOutstanding, totalCollected, overdueCount, commissionPending } })
  } catch (err) { next(err) }
})

router.get('/:id', auth, async (req, res, next) => {
  try {
    const { data, error } = await supabase.from(TABLE).select('*').eq('id', req.params.id).single()
    if (error) return res.status(404).json({ error: 'Finance record not found' })
    res.json(data)
  } catch (err) { next(err) }
})

router.post('/', auth, async (req, res, next) => {
  try {
    const { count } = await supabase.from(TABLE).select('*', { count: 'exact', head: true })
    const financeId = `KHN-F${String((count || 0) + 1).padStart(3, '0')}`
    const body = {
      ...req.body,
      finance_id: financeId,
      outstanding_amount: req.body.loan_amount,
      remaining_installments: req.body.total_installments,
    }
    const { data, error } = await supabase.from(TABLE).insert(body).select().single()
    if (error) return res.status(400).json({ error: error.message })
    res.status(201).json(data)
  } catch (err) { next(err) }
})

router.put('/:id', auth, async (req, res, next) => {
  try {
    const { data, error } = await supabase.from(TABLE)
      .update(req.body).eq('id', req.params.id).select().single()
    if (error) return res.status(400).json({ error: error.message })
    res.json(data)
  } catch (err) { next(err) }
})

// POST /api/finance/:id/record-payment — record an EMI payment
router.post('/:id/record-payment', auth, async (req, res, next) => {
  try {
    const { amount, method, reference, date } = req.body
    const { data: finance, error: fetchErr } = await supabase
      .from(TABLE).select('*').eq('id', req.params.id).single()
    if (fetchErr) return res.status(404).json({ error: 'Finance record not found' })

    const newPaid      = (finance.paid_installments || 0) + 1
    const newTotalPaid = (finance.total_paid || 0) + amount
    const newOutstanding = Math.max(0, (finance.outstanding_amount || 0) - amount)
    const newRemaining = Math.max(0, (finance.remaining_installments || 0) - 1)
    const newStatus    = newRemaining === 0 ? 'completed' : 'active'

    const { data, error } = await supabase.from(TABLE).update({
      paid_installments: newPaid,
      total_paid: newTotalPaid,
      outstanding_amount: newOutstanding,
      remaining_installments: newRemaining,
      last_payment_date: date || new Date().toISOString().slice(0, 10),
      last_payment_amount: amount,
      status: newStatus,
    }).eq('id', req.params.id).select().single()

    if (error) return res.status(400).json({ error: error.message })

    // Log transaction
    const { count } = await supabase.from('transactions').select('*', { count: 'exact', head: true })
    await supabase.from('transactions').insert({
      transaction_id: `KHN-TXN-${String((count || 0) + 1).padStart(3, '0')}`,
      date: date || new Date().toISOString().slice(0, 10),
      type: 'customer_payment',
      amount,
      method: method || 'cash',
      status: 'completed',
      customer_id: finance.customer_id,
      customer_name: finance.customer_name,
      finance_id: req.params.id,
      reference_number: reference,
      description: `EMI payment — ${finance.customer_name} (${finance.finance_company})`,
    })

    res.json({ finance: data, message: 'Payment recorded successfully' })
  } catch (err) { next(err) }
})

module.exports = router
