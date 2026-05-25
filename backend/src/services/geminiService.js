const { GoogleGenerativeAI } = require('@google/generative-ai')
const {
  sanitizeJdSummary,
  formatJdSummaryAsText,
  hasJdSummaryContent,
} = require('../utils/jdSummary')
const {
  sanitizeInterviewPrep,
  hasInterviewPrepContent,
} = require('../utils/aiInterviewPrep')
const { sanitizeResumeMatch, hasResumeMatchContent } = require('../utils/aiResumeMatch')
const { isRetryableError, toUserFacingGeminiError } = require('../utils/geminiErrors')

const DEFAULT_MODEL = 'gemini-2.0-flash-lite'
const FALLBACK_MODELS = [
  'gemini-2.0-flash-lite',
  'gemini-2.0-flash',
  'gemini-2.5-flash',
]
const MAX_JD_CHARS = 8000
const MAX_RESUME_CHARS = 12000

function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey || apiKey === 'your_google_ai_key_here') {
    throw new Error('Gemini API key is not configured. Set GEMINI_API_KEY in backend/.env')
  }
  return new GoogleGenerativeAI(apiKey)
}

function getModelCandidates() {
  const preferred = process.env.GEMINI_MODEL?.trim()
  const list = preferred ? [preferred, ...FALLBACK_MODELS] : [DEFAULT_MODEL, ...FALLBACK_MODELS]
  return [...new Set(list)]
}

function extractJson(text) {
  const trimmed = text.trim()
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i)
  const candidate = fenced ? fenced[1].trim() : trimmed
  return JSON.parse(candidate)
}

async function generateJsonWithModels(prompt) {
  const genAI = getGeminiClient()
  const models = getModelCandidates()
  let lastError = null

  for (let i = 0; i < models.length; i++) {
    const modelName = models[i]
    try {
      const model = genAI.getGenerativeModel({
        model: modelName,
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.4,
        },
      })

      const result = await model.generateContent(prompt)
      const parsed = extractJson(result.response.text())
      return { parsed, modelUsed: modelName }
    } catch (error) {
      lastError = error
      const hasMoreModels = i < models.length - 1
      if (!hasMoreModels || !isRetryableError(error)) {
        throw toUserFacingGeminiError(error)
      }
    }
  }

  throw toUserFacingGeminiError(lastError || new Error('Gemini request failed'))
}

function buildSummarizePrompt(rawText) {
  return `You are a career assistant. Analyze this job posting and return ONLY valid JSON with this exact shape (no markdown):
{
  "summary": "2-3 sentence overview of the role",
  "responsibilities": ["bullet strings for main duties"],
  "requirements": ["bullet strings for qualifications"],
  "skills": ["technical and soft skills mentioned"],
  "experienceLevel": "e.g. Senior, 5+ years — or empty string if unknown",
  "location": "work location / remote policy — or empty string",
  "compensation": "salary or pay range if stated — or empty string",
  "benefits": ["benefits mentioned, or empty array"]
}

Rules:
- Use concise, professional language.
- Do not invent facts not supported by the posting.
- Use empty string or empty arrays when information is missing.
- Keep each bullet under 120 characters.

Job posting:
"""
${rawText.slice(0, MAX_JD_CHARS)}
"""`
}

function buildInterviewPrepPrompt({ role, company, jobDescription, jdSummary }) {
  const summaryBlock = jdSummary
    ? `\nStructured summary (use as context):\n${JSON.stringify(jdSummary, null, 2)}\n`
    : ''

  return `You are an expert career coach helping a candidate prepare for a job application.

Role: ${role}
Company: ${company}
${summaryBlock}
Job description:
"""
${jobDescription.slice(0, MAX_JD_CHARS)}
"""

Return ONLY valid JSON (no markdown) with this exact shape:
{
  "interviewQuestions": [
    "5 to 8 likely interview questions tailored to this role and JD"
  ],
  "followUpEmail": "A complete follow-up email template the candidate can send after applying or after no response. Use placeholders [Your Name] and [Your Phone] where needed. Include Subject: line at the top."
}

Rules for interviewQuestions:
- Mix behavioral, technical/role-specific, and situational questions.
- Reference specifics from the job description when possible.
- Each question should be one clear sentence.
- Do not repeat similar questions.

Rules for followUpEmail:
- Professional, warm, concise (under 200 words for the body).
- Mention the role title and company by name.
- Suitable for following up ~5-7 business days after applying with no reply.
- Use plain text with line breaks, not HTML.`
}

async function summarizeJobDescription(rawText) {
  const { parsed } = await generateJsonWithModels(buildSummarizePrompt(rawText))
  const jdSummary = sanitizeJdSummary(parsed)

  if (!hasJdSummaryContent(jdSummary)) {
    throw new Error('Could not extract a structured summary from this text')
  }

  return {
    jdSummary,
    formattedDescription: formatJdSummaryAsText(jdSummary),
  }
}

async function generateInterviewPrep({ role, company, jobDescription, jdSummary }) {
  const { parsed } = await generateJsonWithModels(
    buildInterviewPrepPrompt({ role, company, jobDescription, jdSummary })
  )
  const prep = sanitizeInterviewPrep(parsed)

  if (!hasInterviewPrepContent(prep)) {
    throw new Error('Could not generate interview questions and follow-up email from this job description')
  }

  return prep
}

function buildResumeMatchPrompt({ role, company, jobDescription, resumeText, jdSummary }) {
  const summaryBlock = jdSummary
    ? `\nStructured job summary:\n${JSON.stringify(jdSummary, null, 2)}\n`
    : ''

  return `You are an ATS and hiring expert. Compare the candidate's resume to the job description.

Role: ${role}
Company: ${company}
${summaryBlock}
Job description:
"""
${jobDescription.slice(0, MAX_JD_CHARS)}
"""

Candidate resume:
"""
${resumeText.slice(0, MAX_RESUME_CHARS)}
"""

Return ONLY valid JSON (no markdown):
{
  "matchScore": 0-100 integer for overall fit (skills, experience, keywords),
  "missingKeywords": ["important skills, tools, or terms from the JD that are weak or absent on the resume — max 15 items, short phrases"]
}

Rules:
- Base the score only on evidence in the resume vs the JD.
- missingKeywords should be specific (e.g. "Kubernetes", "GraphQL", "5+ years React") not vague.
- Prioritize hard skills and requirements from the JD.
- If the resume is a poor match, score below 40; strong match above 75.
- Do not invent resume content.`
}

async function generateResumeMatch({ role, company, jobDescription, resumeText, jdSummary }) {
  const { parsed } = await generateJsonWithModels(
    buildResumeMatchPrompt({ role, company, jobDescription, resumeText, jdSummary })
  )
  const match = sanitizeResumeMatch(parsed)

  if (!hasResumeMatchContent(match)) {
    throw new Error('Could not analyze resume match for this job')
  }

  return match
}

module.exports = { summarizeJobDescription, generateInterviewPrep, generateResumeMatch }
