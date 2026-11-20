import { OrderStatus, PaymentMethod, PaymentStatus, Prisma } from '@prisma/client';
import { prisma } from '../config/prisma';
import { ApiError } from '../utils/ApiError';
import { env } from '../config/env';
import { getPaymentProvider } from './paymentService';

export interface CreateOrderInput {
  customerName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  postalCode: string;
  paymentMethod: PaymentMethod;
}

// Creates an order strictly from server-side/database data. Never trusts
// prices, totals, or availability sent from the client. Wrapped in a single
// DB transaction so a failure at any step rolls back everything (no partial
// orders, no stock decremented without a corresponding order, etc).
export async function createOrder(userId: string, input: CreateOrderInput) {
  const cart = await prisma.cart.findUnique({
    where: { userId },
    include: { items: { include: { product: true } } },
  });

  if (!cart || cart.items.length === 0) {
    throw ApiError.badRequest('Your cart is empty');
  }

  // Verify stock & compute authoritative pricing before opening the transaction
  // (still re-checked with fresh reads INSIDE the transaction for correctness
  // under concurrency).
  const order = await prisma.$transaction(async (tx) => {
    let subtotal = 0;
    const itemsData: {
      productId: string;
      productName: string;
      productImage: string | null;
      price: Prisma.Decimal;
      quantity: number;
    }[] = [];

    for (const cartItem of cart.items) {
      // Re-fetch fresh product data inside the transaction to avoid race conditions.
      const product = await tx.product.findUnique({ where: { id: cartItem.productId } });
      if (!product || product.status !== 'ACTIVE') {
        throw ApiError.badRequest(`Product "${cartItem.product.name}" is no longer available`);
      }
      if (product.stock < cartItem.quantity) {
        throw ApiError.badRequest(
          `Insufficient stock for "${product.name}". Only ${product.stock} left.`
        );
      }

      const lineTotal = Number(product.price) * cartItem.quantity;
      subtotal += lineTotal;

      itemsData.push({
        productId: product.id,
        productName: product.name,
        productImage: product.imageUrl,
        price: product.price,
        quantity: cartItem.quantity,
      });
    }

    const shippingFee = subtotal >= env.freeShippingThreshold ? 0 : env.defaultShippingFee;
    const totalAmount = subtotal + shippingFee;

    const createdOrder = await tx.order.create({
      data: {
        userId,
        customerName: input.customerName,
        customerEmail: input.email,
        customerPhone: input.phone,
        shippingAddress: input.address,
        shippingCity: input.city,
        shippingCountry: input.country,
        postalCode: input.postalCode,
        subtotal,
        shippingFee,
        totalAmount,
        paymentMethod: input.paymentMethod,
        orderStatus: OrderStatus.PENDING,
        paymentStatus: PaymentStatus.PENDING,
        items: {
          create: itemsData.map((item) => ({
            productId: item.productId,
            productName: item.productName,
            productImage: item.productImage,
            price: item.price,
            quantity: item.quantity,
          })),
        },
      },
      include: { items: true },
    });

    // Decrement stock for each purchased product.
    for (const item of itemsData) {
      await tx.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } },
      });
    }

    // Clear the cart now that the order has been placed.
    await tx.cartItem.deleteMany({ where: { cartId: cart.id } });

    return createdOrder;
  });

  // Initialize payment intent/record (outside the core DB transaction since it
  // may involve calling an external provider; failure here should not roll
  // back an already-placed order — payment can be retried).
  const provider = getPaymentProvider(input.paymentMethod);
  const paymentResult = await provider.createPaymentIntent(order.id, Number(order.totalAmount));

  const payment = await prisma.payment.create({
    data: {
      orderId: order.id,
      provider: input.paymentMethod,
      status: paymentResult.status,
      amount: order.totalAmount,
      transactionRef: paymentResult.transactionRef,
    },
  });

  if (payment.status !== order.paymentStatus) {
    await prisma.order.update({ where: { id: order.id }, data: { paymentStatus: payment.status } });
  }

  return {
    ...order,
    paymentStatus: payment.status,
    payment,
    paymentClientSecret: paymentResult.clientSecret,
    paymentRedirectUrl: paymentResult.redirectUrl,
  };
}

export async function listOrdersForUser(userId: string, page = 1, limit = 10) {
  const skip = (page - 1) * limit;
  const [items, total] = await prisma.$transaction([
    prisma.order.findMany({
      where: { userId },
      include: { items: true, payment: true },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.order.count({ where: { userId } }),
  ]);
  return { items, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 } };
}

export async function getOrderById(orderId: string, requestingUser: { id: string; role: string }) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: true,
      payment: true,
      user: { select: { id: true, name: true, email: true, phone: true } },
    },
  });
  if (!order) throw ApiError.notFound('Order not found');

  const isOwner = order.userId === requestingUser.id;
  const isAdmin = requestingUser.role === 'ADMIN' || requestingUser.role === 'SUPER_ADMIN';
  if (!isOwner && !isAdmin) {
    throw ApiError.forbidden('You do not have permission to view this order');
  }

  return order;
}

export interface ListAllOrdersParams {
  page?: number;
  limit?: number;
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
  search?: string;
}

export async function listAllOrders(params: ListAllOrdersParams) {
  const page = params.page && params.page > 0 ? params.page : 1;
  const limit = params.limit && params.limit > 0 ? params.limit : 20;
  const skip = (page - 1) * limit;

  const where: Prisma.OrderWhereInput = {};
  if (params.status) where.orderStatus = params.status;
  if (params.paymentStatus) where.paymentStatus = params.paymentStatus;
  if (params.search) {
    where.OR = [
      { customerName: { contains: params.search, mode: 'insensitive' } },
      { customerEmail: { contains: params.search, mode: 'insensitive' } },
      { id: { contains: params.search, mode: 'insensitive' } },
    ];
  }

  const [items, total] = await prisma.$transaction([
    prisma.order.findMany({
      where,
      include: { items: true, payment: true, user: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.order.count({ where }),
  ]);

  return { items, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 } };
}

export async function updateOrderStatus(
  orderId: string,
  data: { orderStatus?: OrderStatus; paymentStatus?: PaymentStatus }
) {
  const order = await prisma.order.findUnique({ where: { id: orderId }, include: { items: true } });
  if (!order) throw ApiError.notFound('Order not found');

  if (data.orderStatus === OrderStatus.CANCELLED && order.orderStatus !== OrderStatus.CANCELLED) {
    // Restock products when an order is cancelled.
    await prisma.$transaction(async (tx) => {
      for (const item of order.items) {
        if (item.productId) {
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { increment: item.quantity } },
          });
        }
      }
      await tx.order.update({ where: { id: orderId }, data });
    });
  } else {
    await prisma.order.update({ where: { id: orderId }, data });
  }

  return prisma.order.findUnique({ where: { id: orderId }, include: { items: true, payment: true } });
}
