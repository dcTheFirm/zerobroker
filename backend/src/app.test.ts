import { describe, expect, it } from 'vitest'
import request from 'supertest'
import app from './app.js'

describe('ZeroBroker API', () => {
  it('returns health info', async () => {
    const response = await request(app).get('/health')

    expect(response.status).toBe(200)
    expect(response.body.service).toBe('zero-broker-backend')
  })

  it('returns featured properties', async () => {
    const response = await request(app).get('/api/properties/featured')

    expect(response.status).toBe(200)
    expect(response.body.data.length).toBeGreaterThan(0)
  })

  it('filters by city and type', async () => {
    const response = await request(app).get('/api/properties').query({ city: 'Mumbai', type: 'rent' })

    expect(response.status).toBe(200)
    expect(response.body.data.every((property: { city: string; type: string }) => property.city === 'Mumbai' && property.type === 'rent')).toBe(true)
  })

  it('returns 404 for missing property', async () => {
    const response = await request(app).get('/api/properties/does-not-exist')

    expect(response.status).toBe(404)
  })
})
