const router = require('express').Router()
const auth   = require('../middleware/auth')
const { supabase } = require('../db/supabase')

router.get('/', auth, async (req, res, next) => {
  try {
    const { status } = req.query
    let q = supabase.from('payments').select('*').order('due_date', { ascending: true })
    if (status && status !== 'all') q = q.eq('status', status)
    const { data, error } = await q
    if (error) return res.status(400).json({ error: error.message })
    res.json({ data })
  } catch (err) { next(err) }
})

router.post('/', auth, async (req, res, next) => {
  try {
    const { count } = await supabase.from('payments').select('*', { count: 'exact', head: true })
    const paymentId = `KHN-PAY-${String((count || 0) + 1).padStart(3, '0')}`
    const { data, error } = await supabase.from('payments')
      .insert({ ...req.body, payment_id: paymentId }).select().single()
    if (error) return res.status(400).json({ error: error.message })
    res.status(201).json(data)
  } catch (err) { next(err) }
})

router.put('/:id', auth, async (req, res, next) => {
  try {
    const { data, error } = await supabase.from('payments')
      .update(req.body).eq('id', req.params.id).select().single()
    if (error) return res.status(400).json({ error: error.message })
    res.json(data)
  } catch (err) { next(err) }
})

module.exports = router
