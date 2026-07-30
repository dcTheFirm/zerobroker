import { describe, expect, it } from 'vitest'
import request from 'supertest'
import app from './app.js'

describe('ZeroBroker Auth API', () => {
  it('returns health info', async () => {
    const response = await request(app).get('/health')

    expect(response.status).toBe(200)
    expect(response.body.service).toBe('zero-broker-auth')
  })

  it('creates a new user account', async () => {
    const response = await request(app)
      .post('/api/auth/signup')
      .send({ email: 'test@example.com', password: 'password123' })

    expect(response.status).toBe(201)
    expect(response.body.user.email).toBe('test@example.com')
  })

  it('prevents duplicate signups', async () => {
    await request(app)
      .post('/api/auth/signup')
      .send({ email: 'repeat@example.com', password: 'password123' })

    const duplicateResponse = await request(app)
      .post('/api/auth/signup')
      .send({ email: 'repeat@example.com', password: 'password123' })

    expect(duplicateResponse.status).toBe(409)
    expect(duplicateResponse.body.error).toContain('already exists')
  })

  it('authenticates existing users', async () => {
    await request(app)
      .post('/api/auth/signup')
      .send({ email: 'signin@example.com', password: 'password123' })

    const response = await request(app)
      .post('/api/auth/signin')
      .send({ email: 'signin@example.com', password: 'password123' })

    expect(response.status).toBe(200)
    expect(response.body.user.email).toBe('signin@example.com')
  })

  it('rejects invalid credentials', async () => {
    const response = await request(app)
      .post('/api/auth/signin')
      .send({ email: 'unknown@example.com', password: 'wrongpassword' })

    expect(response.status).toBe(401)
  })
})
