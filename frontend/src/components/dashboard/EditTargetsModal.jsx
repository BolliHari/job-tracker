import { useEffect, useState } from 'react'
import { X } from 'lucide-react'

const emptyForm = {
  targetRole: '',
  targetDate: '',
  salary: '',
  applicationTarget: '',
}

export default function EditTargetsModal({
  isOpen,
  initialValues,
  onClose,
  onSave,
  isSaving = false,
  saveError = null,
}) {
  const [form, setForm] = useState(emptyForm)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isOpen) return
    setForm({
      targetRole: initialValues.targetRole ?? '',
      targetDate: initialValues.targetDate ?? '',
      salary: initialValues.salary ?? '',
      applicationTarget: String(initialValues.applicationTarget ?? ''),
    })
    setError('')
  }, [isOpen, initialValues])

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
    if (error) setError('')
  }

  function handleSubmit(e) {
    e.preventDefault()
    const applicationTarget = Number(form.applicationTarget)
    if (!form.applicationTarget.trim() || Number.isNaN(applicationTarget) || applicationTarget < 1) {
      setError('Application target must be at least 1.')
      return
    }
    onSave({
      targetRole: form.targetRole.trim(),
      targetDate: form.targetDate,
      salary: form.salary.trim(),
      applicationTarget,
    })
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-targets-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-charcoal/20"
        onClick={onClose}
        aria-label="Close dialog"
      />
      <div
        className="relative w-full max-w-md rounded-2xl border border-sand bg-white p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h2 id="edit-targets-title" className="text-lg font-semibold text-charcoal">
              Edit targets
            </h2>
            <p className="mt-1 text-sm text-charcoal/60">
              Set your job search goals. Changes are saved to your account.
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
          <Field label="Target role" id="targetRole" name="targetRole" value={form.targetRole} onChange={handleChange} placeholder="e.g. Senior Frontend Engineer" />
          <Field label="Target date" id="targetDate" name="targetDate" type="date" value={form.targetDate} onChange={handleChange} />
          <Field label="Target salary" id="salary" name="salary" value={form.salary} onChange={handleChange} placeholder="e.g. $120,000 or 120k–150k" />
          <Field
            label="Daily application target"
            id="applicationTarget"
            name="applicationTarget"
            type="number"
            min={1}
            value={form.applicationTarget}
            onChange={handleChange}
            placeholder="20"
          />

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
              {isSaving ? 'Saving…' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function Field({ label, id, ...inputProps }) {
  return (
    <div>
      <label htmlFor={id} className="block text-xs font-medium uppercase tracking-wide text-charcoal/50">
        {label}
      </label>
      <input
        id={id}
        {...inputProps}
        className="mt-1.5 w-full rounded-xl border border-sand bg-paper px-3 py-2.5 text-sm text-charcoal placeholder:text-charcoal/40 focus:border-sage focus:outline-none focus:ring-1 focus:ring-sage"
      />
    </div>
  )
}
