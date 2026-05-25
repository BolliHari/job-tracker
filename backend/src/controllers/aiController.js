const {
  summarizeJobDescription,
  generateInterviewPrep,
  generateResumeMatch,
} = require('../services/geminiService')
const { getHttpStatusForGeminiError } = require('../utils/geminiErrors')

const MIN_JD_LENGTH = 50
const MIN_RESUME_LENGTH = 100

function handleAiError(res, error, fallbackMessage) {
  const message = error.message || fallbackMessage
  return res.status(getHttpStatusForGeminiError(message)).json({ message })
}

const summarizeJD = async (req, res) => {
  try {
    const { jobDescription } = req.body
    const text = String(jobDescription || '').trim()

    if (text.length < MIN_JD_LENGTH) {
      return res.status(400).json({
        message: `Paste at least ${MIN_JD_LENGTH} characters of job description text first.`,
      })
    }

    const result = await summarizeJobDescription(text)
    return res.status(200).json(result)
  } catch (error) {
    return handleAiError(res, error, 'Failed to summarize job description')
  }
}

const interviewPrep = async (req, res) => {
  try {
    const { jobDescription, role, company, jdSummary } = req.body
    const text = String(jobDescription || '').trim()
    const jobRole = String(role || '').trim()
    const jobCompany = String(company || '').trim()

    if (text.length < MIN_JD_LENGTH) {
      return res.status(400).json({
        message: `Add a job description with at least ${MIN_JD_LENGTH} characters first (edit job or use AI summarize).`,
      })
    }
    if (!jobRole || !jobCompany) {
      return res.status(400).json({ message: 'Job role and company are required.' })
    }

    const result = await generateInterviewPrep({
      role: jobRole,
      company: jobCompany,
      jobDescription: text,
      jdSummary: jdSummary || null,
    })
    return res.status(200).json(result)
  } catch (error) {
    return handleAiError(res, error, 'Failed to generate interview prep')
  }
}

const resumeMatch = async (req, res) => {
  try {
    const { jobDescription, resumeText, role, company, jdSummary } = req.body
    const jd = String(jobDescription || '').trim()
    const resume = String(resumeText || '').trim()
    const jobRole = String(role || '').trim()
    const jobCompany = String(company || '').trim()

    if (jd.length < MIN_JD_LENGTH) {
      return res.status(400).json({
        message: `Add a job description with at least ${MIN_JD_LENGTH} characters first.`,
      })
    }
    if (resume.length < MIN_RESUME_LENGTH) {
      return res.status(400).json({
        message: `Paste your resume text (at least ${MIN_RESUME_LENGTH} characters) in Edit job to run match analysis.`,
      })
    }
    if (!jobRole || !jobCompany) {
      return res.status(400).json({ message: 'Job role and company are required.' })
    }

    const result = await generateResumeMatch({
      role: jobRole,
      company: jobCompany,
      jobDescription: jd,
      resumeText: resume,
      jdSummary: jdSummary || null,
    })
    return res.status(200).json(result)
  } catch (error) {
    return handleAiError(res, error, 'Failed to analyze resume match')
  }
}

module.exports = { summarizeJD, interviewPrep, resumeMatch }
