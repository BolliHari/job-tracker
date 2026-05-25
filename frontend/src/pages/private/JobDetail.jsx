import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import {
  ArrowLeft,
  ExternalLink,
  Copy,
  Check,
  FileText,
  Bookmark,
  Send,
  MessageCircle,
  Sparkles,
} from 'lucide-react'
import { api } from '../../utils/api'
import { fetchJobById, clearJobDetail, updateJob, clearJobsError } from '../../store/jobsSlice'
import EditJobModal from '../../components/tracker/EditJobModal'
import StructuredJdSummary from '../../components/tracker/StructuredJdSummary'

const STAGES = ['Bookmarked', 'Applying', 'Applied', 'Interview', 'Accepted']

const STATUS_PILL = {
  Bookmarked: 'bg-paper text-charcoal/80 border border-sand',
  Applying: 'bg-orange-50 text-orange-800',
  Applied: 'bg-sand/40 text-charcoal',
  Interview: 'bg-violet-50 text-violet-800',
  Accepted: 'bg-sage/10 text-sage',
}

const TIMELINE_STEPS = [
  { key: 'saved', label: 'Saved', icon: Bookmark },
  { key: 'applied', label: 'Applied', icon: Send },
  { key: 'interviewing', label: 'Interviewing', icon: MessageCircle },
]

const DEFAULT_AI_DATA = {
  matchScore: 0,
  missingKeywords: [],
  interviewQuestions: [],
  followUpEmail: '',
  jdSummary: null,
}

function formatDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function getDaysSince(iso) {
  if (!iso) return 0
  const then = new Date(iso)
  const now = new Date()
  return Math.floor((now - then) / (1000 * 60 * 60 * 24))
}

function getTimelineIndex(status) {
  if (status === 'Bookmarked' || status === 'Applying') return 0
  if (status === 'Applied') return 1
  if (status === 'Interview') return 2
  if (status === 'Accepted') return 2
  return 0
}

function StatusPill({ status }) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_PILL[status] ?? 'bg-paper text-charcoal border border-sand'}`}
    >
      {status}
    </span>
  )
}

function MatchScoreRing({ score }) {
  const radius = 52
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference

  return (
    <div className="relative mx-auto h-32 w-32">
      <svg className="h-full w-full -rotate-90" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r={radius} fill="none" stroke="#E2D9C8" strokeWidth="10" />
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          stroke="#6B8E7B"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-700"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold text-charcoal">{score}</span>
        <span className="text-xs text-charcoal/50">match</span>
      </div>
    </div>
  )
}

function JobDescriptionTab({ job }) {
  const hasDescription = job.jobDescription?.trim()
  const jdSummary = job.aiData?.jdSummary

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-charcoal">Job description</h2>
        {job.postLink ? (
          <a
            href={job.postLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl border border-sand bg-white px-4 py-2 text-sm font-medium text-charcoal transition-colors hover:border-charcoal/20 hover:bg-paper"
          >
            View original post
            <ExternalLink size={16} strokeWidth={1.75} />
          </a>
        ) : null}
      </div>

      <StructuredJdSummary jdSummary={jdSummary} />

      <div className="rounded-2xl border border-sand bg-white p-6">
        {hasDescription ? (
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-charcoal/80">
            {job.jobDescription}
          </p>
        ) : (
          <p className="text-sm text-charcoal/60">
            No job description saved yet. Add one when editing this application.
          </p>
        )}
      </div>
    </div>
  )
}

function AICoachTab({ aiData, job, onGenerate, isGenerating, coachError }) {
  const [copied, setCopied] = useState(false)
  const data = { ...DEFAULT_AI_DATA, ...aiData }
  const hasJd = job.jobDescription?.trim().length >= 50
  const hasPrep = data.interviewQuestions.length > 0 || data.followUpEmail

  async function handleCopy() {
    if (!data.followUpEmail) return
    try {
      await navigator.clipboard.writeText(data.followUpEmail)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-sand bg-white p-4">
        <p className="text-sm text-charcoal/70">
          Generate tailored interview questions and a follow-up email from this job&apos;s description.
        </p>
        <button
          type="button"
          onClick={onGenerate}
          disabled={isGenerating || !hasJd}
          title={hasJd ? 'Generate with AI' : 'Add a job description first (50+ characters)'}
          className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-sage px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-sage/90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Sparkles size={16} strokeWidth={2} className={isGenerating ? 'animate-pulse' : ''} />
          {isGenerating ? 'Generating…' : hasPrep ? 'Regenerate' : 'Generate prep'}
        </button>
      </div>

      {coachError ? (
        <p className="text-sm text-red-600" role="alert">
          {coachError}
        </p>
      ) : null}

      {!hasJd ? (
        <p className="text-sm text-charcoal/60">
          Add a job description on the Job description tab or via Edit job, then generate prep here.
        </p>
      ) : null}

      <section>
        <h2 className="mb-4 text-lg font-semibold text-charcoal">Interview prep</h2>
        {data.interviewQuestions.length > 0 ? (
          <ul className="space-y-3">
            {data.interviewQuestions.map((question, i) => (
              <li
                key={i}
                className="rounded-xl border border-sand bg-paper p-4 text-sm leading-relaxed text-charcoal/80"
              >
                <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-charcoal/50">
                  Question {i + 1}
                </span>
                {question}
              </li>
            ))}
          </ul>
        ) : (
          <p className="rounded-xl border border-sand bg-paper p-4 text-sm text-charcoal/60">
            Click Generate prep to create interview questions from the job description.
          </p>
        )}
      </section>

      <section>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-charcoal">Follow-up draft</h2>
          {data.followUpEmail ? (
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center gap-2 rounded-xl border border-sand bg-paper px-3 py-2 text-sm font-medium text-charcoal/70 transition-colors hover:bg-sage/10 hover:text-sage"
            >
              {copied ? (
                <>
                  <Check size={16} strokeWidth={1.75} />
                  Copied
                </>
              ) : (
                <>
                  <Copy size={16} strokeWidth={1.75} />
                  Copy to clipboard
                </>
              )}
            </button>
          ) : null}
        </div>
        <div className="rounded-2xl border border-sand bg-white p-5">
          <p className="whitespace-pre-line text-sm leading-relaxed text-charcoal/80">
            {data.followUpEmail ||
              'A follow-up email template will appear here after you generate prep.'}
          </p>
        </div>
      </section>
    </div>
  )
}

export default function JobDetail() {
  const { id } = useParams()
  const dispatch = useDispatch()
  const { currentJob: job, isLoadingDetail, detailError, isSaving, error: saveError } =
    useSelector((state) => state.jobs)
  const [activeTab, setActiveTab] = useState('jd')
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isGeneratingCoach, setIsGeneratingCoach] = useState(false)
  const [coachError, setCoachError] = useState('')
  const [isAnalyzingResume, setIsAnalyzingResume] = useState(false)
  const [matchError, setMatchError] = useState('')

  useEffect(() => {
    if (id) dispatch(fetchJobById(id))
    return () => dispatch(clearJobDetail())
  }, [dispatch, id])

  if (isLoadingDetail) {
    return (
      <div className="min-h-full bg-paper px-6 py-8 sm:px-10">
        <div className="mx-auto max-w-6xl">
          <p className="text-sm text-charcoal/60">Loading job details…</p>
        </div>
      </div>
    )
  }

  if (detailError || !job) {
    return (
      <div className="min-h-full bg-paper px-6 py-8 sm:px-10">
        <div className="mx-auto max-w-6xl">
          <Link
            to="/vault"
            className="mb-6 inline-flex items-center gap-2 text-sm text-charcoal/60 hover:text-charcoal"
          >
            <ArrowLeft size={16} strokeWidth={1.75} />
            Back to vault
          </Link>
          <p className="text-sm text-red-600" role="alert">
            {detailError || 'Job not found'}
          </p>
        </div>
      </div>
    )
  }

  const aiData = { ...DEFAULT_AI_DATA, ...job.aiData }
  const timelineIndex = getTimelineIndex(job.status)
  const daysSinceApplied = getDaysSince(job.dateApplied)
  const displayTitle = job.title || job.role

  function openEditModal() {
    dispatch(clearJobsError())
    setIsEditOpen(true)
  }

  async function handleEditJob(updates) {
    try {
      await dispatch(updateJob({ id: job.id, updates })).unwrap()
      setIsEditOpen(false)
    } catch {
      // error stored in Redux
    }
  }

  async function handleAnalyzeResume() {
    const jd = job.jobDescription?.trim() || ''
    const resume = job.resumeText?.trim() || ''

    if (jd.length < 50) {
      setMatchError('Add a job description (50+ characters) first.')
      setActiveTab('jd')
      return
    }
    if (resume.length < 100) {
      setMatchError('Paste resume text in Edit job (100+ characters) for AI match analysis.')
      openEditModal()
      return
    }

    setIsAnalyzingResume(true)
    setMatchError('')
    try {
      const { data } = await api.post('/ai/resume-match', {
        jobDescription: jd,
        resumeText: resume,
        role: job.role,
        company: job.company,
        jdSummary: job.aiData?.jdSummary || null,
      })
      await dispatch(
        updateJob({
          id: job.id,
          updates: {
            aiData: {
              matchScore: data.matchScore,
              missingKeywords: data.missingKeywords,
            },
          },
        })
      ).unwrap()
    } catch (err) {
      setMatchError(err.response?.data?.message || 'Failed to analyze resume match.')
    } finally {
      setIsAnalyzingResume(false)
    }
  }

  async function handleGenerateCoach() {
    const jd = job.jobDescription?.trim() || ''
    if (jd.length < 50) {
      setCoachError('Add a job description with at least 50 characters first.')
      setActiveTab('jd')
      return
    }

    setIsGeneratingCoach(true)
    setCoachError('')
    try {
      const { data } = await api.post('/ai/interview-prep', {
        jobDescription: jd,
        role: job.role,
        company: job.company,
        jdSummary: job.aiData?.jdSummary || null,
      })
      await dispatch(
        updateJob({
          id: job.id,
          updates: {
            aiData: {
              interviewQuestions: data.interviewQuestions,
              followUpEmail: data.followUpEmail,
            },
          },
        })
      ).unwrap()
    } catch (err) {
      setCoachError(err.response?.data?.message || 'Failed to generate interview prep.')
    } finally {
      setIsGeneratingCoach(false)
    }
  }

  return (
    <div className="min-h-full bg-paper px-6 py-8 sm:px-10">
      <div className="mx-auto max-w-6xl">
        <Link
          to="/vault"
          className="mb-6 inline-flex items-center gap-2 text-sm text-charcoal/60 transition-colors hover:text-charcoal"
        >
          <ArrowLeft size={16} strokeWidth={1.75} />
          Back to vault
        </Link>

        <header className="mb-8 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-charcoal sm:text-3xl">
              {displayTitle}
            </h1>
            <p className="mt-1 text-lg text-charcoal/60">{job.company}</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <StatusPill status={job.status} />
            <button
              type="button"
              onClick={openEditModal}
              className="rounded-xl border border-sand bg-white px-4 py-2 text-sm font-medium text-charcoal transition-colors hover:bg-paper"
            >
              Edit job
            </button>
          </div>
        </header>

        <div className="flex flex-col gap-8 lg:flex-row">
          <div className="lg:w-2/3">
            <div className="mb-6 inline-flex rounded-xl border border-sand bg-white p-1">
              <button
                type="button"
                onClick={() => setActiveTab('jd')}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                  activeTab === 'jd' ? 'bg-sage text-white' : 'text-charcoal/70 hover:bg-paper'
                }`}
              >
                Job description
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('coach')}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                  activeTab === 'coach'
                    ? 'bg-sage text-white'
                    : 'text-charcoal/70 hover:bg-paper'
                }`}
              >
                AI Coach ✨
              </button>
            </div>

            {activeTab === 'jd' ? (
              <JobDescriptionTab job={job} />
            ) : (
              <AICoachTab
                job={job}
                aiData={aiData}
                onGenerate={handleGenerateCoach}
                isGenerating={isGeneratingCoach}
                coachError={coachError}
              />
            )}
          </div>

          <aside className="space-y-6 lg:w-1/3">
            <div className="rounded-2xl border border-sand bg-white p-6">
              <div className="mb-4 flex items-center justify-between gap-2">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-charcoal/70">
                  AI match score
                </h3>
                <button
                  type="button"
                  onClick={handleAnalyzeResume}
                  disabled={isAnalyzingResume}
                  className="inline-flex items-center gap-1 rounded-lg border border-sage/30 bg-sage/10 px-2 py-1 text-xs font-medium text-sage transition-colors hover:bg-sage/15 disabled:opacity-50"
                >
                  <Sparkles
                    size={12}
                    strokeWidth={2}
                    className={isAnalyzingResume ? 'animate-pulse' : ''}
                  />
                  {isAnalyzingResume ? 'Analyzing…' : aiData.matchScore ? 'Re-analyze' : 'Analyze'}
                </button>
              </div>
              <MatchScoreRing score={aiData.matchScore} />
              {matchError ? (
                <p className="mt-3 text-xs text-red-600" role="alert">
                  {matchError}
                </p>
              ) : null}
              {!job.resumeText?.trim() && !matchError ? (
                <p className="mt-3 text-center text-xs text-charcoal/50">
                  Paste resume text in Edit job, then analyze.
                </p>
              ) : null}
              {aiData.missingKeywords.length > 0 ? (
                <>
                  <p className="mt-4 mb-3 text-xs font-medium uppercase tracking-wide text-charcoal/50">
                    Missing keywords
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {aiData.missingKeywords.map((keyword) => (
                      <span
                        key={keyword}
                        className="rounded-md border border-sand/50 bg-paper px-2 py-1 text-xs text-charcoal/80"
                      >
                        {keyword}
                      </span>
                    ))}
                  </div>
                </>
              ) : job.resumeText?.trim() && aiData.matchScore > 0 ? (
                <p className="mt-4 text-center text-xs text-charcoal/50">
                  No major keyword gaps found.
                </p>
              ) : !matchError && job.resumeText?.trim() ? (
                <p className="mt-4 text-center text-xs text-charcoal/50">
                  Click Analyze to compare resume vs job description.
                </p>
              ) : null}
            </div>

            <div className="rounded-2xl border border-sand bg-white p-6">
              <h3 className="mb-4 text-sm font-semibold text-charcoal">Application details</h3>
              <dl className="space-y-3 text-sm">
                <div className="flex justify-between gap-4">
                  <dt className="text-charcoal/50">Date applied</dt>
                  <dd className="font-medium text-charcoal">{formatDate(job.dateApplied)}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-charcoal/50">Days since applied</dt>
                  <dd className="font-medium text-charcoal">{daysSinceApplied} days</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-charcoal/50">Platform</dt>
                  <dd className="font-medium text-charcoal">{job.platform}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-charcoal/50">Resume used</dt>
                  <dd>
                    {job.resumeUsed ? (
                      <span className="inline-flex items-center gap-1.5 font-medium text-sage">
                        <FileText size={14} strokeWidth={1.75} />
                        {job.resumeUsed}
                      </span>
                    ) : (
                      <span className="text-charcoal/50">—</span>
                    )}
                  </dd>
                </div>
              </dl>
            </div>

            <div className="rounded-2xl border border-sand bg-white p-6">
              <h3 className="mb-4 text-sm font-semibold text-charcoal">Timeline</h3>
              <ol className="space-y-4">
                {TIMELINE_STEPS.map((step, index) => {
                  const Icon = step.icon
                  const isCurrent = index === timelineIndex
                  const isPast = index < timelineIndex
                  return (
                    <li key={step.key} className="flex gap-3">
                      <div
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border ${
                          isCurrent
                            ? 'border-sage bg-sage/10 text-sage'
                            : isPast
                              ? 'border-sand bg-paper text-charcoal/60'
                              : 'border-sand bg-white text-charcoal/30'
                        }`}
                      >
                        <Icon size={14} strokeWidth={1.75} />
                      </div>
                      <div className="pt-1">
                        <p
                          className={`text-sm font-medium ${
                            isCurrent ? 'text-sage' : isPast ? 'text-charcoal' : 'text-charcoal/40'
                          }`}
                        >
                          {step.label}
                          {isCurrent ? ' (current)' : ''}
                        </p>
                      </div>
                    </li>
                  )
                })}
              </ol>
            </div>
          </aside>
        </div>
      </div>

      <EditJobModal
        isOpen={isEditOpen}
        job={job}
        stages={STAGES}
        onClose={() => setIsEditOpen(false)}
        onSave={handleEditJob}
        isSaving={isSaving}
        saveError={saveError}
      />
    </div>
  )
}
