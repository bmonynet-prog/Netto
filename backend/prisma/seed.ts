/* eslint-disable no-console */
import { PrismaClient, Role, OrderStatus, PaymentStatus, PaymentMethod } from '@prisma/client';
import bcrypt from 'bcryptjs';
import slugify from 'slugify';

const prisma = new PrismaClient();

async function hash(pw: string) {
  return bcrypt.hash(pw, 12);
}

async function main() {
  console.log('🌱 Seeding database...');

  // ---------------------------------------------------------------------
  // Users
  // ---------------------------------------------------------------------
  const adminPassword = await hash('Admin@12345');
  const admin = await prisma.user.upsert({
    where: { email: 'admin@shopdemo.com' },
    update: {},
    create: {
      name: 'Store Admin',
      email: 'admin@shopdemo.com',
      passwordHash: adminPassword,
      role: Role.SUPER_ADMIN,
    },
  });

  const customerPassword = await hash('Customer@123');
  const customers = [];
  for (let i = 1; i <= 3; i++) {
    const customer = await prisma.user.upsert({
      where: { email: `customer${i}@example.com` },
      update: {},
      create: {
        name: `Demo Customer ${i}`,
        email: `customer${i}@example.com`,
        passwordHash: customerPassword,
        role: Role.CUSTOMER,
        phone: `+1555000000${i}`,
      },
    });
    await prisma.cart.upsert({
      where: { userId: customer.id },
      update: {},
      create: { userId: customer.id },
    });
    customers.push(customer);
  }

  // ---------------------------------------------------------------------
  // Categories
  // ---------------------------------------------------------------------
  const categoryNames = ['Electronics', 'Clothing', 'Shoes', 'Accessories', 'Beauty', 'Home'];
  const categories = [];
  for (const name of categoryNames) {
    const category = await prisma.category.upsert({
      where: { name },
      update: {},
      create: {
        name,
        slug: slugify(name, { lower: true, strict: true }),
        description: `${name} products for every need`,
      },
    });
    categories.push(category);
  }

  const catBy = (name: string) => categories.find((c) => c.name === name)!;

  // ---------------------------------------------------------------------
  // Products
  // ---------------------------------------------------------------------
  const productsData = [
    { name: 'Wireless Bluetooth Headphones', category: 'Electronics', price: 79.99, stock: 50, description: 'Premium over-ear wireless headphones with active noise cancellation and 30-hour battery life.', imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800' },
    { name: 'Smart Watch Series 5', category: 'Electronics', price: 199.99, stock: 30, description: 'Track your fitness, heart rate, and notifications with this sleek smart watch.', imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800' },
    { name: '4K Action Camera', category: 'Electronics', price: 149.99, stock: 25, description: 'Waterproof 4K action camera perfect for adventure and sports recording.', imageUrl: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800' },
    { name: 'Portable Bluetooth Speaker', category: 'Electronics', price: 45.99, stock: 60, description: 'Compact speaker with rich bass and 12-hour playtime, splash resistant.', imageUrl: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=800' },

    { name: "Men's Classic Denim Jacket", category: 'Clothing', price: 59.99, stock: 40, description: 'Durable denim jacket with a timeless classic fit, perfect for all seasons.', imageUrl: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800' },
    { name: "Women's Summer Floral Dress", category: 'Clothing', price: 39.99, stock: 45, description: 'Lightweight floral dress ideal for summer days and casual outings.', imageUrl: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800' },
    { name: 'Cotton Crew Neck T-Shirt', category: 'Clothing', price: 14.99, stock: 100, description: 'Soft, breathable 100% cotton t-shirt available in multiple colors.', imageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800' },
    { name: 'Slim Fit Chino Pants', category: 'Clothing', price: 44.99, stock: 55, description: 'Comfortable slim-fit chinos suitable for both casual and semi-formal wear.', imageUrl: 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=800' },

    { name: 'Running Shoes Pro', category: 'Shoes', price: 89.99, stock: 35, description: 'Lightweight running shoes with responsive cushioning for daily training.', imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800' },
    { name: 'Classic Leather Sneakers', category: 'Shoes', price: 74.99, stock: 40, description: 'Timeless leather sneakers that pair well with any casual outfit.', imageUrl: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800' },
    { name: 'Hiking Boots Waterproof', category: 'Shoes', price: 109.99, stock: 20, description: 'Rugged waterproof hiking boots built for tough outdoor terrain.', imageUrl: 'https://images.unsplash.com/photo-1520639888713-7851133b1ed0?w=800' },

    { name: 'Leather Wallet', category: 'Accessories', price: 29.99, stock: 70, description: 'Genuine leather bifold wallet with RFID protection.', imageUrl: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=800' },
    { name: 'Aviator Sunglasses', category: 'Accessories', price: 24.99, stock: 65, description: 'Classic aviator sunglasses with UV400 protection.', imageUrl: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800' },
    { name: 'Stainless Steel Watch', category: 'Accessories', price: 129.99, stock: 25, description: 'Elegant stainless steel wristwatch with a minimalist dial.', imageUrl: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=800' },

    { name: 'Vitamin C Serum', category: 'Beauty', price: 19.99, stock: 80, description: 'Brightening vitamin C serum to even skin tone and boost radiance.', imageUrl: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800' },
    { name: 'Moisturizing Face Cream', category: 'Beauty', price: 22.99, stock: 75, description: 'Deeply hydrating face cream suitable for all skin types.', imageUrl: 'https://images.unsplash.com/photo-1570194065650-d99fb4b8ccb0?w=800' },
    { name: 'Matte Lipstick Set', category: 'Beauty', price: 27.99, stock: 50, description: 'Long-lasting matte lipstick set in 6 vibrant shades.', imageUrl: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=800' },

    { name: 'Ceramic Dinnerware Set', category: 'Home', price: 69.99, stock: 30, description: '16-piece ceramic dinnerware set for everyday use and entertaining.', imageUrl: 'https://images.unsplash.com/photo-1603199506016-b9a594b593c0?w=800' },
    { name: 'Scented Soy Candle', category: 'Home', price: 15.99, stock: 90, description: 'Long-burning soy candle with calming lavender scent.', imageUrl: 'https://images.unsplash.com/photo-1602874801007-bd458bb1b8f6?w=800' },
    { name: 'Cozy Throw Blanket', category: 'Home', price: 34.99, stock: 45, description: 'Ultra-soft throw blanket perfect for couch or bed.', imageUrl: 'https://images.unsplash.com/photo-1580301762395-83c1a3d1e7f6?w=800' },
  ];

  const products = [];
  for (const p of productsData) {
    const slug = slugify(p.name, { lower: true, strict: true });
    const product = await prisma.product.upsert({
      where: { slug },
      update: {},
      create: {
        name: p.name,
        slug,
        description: p.description,
        price: p.price,
        stock: p.stock,
        imageUrl: p.imageUrl,
        categoryId: catBy(p.category).id,
      },
    });
    products.push(product);
  }

  // ---------------------------------------------------------------------
  // Sample orders (for admin dashboard demo data)
  // ---------------------------------------------------------------------
  const existingOrders = await prisma.order.count();
  if (existingOrders === 0) {
    const sampleStatuses: { orderStatus: OrderStatus; paymentStatus: PaymentStatus }[] = [
      { orderStatus: OrderStatus.DELIVERED, paymentStatus: PaymentStatus.PAID },
      { orderStatus: OrderStatus.SHIPPED, paymentStatus: PaymentStatus.PAID },
      { orderStatus: OrderStatus.PENDING, paymentStatus: PaymentStatus.PENDING },
      { orderStatus: OrderStatus.PROCESSING, paymentStatus: PaymentStatus.PAID },
      { orderStatus: OrderStatus.CONFIRMED, paymentStatus: PaymentStatus.PAID },
    ];

    for (let i = 0; i < sampleStatuses.length; i++) {
      const customer = customers[i % customers.length];
      const product1 = products[i % products.length];
      const product2 = products[(i + 3) % products.length];
      const qty1 = 1 + (i % 3);
      const qty2 = 1;
      const subtotal = Number(product1.price) * qty1 + Number(product2.price) * qty2;
      const shippingFee = subtotal >= 100 ? 0 : 5;
      const totalAmount = subtotal + shippingFee;
      const daysAgo = (sampleStatuses.length - i) * 3;
      const createdAt = new Date();
      createdAt.setDate(createdAt.getDate() - daysAgo);

      const order = await prisma.order.create({
        data: {
          userId: customer.id,
          customerName: customer.name,
          customerEmail: customer.email,
          customerPhone: customer.phone || '+15550000000',
          shippingAddress: '123 Demo Street',
          shippingCity: 'Springfield',
          shippingCountry: 'USA',
          postalCode: '12345',
          subtotal,
          shippingFee,
          totalAmount,
          orderStatus: sampleStatuses[i].orderStatus,
          paymentStatus: sampleStatuses[i].paymentStatus,
          paymentMethod: PaymentMethod.COD,
          createdAt,
          items: {
            create: [
              { productId: product1.id, productName: product1.name, productImage: product1.imageUrl, price: product1.price, quantity: qty1 },
              { productId: product2.id, productName: product2.name, productImage: product2.imageUrl, price: product2.price, quantity: qty2 },
            ],
          },
        },
      });

      await prisma.payment.create({
        data: {
          orderId: order.id,
          provider: PaymentMethod.COD,
          status: sampleStatuses[i].paymentStatus,
          amount: totalAmount,
        },
      });
    }
  }

  // ---------------------------------------------------------------------
  // Sample reviews
  // ---------------------------------------------------------------------
  const reviewSeeds = [
    { productIdx: 0, userIdx: 0, rating: 5, comment: 'Amazing sound quality, very comfortable!' },
    { productIdx: 0, userIdx: 1, rating: 4, comment: 'Great headphones, battery could be better.' },
    { productIdx: 1, userIdx: 2, rating: 5, comment: 'Love this watch, tracks everything accurately.' },
    { productIdx: 4, userIdx: 0, rating: 4, comment: 'Nice jacket, true to size.' },
  ];
  for (const r of reviewSeeds) {
    const product = products[r.productIdx];
    const user = customers[r.userIdx];
    await prisma.review.upsert({
      where: { userId_productId: { userId: user.id, productId: product.id } },
      update: {},
      create: { userId: user.id, productId: product.id, rating: r.rating, comment: r.comment },
    });
  }

  console.log('✅ Seed completed successfully!');
  console.log('\n--- Demo credentials ---');
  console.log('Admin login:    admin@shopdemo.com / Admin@12345');
  console.log('Customer login: customer1@example.com / Customer@123 (also customer2, customer3)');
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
