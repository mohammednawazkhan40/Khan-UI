const router = require('express').Router()
const auth   = require('../middleware/auth')
const { runAgent, chatWithAgent, getAgentStatus } = require('../services/groq')

// POST /api/ai/run/:agentId — run a full agent analysis
router.post('/run/:agentId', auth, async (req, res, next) => {
  try {
    const result = await runAgent(req.params.agentId)
    res.json(result)
  } catch (err) { next(err) }
})

// POST /api/ai/chat/:agentId — chat with an agent
router.post('/chat/:agentId', auth, async (req, res, next) => {
  try {
    const { message, history = [] } = req.body
    if (!message) return res.status(400).json({ error: 'message required' })
    const reply = await chatWithAgent(req.params.agentId, message, history)
    res.json(reply)
  } catch (err) { next(err) }
})

// GET /api/ai/status — all agents status
router.get('/status', auth, async (req, res, next) => {
  try {
    const status = await getAgentStatus()
    res.json(status)
  } catch (err) { next(err) }
})

module.exports = router
