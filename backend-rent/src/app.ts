import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import { z } from 'zod'
import { getCollection } from './db/mongo.js'
import { createRentProperty, getRentPropertyById, listRentProperties } from './services/propertyService.js'
import type { RequestHandler } from 'express'

const app = express()
app.use(helmet())
app.use(cors())
app.use(morgan('dev'))
app.use(express.json())

const searchQuerySchema = z.object({
  query: z.string().optional(),
  city: z.string().optional(),
  minPrice: z.coerce.number().optional(),
  maxPrice: z.coerce.number().optional(),
  bedrooms: z.coerce.number().optional(),
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
})

const listingSchema = z.object({
  title: z.string().min(3),
  type: z.literal('rent'),
  city: z.string().min(2),
  area: z.string().min(2),
  bedrooms: z.coerce.number().int().min(1),
  bathrooms: z.coerce.number().int().min(1),
  sqft: z.coerce.number().int().min(100),
  price: z.coerce.number().min(1),
  image: z.string().url(),
  tags: z.array(z.string()).optional(),
})

const asyncHandler = (handler: RequestHandler): RequestHandler => (req, res, next) => {
  Promise.resolve(handler(req, res, next)).catch(next)
}

type PropertyRequestDocument = {
  propertyId: string
  listingType: 'rent'
  requestType: 'contact' | 'visit'
  payload: Record<string, unknown>
  createdAt: Date
}

async function savePropertyRequest(propertyId: string, requestType: 'contact' | 'visit', payload: unknown) {
  const collection = await getCollection<PropertyRequestDocument>('property_requests')
  if (!collection) {
    return
  }

  await collection.insertOne({
    propertyId,
    listingType: 'rent',
    requestType,
    payload: payload && typeof payload === 'object' ? payload as Record<string, unknown> : {},
    createdAt: new Date(),
  })
}

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'zero-broker-rent' })
})

app.get('/api/rent/properties', asyncHandler(async (req, res) => {
  const parsed = searchQuerySchema.safeParse(req.query)
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() })
  }

  const filters = {
    query: parsed.data.query,
    city: parsed.data.city,
    minPrice: parsed.data.minPrice,
    maxPrice: parsed.data.maxPrice,
    bedrooms: parsed.data.bedrooms ?? null,
  }
  const page = parsed.data.page ?? 1
  const limit = parsed.data.limit ?? 12
  res.json(await listRentProperties(filters, page, limit))
}))

app.post('/api/rent/properties', asyncHandler(async (req, res) => {
  const parsed = listingSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid listing details.' })
  }

  const property = await createRentProperty(parsed.data)
  return res.status(201).json({ data: property, message: 'Rent property listing submitted successfully.' })
}))

app.post('/api/rent/properties/:id/contact', asyncHandler(async (req, res) => {
  await savePropertyRequest(String(req.params.id), 'contact', req.body)
  return res.status(200).json({ message: 'Contact request received. The owner will reach out shortly.' })
}))

app.post('/api/rent/properties/:id/visit', asyncHandler(async (req, res) => {
  await savePropertyRequest(String(req.params.id), 'visit', req.body)
  return res.status(200).json({ message: 'Visit request received. The owner will contact you to confirm the schedule.' })
}))

app.get('/api/rent/properties/:id', asyncHandler(async (req, res) => {
  const property = await getRentPropertyById(String(req.params.id))
  if (!property) {
    return res.status(404).json({ error: 'Property not found' })
  }
  res.json({ data: property })
}))

app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found' })
})

app.use((error: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(error)
  res.status(500).json({ error: 'Internal server error' })
})

export default app
