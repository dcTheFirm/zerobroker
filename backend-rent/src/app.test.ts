import { describe, expect, it } from 'vitest'
import request from 'supertest'
import app from './app.js'

describe('ZeroBroker Rent API', () => {
  it('returns health info', async () => {
    const response = await request(app).get('/health')
    expect(response.status).toBe(200)
    expect(response.body.service).toBe('zero-broker-rent')
  })

  it('returns rent listings', async () => {
    const response = await request(app).get('/api/rent/properties')
    expect(response.status).toBe(200)
    expect(response.body.data.every((property: any) => property.type === 'rent')).toBe(true)
  })

  it('returns a rent property by id', async () => {
    const response = await request(app).get('/api/rent/properties/1')
    expect(response.status).toBe(200)
    expect(response.body.data.id).toBe('1')
  })
})
