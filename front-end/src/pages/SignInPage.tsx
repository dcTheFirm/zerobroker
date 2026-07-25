import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
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
    if (!email.trim() || !password.trim()) {
      setError('Enter both email and password to continue.')
      return
    }

    const { message } = await signIn(email.trim(), password)
    setStatus(message)
    setTimeout(() => navigate('/'), 1200)
  }

  return (
    <div className="auth-page">
      <div className="container auth-page__card">
        <h1>Sign In</h1>
        <p>Access ZeroBroker with your email address. Your session is saved locally until backend auth is connected.</p>

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
            ? 'Already signed in locally. You can safely continue.'
            : 'If backend auth is not available yet, the app will still keep your session locally.'}
        </div>
      </div>
    </div>
  )
}
