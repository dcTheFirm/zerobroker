import { describe, expect, it } from 'vitest'
import request from 'supertest'
import app from './app.js'

describe('ZeroBroker Home API', () => {
  it('returns health info', async () => {
    const response = await request(app).get('/health')
    expect(response.status).toBe(200)
    expect(response.body.service).toBe('zero-broker-home')
  })

  it('returns featured properties', async () => {
    const response = await request(app).get('/api/home/featured')
    expect(response.status).toBe(200)
    expect(response.body.data.length).toBeGreaterThan(0)
  })

  it('returns cities list', async () => {
    const response = await request(app).get('/api/home/cities')
    expect(response.status).toBe(200)
    expect(response.body.data).toContain('Mumbai')
  })
})
