const router = require('express').Router()
const auth   = require('../middleware/auth')
const { supabase } = require('../db/supabase')

router.get('/', auth, async (req, res, next) => {
  try {
    const { status, priority } = req.query
    let q = supabase.from('reminders').select('*').order('due_date', { ascending: true })
    if (status)   q = q.eq('status', status)
    if (priority) q = q.eq('priority', priority)
    const { data, error } = await q
    if (error) return res.status(400).json({ error: error.message })
    res.json({ data })
  } catch (err) { next(err) }
})

router.post('/', auth, async (req, res, next) => {
  try {
    const { count } = await supabase.from('reminders').select('*', { count: 'exact', head: true })
    const reminderId = `KHN-REM-${String((count || 0) + 1).padStart(3, '0')}`
    const { data, error } = await supabase.from('reminders')
      .insert({ ...req.body, reminder_id: reminderId }).select().single()
    if (error) return res.status(400).json({ error: error.message })
    res.status(201).json(data)
  } catch (err) { next(err) }
})

router.put('/:id', auth, async (req, res, next) => {
  try {
    const { data, error } = await supabase.from('reminders')
      .update(req.body).eq('id', req.params.id).select().single()
    if (error) return res.status(400).json({ error: error.message })
    res.json(data)
  } catch (err) { next(err) }
})

router.patch('/:id/complete', auth, async (req, res, next) => {
  try {
    const { data, error } = await supabase.from('reminders').update({
      status: 'completed', completed_at: new Date().toISOString(),
    }).eq('id', req.params.id).select().single()
    if (error) return res.status(400).json({ error: error.message })
    res.json(data)
  } catch (err) { next(err) }
})

module.exports = router
