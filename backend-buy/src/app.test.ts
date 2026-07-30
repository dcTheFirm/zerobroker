import { describe, expect, it } from 'vitest'
import request from 'supertest'
import app from './app.js'

describe('ZeroBroker Buy API', () => {
  it('returns health info', async () => {
    const response = await request(app).get('/health')
    expect(response.status).toBe(200)
    expect(response.body.service).toBe('zero-broker-buy')
  })

  it('returns buy listings', async () => {
    const response = await request(app).get('/api/buy/properties')
    expect(response.status).toBe(200)
    expect(response.body.data.every((property: any) => property.type === 'buy')).toBe(true)
  })

  it('returns a buy property by id', async () => {
    const response = await request(app).get('/api/buy/properties/3')
    expect(response.status).toBe(200)
    expect(response.body.data.id).toBe('3')
  })
})
