import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import { z } from 'zod'
import { findProperties, getPropertyById } from './services/searchService.js'

const app = express()
app.use(helmet())
app.use(cors())
app.use(morgan('dev'))
app.use(express.json())

const searchQuerySchema = z.object({
  query: z.string().optional(),
  city: z.string().optional(),
  type: z.enum(['rent', 'buy', 'all']).optional(),
  minPrice: z.coerce.number().optional(),
  maxPrice: z.coerce.number().optional(),
  bedrooms: z.coerce.number().optional(),
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  id: z.string().optional(),
})

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'zero-broker-search' })
})

app.get('/api/search', (req, res) => {
  const parsed = searchQuerySchema.safeParse(req.query)
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() })
  }

  if (parsed.data.id) {
    const property = getPropertyById(parsed.data.id)
    if (!property) {
      return res.status(404).json({ error: 'Property not found' })
    }
    return res.json({ data: property })
  }

  const filters = {
    query: parsed.data.query,
    city: parsed.data.city,
    type: parsed.data.type ?? 'all',
    minPrice: parsed.data.minPrice,
    maxPrice: parsed.data.maxPrice,
    bedrooms: parsed.data.bedrooms ?? null,
  }

  const page = parsed.data.page ?? 1
  const limit = parsed.data.limit ?? 12
  const allResults = findProperties(filters)
  const start = (page - 1) * limit

  res.json({ data: allResults.slice(start, start + limit), total: allResults.length, page, limit })
})

app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found' })
})

export default app
