import { describe, expect, it } from 'vitest'
import request from 'supertest'
import app from './app.js'

describe('ZeroBroker Search API', () => {
  it('returns health info', async () => {
    const response = await request(app).get('/health')
    expect(response.status).toBe(200)
    expect(response.body.service).toBe('zero-broker-search')
  })

  it('returns results for search queries', async () => {
    const response = await request(app).get('/api/search').query({ city: 'Mumbai' })
    expect(response.status).toBe(200)
    expect(response.body.data.every((property: any) => property.city === 'Mumbai')).toBe(true)
  })

  it('returns property details by id', async () => {
    const response = await request(app).get('/api/search').query({ id: '3' })
    expect(response.status).toBe(200)
    expect(response.body.data.id).toBe('3')
  })
})
