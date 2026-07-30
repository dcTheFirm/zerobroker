import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { signUp } from '../services/auth'
import './SignInPage.css'

export function SignUpPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [status, setStatus] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    setStatus(null)

    if (!email.trim() || !password.trim() || !confirmPassword.trim()) {
      setError('Please complete all fields to create your account.')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please try again.')
      return
    }

    try {
      const { message } = await signUp(email.trim(), password)
      setStatus(message)
      setTimeout(() => navigate('/signin'), 1200)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unable to create account.')
    }
  }

  return (
    <div className="auth-page">
      <div className="container auth-page__card">
        <h1>Create Account</h1>
        <p>Sign up for ZeroBroker and manage your property listings with your own account.</p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label className="auth-form__label" htmlFor="signup-email">
            Email address
          </label>
          <input
            id="signup-email"
            type="email"
            className="auth-form__input"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
          />

          <label className="auth-form__label" htmlFor="signup-password">
            Password
          </label>
          <input
            id="signup-password"
            type="password"
            className="auth-form__input"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Create a strong password"
          />

          <label className="auth-form__label" htmlFor="signup-confirm-password">
            Confirm password
          </label>
          <input
            id="signup-confirm-password"
            type="password"
            className="auth-form__input"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            placeholder="Re-enter your password"
          />

          {(error || status) && (
            <div className={`auth-form__message ${error ? 'auth-form__message--error' : 'auth-form__message--success'}`}>
              {error ?? status}
            </div>
          )}

          <button type="submit" className="btn btn--primary auth-form__submit">
            Sign Up
          </button>
        </form>

        <div className="auth-page__hint">
          Already have an account? <Link to="/signin">Sign in instead</Link>.
        </div>
      </div>
    </div>
  )
}
