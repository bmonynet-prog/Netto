import request from 'supertest';
import { createApp } from '../app';
import { prisma } from '../config/prisma';

const app = createApp();

describe('Product API', () => {
  let adminToken: string;
  let categoryId: string;
  let productId: string;
  const adminEmail = `admin_test_${Date.now()}@example.com`;

  beforeAll(async () => {
    // Create an admin user directly for testing admin-only endpoints.
    const bcrypt = require('bcryptjs');
    const passwordHash = await bcrypt.hash('AdminPass123', 12);
    const admin = await prisma.user.create({
      data: { name: 'Test Admin', email: adminEmail, passwordHash, role: 'ADMIN' },
    });
    const loginRes = await request(app).post('/api/auth/login').send({ email: adminEmail, password: 'AdminPass123' });
    adminToken = loginRes.body.data.token;

    const category = await prisma.category.create({
      data: { name: `TestCat_${Date.now()}`, slug: `testcat-${Date.now()}` },
    });
    categoryId = category.id;
  });

  afterAll(async () => {
    if (productId) await prisma.product.deleteMany({ where: { id: productId } });
    await prisma.category.deleteMany({ where: { id: categoryId } });
    await prisma.user.deleteMany({ where: { email: adminEmail } });
    await prisma.$disconnect();
  });

  it('lists products publicly without authentication', async () => {
    const res = await request(app).get('/api/products');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('rejects product creation without authentication', async () => {
    const res = await request(app).post('/api/products').send({
      name: 'Unauthorized Product', description: 'test', price: 10, stock: 5, categoryId,
    });
    expect(res.status).toBe(401);
  });

  it('allows an admin to create a product', async () => {
    const res = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Test Product', description: 'A great test product', price: 25.5, stock: 10, categoryId });
    expect(res.status).toBe(201);
    expect(res.body.data.name).toBe('Test Product');
    expect(res.body.data.slug).toBeDefined();
    productId = res.body.data.id;
  });

  it('rejects invalid product payloads', async () => {
    const res = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'x', description: 'short', price: -5, stock: -1, categoryId });
    expect(res.status).toBe(422);
  });

  it('retrieves a product by id', async () => {
    const res = await request(app).get(`/api/products/${productId}`);
    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe(productId);
  });

  it('allows an admin to update a product', async () => {
    const res = await request(app)
      .put(`/api/products/${productId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ price: 30, stock: 20 });
    expect(res.status).toBe(200);
    expect(Number(res.body.data.price)).toBe(30);
    expect(res.body.data.stock).toBe(20);
  });
});
