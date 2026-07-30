import crypto from 'node:crypto'
import { MongoServerError } from 'mongodb'
import { getCollection } from '../db/mongo.js'

export interface AuthUser {
  email: string
}

type StoredUser = {
  email: string
  passwordHash: string
  createdAt?: Date
  updatedAt?: Date
  _id?: unknown
}

const users = new Map<string, StoredUser>()
let indexesReady = false

function hashPassword(password: string) {
  return crypto.createHash('sha256').update(password, 'utf8').digest('hex')
}

async function getUsersCollection() {
  const collection = await getCollection<StoredUser>('users')
  if (collection && !indexesReady) {
    await collection.createIndex({ email: 1 }, { unique: true })
    indexesReady = true
  }
  return collection
}

function isDuplicateKeyError(error: unknown) {
  return error instanceof MongoServerError && error.code === 11000
}

export async function registerUser(email: string, password: string): Promise<AuthUser | null> {
  const normalizedEmail = email.toLowerCase().trim()
  const collection = await getUsersCollection()

  if (collection) {
    try {
      await collection.insertOne({
        email: normalizedEmail,
        passwordHash: hashPassword(password),
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      return { email: normalizedEmail }
    } catch (error) {
      if (isDuplicateKeyError(error)) {
        return null
      }
      throw error
    }
  }

  if (users.has(normalizedEmail)) {
    return null
  }

  users.set(normalizedEmail, {
    email: normalizedEmail,
    passwordHash: hashPassword(password),
  })

  return { email: normalizedEmail }
}

export async function authenticateUser(email: string, password: string): Promise<AuthUser | null> {
  const normalizedEmail = email.toLowerCase().trim()
  const collection = await getUsersCollection()
  const stored = collection
    ? await collection.findOne({ email: normalizedEmail })
    : users.get(normalizedEmail)

  if (!stored) {
    return null
  }

  return stored.passwordHash === hashPassword(password) ? { email: stored.email } : null
}

export function clearLocalUsers() {
  users.clear()
}
