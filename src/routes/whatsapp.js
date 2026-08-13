const router = require('express').Router()
const auth   = require('../middleware/auth')
const { sendWhatsApp, sendFollowUpReminder, sendPaymentReminder } = require('../services/whatsapp')
const { supabase } = require('../db/supabase')

// POST /api/whatsapp/send — send a custom message
router.post('/send', auth, async (req, res, next) => {
  try {
    const { to, toName, message, relatedType, relatedId } = req.body
    if (!to || !message) return res.status(400).json({ error: 'to and message required' })

    const result = await sendWhatsApp(to, message)

    // Log to DB
    await supabase.from('whatsapp_messages').insert({
      to_number: to, to_name: toName, message,
      status: result.success ? 'sent' : 'failed',
      twilio_sid: result.sid,
      related_type: relatedType, related_id: relatedId,
      sent_by: req.user?.name || 'Nawaz Khan',
      sent_at: new Date().toISOString(),
    })

    res.json(result)
  } catch (err) { next(err) }
})

// POST /api/whatsapp/payment-reminder — send payment reminder
router.post('/payment-reminder', auth, async (req, res, next) => {
  try {
    const { customerId, amount, dueDate, financeCompany } = req.body
    const { data: customer } = await supabase.from('customers')
      .select('*').eq('id', customerId).single()
    if (!customer) return res.status(404).json({ error: 'Customer not found' })

    const phone = customer.whatsapp || customer.phone
    const result = await sendPaymentReminder(phone, customer.full_name, amount, dueDate, financeCompany)

    await supabase.from('whatsapp_messages').insert({
      to_number: phone, to_name: customer.full_name,
      message: result.message, status: result.success ? 'sent' : 'failed',
      twilio_sid: result.sid, related_type: 'customer', related_id: customerId,
      sent_by: 'Finance Agent', sent_at: new Date().toISOString(),
    })

    // Update customer last contact
    await supabase.from('customers').update({ last_contact_date: new Date().toISOString().slice(0, 10) })
      .eq('id', customerId)

    res.json({ ...result, customerName: customer.full_name })
  } catch (err) { next(err) }
})

// POST /api/whatsapp/follow-up — send follow-up message
router.post('/follow-up', auth, async (req, res, next) => {
  try {
    const { customerId, type, notes } = req.body
    const { data: customer } = await supabase.from('customers')
      .select('*').eq('id', customerId).single()
    if (!customer) return res.status(404).json({ error: 'Customer not found' })

    const phone = customer.whatsapp || customer.phone
    const result = await sendFollowUpReminder(phone, customer.full_name, type, notes)

    await supabase.from('whatsapp_messages').insert({
      to_number: phone, to_name: customer.full_name,
      message: result.message, status: result.success ? 'sent' : 'failed',
      twilio_sid: result.sid, related_type: 'customer', related_id: customerId,
      sent_by: req.user?.name || 'Customer Agent', sent_at: new Date().toISOString(),
    })

    await supabase.from('customers').update({ last_contact_date: new Date().toISOString().slice(0, 10) })
      .eq('id', customerId)

    res.json({ ...result, customerName: customer.full_name })
  } catch (err) { next(err) }
})

// GET /api/whatsapp/history — message history
router.get('/history', auth, async (req, res, next) => {
  try {
    const { data, error } = await supabase.from('whatsapp_messages')
      .select('*').order('created_at', { ascending: false }).limit(100)
    if (error) return res.status(400).json({ error: error.message })
    res.json({ data })
  } catch (err) { next(err) }
})

module.exports = router
