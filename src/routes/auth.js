const router  = require('express').Router()
const bcrypt  = require('bcryptjs')
const jwt     = require('jsonwebtoken')
const { supabase } = require('../db/supabase')

// POST /api/auth/login
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' })

    const { data: user, error } = await supabase
      .from('users').select('*').eq('email', email).single()

    if (error || !user) return res.status(401).json({ error: 'Invalid credentials' })
    if (!user.active)   return res.status(401).json({ error: 'Account disabled' })

    const valid = await bcrypt.compare(password, user.password)
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' })

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    )

    res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    })
  } catch (err) { next(err) }
})

// POST /api/auth/register (admin only)
router.post('/register', async (req, res, next) => {
  try {
    const { name, email, password, role = 'staff' } = req.body
    const hash = await bcrypt.hash(password, 10)
    const { data, error } = await supabase
      .from('users').insert({ name, email, password: hash, role }).select().single()
    if (error) return res.status(400).json({ error: error.message })
    res.status(201).json({ user: { id: data.id, name: data.name, email: data.email, role: data.role } })
  } catch (err) { next(err) }
})

module.exports = router
