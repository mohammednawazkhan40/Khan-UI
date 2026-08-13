/**
 * WHATSAPP SERVICE — Khan Interface
 * Uses Twilio WhatsApp API
 * Free sandbox: https://www.twilio.com/console/sms/whatsapp/sandbox
 * Production: WhatsApp Business API via Twilio
 */
const twilio = require('twilio')

const BUSINESS = process.env.BUSINESS_NAME || 'KM Car Deals'
const OWNER    = process.env.OWNER_NAME    || 'Nawaz Khan'

function getClient() {
  if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
    return null
  }
  return twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
}

// ── Format phone number ────────────────────────────────────────────────────
function formatPhone(phone) {
  const cleaned = phone.replace(/\D/g, '')
  if (cleaned.startsWith('91') && cleaned.length === 12) return `+${cleaned}`
  if (cleaned.length === 10) return `+91${cleaned}`
  return `+${cleaned}`
}

// ── Send WhatsApp message ──────────────────────────────────────────────────
async function sendWhatsApp(to, message) {
  const client = getClient()

  if (!client) {
    console.log(`[WhatsApp MOCK] To: ${to}\nMessage: ${message}`)
    return { success: true, sid: `MOCK_${Date.now()}`, message, mock: true }
  }

  try {
    const toFormatted   = `whatsapp:${formatPhone(to)}`
    const fromFormatted = process.env.TWILIO_WHATSAPP_FROM

    const result = await client.messages.create({
      body: message, from: fromFormatted, to: toFormatted,
    })

    return { success: true, sid: result.sid, status: result.status, message }
  } catch (err) {
    console.error('WhatsApp send error:', err.message)
    return { success: false, error: err.message, message }
  }
}

// ── Payment Reminder ───────────────────────────────────────────────────────
async function sendPaymentReminder(phone, customerName, amount, dueDate, financeCompany) {
  const msg = `Hello ${customerName},

This is a reminder from *${BUSINESS}* (${OWNER}).

Your EMI payment is due:
💰 Amount: ₹${Number(amount).toLocaleString('en-IN')}
📅 Due Date: ${dueDate}
🏦 Finance: ${financeCompany}

Please ensure timely payment to avoid late charges.

For assistance, contact us anytime.

Thank you,
${OWNER}
${BUSINESS}`

  return { ...(await sendWhatsApp(phone, msg)), message: msg }
}

// ── Follow-Up Reminder ─────────────────────────────────────────────────────
async function sendFollowUpReminder(phone, customerName, type, notes) {
  const typeMessages = {
    payment_followup: `regarding your pending payment`,
    delivery_update:  `regarding your vehicle delivery`,
    document_request: `regarding pending documents`,
    general:          `for a quick update`,
  }

  const msg = `Hello ${customerName},

${OWNER} from *${BUSINESS}* is reaching out ${typeMessages[type] || 'for a follow-up'}.

${notes ? `Note: ${notes}` : ''}

Please get in touch at your earliest convenience.

Thank you,
${OWNER}
${BUSINESS}`

  return { ...(await sendWhatsApp(phone, msg)), message: msg }
}

// ── RTO Alert ─────────────────────────────────────────────────────────────
async function sendRTOAlert(phone, customerName, vehicleReg, taskDescription, deadline) {
  const msg = `Hello ${customerName},

Important update from *${BUSINESS}*:

🚗 Vehicle: ${vehicleReg}
📋 Task: ${taskDescription}
⏰ Deadline: ${deadline}

Action required from your side. Please contact us immediately.

${OWNER}
${BUSINESS}`

  return { ...(await sendWhatsApp(phone, msg)), message: msg }
}

module.exports = { sendWhatsApp, sendPaymentReminder, sendFollowUpReminder, sendRTOAlert }
