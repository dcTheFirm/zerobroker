import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import { z } from 'zod'
import { getBuyProperties, getBuyPropertyById, listBuyProperties } from './services/propertyService.js'

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
  type: z.literal('buy'),
  city: z.string().min(2),
  area: z.string().min(2),
  bedrooms: z.coerce.number().int().min(1),
  bathrooms: z.coerce.number().int().min(1),
  sqft: z.coerce.number().int().min(100),
  price: z.coerce.number().min(1),
  image: z.string().url(),
  tags: z.array(z.string()).optional(),
})

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'zero-broker-buy' })
})

app.post('/api/buy/properties', (req, res) => {
  const parsed = listingSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid listing details.' })
  }

  return res.status(201).json({ message: 'Buy property listing submitted successfully.' })
})

app.post('/api/buy/properties/:id/contact', (req, res) => {
  return res.status(200).json({ message: 'Contact request received. The owner will reach out shortly.' })
})

app.post('/api/buy/properties/:id/visit', (req, res) => {
  return res.status(200).json({ message: 'Visit request received. The owner will contact you to confirm the schedule.' })
})

app.get('/api/buy/properties', (req, res) => {
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
  res.json(listBuyProperties(filters, page, limit))
})

app.get('/api/buy/properties/:id', (req, res) => {
  const property = getBuyPropertyById(req.params.id)
  if (!property) {
    return res.status(404).json({ error: 'Property not found' })
  }
  res.json({ data: property })
})

app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found' })
})

export default app
