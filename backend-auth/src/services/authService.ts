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

let indexesReady = false

function hashPassword(password: string) {
  return crypto.createHash('sha256').update(password, 'utf8').digest('hex')
}

async function getUsersCollection() {
  const collection = await getCollection<StoredUser>('users')
  if (!collection) {
    throw new Error('MongoDB collection not available for users')
  }
  if (!indexesReady) {
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

export async function authenticateUser(email: string, password: string): Promise<AuthUser | null> {
  const normalizedEmail = email.toLowerCase().trim()
  const collection = await getUsersCollection()
  const stored = await collection.findOne({ email: normalizedEmail })

  if (!stored) {
    return null
  }

  return stored.passwordHash === hashPassword(password) ? { email: stored.email } : null
}

