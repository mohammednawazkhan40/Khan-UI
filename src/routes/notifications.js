const router = require('express').Router()
const auth   = require('../middleware/auth')
const { supabase } = require('../db/supabase')

router.get('/', auth, async (req, res, next) => {
  try {
    const { data, error } = await supabase.from('notifications')
      .select('*').order('created_at', { ascending: false }).limit(50)
    if (error) return res.status(400).json({ error: error.message })
    res.json({ data, unreadCount: data.filter(n => !n.read).length })
  } catch (err) { next(err) }
})

router.patch('/:id/read', auth, async (req, res, next) => {
  try {
    const { error } = await supabase.from('notifications').update({ read: true }).eq('id', req.params.id)
    if (error) return res.status(400).json({ error: error.message })
    res.json({ success: true })
  } catch (err) { next(err) }
})

router.patch('/mark-all-read', auth, async (req, res, next) => {
  try {
    const { error } = await supabase.from('notifications').update({ read: true }).eq('read', false)
    if (error) return res.status(400).json({ error: error.message })
    res.json({ success: true })
  } catch (err) { next(err) }
})

module.exports = router
