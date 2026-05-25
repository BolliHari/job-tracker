import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { Briefcase, Target, Clock, Send, Check } from 'lucide-react'
import TargetsSection from '../../components/dashboard/TargetsSection'
import EditTargetsModal from '../../components/dashboard/EditTargetsModal'
import {
  fetchTargets,
  updateTargets,
  clearTargetsError,
} from '../../store/targetsSlice'
import { fetchJobs, updateJob } from '../../store/jobsSlice'
import { isSameLocalDay } from '../../utils/dates'

function getDaysAgo(dateString) {
  const then = new Date(dateString)
  const now = new Date()
  const msPerDay = 1000 * 60 * 60 * 24
  return Math.floor((now - then) / msPerDay)
}

function getFollowUpTagClass(days) {
  if (days > 14) return 'bg-red-50 text-red-700'
  return 'bg-orange-50 text-orange-700'
}

export default function Dashboard() {
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth)
  const { targets, isLoading, isSaving, error } = useSelector((state) => state.targets)
  const { jobs } = useSelector((state) => state.jobs)
  const [isEditOpen, setIsEditOpen] = useState(false)

  const followUpsDue = jobs.filter(
    (job) =>
      job.status === 'Applied' &&
      job.lastContactDate &&
      getDaysAgo(job.lastContactDate) >= 6
  )

  useEffect(() => {
    if (user) {
      dispatch(fetchTargets())
      dispatch(fetchJobs())
    }
  }, [dispatch, user])

  async function handleSaveTargets(nextTargets) {
    try {
      await dispatch(updateTargets(nextTargets)).unwrap()
      setIsEditOpen(false)
    } catch {
      // Error stored in Redux; modal displays saveError
    }
  }

  function handleOpenEdit() {
    dispatch(clearTargetsError())
    setIsEditOpen(true)
  }

  const jobsApplied = jobs.filter((job) => isSameLocalDay(job.dateApplied)).length
  const dailyTarget = targets.applicationTarget
  const progress = Math.min((jobsApplied / dailyTarget) * 100, 100)
  const displayName = user?.name || user?.email?.split('@')[0] || 'there'

  return (
    <div className="px-6 py-8 sm:px-10">
      <header className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-charcoal sm:text-3xl">
          Welcome back, <span className="capitalize">{displayName}</span>
        </h1>
        <p className="mt-1 text-sm text-charcoal/60">
          Ready to work toward your goals today?
        </p>
      </header>

      {isLoading ? (
        <section className="mb-8 rounded-2xl border border-sand bg-white p-6">
          <p className="text-sm text-charcoal/60">Loading your targets…</p>
        </section>
      ) : (
        <>
          {error && !isEditOpen ? (
            <p className="mb-4 text-sm text-red-600" role="alert">
              {error}
            </p>
          ) : null}
          <TargetsSection targets={targets} onEdit={handleOpenEdit} />
        </>
      )}

      <EditTargetsModal
        isOpen={isEditOpen}
        initialValues={targets}
        onClose={() => setIsEditOpen(false)}
        onSave={handleSaveTargets}
        isSaving={isSaving}
        saveError={isEditOpen ? error : null}
      />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="rounded-2xl border border-sand bg-white p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-charcoal">
              <Target size={20} className="text-sage" strokeWidth={1.75} />
              Daily progress
            </h2>
            <span className="text-2xl font-semibold text-charcoal">
              {jobsApplied} / {dailyTarget}
            </span>
          </div>

          <div className="mb-2 h-2.5 w-full overflow-hidden rounded-full bg-sand/60">
            <div
              className="h-full rounded-full bg-sage transition-all duration-700 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-right text-sm text-charcoal/60">
            {jobsApplied >= dailyTarget
              ? 'Daily target reached — well done.'
              : `${dailyTarget - jobsApplied} applications to go`}
          </p>
        </div>

        <div className="flex flex-col items-center justify-center rounded-2xl border border-sand bg-white p-6 text-center">
          <Briefcase size={28} className="mb-3 text-sage" strokeWidth={1.5} />
          <h3 className="text-lg font-semibold text-charcoal">Found a new role?</h3>
          <p className="mb-5 mt-1 max-w-xs text-sm text-charcoal/60">
            Add it to your vault manually or with the URL scraper when ready.
          </p>
          <button
            type="button"
            className="rounded-xl bg-sage px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-sage/90"
          >
            + Track application
          </button>
        </div>
      </div>

      <section className="mt-8 rounded-2xl border border-sand bg-white p-6 shadow-sm">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-charcoal">
          <Clock size={20} className="text-sage" strokeWidth={1.75} />
          Action Radar: Follow-ups Due
        </h2>

        {followUpsDue.length === 0 ? (
          <p className="rounded-xl border border-sand/50 bg-paper px-4 py-6 text-center text-sm text-charcoal/60">
            No follow-ups due right now. You&apos;re all caught up.
          </p>
        ) : (
          <ul className="space-y-3">
            {followUpsDue.map((job) => {
              const days = getDaysAgo(job.lastContactDate)
              return (
                <li
                  key={job.id}
                  className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-sand/50 bg-paper px-4 py-4"
                >
                  <Link to={`/tracker/${job.id}`} className="min-w-0 flex-1 hover:opacity-80">
                    <p className="font-medium text-charcoal">{job.role}</p>
                    <p className="mt-0.5 text-sm text-charcoal/60">
                      {job.company} · {job.platform}
                    </p>
                  </Link>
                  <div className="flex flex-wrap items-center gap-3">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${getFollowUpTagClass(days)}`}
                    >
                      {days} days ago
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        className="inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-sm font-medium text-charcoal/70 transition-colors hover:bg-sage/10 hover:text-sage"
                      >
                        <Send size={15} strokeWidth={1.75} />
                        Draft Ping
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          dispatch(
                            updateJob({
                              id: job.id,
                              updates: { lastContactDate: new Date().toISOString() },
                            })
                          )
                        }
                        className="inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-sm font-medium text-charcoal/70 transition-colors hover:bg-sage/10 hover:text-sage"
                      >
                        <Check size={15} strokeWidth={1.75} />
                        Mark Done
                      </button>
                    </div>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </section>
    </div>
  )
}
