const mongoose = require('mongoose')

const STAGES = ['Bookmarked', 'Applying', 'Applied', 'Interview', 'Accepted']

const jdSummarySchema = new mongoose.Schema(
  {
    summary: { type: String, default: '' },
    responsibilities: { type: [String], default: [] },
    requirements: { type: [String], default: [] },
    skills: { type: [String], default: [] },
    experienceLevel: { type: String, default: '' },
    location: { type: String, default: '' },
    compensation: { type: String, default: '' },
    benefits: { type: [String], default: [] },
  },
  { _id: false }
)

const aiDataSchema = new mongoose.Schema(
  {
    matchScore: { type: Number, default: 0, min: 0, max: 100 },
    missingKeywords: { type: [String], default: [] },
    interviewQuestions: { type: [String], default: [] },
    followUpEmail: { type: String, default: '' },
    jdSummary: { type: jdSummarySchema, default: null },
  },
  { _id: false }
)

const jobSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    role: { type: String, required: true, trim: true },
    company: { type: String, required: true, trim: true },
    platform: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: STAGES,
      default: 'Bookmarked',
    },
    salary: { type: String, default: '' },
    dateApplied: { type: Date, required: true },
    datePosted: { type: Date },
    lastContactDate: { type: Date },
    postLink: { type: String, default: '' },
    resumeUsed: { type: String, default: '' },
    resumeText: { type: String, default: '' },
    jobDescription: { type: String, default: '' },
    aiData: { type: aiDataSchema, default: () => ({}) },
  },
  { timestamps: true }
)

const Job = mongoose.model('Job', jobSchema)

module.exports = Job
module.exports.STAGES = STAGES
