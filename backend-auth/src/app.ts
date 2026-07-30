import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import { z } from 'zod'
import { authenticateUser, registerUser } from './services/authService.js'
import type { RequestHandler } from 'express'

const app = express()

app.use(helmet())
app.use(cors())
app.use(morgan('dev'))
app.use(express.json())

const authSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

const asyncHandler = (handler: RequestHandler): RequestHandler => (req, res, next) => {
  Promise.resolve(handler(req, res, next)).catch(next)
}

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'zero-broker-auth' })
})

app.post('/api/auth/signup', asyncHandler(async (req, res) => {
  const parsed = authSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid signup details. Make sure your email and password are correct.' })
  }

  const user = await registerUser(parsed.data.email, parsed.data.password)
  if (!user) {
    return res.status(409).json({ error: 'A user with that email already exists.' })
  }

  return res.status(201).json({ user, message: 'Account created successfully.' })
}))

app.post('/api/auth/signin', asyncHandler(async (req, res) => {
  const parsed = authSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid signin details. Make sure your email and password are correct.' })
  }

  const user = await authenticateUser(parsed.data.email, parsed.data.password)
  if (!user) {
    return res.status(401).json({ error: 'Invalid email or password.' })
  }

  return res.json({ user, message: 'Signed in successfully.' })
}))

app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found' })
})

app.use((error: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(error)
  res.status(500).json({ error: 'Internal server error' })
})

export default app
