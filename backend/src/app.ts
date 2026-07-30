import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import { z } from 'zod'
import { getAllProperties, getCities, getFeaturedProperties, getPropertyById, listProperties } from './services/propertyService.js'
import type { ListingType, SearchFilters } from './types/property.js'
import type { RequestHandler } from 'express'

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
})

const asyncHandler = (handler: RequestHandler): RequestHandler => (req, res, next) => {
  Promise.resolve(handler(req, res, next)).catch(next)
}

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'zero-broker-backend' })
})

app.get('/api/properties', asyncHandler(async (req, res) => {
  const parsed = searchQuerySchema.safeParse(req.query)

  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() })
  }

  const filters: SearchFilters = {
    query: parsed.data.query,
    city: parsed.data.city,
    type: parsed.data.type as ListingType | 'all' | undefined,
    minPrice: parsed.data.minPrice,
    maxPrice: parsed.data.maxPrice,
    bedrooms: parsed.data.bedrooms ?? null,
  }

  const page = parsed.data.page ?? 1
  const limit = parsed.data.limit ?? 12

  return res.json(await listProperties(filters, page, limit))
}))

app.get('/api/properties/featured', asyncHandler(async (_req, res) => {
  res.json({ data: await getFeaturedProperties(4) })
}))

app.get('/api/properties/cities', asyncHandler(async (_req, res) => {
  res.json({ data: await getCities() })
}))

app.get('/api/properties/:id', asyncHandler(async (req, res) => {
  const property = await getPropertyById(String(req.params.id))

  if (!property) {
    return res.status(404).json({ error: 'Property not found' })
  }

  return res.json({ data: property })
}))

app.get('/api/search', asyncHandler(async (req, res) => {
  const parsed = searchQuerySchema.safeParse(req.query)

  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() })
  }

  const filters: SearchFilters = {
    query: parsed.data.query,
    city: parsed.data.city,
    type: parsed.data.type as ListingType | 'all' | undefined,
    minPrice: parsed.data.minPrice,
    maxPrice: parsed.data.maxPrice,
    bedrooms: parsed.data.bedrooms ?? null,
  }

  return res.json({ data: await getAllProperties(filters) })
}))

app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found' })
})

app.use((error: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(error)
  res.status(500).json({ error: 'Internal server error' })
})

export default app
