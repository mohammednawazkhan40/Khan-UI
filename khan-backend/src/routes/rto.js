const router = require('express').Router()
const auth   = require('../middleware/auth')
const { supabase } = require('../db/supabase')

router.get('/', auth, async (req, res, next) => {
  try {
    const { status, priority } = req.query
    let q = supabase.from('rto_tasks').select('*').order('created_at', { ascending: false })
    if (status)   q = q.eq('status', status)
    if (priority) q = q.eq('priority', priority)
    const { data, error } = await q
    if (error) return res.status(400).json({ error: error.message })
    res.json({ data })
  } catch (err) { next(err) }
})

router.get('/:id', auth, async (req, res, next) => {
  try {
    const { data, error } = await supabase.from('rto_tasks').select('*').eq('id', req.params.id).single()
    if (error) return res.status(404).json({ error: 'RTO task not found' })
    res.json(data)
  } catch (err) { next(err) }
})

router.post('/', auth, async (req, res, next) => {
  try {
    const { count } = await supabase.from('rto_tasks').select('*', { count: 'exact', head: true })
    const taskId = `KHN-RTO-${String((count || 0) + 1).padStart(3, '0')}`
    const { data, error } = await supabase.from('rto_tasks')
      .insert({ ...req.body, task_id: taskId }).select().single()
    if (error) return res.status(400).json({ error: error.message })
    res.status(201).json(data)
  } catch (err) { next(err) }
})

router.put('/:id', auth, async (req, res, next) => {
  try {
    const { data, error } = await supabase.from('rto_tasks')
      .update(req.body).eq('id', req.params.id).select().single()
    if (error) return res.status(400).json({ error: error.message })
    res.json(data)
  } catch (err) { next(err) }
})

module.exports = router
