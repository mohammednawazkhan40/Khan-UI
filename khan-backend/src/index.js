require('dotenv').config()
const express = require('express')
const path = require('path')
const cors = require('cors')
const helmet = require('helmet')
const morgan = require('morgan')
const rateLimit = require('express-rate-limit')

const app = express()
const PORT = process.env.PORT || 8000

// ── Security & Middleware ─────────────────────────────────────────────────────
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
}))
app.use(morgan('combined'))
app.use(cors({
  origin: [
    process.env.FRONTEND_URL,
    'http://localhost:3000',
    'http://localhost:8000',
    'https://khan-ui.vercel.app',
    'https://mohammednawazkhan40.github.io',
  ],
  credentials: true,
}))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// ── Rate Limiting ─────────────────────────────────────────────────────────────
app.use('/api/', rateLimit({ windowMs: 15 * 60 * 1000, max: 300 }))
app.use('/api/ai/', rateLimit({ windowMs: 60 * 1000, max: 20 }))

// ── Health Check ──────────────────────────────────────────────────────────────
app.get('/', (req, res) => res.json({
  status: 'ok',
  app: 'Khan Interface API',
  business: 'KM Car Deals',
  owner: 'Nawaz Khan',
  version: '1.0.0',
  admin: `http://localhost:${PORT}/admin`,
  timestamp: new Date().toISOString(),
}))

// ── Admin Portal (standalone HTML) ───────────────────────────────────────────
app.use('/admin', express.static(path.join(__dirname, '..', 'public')))
app.get('/admin', (req, res) => res.sendFile(path.join(__dirname, '..', 'public', 'admin.html')))

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/auth',         require('./routes/auth'))
app.use('/api/customers',    require('./routes/customers'))
app.use('/api/vehicles',     require('./routes/vehicles'))
app.use('/api/finance',      require('./routes/finance'))
app.use('/api/payments',     require('./routes/payments'))
app.use('/api/transactions', require('./routes/transactions'))
app.use('/api/rto',          require('./routes/rto'))
app.use('/api/reminders',    require('./routes/reminders'))
app.use('/api/notifications',require('./routes/notifications'))
app.use('/api/dashboard',    require('./routes/dashboard'))
app.use('/api/ai',           require('./routes/ai'))
app.use('/api/whatsapp',     require('./routes/whatsapp'))

// ── Error Handler ─────────────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  })
})

app.use((req, res) => res.status(404).json({ error: 'Route not found' }))

// ── Seed Data ────────────────────────────────────────────────────────────────
const seed = require('./db/seed')

// ── Start ─────────────────────────────────────────────────────────────────────
app.listen(PORT, async () => {
  console.log(`✅ Khan Interface API running on port ${PORT}`)
  console.log(`📊 Business: ${process.env.BUSINESS_NAME}`)
  console.log(`👤 Owner: ${process.env.OWNER_NAME}`)
  console.log(`🌐 Environment: ${process.env.NODE_ENV}`)
  await seed()
})

// ── Cron Jobs (only if Supabase configured) ──────────────────────────────────
if (process.env.SUPABASE_URL) {
  require('./cron/scheduler')
}

module.exports = app
