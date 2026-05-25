const Job = require('../models/Job')
const { STAGES } = require('../models/Job')
const { sanitizeJdSummary, hasJdSummaryContent } = require('../utils/jdSummary')

const DEFAULT_AI_DATA = {
  matchScore: 0,
  missingKeywords: [],
  interviewQuestions: [],
  followUpEmail: '',
  jdSummary: null,
}

function mergeAiData(existing, incoming) {
  const base = {
    ...DEFAULT_AI_DATA,
    ...(existing?.toObject?.() ?? existing ?? {}),
  }
  if (!incoming || typeof incoming !== 'object') return base

  if (incoming.jdSummary !== undefined) {
    const cleaned = sanitizeJdSummary(incoming.jdSummary)
    base.jdSummary = hasJdSummaryContent(cleaned) ? cleaned : null
  }

  if (incoming.interviewQuestions !== undefined) {
    base.interviewQuestions = Array.isArray(incoming.interviewQuestions)
      ? incoming.interviewQuestions.map((q) => String(q).trim()).filter(Boolean)
      : []
  }

  if (incoming.followUpEmail !== undefined) {
    base.followUpEmail = String(incoming.followUpEmail).trim()
  }

  if (incoming.matchScore !== undefined) {
    const score = Number(incoming.matchScore)
    base.matchScore = Number.isNaN(score) ? 0 : Math.min(100, Math.max(0, Math.round(score)))
  }

  if (incoming.missingKeywords !== undefined) {
    base.missingKeywords = Array.isArray(incoming.missingKeywords)
      ? incoming.missingKeywords.map((k) => String(k).trim()).filter(Boolean)
      : []
  }

  return base
}

function formatJob(job) {
  return {
    id: job._id.toString(),
    role: job.role,
    title: job.role,
    company: job.company,
    platform: job.platform,
    status: job.status,
    salary: job.salary || '',
    dateApplied: job.dateApplied,
    datePosted: job.datePosted || null,
    lastContactDate: job.lastContactDate || job.dateApplied,
    postLink: job.postLink || '',
    resumeUsed: job.resumeUsed || '',
    resumeText: job.resumeText || '',
    jobDescription: job.jobDescription || '',
    aiData: {
      ...DEFAULT_AI_DATA,
      ...(job.aiData?.toObject?.() ?? job.aiData ?? {}),
    },
    createdAt: job.createdAt,
    updatedAt: job.updatedAt,
  }
}

function validateJobBody(body, { isCreate = false } = {}) {
  const {
    role,
    company,
    platform,
    status,
    salary,
    dateApplied,
    postLink,
    resumeUsed,
    resumeText,
    jobDescription,
    aiData,
  } = body

  if (isCreate && (!role || !String(role).trim())) {
    return { valid: false, message: 'Job title / role is required' }
  }
  if (isCreate && (!company || !String(company).trim())) {
    return { valid: false, message: 'Company is required' }
  }
  if (isCreate && (!platform || !String(platform).trim())) {
    return { valid: false, message: 'Platform is required' }
  }
  if (isCreate && !dateApplied) {
    return { valid: false, message: 'Date applied is required' }
  }

  if (status && !STAGES.includes(status)) {
    return { valid: false, message: 'Invalid status' }
  }

  const data = {}
  if (role !== undefined) data.role = String(role).trim()
  if (company !== undefined) data.company = String(company).trim()
  if (platform !== undefined) data.platform = String(platform).trim()
  if (status !== undefined) data.status = status
  if (salary !== undefined) data.salary = String(salary).trim()
  if (postLink !== undefined) data.postLink = String(postLink).trim()
  if (resumeUsed !== undefined) data.resumeUsed = String(resumeUsed).trim()
  if (resumeText !== undefined) data.resumeText = String(resumeText).trim()
  if (jobDescription !== undefined) data.jobDescription = String(jobDescription).trim()

  if (dateApplied !== undefined) {
    const parsed = new Date(dateApplied)
    if (Number.isNaN(parsed.getTime())) {
      return { valid: false, message: 'Invalid date applied' }
    }
    data.dateApplied = parsed
  }

  if (aiData !== undefined) {
    data.aiDataPatch = aiData
  }

  return { valid: true, data }
}

const getJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ user: req.user._id }).sort({ dateApplied: -1 })
    return res.status(200).json(jobs.map(formatJob))
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error', error: error.message })
  }
}

const getJob = async (req, res) => {
  try {
    const job = await Job.findOne({ _id: req.params.id, user: req.user._id })
    if (!job) {
      return res.status(404).json({ message: 'Job not found' })
    }
    return res.status(200).json(formatJob(job))
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error', error: error.message })
  }
}

const createJob = async (req, res) => {
  try {
    const validation = validateJobBody(req.body, { isCreate: true })
    if (!validation.valid) {
      return res.status(400).json({ message: validation.message })
    }

    const appliedDate = validation.data.dateApplied
    const { aiDataPatch, ...jobFields } = validation.data
    const job = await Job.create({
      user: req.user._id,
      role: jobFields.role,
      company: jobFields.company,
      platform: jobFields.platform,
      status: jobFields.status || 'Bookmarked',
      salary: jobFields.salary ?? '',
      dateApplied: appliedDate,
      lastContactDate: appliedDate,
      postLink: jobFields.postLink ?? '',
      resumeUsed: jobFields.resumeUsed ?? '',
      resumeText: jobFields.resumeText ?? '',
      jobDescription: jobFields.jobDescription ?? '',
      aiData: mergeAiData(null, aiDataPatch),
    })

    return res.status(201).json(formatJob(job))
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error', error: error.message })
  }
}

const updateJob = async (req, res) => {
  try {
    const validation = validateJobBody(req.body)
    if (!validation.valid) {
      return res.status(400).json({ message: validation.message })
    }

    const { aiDataPatch, ...jobFields } = validation.data
    if (Object.keys(jobFields).length === 0 && aiDataPatch === undefined) {
      return res.status(400).json({ message: 'No valid fields to update' })
    }

    const existing = await Job.findOne({ _id: req.params.id, user: req.user._id })
    if (!existing) {
      return res.status(404).json({ message: 'Job not found' })
    }

    Object.assign(existing, jobFields)
    if (aiDataPatch !== undefined) {
      existing.aiData = mergeAiData(existing.aiData, aiDataPatch)
      existing.markModified('aiData')
    }
    const job = await existing.save()

    return res.status(200).json(formatJob(job))
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error', error: error.message })
  }
}

const deleteJob = async (req, res) => {
  try {
    const job = await Job.findOneAndDelete({ _id: req.params.id, user: req.user._id })
    if (!job) {
      return res.status(404).json({ message: 'Job not found' })
    }
    return res.status(200).json({ message: 'Job deleted', id: job._id.toString() })
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error', error: error.message })
  }
}

module.exports = { getJobs, getJob, createJob, updateJob, deleteJob }
