import { Calendar, DollarSign, Pencil, Target, Briefcase } from 'lucide-react'

function formatTargetDate(isoDate) {
  if (!isoDate) return 'Not set'
  const date = new Date(`${isoDate}T00:00:00`)
  if (Number.isNaN(date.getTime())) return isoDate
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function TargetCard({ icon: Icon, label, value }) {
  return (
    <div className="rounded-xl border border-sand bg-white p-4">
      <div className="mb-3 flex items-center gap-2">
        <span className="rounded-lg bg-paper p-2 text-sage">
          <Icon size={16} strokeWidth={1.75} />
        </span>
        <span className="text-xs font-medium uppercase tracking-wide text-charcoal/50">
          {label}
        </span>
      </div>
      <p className="text-sm font-medium text-charcoal sm:text-base">{value}</p>
    </div>
  )
}

export default function TargetsSection({ targets, onEdit }) {
  const displayRole = targets.targetRole?.trim() || 'Not set'
  const displaySalary = targets.salary?.trim() || 'Not set'
  const displayDate = formatTargetDate(targets.targetDate)
  const displayApplicationTarget = `${targets.applicationTarget} / day`

  return (
    <section className="mb-8 rounded-2xl border border-sand bg-white p-6">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-charcoal">Your targets</h2>
          <p className="mt-1 text-sm text-charcoal/60">
            Goals that guide your job search and daily momentum.
          </p>
        </div>
        <button
          type="button"
          onClick={onEdit}
          className="inline-flex items-center gap-2 rounded-xl border border-sand bg-paper px-3.5 py-2 text-sm font-medium text-charcoal transition-colors hover:bg-sand/40"
        >
          <Pencil size={15} strokeWidth={1.75} />
          Edit
        </button>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <TargetCard icon={Briefcase} label="Target role" value={displayRole} />
        <TargetCard icon={Calendar} label="Target date" value={displayDate} />
        <TargetCard icon={DollarSign} label="Target salary" value={displaySalary} />
        <TargetCard icon={Target} label="Application target" value={displayApplicationTarget} />
      </div>
    </section>
  )
}
