import { useState } from 'react'
import { Sparkles } from 'lucide-react'
import { api } from '../../utils/api'

const MIN_JD_LENGTH = 50

function Field({ label, id, children, action }) {
  return (
    <div>
      <div className="flex items-center justify-between gap-2">
        <label htmlFor={id} className="block text-xs font-medium uppercase tracking-wide text-charcoal/50">
          {label}
        </label>
        {action}
      </div>
      {children}
    </div>
  )
}

export default function JobDescriptionField({
  id,
  name = 'jobDescription',
  value,
  onChange,
  onSummaryGenerated,
  inputClass,
  label = 'Job description (optional)',
}) {
  const [isSummarizing, setIsSummarizing] = useState(false)
  const [aiError, setAiError] = useState('')

  async function handleSummarize() {
    const text = value?.trim() || ''
    if (text.length < MIN_JD_LENGTH) {
      setAiError(`Paste at least ${MIN_JD_LENGTH} characters of job description first.`)
      return
    }

    setIsSummarizing(true)
    setAiError('')
    try {
      const { data } = await api.post('/ai/summarize-jd', { jobDescription: text })
      onChange({
        target: { name, value: data.formattedDescription },
      })
      onSummaryGenerated?.(data.jdSummary)
    } catch (err) {
      setAiError(err.response?.data?.message || 'AI summary failed. Check your Gemini API key.')
    } finally {
      setIsSummarizing(false)
    }
  }

  function handleTextChange(e) {
    onChange(e)
    if (aiError) setAiError('')
  }

  const sparkButton = (
    <button
      type="button"
      onClick={handleSummarize}
      disabled={isSummarizing}
      title="AI summarize job description"
      className="inline-flex items-center gap-1 rounded-lg border border-sage/30 bg-sage/10 px-2 py-1 text-xs font-medium text-sage transition-colors hover:bg-sage/15 disabled:cursor-not-allowed disabled:opacity-50"
    >
      <Sparkles size={12} strokeWidth={2} className={isSummarizing ? 'animate-pulse' : ''} />
      {isSummarizing ? 'Summarizing…' : 'AI'}
    </button>
  )

  return (
    <Field label={label} id={id} action={sparkButton}>
      <textarea
        id={id}
        name={name}
        rows={5}
        value={value}
        onChange={handleTextChange}
        placeholder="Paste the job posting text here, then tap AI to structure it…"
        className={`${inputClass} resize-y min-h-[7rem]`}
      />
      {aiError ? (
        <p className="mt-1.5 text-xs text-red-600" role="alert">
          {aiError}
        </p>
      ) : null}
    </Field>
  )
}
