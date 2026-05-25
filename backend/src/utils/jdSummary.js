const EMPTY_JD_SUMMARY = {
  summary: '',
  responsibilities: [],
  requirements: [],
  skills: [],
  experienceLevel: '',
  location: '',
  compensation: '',
  benefits: [],
}

function asStringArray(value) {
  if (!Array.isArray(value)) return []
  return value.map((item) => String(item).trim()).filter(Boolean)
}

function sanitizeJdSummary(raw) {
  if (!raw || typeof raw !== 'object') return { ...EMPTY_JD_SUMMARY }

  return {
    summary: String(raw.summary || '').trim(),
    responsibilities: asStringArray(raw.responsibilities),
    requirements: asStringArray(raw.requirements),
    skills: asStringArray(raw.skills),
    experienceLevel: String(raw.experienceLevel || '').trim(),
    location: String(raw.location || '').trim(),
    compensation: String(raw.compensation || '').trim(),
    benefits: asStringArray(raw.benefits),
  }
}

function formatJdSummaryAsText(jdSummary) {
  const s = sanitizeJdSummary(jdSummary)
  const lines = []

  if (s.summary) {
    lines.push('SUMMARY', s.summary, '')
  }
  if (s.experienceLevel) {
    lines.push('EXPERIENCE LEVEL', s.experienceLevel, '')
  }
  if (s.location) {
    lines.push('LOCATION', s.location, '')
  }
  if (s.compensation) {
    lines.push('COMPENSATION', s.compensation, '')
  }
  if (s.responsibilities.length) {
    lines.push('KEY RESPONSIBILITIES', ...s.responsibilities.map((item) => `• ${item}`), '')
  }
  if (s.requirements.length) {
    lines.push('REQUIREMENTS', ...s.requirements.map((item) => `• ${item}`), '')
  }
  if (s.skills.length) {
    lines.push('SKILLS', ...s.skills.map((item) => `• ${item}`), '')
  }
  if (s.benefits.length) {
    lines.push('BENEFITS', ...s.benefits.map((item) => `• ${item}`), '')
  }

  return lines.join('\n').trim()
}

function hasJdSummaryContent(jdSummary) {
  const s = sanitizeJdSummary(jdSummary)
  return Boolean(
    s.summary ||
      s.experienceLevel ||
      s.location ||
      s.compensation ||
      s.responsibilities.length ||
      s.requirements.length ||
      s.skills.length ||
      s.benefits.length
  )
}

module.exports = {
  EMPTY_JD_SUMMARY,
  sanitizeJdSummary,
  formatJdSummaryAsText,
  hasJdSummaryContent,
}
