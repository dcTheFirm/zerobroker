import crypto from 'node:crypto'

export interface AuthUser {
  email: string
}

type StoredUser = {
  email: string
  passwordHash: string
}

const users = new Map<string, StoredUser>()

function hashPassword(password: string) {
  return crypto.createHash('sha256').update(password, 'utf8').digest('hex')
}

export function registerUser(email: string, password: string): AuthUser | null {
  const normalizedEmail = email.toLowerCase().trim()
  if (users.has(normalizedEmail)) {
    return null
  }

  users.set(normalizedEmail, {
    email: normalizedEmail,
    passwordHash: hashPassword(password),
  })

  return { email: normalizedEmail }
}

export function authenticateUser(email: string, password: string): AuthUser | null {
  const normalizedEmail = email.toLowerCase().trim()
  const stored = users.get(normalizedEmail)

  if (!stored) {
    return null
  }

  return stored.passwordHash === hashPassword(password) ? { email: stored.email } : null
}
