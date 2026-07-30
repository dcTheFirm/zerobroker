import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import { properties, cities } from './data/properties.js'

const app = express()
app.use(helmet())
app.use(cors())
app.use(morgan('dev'))
app.use(express.json())

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'zero-broker-home' })
})

app.get('/api/home/featured', (req, res) => {
  const limit = Number(String(req.query.limit ?? '4')) || 4
  const featured = properties.filter((property) => property.featured).slice(0, limit)
  res.json({ data: featured })
})

app.get('/api/home/cities', (_req, res) => {
  res.json({ data: cities })
})

app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found' })
})

export default app
