import { Link } from 'react-router-dom'
import Logo from '../../components/brand/Logo'
import { ArrowLeft } from 'lucide-react'

const LAST_UPDATED = 'June 1, 2026'
const CONTACT_EMAIL = 'bollihari18@gmail.com'

function Section({ title, children }) {
  return (
    <section className="mt-10">
      <h2 className="text-xl font-semibold tracking-tight text-charcoal">{title}</h2>
      <div className="mt-3 space-y-3 text-sm leading-relaxed text-charcoal/70">
        {children}
      </div>
    </section>
  )
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-paper text-charcoal">
      <header className="sticky top-0 z-50 border-b border-sand/80 bg-paper/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <Link to="/" className="transition-opacity hover:opacity-90">
            <Logo size="md" />
          </Link>
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-charcoal/70 transition-colors hover:text-sage"
          >
            <ArrowLeft size={16} strokeWidth={2} />
            Back to home
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
        <p className="text-xs font-semibold uppercase tracking-wider text-sage">
          Legal
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-charcoal sm:text-4xl">
          Privacy Policy
        </h1>
        <p className="mt-3 text-sm text-charcoal/50">Last updated: {LAST_UPDATED}</p>

        <div className="mt-8 rounded-2xl border border-sand bg-white p-6 text-sm leading-relaxed text-charcoal/70 sm:p-8">
          <p>
            Job Tracker (&ldquo;we&rdquo;, &ldquo;us&rdquo;) provides a web app and a Chrome
            extension that help you save and manage job applications. This policy explains
            what we collect, why we collect it, and how it is used across both the web app
            and the browser extension.
          </p>

          <Section title="Information we collect">
            <ul className="list-disc space-y-2 pl-5">
              <li>
                <strong>Account information.</strong> When you sign up or sign in, we collect
                your name, email address, and password. Passwords are stored in hashed form
                on our servers and are never stored in plain text.
              </li>
              <li>
                <strong>Authentication tokens.</strong> The Chrome extension stores your name,
                email, and a login token locally in your browser (via Chrome storage) so you
                stay signed in. This stays on your device until you log out.
              </li>
              <li>
                <strong>Job data.</strong> When you save or import a job, we collect the
                details you provide or import — role, company, platform, status, salary, job
                description, and the job post URL.
              </li>
              <li>
                <strong>Page content you choose to import.</strong> When you click
                &ldquo;Import from page&rdquo; on a supported site (LinkedIn, Indeed,
                Wellfound, or a company careers page), the extension reads the visible job
                details on that page only at that moment. It does not run in the background
                or track your browsing.
              </li>
            </ul>
          </Section>

          <Section title="How we use your information">
            <ul className="list-disc space-y-2 pl-5">
              <li>To create and authenticate your account.</li>
              <li>To save, sync, and display jobs in your personal vault.</li>
              <li>
                To generate AI summaries of job descriptions when you choose to use the AI
                feature.
              </li>
              <li>To operate, maintain, and improve the service.</li>
            </ul>
          </Section>

          <Section title="AI processing">
            <p>
              If you use the &ldquo;AI&rdquo; summarize feature, the job description text you
              submit is sent to our backend and then to{' '}
              <strong>Google Gemini</strong> (via the Gemini API) to produce a structured
              summary. Only the text you choose to summarize is sent for this purpose. Google
              may process that text according to{' '}
              <a
                href="https://policies.google.com/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-sage hover:underline"
              >
                Google&apos;s Privacy Policy
              </a>
              .
            </p>
          </Section>

          <Section title="Where your data is stored">
            <p>
              Account and job data are stored in <strong>MongoDB</strong>, our database. Our
              API runs on <strong>Render</strong>, and the web app is hosted on{' '}
              <strong>Vercel</strong>. The Chrome extension communicates only with our API on
              Render (and with Google Gemini when you use AI summarize). We do not sell your
              personal information to anyone.
            </p>
          </Section>

          <Section title="Data sharing">
            <p>
              We do not sell or rent your personal data. We share data only with service
              providers that help us run the product — including{' '}
              <strong>MongoDB</strong> (database), <strong>Render</strong> (API hosting),{' '}
              <strong>Vercel</strong> (web app hosting), and <strong>Google Gemini</strong>{' '}
              (AI processing when you use that feature) — and only to the extent needed to
              provide the service, or where required by law.
            </p>
          </Section>

          <Section title="Data retention and deletion">
            <p>
              We keep your account and job data until you delete it or request account
              deletion. You can remove individual jobs from your vault at any time. To delete
              your account and associated data, contact us at the email below. Logging out of
              the extension clears the data it stores locally on your device.
            </p>
          </Section>

          <Section title="Your choices">
            <ul className="list-disc space-y-2 pl-5">
              <li>Log out of the extension to clear locally stored login data.</li>
              <li>Edit or delete jobs in your vault at any time.</li>
              <li>Request account and data deletion by contacting us.</li>
            </ul>
          </Section>

          <Section title="Children's privacy">
            <p>
              Job Tracker is not directed to children under 13, and we do not knowingly
              collect personal information from them.
            </p>
          </Section>

          <Section title="Changes to this policy">
            <p>
              We may update this policy from time to time. When we do, we will revise the
              &ldquo;Last updated&rdquo; date at the top of this page.
            </p>
          </Section>

          <Section title="Contact us">
            <p>
              If you have questions about this policy or your data, contact us at{' '}
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="font-medium text-sage hover:underline"
              >
                {CONTACT_EMAIL}
              </a>
              .
            </p>
          </Section>
        </div>
      </main>

      <footer className="border-t border-sand px-4 py-8 sm:px-6">
        <div className="mx-auto flex max-w-3xl flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-sm text-charcoal/50">
            © {new Date().getFullYear()} Job Tracker
          </p>
          <div className="flex gap-6 text-sm text-charcoal/60">
            <Link to="/" className="hover:text-sage">
              Home
            </Link>
            <Link to="/login" className="hover:text-sage">
              Sign in
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
