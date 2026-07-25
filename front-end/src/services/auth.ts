const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4000'
const AUTH_KEY = 'zerobroker-user'

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

export async function signIn(email: string, password: string): Promise<{ user: AuthUser; message: string }> {
  try {
    const response = await fetch(`${API_BASE}/api/auth/signin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })

    if (response.ok) {
      const payload = await response.json()
      const user = payload.user ?? { email }
      localStorage.setItem(AUTH_KEY, JSON.stringify(user))
      emitAuthUpdate()
      return { user, message: 'Signed in successfully.' }
    }
  } catch {
    // no-op: fallback to local auth if backend is not available
  }

  const user = { email }
  localStorage.setItem(AUTH_KEY, JSON.stringify(user))
  emitAuthUpdate()
  return { user, message: 'Signed in with frontend-only mode. Backend auth will connect soon.' }
}

export function signOut() {
  localStorage.removeItem(AUTH_KEY)
  emitAuthUpdate()
}
