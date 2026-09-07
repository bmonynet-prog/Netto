import request from 'supertest';
import { createApp } from '../app';
import { prisma } from '../config/prisma';

const app = createApp();

describe('Auth API', () => {
  const testEmail = `test_${Date.now()}@example.com`;

  afterAll(async () => {
    await prisma.user.deleteMany({ where: { email: testEmail } });
    await prisma.$disconnect();
  });

  it('registers a new user successfully', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Test User',
      email: testEmail,
      password: 'Password123',
    });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe(testEmail);
    expect(res.body.data.token).toBeDefined();
    expect(res.body.data.user.passwordHash).toBeUndefined();
  });

  it('rejects registration with a weak password', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Weak Pass',
      email: `weak_${Date.now()}@example.com`,
      password: '123',
    });
    expect(res.status).toBe(422);
    expect(res.body.success).toBe(false);
  });

  it('rejects duplicate email registration', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Duplicate',
      email: testEmail,
      password: 'Password123',
    });
    expect(res.status).toBe(409);
  });

  it('logs in with correct credentials', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: testEmail,
      password: 'Password123',
    });
    expect(res.status).toBe(200);
    expect(res.body.data.token).toBeDefined();
  });

  it('rejects login with wrong password', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: testEmail,
      password: 'WrongPassword',
    });
    expect(res.status).toBe(401);
  });

  it('returns the current user with a valid token', async () => {
    const loginRes = await request(app).post('/api/auth/login').send({
      email: testEmail,
      password: 'Password123',
    });
    const token = loginRes.body.data.token;
    const res = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.data.email).toBe(testEmail);
  });

  it('rejects /me without a token', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });
});
