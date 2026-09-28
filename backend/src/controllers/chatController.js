const { answerQuestion } = require('../services/ragService')
const { toUserFacingGeminiError, getHttpStatusForGeminiError } = require('../utils/geminiErrors')

const WINDOW_MS = 60 * 1000
const MAX_REQUESTS = 20
const hits = new Map()

function allowRequest(ip) {
  const now = Date.now()
  const recent = (hits.get(ip) || []).filter((time) => now - time < WINDOW_MS)
  if (recent.length >= MAX_REQUESTS) {
    hits.set(ip, recent)
    return false
  }
  recent.push(now)
  hits.set(ip, recent)
  return true
}

function cleanHistory(history) {
  if (!Array.isArray(history)) return []
  return history
    .filter((turn) => turn && (turn.role === 'user' || turn.role === 'assistant'))
    .slice(-6)
    .map((turn) => ({
      role: turn.role,
      content: String(turn.content || '').trim().slice(0, 1000),
    }))
    .filter((turn) => turn.content)
}

const chat = async (req, res) => {
  const ip = req.ip || req.socket?.remoteAddress || 'unknown'
  if (!allowRequest(ip)) {
    return res.status(429).json({ message: 'Too many questions. Wait a minute and try again.' })
  }

  const question = String(req.body?.question || '').trim()
  if (!question) {
    return res.status(400).json({ message: 'Question is required.' })
  }
  if (question.length > 1000) {
    return res.status(400).json({ message: 'Question is too long.' })
  }

  try {
    const answer = await answerQuestion(question, cleanHistory(req.body?.history))
    return res.status(200).json({ answer })
  } catch (error) {
    const friendly = toUserFacingGeminiError(error)
    const message = friendly.message || 'The guide could not answer just now.'
    return res.status(getHttpStatusForGeminiError(message)).json({ message })
  }
}

module.exports = { chat }
