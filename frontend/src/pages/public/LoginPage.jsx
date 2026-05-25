import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { loginUser, registerUser, clearAuthError } from '../../store/authslice.js'
import Logo from '../../components/brand/Logo'

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

function LoginPage() {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { isLoading, error } = useSelector((state) => state.auth)

  const [mode, setMode] = useState('signin')
  const [signIn, setSignIn] = useState({ email: '', password: '' })
  const [signUp, setSignUp] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [signUpError, setSignUpError] = useState('')

  function switchToSignIn() {
    setMode('signin')
    setSignUpError('')
    dispatch(clearAuthError())
  }

  function switchToSignUp() {
    setMode('signup')
    setSignUpError('')
    dispatch(clearAuthError())
  }

  async function handleSignInSubmit(e) {
    e.preventDefault()
    try {
      await dispatch(
        loginUser({ email: signIn.email, password: signIn.password })
      ).unwrap()
      navigate('/dashboard')
    } catch (err) {
      console.error('Login failed:', err)
    }
  }

  async function handleSignUpSubmit(e) {
    e.preventDefault()
    if (signUp.password !== signUp.confirmPassword) {
      setSignUpError('Passwords do not match.')
      return
    }
    setSignUpError('')
    try {
      await dispatch(
        registerUser({
          name: signUp.name,
          email: signUp.email,
          password: signUp.password,
        })
      ).unwrap()
      navigate('/dashboard')
    } catch (err) {
      console.error('Registration failed:', err)
    }
  }

  return (
    <div className="min-h-screen bg-paper text-charcoal">
      <div className="mx-auto flex min-h-screen max-w-md flex-col px-4 py-10 sm:px-6">
        <Link to="/" className="mb-8 self-center">
          <Logo size="lg" />
        </Link>

        <div className="flex flex-1 flex-col justify-center">
          <section className="rounded-2xl border border-sand bg-white p-6 sm:p-8">
            {mode === 'signin' ? (
              <>
                <h1 className="text-xl font-semibold tracking-tight text-charcoal">
                  Sign in
                </h1>
                <p className="mt-1 text-sm text-charcoal/60">
                  Welcome back. Enter your email and password.
                </p>

                <form className="mt-6 space-y-4" onSubmit={handleSignInSubmit}>
                  <Field
                    label="Email"
                    id="signin-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={signIn.email}
                    onChange={(e) =>
                      setSignIn((s) => ({ ...s, email: e.target.value }))
                    }
                    placeholder="you@example.com"
                  />
                  <Field
                    label="Password"
                    id="signin-password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={signIn.password}
                    onChange={(e) =>
                      setSignIn((s) => ({ ...s, password: e.target.value }))
                    }
                    placeholder="••••••••"
                  />

                  {error ? (
                    <p className="text-sm text-red-600" role="alert">
                      {error}
                    </p>
                  ) : null}

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full rounded-xl bg-sage px-3 py-2.5 text-sm font-medium text-white transition-colors hover:bg-sage/90 disabled:opacity-50"
                  >
                    {isLoading ? 'Signing in…' : 'Sign in'}
                  </button>
                </form>

                <p className="mt-6 text-center text-sm text-charcoal/60">
                  Don&apos;t have an account?{' '}
                  <button
                    type="button"
                    onClick={switchToSignUp}
                    className="font-medium text-sage underline-offset-4 hover:underline"
                  >
                    Create account
                  </button>
                </p>
              </>
            ) : (
              <>
                <h1 className="text-xl font-semibold tracking-tight text-charcoal">
                  Create account
                </h1>
                <p className="mt-1 text-sm text-charcoal/60">
                  Sign up with your name, email, and a new password.
                </p>

                <form className="mt-6 space-y-4" onSubmit={handleSignUpSubmit}>
                  <Field
                    label="Name"
                    id="signup-name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    required
                    value={signUp.name}
                    onChange={(e) =>
                      setSignUp((s) => ({ ...s, name: e.target.value }))
                    }
                    placeholder="Your name"
                  />
                  <Field
                    label="Email"
                    id="signup-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={signUp.email}
                    onChange={(e) =>
                      setSignUp((s) => ({ ...s, email: e.target.value }))
                    }
                    placeholder="you@example.com"
                  />
                  <Field
                    label="Password"
                    id="signup-password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    required
                    minLength={8}
                    value={signUp.password}
                    onChange={(e) =>
                      setSignUp((s) => ({ ...s, password: e.target.value }))
                    }
                    placeholder="At least 8 characters"
                  />
                  <Field
                    label="Confirm password"
                    id="signup-confirm"
                    name="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    required
                    value={signUp.confirmPassword}
                    onChange={(e) =>
                      setSignUp((s) => ({
                        ...s,
                        confirmPassword: e.target.value,
                      }))
                    }
                    placeholder="Repeat password"
                  />

                  {signUpError ? (
                    <p className="text-sm text-red-600" role="alert">
                      {signUpError}
                    </p>
                  ) : null}
                  {error ? (
                    <p className="text-sm text-red-600" role="alert">
                      {error}
                    </p>
                  ) : null}

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full rounded-xl bg-sage px-3 py-2.5 text-sm font-medium text-white transition-colors hover:bg-sage/90 disabled:opacity-50"
                  >
                    {isLoading ? 'Creating account…' : 'Create account'}
                  </button>
                </form>

                <p className="mt-6 text-center text-sm text-charcoal/60">
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={switchToSignIn}
                    className="font-medium text-sage underline-offset-4 hover:underline"
                  >
                    Sign in
                  </button>
                </p>
              </>
            )}
          </section>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
