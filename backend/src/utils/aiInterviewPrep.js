function asQuestionList(value) {
  if (!Array.isArray(value)) return []
  return value.map((q) => String(q).trim()).filter(Boolean).slice(0, 12)
}

function sanitizeInterviewPrep(raw) {
  if (!raw || typeof raw !== 'object') {
    return { interviewQuestions: [], followUpEmail: '' }
  }

  return {
    interviewQuestions: asQuestionList(raw.interviewQuestions),
    followUpEmail: String(raw.followUpEmail || '').trim(),
  }
}

function hasInterviewPrepContent(prep) {
  return prep.interviewQuestions.length > 0 && prep.followUpEmail.length > 0
}

module.exports = {
  sanitizeInterviewPrep,
  hasInterviewPrepContent,
}
