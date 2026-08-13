const router = require('express').Router()
const auth   = require('../middleware/auth')
const { supabase } = require('../db/supabase')

const TABLE = 'customers'

// GET /api/customers
router.get('/', auth, async (req, res, next) => {
  try {
    const { status, search, limit = 50, offset = 0 } = req.query
    let query = supabase.from(TABLE).select('*').order('created_at', { ascending: false })
    if (status && status !== 'all') query = query.eq('status', status)
    if (search) query = query.or(`full_name.ilike.%${search}%,phone.ilike.%${search}%,vehicle_registration.ilike.%${search}%`)
    query = query.range(Number(offset), Number(offset) + Number(limit) - 1)
    const { data, error, count } = await query
    if (error) return res.status(400).json({ error: error.message })
    res.json({ data, count })
  } catch (err) { next(err) }
})

// GET /api/customers/:id
router.get('/:id', auth, async (req, res, next) => {
  try {
    const { data, error } = await supabase.from(TABLE).select('*').eq('id', req.params.id).single()
    if (error) return res.status(404).json({ error: 'Customer not found' })
    res.json(data)
  } catch (err) { next(err) }
})

// POST /api/customers
router.post('/', auth, async (req, res, next) => {
  try {
    // Auto-generate customer_id
    const { count } = await supabase.from(TABLE).select('*', { count: 'exact', head: true })
    const customerId = `KHN-C${String((count || 0) + 1).padStart(3, '0')}`
    const { data, error } = await supabase.from(TABLE)
      .insert({ ...req.body, customer_id: customerId }).select().single()
    if (error) return res.status(400).json({ error: error.message })
    // Create notification
    await supabase.from('notifications').insert({
      title: `New Customer Added`,
      message: `${data.full_name} has been added to KM Car Deals.`,
      type: 'general', priority: 'low',
    })
    res.status(201).json(data)
  } catch (err) { next(err) }
})

// PUT /api/customers/:id
router.put('/:id', auth, async (req, res, next) => {
  try {
    const { data, error } = await supabase.from(TABLE)
      .update(req.body).eq('id', req.params.id).select().single()
    if (error) return res.status(400).json({ error: error.message })
    res.json(data)
  } catch (err) { next(err) }
})

// DELETE /api/customers/:id
router.delete('/:id', auth, async (req, res, next) => {
  try {
    const { error } = await supabase.from(TABLE).delete().eq('id', req.params.id)
    if (error) return res.status(400).json({ error: error.message })
    res.json({ success: true })
  } catch (err) { next(err) }
})

// GET /api/customers/overdue
router.get('/status/overdue', auth, async (req, res, next) => {
  try {
    const { data, error } = await supabase.from(TABLE)
      .select('*').eq('status', 'overdue').order('amount_pending', { ascending: false })
    if (error) return res.status(400).json({ error: error.message })
    res.json(data)
  } catch (err) { next(err) }
})

module.exports = router
