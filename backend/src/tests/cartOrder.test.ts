import request from 'supertest';
import bcrypt from 'bcryptjs';
import { createApp } from '../app';
import { prisma } from '../config/prisma';

const app = createApp();

describe('Cart & Order flow', () => {
  let userToken: string;
  let userId: string;
  let categoryId: string;
  let productId: string;
  let orderId: string;
  const userEmail = `cart_test_${Date.now()}@example.com`;

  beforeAll(async () => {
    const passwordHash = await bcrypt.hash('CustomerPass123', 12);
    const user = await prisma.user.create({
      data: { name: 'Cart Test User', email: userEmail, passwordHash, role: 'CUSTOMER' },
    });
    userId = user.id;
    await prisma.cart.create({ data: { userId: user.id } });

    const loginRes = await request(app).post('/api/auth/login').send({ email: userEmail, password: 'CustomerPass123' });
    userToken = loginRes.body.data.token;

    const category = await prisma.category.create({
      data: { name: `CartCat_${Date.now()}`, slug: `cartcat-${Date.now()}` },
    });
    categoryId = category.id;

    const product = await prisma.product.create({
      data: {
        name: 'Cart Test Product',
        slug: `cart-test-product-${Date.now()}`,
        description: 'A product for cart testing',
        price: 20,
        stock: 5,
        categoryId,
      },
    });
    productId = product.id;
  });

  afterAll(async () => {
    await prisma.orderItem.deleteMany({ where: { productId } });
    await prisma.order.deleteMany({ where: { userId } });
    await prisma.cartItem.deleteMany({ where: { product: { id: productId } } });
    await prisma.product.deleteMany({ where: { id: productId } });
    await prisma.category.deleteMany({ where: { id: categoryId } });
    await prisma.cart.deleteMany({ where: { userId } });
    await prisma.user.deleteMany({ where: { id: userId } });
    await prisma.$disconnect();
  });

  it('adds an item to the cart', async () => {
    const res = await request(app)
      .post('/api/cart')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ productId, quantity: 2 });
    expect(res.status).toBe(201);
    expect(res.body.data.items).toHaveLength(1);
    expect(res.body.data.items[0].quantity).toBe(2);
  });

  it('rejects adding more than available stock', async () => {
    const res = await request(app)
      .post('/api/cart')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ productId, quantity: 999 });
    expect(res.status).toBe(400);
  });

  it('fetches the current cart with computed totals', async () => {
    const res = await request(app).get('/api/cart').set('Authorization', `Bearer ${userToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.subtotal).toBe(40); // 20 * 2
  });

  it('creates an order from the cart and decrements stock', async () => {
    const res = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        customerName: 'Cart Test User',
        email: userEmail,
        phone: '+15551112222',
        address: '1 Test Way',
        city: 'Testopia',
        country: 'USA',
        postalCode: '00000',
        paymentMethod: 'COD',
      });
    expect(res.status).toBe(201);
    expect(res.body.data.items).toHaveLength(1);
    orderId = res.body.data.id;

    const product = await prisma.product.findUnique({ where: { id: productId } });
    expect(product?.stock).toBe(3); // 5 - 2

    const cartRes = await request(app).get('/api/cart').set('Authorization', `Bearer ${userToken}`);
    expect(cartRes.body.data.items).toHaveLength(0); // cart cleared
  });

  it('rejects checkout when the cart is empty', async () => {
    const res = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        customerName: 'Cart Test User',
        email: userEmail,
        phone: '+15551112222',
        address: '1 Test Way',
        city: 'Testopia',
        country: 'USA',
        postalCode: '00000',
        paymentMethod: 'COD',
      });
    expect(res.status).toBe(400);
  });

  it('retrieves the created order for its owner', async () => {
    const res = await request(app).get(`/api/orders/${orderId}`).set('Authorization', `Bearer ${userToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe(orderId);
  });

  it('prevents a customer from updating order status (admin only)', async () => {
    const res = await request(app)
      .put(`/api/orders/${orderId}/status`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ orderStatus: 'CONFIRMED' });
    expect(res.status).toBe(403);
  });
});
