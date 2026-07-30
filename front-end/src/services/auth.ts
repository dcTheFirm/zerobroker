const AUTH_BASE = import.meta.env.VITE_AUTH_BASE_URL ?? 'http://localhost:5000'
const AUTH_KEY = 'zerobroker-user'
const OFFLINE_ERROR = 'Authentication service unavailable.'

export interface AuthUser {
  email: string
}

function emitAuthUpdate() {
  window.dispatchEvent(new CustomEvent('zerobroker-auth'))
}

export function getCurrentUser(): AuthUser | null {
  if (typeof window === 'undefined') {
    return null
  }

  try {
    return JSON.parse(localStorage.getItem(AUTH_KEY) ?? 'null') as AuthUser | null
  } catch {
    return null
  }
}

export function subscribeAuthChanges(callback: (user: AuthUser | null) => void) {
  const listener = () => callback(getCurrentUser())
  window.addEventListener('zerobroker-auth', listener)
  return () => window.removeEventListener('zerobroker-auth', listener)
}

async function fetchAuth<T>(path: string, options?: RequestInit): Promise<T> {
  let response: Response

  try {
    response = await fetch(`${AUTH_BASE}${path}`, options)
  } catch {
    throw new Error(OFFLINE_ERROR)
  }

  if (!response.ok) {
    const payload = await response.json().catch(() => null)
    const message = payload?.error ?? payload?.message ?? 'Authentication request failed.'
    throw new Error(message)
  }

  return response.json()
}

function isOfflineError(error: unknown): boolean {
  return error instanceof Error && error.message === OFFLINE_ERROR
}

export async function signIn(email: string, password: string): Promise<{ user: AuthUser; message: string }> {
  try {
    const payload = await fetchAuth<{ user: AuthUser; message?: string }>('/api/auth/signin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })

    const user = payload.user ?? { email }
    localStorage.setItem(AUTH_KEY, JSON.stringify(user))
    emitAuthUpdate()
    return { user, message: payload.message ?? 'Signed in successfully.' }
  } catch (error) {
    // Do not fall back to frontend-only/local sign-in when the auth backend is unavailable.
    // Surface the error to the caller so the UI can show a proper failure.
    throw error
  }
}

export async function signUp(email: string, password: string): Promise<{ user: AuthUser; message: string }> {
  try {
    const payload = await fetchAuth<{ user: AuthUser; message?: string }>('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })

    const user = payload.user
    localStorage.setItem(AUTH_KEY, JSON.stringify(user))
    emitAuthUpdate()
    return { user, message: payload.message ?? 'Account created successfully.' }
  } catch (error) {
    // Do not fall back to frontend-only/local sign-up when the auth backend is unavailable.
    // Surface the error to the caller so the UI can show a proper failure.
    throw error
  }
}

export function signOut() {
  localStorage.removeItem(AUTH_KEY)
  emitAuthUpdate()
}
