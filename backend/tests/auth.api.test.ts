import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app';

describe('Auth API', () => {
  const app = createApp();
  const email = `auth-api-test-${Date.now()}@example.com`;
  const password = 'password123';

  it('POST /api/v1/auth/register creates an account and returns a token', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ name: 'Auth Tester', email, password });

    expect(res.status).toBe(201);
    expect(res.body.data.user).toMatchObject({ name: 'Auth Tester', email });
    expect(res.body.data.user).not.toHaveProperty('password');
    expect(typeof res.body.data.token).toBe('string');
  });

  it('POST /api/v1/auth/register rejects a duplicate email', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ name: 'Duplicate', email, password });

    expect(res.status).toBe(409);
  });

  it('POST /api/v1/auth/register rejects a weak password', async () => {
    const res = await request(app).post('/api/v1/auth/register').send({
      name: 'Weak Password',
      email: `weak-${Date.now()}@example.com`,
      password: '123',
    });

    expect(res.status).toBe(400);
  });

  it('POST /api/v1/auth/login succeeds with correct credentials', async () => {
    const res = await request(app).post('/api/v1/auth/login').send({ email, password });
    expect(res.status).toBe(200);
    expect(typeof res.body.data.token).toBe('string');
  });

  it('POST /api/v1/auth/login rejects an incorrect password', async () => {
    const res = await request(app).post('/api/v1/auth/login').send({ email, password: 'wrong-password' });
    expect(res.status).toBe(401);
  });

  it('POST /api/v1/auth/login rejects an unknown email', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'nobody@example.com', password });
    expect(res.status).toBe(401);
  });

  it('GET /api/v1/auth/me returns the current user when authenticated', async () => {
    const login = await request(app).post('/api/v1/auth/login').send({ email, password });
    const res = await request(app)
      .get('/api/v1/auth/me')
      .set({ Authorization: `Bearer ${login.body.data.token}` });

    expect(res.status).toBe(200);
    expect(res.body.data.email).toBe(email);
  });

  it('GET /api/v1/auth/me rejects a missing token', async () => {
    const res = await request(app).get('/api/v1/auth/me');
    expect(res.status).toBe(401);
  });

  it('GET /api/v1/auth/me rejects a malformed token', async () => {
    const res = await request(app).get('/api/v1/auth/me').set({ Authorization: 'Bearer not-a-real-token' });
    expect(res.status).toBe(401);
  });
});