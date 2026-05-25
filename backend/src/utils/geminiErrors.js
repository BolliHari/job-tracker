function getErrorMessage(error) {
  return String(error?.message || '')
}

function isQuotaOrRateLimitError(error) {
  const message = getErrorMessage(error)
  return (
    message.includes('429') ||
    message.includes('Too Many Requests') ||
    message.includes('quota') ||
    message.includes('Quota exceeded') ||
    message.includes('rate limit')
  )
}

function isModelNotFoundError(error) {
  const message = getErrorMessage(error)
  return (
    message.includes('404') ||
    message.includes('not found') ||
    message.includes('is not supported')
  )
}

function isRetryableError(error) {
  return isQuotaOrRateLimitError(error) || isModelNotFoundError(error)
}

function toUserFacingGeminiError(error) {
  const message = getErrorMessage(error)

  if (isQuotaOrRateLimitError(error)) {
    const retryMatch = message.match(/retry in ([\d.]+)s/i)
    const waitHint = retryMatch
      ? ` Try again in about ${Math.ceil(Number(retryMatch[1]))} seconds.`
      : ''
    return new Error(
      `Gemini quota exceeded.${waitHint} Use GEMINI_MODEL=gemini-2.0-flash-lite in backend/.env, wait a minute, or enable billing in Google AI Studio.`
    )
  }

  if (isModelNotFoundError(error)) {
    return new Error(
      'Gemini model not available for your API key. Set GEMINI_MODEL=gemini-2.0-flash-lite in backend/.env and restart the server.'
    )
  }

  return error
}

function getHttpStatusForGeminiError(message) {
  if (message.includes('API key')) return 503
  if (message.includes('quota') || message.includes('429')) return 429
  if (message.includes('not available') || message.includes('not found')) return 400
  if (message.includes('at least')) return 400
  return 500
}

module.exports = {
  isRetryableError,
  toUserFacingGeminiError,
  getHttpStatusForGeminiError,
}
