import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import { z } from 'zod'
import { getCollection } from './db/mongo.js'
import { createBuyProperty, getBuyPropertyById, listBuyProperties } from './services/propertyService.js'
import type { RequestHandler } from 'express'
import path from 'node:path'
import fs from 'node:fs/promises'
import crypto from 'node:crypto'

const app = express()
app.use(helmet())
app.use(cors())
app.use(morgan('dev'))
app.use(express.json())

// Serve uploaded images
const uploadsDir = path.resolve(process.cwd(), 'uploads')
app.use('/uploads', express.static(uploadsDir))

async function ensureUploadsDir() {
  try {
    await fs.mkdir(uploadsDir, { recursive: true })
  } catch (e) {
    // ignore
  }
}

async function saveDataUrlImage(dataUrl: string) {
  const match = dataUrl.match(/^data:(image\/[a-zA-Z0-9+.]+);base64,(.+)$/)
  if (!match) return null
  const mime = match[1]
  const b64 = match[2]
  const ext = mime.split('/')[1]
  const filename = `${crypto.randomUUID()}.${ext}`
  await ensureUploadsDir()
  const buffer = Buffer.from(b64, 'base64')
  const filePath = path.join(uploadsDir, filename)
  await fs.writeFile(filePath, buffer)
  return filename
}

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
  image: z.string().refine((val) => {
    if (typeof val !== 'string') return false
    if (val.startsWith('data:image/')) return true
    try { new URL(val); return true } catch { return false }
  }, { message: 'image must be a URL or a data:image/... base64 string' }),
  tags: z.array(z.string()).optional(),
})

const asyncHandler = (handler: RequestHandler): RequestHandler => (req, res, next) => {
  Promise.resolve(handler(req, res, next)).catch(next)
}

type PropertyRequestDocument = {
  propertyId: string
  listingType: 'buy'
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
    listingType: 'buy',
    requestType,
    payload: payload && typeof payload === 'object' ? payload as Record<string, unknown> : {},
    createdAt: new Date(),
  })
}

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'zero-broker-buy' })
})

app.post('/api/buy/properties', asyncHandler(async (req, res) => {
  const parsed = listingSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid listing details.' })
  }

  let listing = parsed.data
  if (typeof listing.image === 'string' && listing.image.startsWith('data:image/')) {
    const filename = await saveDataUrlImage(listing.image)
    if (filename) {
      const host = req.get('host')
      const proto = req.protocol
      listing = { ...listing, image: `${proto}://${host}/uploads/${filename}` }
    }
  }

  const property = await createBuyProperty(listing)
  return res.status(201).json({ data: property, message: 'Buy property listing submitted successfully.' })
}))

app.post('/api/buy/properties/:id/contact', asyncHandler(async (req, res) => {
  await savePropertyRequest(String(req.params.id), 'contact', req.body)
  return res.status(200).json({ message: 'Contact request received. The owner will reach out shortly.' })
}))

app.post('/api/buy/properties/:id/visit', asyncHandler(async (req, res) => {
  await savePropertyRequest(String(req.params.id), 'visit', req.body)
  return res.status(200).json({ message: 'Visit request received. The owner will contact you to confirm the schedule.' })
}))

app.get('/api/buy/properties', asyncHandler(async (req, res) => {
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
  res.json(await listBuyProperties(filters, page, limit))
}))

app.get('/api/buy/properties/:id', asyncHandler(async (req, res) => {
  const property = await getBuyPropertyById(String(req.params.id))
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
