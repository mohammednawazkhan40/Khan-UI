const router = require('express').Router()
const auth   = require('../middleware/auth')
const { supabase } = require('../db/supabase')

const TABLE = 'vehicles'

router.get('/', auth, async (req, res, next) => {
  try {
    const { status, search } = req.query
    let q = supabase.from(TABLE).select('*').order('created_at', { ascending: false })
    if (status && status !== 'all') q = q.eq('status', status)
    if (search) q = q.or(`registration_number.ilike.%${search}%,brand.ilike.%${search}%,model.ilike.%${search}%`)
    const { data, error } = await q
    if (error) return res.status(400).json({ error: error.message })
    res.json({ data })
  } catch (err) { next(err) }
})

router.get('/:id', auth, async (req, res, next) => {
  try {
    const { data, error } = await supabase.from(TABLE).select('*').eq('id', req.params.id).single()
    if (error) return res.status(404).json({ error: 'Vehicle not found' })
    res.json(data)
  } catch (err) { next(err) }
})

router.post('/', auth, async (req, res, next) => {
  try {
    const { count } = await supabase.from(TABLE).select('*', { count: 'exact', head: true })
    const vehicleId = `KHN-V${String((count || 0) + 1).padStart(3, '0')}`
    const { data, error } = await supabase.from(TABLE)
      .insert({ ...req.body, vehicle_id: vehicleId }).select().single()
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

router.delete('/:id', auth, async (req, res, next) => {
  try {
    const { error } = await supabase.from(TABLE).delete().eq('id', req.params.id)
    if (error) return res.status(400).json({ error: error.message })
    res.json({ success: true })
  } catch (err) { next(err) }
})

module.exports = router
