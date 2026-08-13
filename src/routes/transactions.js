const router = require('express').Router()
const auth   = require('../middleware/auth')
const { supabase } = require('../db/supabase')

router.get('/', auth, async (req, res, next) => {
  try {
    const { type, from, to, limit = 50 } = req.query
    let q = supabase.from('transactions').select('*').order('date', { ascending: false }).limit(Number(limit))
    if (type) q = q.eq('type', type)
    if (from) q = q.gte('date', from)
    if (to)   q = q.lte('date', to)
    const { data, error } = await q
    if (error) return res.status(400).json({ error: error.message })
    res.json({ data })
  } catch (err) { next(err) }
})

router.post('/', auth, async (req, res, next) => {
  try {
    const { count } = await supabase.from('transactions').select('*', { count: 'exact', head: true })
    const txnId = `KHN-TXN-${String((count || 0) + 1).padStart(3, '0')}`
    const { data, error } = await supabase.from('transactions')
      .insert({ ...req.body, transaction_id: txnId, created_by: req.user?.name || 'Nawaz Khan' }).select().single()
    if (error) return res.status(400).json({ error: error.message })
    res.status(201).json(data)
  } catch (err) { next(err) }
})

module.exports = router
