import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { signIn, getCurrentUser } from '../services/auth'
import './SignInPage.css'

export function SignInPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [status, setStatus] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    setStatus(null)

    if (!email.trim() || !password.trim()) {
      setError('Enter both email and password to continue.')
      return
    }

    try {
      const { message } = await signIn(email.trim(), password)
      setStatus(message)
      setTimeout(() => navigate('/'), 1200)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unable to sign in.')
    }
  }

  return (
    <div className="auth-page">
      <div className="container auth-page__card">
        <h1>Sign In</h1>
        <p>Access ZeroBroker with your email address. The app requires a running auth backend; ensure VITE_AUTH_BASE_URL points to your auth service.</p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label className="auth-form__label" htmlFor="signin-email">
            Email address
          </label>
          <input
            id="signin-email"
            type="email"
            className="auth-form__input"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
          />

          <label className="auth-form__label" htmlFor="signin-password">
            Password
          </label>
          <input
            id="signin-password"
            type="password"
            className="auth-form__input"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Enter your password"
          />

          {(error || status) && (
            <div className={`auth-form__message ${error ? 'auth-form__message--error' : 'auth-form__message--success'}`}>
              {error ?? status}
            </div>
          )}

          <button type="submit" className="btn btn--primary auth-form__submit">
            Sign In
          </button>
        </form>

        <div className="auth-page__hint">
          {getCurrentUser()
            ? 'Already signed in.'
            : 'Not signed in. Please create an account or sign in to continue.'}
          <br />
          New here? <Link to="/signup">Create an account.</Link>
        </div>
      </div>
    </div>
  )
}
