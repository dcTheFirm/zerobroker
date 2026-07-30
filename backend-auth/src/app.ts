import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import { z } from 'zod'
import { authenticateUser, registerUser } from './services/authService.js'

const app = express()

app.use(helmet())
app.use(cors())
app.use(morgan('dev'))
app.use(express.json())

const authSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'zero-broker-auth' })
})

app.post('/api/auth/signup', (req, res) => {
  const parsed = authSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid signup details. Make sure your email and password are correct.' })
  }

  const user = registerUser(parsed.data.email, parsed.data.password)
  if (!user) {
    return res.status(409).json({ error: 'A user with that email already exists.' })
  }

  return res.status(201).json({ user, message: 'Account created successfully.' })
})

app.post('/api/auth/signin', (req, res) => {
  const parsed = authSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid signin details. Make sure your email and password are correct.' })
  }

  const user = authenticateUser(parsed.data.email, parsed.data.password)
  if (!user) {
    return res.status(401).json({ error: 'Invalid email or password.' })
  }

  return res.json({ user, message: 'Signed in successfully.' })
})

app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found' })
})

export default app
