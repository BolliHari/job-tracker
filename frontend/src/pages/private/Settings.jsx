import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { ExternalLink, LogOut, Puzzle, Target } from 'lucide-react'
import EditTargetsModal from '../../components/dashboard/EditTargetsModal'
import {
  fetchTargets,
  updateTargets,
  clearTargetsError,
} from '../../store/targetsSlice'
import {
  updateProfile,
  changePassword,
  logoutUser,
  clearProfileMessages,
  clearPasswordMessages,
} from '../../store/authslice.js'
import { API_BASE_URL, APP_BASE_URL } from '../../utils/api'

function Field({ label, id, ...inputProps }) {
  return (
    <div>
      <label
        htmlFor={id}
        className="block text-xs font-medium uppercase tracking-wide text-charcoal/50"
      >
        {label}
      </label>
      <input
        id={id}
        {...inputProps}
        className="mt-1.5 w-full rounded-xl border border-sand bg-paper px-3 py-2.5 text-sm text-charcoal placeholder:text-charcoal/40 focus:border-sage focus:outline-none focus:ring-1 focus:ring-sage disabled:cursor-not-allowed disabled:opacity-60"
      />
    </div>
  )
}

function SettingsSection({ title, description, children }) {
  return (
    <section className="rounded-2xl border border-sand bg-white p-6">
      <h2 className="text-lg font-semibold text-charcoal">{title}</h2>
      {description ? (
        <p className="mt-1 text-sm text-charcoal/60">{description}</p>
      ) : null}
      <div className="mt-5">{children}</div>
    </section>
  )
}

export default function Settings() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { user, isUpdatingProfile, profileError, profileSuccess, isChangingPassword, passwordError, passwordSuccess } =
    useSelector((state) => state.auth)
  const { targets, isSaving, error: targetsError } = useSelector((state) => state.targets)

  const [name, setName] = useState('')
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [passwordFormError, setPasswordFormError] = useState('')
  const [isTargetsOpen, setIsTargetsOpen] = useState(false)

  useEffect(() => {
    if (user) {
      dispatch(fetchTargets())
      setName(user.name || '')
    }
  }, [dispatch, user])

  useEffect(() => {
    setName(user?.name || '')
  }, [user?.name])

  async function handleProfileSubmit(e) {
    e.preventDefault()
    dispatch(clearProfileMessages())
    const trimmed = name.trim()
    if (!trimmed) return
    try {
      await dispatch(updateProfile({ name: trimmed })).unwrap()
    } catch {
      // error in Redux
    }
  }

  async function handlePasswordSubmit(e) {
    e.preventDefault()
    dispatch(clearPasswordMessages())
    setPasswordFormError('')

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordFormError('New passwords do not match.')
      return
    }

    if (passwordForm.newPassword.length < 6) {
      setPasswordFormError('New password must be at least 6 characters.')
      return
    }

    try {
      await dispatch(
        changePassword({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        })
      ).unwrap()
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch {
      // error in Redux
    }
  }

  async function handleSaveTargets(nextTargets) {
    try {
      await dispatch(updateTargets(nextTargets)).unwrap()
      setIsTargetsOpen(false)
    } catch {
      // modal shows saveError
    }
  }

  function handleOpenTargets() {
    dispatch(clearTargetsError())
    setIsTargetsOpen(true)
  }

  function handleLogout() {
    dispatch(logoutUser())
    navigate('/login')
  }

  return (
    <div className="px-6 py-8 sm:px-10">
      <header className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-charcoal sm:text-3xl">
          Settings
        </h1>
        <p className="mt-1 text-sm text-charcoal/60">
          Account, goals, and extension setup.
        </p>
      </header>

      <div className="mx-auto max-w-2xl space-y-6">
        <SettingsSection
          title="Profile"
          description="Update how your name appears in the app."
        >
          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <Field
              label="Name"
              id="settings-name"
              name="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoComplete="name"
            />
            <Field
              label="Email"
              id="settings-email"
              name="email"
              type="email"
              value={user?.email || ''}
              disabled
              autoComplete="email"
            />
            {profileError ? (
              <p className="text-sm text-red-600" role="alert">
                {profileError}
              </p>
            ) : null}
            {profileSuccess ? (
              <p className="text-sm text-sage" role="status">
                {profileSuccess}
              </p>
            ) : null}
            <button
              type="submit"
              disabled={isUpdatingProfile || !name.trim()}
              className="rounded-xl bg-sage px-4 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {isUpdatingProfile ? 'Saving…' : 'Save profile'}
            </button>
          </form>
        </SettingsSection>

        <SettingsSection
          title="Security"
          description="Change your password. You will stay signed in."
        >
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <Field
              label="Current password"
              id="settings-current-password"
              type="password"
              value={passwordForm.currentPassword}
              onChange={(e) =>
                setPasswordForm((prev) => ({ ...prev, currentPassword: e.target.value }))
              }
              required
              autoComplete="current-password"
            />
            <Field
              label="New password"
              id="settings-new-password"
              type="password"
              value={passwordForm.newPassword}
              onChange={(e) =>
                setPasswordForm((prev) => ({ ...prev, newPassword: e.target.value }))
              }
              required
              autoComplete="new-password"
            />
            <Field
              label="Confirm new password"
              id="settings-confirm-password"
              type="password"
              value={passwordForm.confirmPassword}
              onChange={(e) =>
                setPasswordForm((prev) => ({ ...prev, confirmPassword: e.target.value }))
              }
              required
              autoComplete="new-password"
            />
            {passwordFormError ? (
              <p className="text-sm text-red-600" role="alert">
                {passwordFormError}
              </p>
            ) : null}
            {passwordError ? (
              <p className="text-sm text-red-600" role="alert">
                {passwordError}
              </p>
            ) : null}
            {passwordSuccess ? (
              <p className="text-sm text-sage" role="status">
                {passwordSuccess}
              </p>
            ) : null}
            <button
              type="submit"
              disabled={isChangingPassword}
              className="rounded-xl border border-sand bg-paper px-4 py-2.5 text-sm font-medium text-charcoal transition-colors hover:border-sage/40 disabled:opacity-50"
            >
              {isChangingPassword ? 'Updating…' : 'Update password'}
            </button>
          </form>
        </SettingsSection>

        <SettingsSection
          title="Goals"
          description="Daily application target and job search goals."
        >
          <div className="flex flex-wrap items-center gap-3 text-sm text-charcoal/70">
            {targets.targetRole ? (
              <span>
                Role: <strong className="text-charcoal">{targets.targetRole}</strong>
              </span>
            ) : null}
            {targets.applicationTarget ? (
              <span>
                Daily target:{' '}
                <strong className="text-charcoal">{targets.applicationTarget}</strong>{' '}
                applications
              </span>
            ) : null}
          </div>
          <button
            type="button"
            onClick={handleOpenTargets}
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-sage px-4 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
          >
            <Target size={16} strokeWidth={1.75} />
            Edit goals
          </button>
        </SettingsSection>

        <SettingsSection
          title="Chrome extension"
          description="Import jobs from LinkedIn, Indeed, Wellfound, and career pages."
        >
          <ul className="space-y-2 text-sm text-charcoal/70">
            <li className="flex items-start gap-2">
              <Puzzle size={16} className="mt-0.5 shrink-0 text-sage" strokeWidth={1.75} />
              Load unpacked from the <code className="rounded bg-paper px-1.5 py-0.5 text-xs">extension/</code> folder in Chrome.
            </li>
            <li>
              API URL:{' '}
              <code className="rounded bg-paper px-1.5 py-0.5 text-xs">{API_BASE_URL}</code>
            </li>
            <li>
              App URL:{' '}
              <code className="rounded bg-paper px-1.5 py-0.5 text-xs">{APP_BASE_URL}</code>
            </li>
            <li>Sign in with the same account as this web app.</li>
          </ul>
          <a
            href={APP_BASE_URL + '/vault'}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-sage hover:underline"
          >
            Open job vault
            <ExternalLink size={14} strokeWidth={1.75} />
          </a>
        </SettingsSection>

        <SettingsSection title="Account">
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center gap-2 rounded-xl border border-sand px-4 py-2.5 text-sm font-medium text-charcoal/80 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-700"
          >
            <LogOut size={16} strokeWidth={1.75} />
            Log out
          </button>
        </SettingsSection>
      </div>

      <EditTargetsModal
        isOpen={isTargetsOpen}
        initialValues={targets}
        onClose={() => setIsTargetsOpen(false)}
        onSave={handleSaveTargets}
        isSaving={isSaving}
        saveError={targetsError}
      />
    </div>
  )
}
