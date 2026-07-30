import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import { getCities, getFeaturedProperties } from './services/homeService.js'
import type { RequestHandler } from 'express'

const app = express()
app.use(helmet())
app.use(cors())
app.use(morgan('dev'))
app.use(express.json())

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'zero-broker-home' })
})

const asyncHandler = (handler: RequestHandler): RequestHandler => (req, res, next) => {
  Promise.resolve(handler(req, res, next)).catch(next)
}

app.get('/api/home/featured', asyncHandler(async (req, res) => {
  const limit = Number(String(req.query.limit ?? '4')) || 4
  const featured = await getFeaturedProperties(limit)
  res.json({ data: featured })
}))

app.get('/api/home/cities', asyncHandler(async (_req, res) => {
  res.json({ data: await getCities() })
}))

app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found' })
})

app.use((error: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(error)
  res.status(500).json({ error: 'Internal server error' })
})

export default app
