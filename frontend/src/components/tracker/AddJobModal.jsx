import { useEffect, useRef, useState } from 'react'
import { X, Upload, FileText } from 'lucide-react'
import JobDescriptionField from './JobDescriptionField'
import { toLocalDateString } from '../../utils/dates'

const ACCEPTED_RESUME_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]
const ACCEPTED_RESUME_EXT = '.pdf,.doc,.docx,.txt'
const MAX_RESUME_MB = 5

const PLATFORMS = ['LinkedIn', 'Company Site', 'Wellfound', 'Referral', 'Indeed', 'Other']

function todayISO() {
  return toLocalDateString()
}

const emptyForm = {
  role: '',
  company: '',
  platform: 'LinkedIn',
  status: 'Bookmarked',
  salary: '',
  dateApplied: todayISO(),
  postLink: '',
  jobDescription: '',
  resumeText: '',
}

function Field({ label, id, children }) {
  return (
    <div>
      <label htmlFor={id} className="block text-xs font-medium uppercase tracking-wide text-charcoal/50">
        {label}
      </label>
      {children}
    </div>
  )
}

const inputClass =
  'mt-1.5 w-full rounded-xl border border-sand bg-paper px-3 py-2.5 text-sm text-charcoal placeholder:text-charcoal/40 focus:border-sage focus:outline-none focus:ring-1 focus:ring-sage'

export default function AddJobModal({
  isOpen,
  stages,
  onClose,
  onSave,
  isSaving = false,
  saveError = null,
}) {
  const [form, setForm] = useState(emptyForm)
  const [jdSummary, setJdSummary] = useState(null)
  const [resumeFile, setResumeFile] = useState(null)
  const [error, setError] = useState('')
  const fileInputRef = useRef(null)

  useEffect(() => {
    if (!isOpen) return
    setForm({ ...emptyForm, dateApplied: todayISO() })
    setJdSummary(null)
    setResumeFile(null)
    setError('')
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return
    function onKeyDown(e) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  function handleChange(e) {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    if (name === 'jobDescription' && jdSummary) setJdSummary(null)
    if (error) setError('')
  }

  async function handleResumeChange(e) {
    const file = e.target.files?.[0]
    if (!file) return

    const isTxt = file.type === 'text/plain' || /\.txt$/i.test(file.name)
    const isValidType =
      isTxt ||
      ACCEPTED_RESUME_TYPES.includes(file.type) ||
      /\.(pdf|doc|docx)$/i.test(file.name)

    if (!isValidType) {
      setError('Please upload a PDF, Word, or .txt file.')
      return
    }

    if (file.size > MAX_RESUME_MB * 1024 * 1024) {
      setError(`Resume must be smaller than ${MAX_RESUME_MB}MB.`)
      return
    }

    setResumeFile(file)
    if (isTxt) {
      try {
        const text = await file.text()
        setForm((prev) => ({ ...prev, resumeText: text }))
      } catch {
        setError('Could not read the text file.')
      }
    }
    if (error) setError('')
  }

  function handleRemoveResume() {
    setResumeFile(null)
    setForm((prev) => ({ ...prev, resumeText: '' }))
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!form.role.trim()) {
      setError('Job title / role is required.')
      return
    }
    if (!form.company.trim()) {
      setError('Company name is required.')
      return
    }
    if (!form.platform.trim()) {
      setError('Platform is required.')
      return
    }
    if (!form.dateApplied) {
      setError('Date applied is required.')
      return
    }

    onSave({
      role: form.role.trim(),
      company: form.company.trim(),
      platform: form.platform.trim(),
      status: form.status,
      salary: form.salary.trim(),
      dateApplied: new Date(`${form.dateApplied}T12:00:00`).toISOString(),
      postLink: form.postLink.trim(),
      jobDescription: form.jobDescription.trim(),
      resumeUsed: resumeFile?.name || '',
      resumeText: form.resumeText.trim(),
      ...(jdSummary ? { aiData: { jdSummary } } : {}),
    })
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-job-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-charcoal/20"
        onClick={onClose}
        aria-label="Close dialog"
      />
      <div
        className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-sand bg-white p-6 [scrollbar-width:none]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h2
              id="add-job-title"
              className="text-lg font-semibold text-charcoal"
            >
              Add job
            </h2>
            <p className="mt-1 text-sm text-charcoal/60">
              Track a new application in your vault.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-1.5 text-charcoal/50 transition-colors hover:bg-paper hover:text-charcoal"
            aria-label="Close"
          >
            <X size={18} strokeWidth={1.75} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="Job title / role *" id="role">
            <input
              id="role"
              name="role"
              type="text"
              required
              value={form.role}
              onChange={handleChange}
              placeholder="e.g. Senior Frontend Engineer"
              className={inputClass}
            />
          </Field>

          <Field label="Company *" id="company">
            <input
              id="company"
              name="company"
              type="text"
              required
              value={form.company}
              onChange={handleChange}
              placeholder="e.g. Acme Inc."
              className={inputClass}
            />
          </Field>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Platform *" id="platform">
              <select
                id="platform"
                name="platform"
                value={form.platform}
                onChange={handleChange}
                className={inputClass}
              >
                {PLATFORMS.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Status *" id="status">
              <select
                id="status"
                name="status"
                value={form.status}
                onChange={handleChange}
                className={inputClass}
              >
                {stages.map((stage) => (
                  <option key={stage} value={stage}>
                    {stage}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <Field label="Salary range (optional)" id="salary">
            <input
              id="salary"
              name="salary"
              type="text"
              value={form.salary}
              onChange={handleChange}
              placeholder="e.g. $120k–$150k"
              className={inputClass}
            />
          </Field>

          <Field label="Date applied *" id="dateApplied">
            <input
              id="dateApplied"
              name="dateApplied"
              type="date"
              required
              value={form.dateApplied}
              onChange={handleChange}
              className={inputClass}
            />
          </Field>

          <Field label="Job post link (optional)" id="postLink">
            <input
              id="postLink"
              name="postLink"
              type="url"
              value={form.postLink}
              onChange={handleChange}
              placeholder="https://..."
              className={inputClass}
            />
          </Field>

          <JobDescriptionField
            id="jobDescription"
            value={form.jobDescription}
            onChange={handleChange}
            onSummaryGenerated={setJdSummary}
            inputClass={inputClass}
          />

          <div>
            <span className="block text-xs font-medium uppercase tracking-wide text-charcoal/50">
              Resume (optional)
            </span>
            <input
              ref={fileInputRef}
              id="resume"
              type="file"
              accept={ACCEPTED_RESUME_EXT}
              onChange={handleResumeChange}
              className="sr-only"
            />
            {resumeFile ? (
              <div className="mt-1.5 flex items-center justify-between gap-3 rounded-xl border border-sand bg-paper px-3 py-3">
                <div className="flex min-w-0 items-center gap-2">
                  <FileText
                    size={18}
                    className="shrink-0 text-sage"
                    strokeWidth={1.75}
                  />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-charcoal">
                      {resumeFile.name}
                    </p>
                    <p className="text-xs text-charcoal/50">
                      {(resumeFile.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleRemoveResume}
                  className="shrink-0 text-xs font-medium text-charcoal/60 hover:text-charcoal"
                >
                  Remove
                </button>
              </div>
            ) : (
              <label
                htmlFor="resume"
                className="mt-1.5 flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-sand bg-paper px-4 py-6 transition-colors hover:border-sage/50 hover:bg-sage/5"
              >
                <Upload size={22} className="text-sage" strokeWidth={1.75} />
                <span className="mt-2 text-sm font-medium text-charcoal">
                  Click to upload resume
                </span>
                <span className="mt-1 text-xs text-charcoal/50">
                  PDF, Word, or .txt · max {MAX_RESUME_MB}MB
                </span>
              </label>
            )}
          </div>

          <Field label="Resume text for AI match (optional)" id="resumeText">
            <textarea
              id="resumeText"
              name="resumeText"
              rows={4}
              value={form.resumeText}
              onChange={handleChange}
              placeholder="Paste resume text here for match score & missing keywords (.txt upload fills this automatically)…"
              className={`${inputClass} resize-y min-h-[5rem]`}
            />
          </Field>

          {error ? (
            <p className="text-sm text-red-600" role="alert">
              {error}
            </p>
          ) : null}
          {saveError ? (
            <p className="text-sm text-red-600" role="alert">
              {saveError}
            </p>
          ) : null}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="flex-1 rounded-xl border border-sand px-4 py-2.5 text-sm font-medium text-charcoal transition-colors hover:bg-paper disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex-1 rounded-xl bg-sage px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-sage/90 disabled:opacity-50"
            >
              {isSaving ? "Adding…" : "Add job"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
