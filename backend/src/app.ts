import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import { z } from 'zod'
import { getAllProperties, getFeaturedProperties, getPropertyById, listProperties } from './services/propertyService.js'
import type { ListingType, SearchFilters } from './types/property.js'

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

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'zero-broker-backend' })
})

app.get('/api/properties', (req, res) => {
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

  return res.json(listProperties(filters, page, limit))
})

app.get('/api/properties/featured', (_req, res) => {
  res.json({ data: getFeaturedProperties(4) })
})

app.get('/api/properties/cities', (_req, res) => {
  res.json({ data: ['Mumbai', 'Bangalore', 'Delhi NCR', 'Hyderabad', 'Pune', 'Chennai', 'Kolkata', 'Ahmedabad'] })
})

app.get('/api/properties/:id', (req, res) => {
  const property = getPropertyById(req.params.id)

  if (!property) {
    return res.status(404).json({ error: 'Property not found' })
  }

  return res.json({ data: property })
})

app.get('/api/search', (req, res) => {
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

  return res.json({ data: getAllProperties(filters) })
})

app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found' })
})

export default app
