import { Link } from 'react-router-dom'
import Logo from '../../components/brand/Logo'
import {
  ArrowRight,
  Briefcase,
  Puzzle,
  Kanban,
  LayoutDashboard,
  Radar,
  Sparkles,
  Target,
  TrendingUp,
} from 'lucide-react'

const FEATURES = [
  {
    icon: Target,
    title: 'Personal goals',
    description:
      'Set your target role, date, salary, and daily application count. Edit anytime from the dashboard or settings.',
  },
  {
    icon: TrendingUp,
    title: 'Daily progress',
    description:
      'See how many applications you logged today versus your daily target — stay accountable without spreadsheets.',
  },
  {
    icon: Radar,
    title: 'Action radar',
    description:
      'Follow-ups surface automatically for applied roles you have not contacted in 6+ days. Mark done in one click.',
  },
  {
    icon: Briefcase,
    title: 'Job vault',
    description:
      'Every role in one place — bookmarked through accepted. Search by company, role, or platform.',
  },
  {
    icon: Kanban,
    title: 'List & Kanban',
    description:
      'Switch views anytime. Drag cards across columns to update status — changes sync to your account instantly.',
  },
  {
    icon: Sparkles,
    title: 'AI job coach',
    description:
      'Structured JD summaries, match scores, missing keywords, and interview prep — all on the job detail page.',
  },
]

const SCREENSHOTS = [
  {
    src: '/landing/dashboard.png',
    alt: 'Job Tracker dashboard with targets, daily progress, and action radar',
    label: 'Dashboard',
    title: 'Your command center',
    description:
      'Targets, daily progress, quick add to vault, and follow-up radar — everything you need before you apply.',
  },
  {
    src: '/landing/vault-list.png',
    alt: 'Job vault list view with funnel stats and status tags',
    label: 'List view',
    title: 'Scan every application',
    description:
      'Funnel counts at a glance. Filter by stage, search your pipeline, and open any role for full details.',
    reverse: true,
  },
  {
    src: '/landing/vault-kanban.png',
    alt: 'Job vault Kanban board with drag and drop columns',
    label: 'Kanban',
    title: 'Move jobs through your pipeline',
    description:
      'Drag cards from Bookmarked to Accepted. Each column shows live counts so you always know where you stand.',
  },
  {
    src: '/landing/job-detail.png',
    alt: 'Job detail page with AI summary and match score',
    label: 'Job detail',
    title: 'AI-powered insights per role',
    description:
      'Structured job descriptions, match scores, missing keywords, and an AI coach tab — tailored to each application.',
    reverse: true,
  },
]

function Nav() {
  return (
    <header className="sticky top-0 z-50 border-b border-sand/80 bg-paper/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <Link to="/" className="transition-opacity hover:opacity-90">
          <Logo size="md" />
        </Link>
        <nav className="hidden items-center gap-8 text-sm font-medium text-charcoal/70 sm:flex">
          <a href="#features" className="transition-colors hover:text-sage">
            Features
          </a>
          <a href="#product" className="transition-colors hover:text-sage">
            Product
          </a>
          <a href="#extension" className="transition-colors hover:text-sage">
            Extension
          </a>
        </nav>
        <div className="flex items-center gap-3">
          <Link
            to="/login"
            className="hidden text-sm font-medium text-charcoal/70 transition-colors hover:text-sage sm:inline"
          >
            Sign in
          </Link>
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 rounded-xl bg-sage px-4 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
          >
            Get started
            <ArrowRight size={16} strokeWidth={2} />
          </Link>
        </div>
      </div>
    </header>
  )
}

function ScreenshotFrame({ src, alt, label }) {
  return (
    <div className="relative">
      <div className="absolute -inset-3 rounded-3xl bg-gradient-to-br from-sage/15 via-transparent to-sand/40 blur-sm" />
      <div className="relative overflow-hidden rounded-2xl border border-sand bg-white shadow-lg shadow-charcoal/5">
        <div className="flex items-center gap-2 border-b border-sand/60 bg-paper px-4 py-2.5">
          <span className="h-2.5 w-2.5 rounded-full bg-red-300/80" />
          <span className="h-2.5 w-2.5 rounded-full bg-amber-300/80" />
          <span className="h-2.5 w-2.5 rounded-full bg-sage/50" />
          <span className="ml-2 text-xs font-medium text-charcoal/50">{label}</span>
        </div>
        <img
          src={src}
          alt={alt}
          className="w-full object-cover object-top"
          loading="lazy"
        />
      </div>
    </div>
  )
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-paper text-charcoal">
      <Nav />

      {/* Hero */}
      <section className="relative overflow-hidden px-4 pb-16 pt-12 sm:px-6 sm:pb-24 sm:pt-16">
        <div
          className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-sage/10 blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -left-24 top-1/2 h-72 w-72 rounded-full bg-sand/50 blur-3xl"
          aria-hidden
        />
        <div className="relative mx-auto max-w-6xl">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full border border-sand bg-white px-3 py-1 text-xs font-medium text-charcoal/70">
                <Sparkles size={14} className="text-sage" strokeWidth={1.75} />
                Gamified job search, built for focus
              </p>
              <h1 className="mt-6 text-4xl font-semibold leading-tight tracking-tight text-charcoal sm:text-5xl lg:text-[3.25rem]">
                Track every application.{' '}
                <span className="text-sage">Land the role you want.</span>
              </h1>
              <p className="mt-5 max-w-lg text-base leading-relaxed text-charcoal/65 sm:text-lg">
                Job Tracker keeps your pipeline organized — from daily targets and follow-ups
                to a full job vault with Kanban, AI summaries, and a Chrome extension that
                imports roles in seconds.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 rounded-xl bg-sage px-6 py-3 text-sm font-medium text-white transition-opacity hover:opacity-90"
                >
                  Start tracking free
                  <ArrowRight size={18} strokeWidth={2} />
                </Link>
                <a
                  href="#product"
                  className="inline-flex items-center gap-2 rounded-xl border border-sand bg-white px-6 py-3 text-sm font-medium text-charcoal transition-colors hover:border-sage/40"
                >
                  <LayoutDashboard size={18} strokeWidth={1.75} />
                  See the product
                </a>
              </div>
            </div>
            <ScreenshotFrame
              src="/landing/dashboard.png"
              alt="Job Tracker dashboard"
              label="Dashboard"
            />
          </div>
        </div>
      </section>

      {/* Feature grid */}
      <section id="features" className="border-t border-sand/60 bg-white px-4 py-16 sm:px-6 sm:py-20">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-2xl">
            <h2 className="text-2xl font-semibold tracking-tight text-charcoal sm:text-3xl">
              Everything you need in one workflow
            </h2>
            <p className="mt-3 text-charcoal/60">
              No more scattered spreadsheets. Plan your search, execute daily, and never
              miss a follow-up.
            </p>
          </div>
          <ul className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map(({ icon: Icon, title, description }) => (
              <li
                key={title}
                className="rounded-2xl border border-sand bg-paper p-6 transition-shadow hover:shadow-md hover:shadow-charcoal/5"
              >
                <span className="inline-flex rounded-xl bg-sage/10 p-2.5 text-sage">
                  <Icon size={22} strokeWidth={1.75} />
                </span>
                <h3 className="mt-4 font-semibold text-charcoal">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-charcoal/60">{description}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Screenshot walkthrough */}
      <section id="product" className="px-4 py-16 sm:px-6 sm:py-20">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <h2 className="text-2xl font-semibold tracking-tight text-charcoal sm:text-3xl">
              Built for how you actually job hunt
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-charcoal/60">
              Real screens from the app — dashboard, vault, Kanban, and AI-powered job
              details.
            </p>
          </div>
          <div className="mt-16 space-y-24 sm:space-y-28">
            {SCREENSHOTS.map(
              ({ src, alt, label, title, description, reverse }) => (
                <div
                  key={label}
                  className={`grid items-center gap-10 lg:grid-cols-2 lg:gap-16 ${
                    reverse ? 'lg:[&>*:first-child]:order-2' : ''
                  }`}
                >
                  <ScreenshotFrame src={src} alt={alt} label={label} />
                  <div className={reverse ? 'lg:pr-4' : 'lg:pl-4'}>
                    <span className="text-xs font-semibold uppercase tracking-wider text-sage">
                      {label}
                    </span>
                    <h3 className="mt-2 text-2xl font-semibold text-charcoal">{title}</h3>
                    <p className="mt-4 text-base leading-relaxed text-charcoal/65">
                      {description}
                    </p>
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      </section>

      {/* Extension */}
      <section
        id="extension"
        className="border-t border-sand/60 bg-white px-4 py-16 sm:px-6 sm:py-20"
      >
        <div className="mx-auto max-w-6xl">
          <div className="rounded-3xl border border-sand bg-gradient-to-br from-paper via-white to-sage/5 p-8 sm:p-12">
            <div className="grid items-center gap-10 lg:grid-cols-2">
              <div>
                <span className="inline-flex items-center gap-2 rounded-full bg-sage/10 px-3 py-1 text-xs font-medium text-sage">
                  <Puzzle size={14} strokeWidth={1.75} />
                  Chrome extension
                </span>
                <h2 className="mt-4 text-2xl font-semibold text-charcoal sm:text-3xl">
                  Save jobs from the page you are on
                </h2>
                <p className="mt-4 text-charcoal/65">
                  Import roles from LinkedIn, Indeed, Wellfound, and company career pages.
                  AI summarizes the job description and saves straight to your vault — same
                  account as the web app.
                </p>
                <ul className="mt-6 space-y-2 text-sm text-charcoal/70">
                  <li className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-sage" />
                    Side panel — no tab switching
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-sage" />
                    Scrape title, company, description, and link
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-sage" />
                    One-click save to your vault
                  </li>
                </ul>
              </div>
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-sand bg-paper/80 p-10 text-center">
                <Briefcase size={48} className="text-sage/60" strokeWidth={1.25} />
                <p className="mt-4 text-sm font-medium text-charcoal">
                  Load unpacked from the{' '}
                  <code className="rounded bg-white px-1.5 py-0.5 text-xs">extension/</code>{' '}
                  folder
                </p>
                <p className="mt-2 text-xs text-charcoal/50">
                  Connect with the same login as the web app
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 py-16 sm:px-6 sm:py-20">
        <div className="mx-auto max-w-3xl rounded-3xl bg-sage px-8 py-12 text-center text-white sm:px-12 sm:py-14">
          <h2 className="text-2xl font-semibold sm:text-3xl">
            Ready to organize your job search?
          </h2>
          <p className="mx-auto mt-3 max-w-md text-white/85">
            Create a free account, set your targets, and start building your vault today.
          </p>
          <Link
            to="/login"
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-sage transition-opacity hover:opacity-95"
          >
            Get started — it&apos;s free
            <ArrowRight size={18} strokeWidth={2} />
          </Link>
        </div>
      </section>

      <footer className="border-t border-sand px-4 py-8 sm:px-6">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-sm text-charcoal/50">
            © {new Date().getFullYear()} Job Tracker
          </p>
          <div className="flex gap-6 text-sm text-charcoal/60">
            <Link to="/login" className="hover:text-sage">
              Sign in
            </Link>
            <a href="#features" className="hover:text-sage">
              Features
            </a>
            <Link to="/privacy" className="hover:text-sage">
              Privacy
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
