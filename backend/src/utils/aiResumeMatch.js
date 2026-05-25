const MAX_KEYWORDS = 20

function sanitizeResumeMatch(raw) {
  if (!raw || typeof raw !== 'object') {
    return { matchScore: 0, missingKeywords: [] }
  }

  let score = Number(raw.matchScore)
  if (Number.isNaN(score)) score = 0
  score = Math.min(100, Math.max(0, Math.round(score)))

  const missingKeywords = Array.isArray(raw.missingKeywords)
    ? raw.missingKeywords
        .map((k) => String(k).trim())
        .filter(Boolean)
        .slice(0, MAX_KEYWORDS)
    : []

  return { matchScore: score, missingKeywords }
}

function hasResumeMatchContent(match) {
  return match.matchScore > 0 || match.missingKeywords.length > 0
}

module.exports = { sanitizeResumeMatch, hasResumeMatchContent }
