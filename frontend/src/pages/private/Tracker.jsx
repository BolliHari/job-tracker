import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  useDraggable,
  useDroppable,
} from '@dnd-kit/core'
import { List, Kanban, Plus, Search } from 'lucide-react'
import AddJobModal from '../../components/tracker/AddJobModal'
import {
  fetchJobs,
  createJob,
  updateJob,
  clearJobsError,
} from '../../store/jobsSlice'

const STAGES = ['Bookmarked', 'Applying', 'Applied', 'Interview', 'Accepted']

function formatDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

const STATUS_PILL = {
  Bookmarked: 'bg-paper text-charcoal/80 border border-sand',
  Applying: 'bg-orange-50 text-orange-800',
  Applied: 'bg-sand/40 text-charcoal',
  Interview: 'bg-violet-50 text-violet-800',
  Accepted: 'bg-sage/10 text-sage',
}

function StatusPill({ status }) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_PILL[status] ?? 'bg-paper text-charcoal'}`}
    >
      {status}
    </span>
  )
}

export default function Tracker() {
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth)
  const { jobs, isLoading, isSaving, error } = useSelector((state) => state.jobs)
  const [view, setView] = useState('list')
  const [statusFilter, setStatusFilter] = useState(null)
  const [search, setSearch] = useState('')
  const [isAddOpen, setIsAddOpen] = useState(false)

  useEffect(() => {
    if (user) dispatch(fetchJobs())
  }, [dispatch, user])

  const counts = useMemo(() => {
    const tally = Object.fromEntries(STAGES.map((s) => [s, 0]))
    jobs.forEach((job) => {
      if (tally[job.status] !== undefined) tally[job.status] += 1
    })
    return tally
  }, [jobs])

  const filteredJobs = useMemo(() => {
    const q = search.trim().toLowerCase()
    return jobs.filter((job) => {
      if (statusFilter && job.status !== statusFilter) return false
      if (!q) return true
      return (
        job.company.toLowerCase().includes(q) ||
        job.role.toLowerCase().includes(q) ||
        job.platform.toLowerCase().includes(q)
      )
    })
  }, [jobs, statusFilter, search])

  function toggleStatusFilter(stage) {
    setStatusFilter((prev) => (prev === stage ? null : stage))
  }

  const kanbanJobs = useMemo(() => {
    const q = search.trim().toLowerCase()
    return jobs.filter((job) => {
      if (!q) return true
      return (
        job.company.toLowerCase().includes(q) ||
        job.role.toLowerCase().includes(q) ||
        job.platform.toLowerCase().includes(q)
      )
    })
  }, [jobs, search])

  function moveJob(jobId, newStatus) {
    dispatch(updateJob({ id: jobId, updates: { status: newStatus } }))
  }

  async function handleAddJob(jobData) {
    try {
      await dispatch(
        createJob({
          role: jobData.role,
          company: jobData.company,
          platform: jobData.platform,
          status: jobData.status,
          salary: jobData.salary,
          dateApplied: jobData.dateApplied,
          postLink: jobData.postLink,
          jobDescription: jobData.jobDescription,
          resumeUsed: jobData.resumeUsed,
          resumeText: jobData.resumeText,
          ...(jobData.aiData ? { aiData: jobData.aiData } : {}),
        })
      ).unwrap()
      setIsAddOpen(false)
    } catch {
      // error in Redux
    }
  }

  function handleOpenAdd() {
    dispatch(clearJobsError())
    setIsAddOpen(true)
  }

  return (
    <div className="px-6 py-8 sm:px-10">
      <header className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-charcoal sm:text-3xl">
          Job vault
        </h1>
        <p className="mt-1 text-sm text-charcoal/60">
          Track every application from bookmark to offer.
        </p>
      </header>

      {/* Funnel stats */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {STAGES.map((stage) => {
          const active = statusFilter === stage
          return (
            <button
              key={stage}
              type="button"
              onClick={() => toggleStatusFilter(stage)}
              className={`rounded-xl border bg-white p-4 text-left transition-colors ${
                active
                  ? 'border-sage ring-1 ring-sage/30'
                  : 'border-sand hover:border-charcoal/20'
              }`}
            >
              <p className="text-xs font-medium uppercase tracking-wide text-charcoal/70">
                {stage}
              </p>
              <p className="mt-1 text-2xl font-bold text-charcoal">{counts[stage]}</p>
            </button>
          )
        })}
      </div>

      {/* Utility bar */}
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative max-w-md flex-1">
          <Search
            size={18}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-charcoal/40"
            strokeWidth={1.75}
          />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search company, role, or platform…"
            className="w-full rounded-xl border border-sand bg-white py-2.5 pl-10 pr-4 text-sm text-charcoal outline-none placeholder:text-charcoal/40 focus:border-sage focus:ring-1 focus:ring-sage"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div
            className="inline-flex rounded-xl border border-sand bg-white p-1"
            role="group"
            aria-label="View mode"
          >
            <button
              type="button"
              onClick={() => setView('list')}
              className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                view === 'list'
                  ? 'bg-sage text-white'
                  : 'text-charcoal/70 hover:bg-paper'
              }`}
            >
              <List size={16} strokeWidth={1.75} />
              List
            </button>
            <button
              type="button"
              onClick={() => setView('kanban')}
              className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                view === 'kanban'
                  ? 'bg-sage text-white'
                  : 'text-charcoal/70 hover:bg-paper'
              }`}
            >
              <Kanban size={16} strokeWidth={1.75} />
              Kanban
            </button>
          </div>

          <button
            type="button"
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-2 rounded-xl bg-sage px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-sage/90"
          >
            <Plus size={18} strokeWidth={1.75} />
            Add job
          </button>
        </div>
      </div>

      <AddJobModal
        isOpen={isAddOpen}
        stages={STAGES}
        onClose={() => setIsAddOpen(false)}
        onSave={handleAddJob}
        isSaving={isSaving}
        saveError={isAddOpen ? error : null}
      />

      {isLoading ? (
        <div className="rounded-2xl border border-sand bg-white px-6 py-12 text-center">
          <p className="text-sm text-charcoal/60">Loading your applications…</p>
        </div>
      ) : error && !isAddOpen ? (
        <p className="mb-4 text-sm text-red-600" role="alert">
          {error}
        </p>
      ) : null}

      {!isLoading && statusFilter ? (
        <p className="mb-4 text-sm text-charcoal/60">
          Showing <span className="font-medium text-charcoal">{statusFilter}</span> only.{' '}
          <button
            type="button"
            onClick={() => setStatusFilter(null)}
            className="font-medium text-sage underline-offset-2 hover:underline"
          >
            Clear filter
          </button>
        </p>
      ) : null}

      {/* Content */}
      {!isLoading && filteredJobs.length === 0 ? (
        <div className="rounded-2xl border border-sand bg-white px-6 py-12 text-center">
          <p className="text-sm text-charcoal/60">No jobs match your filters.</p>
        </div>
      ) : !isLoading && view === 'list' ? (
        <ListView jobs={filteredJobs} />
      ) : !isLoading ? (
        <KanbanView jobs={kanbanJobs} onMoveJob={moveJob} />
      ) : null}
    </div>
  )
}

function ListView({ jobs }) {
  return (
    <ul className="space-y-0">
      {jobs.map((job) => (
        <li key={job.id}>
          <Link
            to={`/tracker/${job.id}`}
            className="mb-3 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-sand bg-white p-4 transition-colors hover:border-charcoal/30"
          >
            <div className="min-w-0">
              <p className="font-medium text-charcoal">{job.role}</p>
              <p className="mt-0.5 text-sm text-charcoal/60">
                {job.company} · {job.platform}
                {job.salary ? ` · ${job.salary}` : ''}
              </p>
              <p className="mt-1 text-xs text-charcoal/50">
                Applied {formatDate(job.dateApplied)}
                {job.resumeUsed ? ` · ${job.resumeUsed}` : ''}
              </p>
            </div>
            <StatusPill status={job.status} />
          </Link>
        </li>
      ))}
    </ul>
  )
}


function KanbanCardContent({ job, isOverlay = false }) {
  return (
    <>
      <p className="font-medium text-charcoal">{job.role}</p>
      <p className="mt-1 text-sm text-charcoal/60">{job.company}</p>
      <p className="mt-2 text-xs text-charcoal/50">{job.platform}</p>
      {job.salary ? <p className="mt-1 text-xs text-charcoal/50">{job.salary}</p> : null}
      <p className="mt-2 text-xs text-charcoal/40">{formatDate(job.dateApplied)}</p>
      {!isOverlay ? (
        <>
          <p className="mt-2 text-[10px] uppercase tracking-wide text-charcoal/30">
            Drag to move
          </p>
          <Link
            to={`/tracker/${job.id}`}
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
            className="mt-2 inline-block text-xs font-medium text-sage hover:underline"
          >
            View details →
          </Link>
        </>
      ) : null}
    </>
  )
}

function KanbanCard({ job, isDragging }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: job.id,
    data: { job },
  })

  const style = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
    : undefined

  return (
    <article
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`cursor-grab rounded-xl border border-sand bg-white p-4 shadow-sm transition-colors active:cursor-grabbing hover:border-charcoal/20 ${
        isDragging ? 'opacity-40' : ''
      }`}
    >
      <KanbanCardContent job={job} />
    </article>
  )
}

function KanbanColumn({ stage, jobs, activeJobId }) {
  const { setNodeRef, isOver } = useDroppable({ id: stage })
  const columnJobs = jobs.filter((j) => j.status === stage)

  return (
    <div
      ref={setNodeRef}
      className={`flex w-64 shrink-0 flex-col rounded-xl border bg-paper/80 transition-colors ${
        isOver ? 'border-sage bg-sage/5 ring-1 ring-sage/20' : 'border-sand'
      }`}
    >

      <div className="border-b border-sand px-3 py-3">
        <h3 className="text-sm font-semibold text-charcoal">{stage}</h3>
        <p className="text-xs text-charcoal/50">{columnJobs.length} jobs</p>
      </div>
      <div className="flex min-h-[12rem] flex-1 flex-col gap-3 p-3">
        {columnJobs.length === 0 ? (
          <p
            className={`flex flex-1 items-center justify-center py-6 text-center text-xs ${
              isOver ? 'text-sage' : 'text-charcoal/40'
            }`}
          >
            {isOver ? 'Drop here' : 'No jobs'}
          </p>
        ) : (
          columnJobs.map((job) => (
            <KanbanCard key={job.id} job={job} isDragging={activeJobId === job.id} />
          ))
        )}
      </div>
    </div>
  )
}

function KanbanView({ jobs, onMoveJob }) {
  const [activeJob, setActiveJob] = useState(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  )

  function handleDragStart(event) {
    const job = jobs.find((j) => j.id === event.active.id)
    if (job) setActiveJob(job)
  }

  function handleDragEnd(event) {
    const { active, over } = event
    setActiveJob(null)
    if (!over) return
    const newStatus = over.id
    if (!STAGES.includes(newStatus)) return
    const job = jobs.find((j) => j.id === active.id)
    if (job && job.status !== newStatus) {
      onMoveJob(active.id, newStatus)
    }
  }

  function handleDragCancel() {
    setActiveJob(null)
  }

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div className="scrollbar-hide flex gap-4 overflow-x-auto pb-4">
        {STAGES.map((stage) => (
          <KanbanColumn
            key={stage}
            stage={stage}
            jobs={jobs}
            activeJobId={activeJob?.id ?? null}
          />
        ))}
      </div>

      <DragOverlay dropAnimation={null}>
        {activeJob ? (
          <article className="w-64 cursor-grabbing rounded-xl border border-sage bg-white p-4 shadow-md ring-2 ring-sage/20">
            <KanbanCardContent job={activeJob} isOverlay />
          </article>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}
