import { Prisma, ProductStatus } from '@prisma/client';
import { prisma } from '../config/prisma';
import { ApiError } from '../utils/ApiError';
import { env } from '../config/env';

async function getOrCreateCart(userId: string) {
  let cart = await prisma.cart.findUnique({ where: { userId } });
  if (!cart) {
    cart = await prisma.cart.create({ data: { userId } });
  }
  return cart;
}

function computeTotals(items: { quantity: number; product: { price: Prisma.Decimal } }[]) {
  const subtotal = items.reduce((sum, item) => sum + Number(item.product.price) * item.quantity, 0);
  const shippingFee = items.length === 0 || subtotal >= env.freeShippingThreshold ? 0 : env.defaultShippingFee;
  const total = subtotal + shippingFee;
  return {
    subtotal: Math.round(subtotal * 100) / 100,
    shippingFee: Math.round(shippingFee * 100) / 100,
    total: Math.round(total * 100) / 100,
  };
}

export async function getCart(userId: string) {
  const cart = await getOrCreateCart(userId);
  const items = await prisma.cartItem.findMany({
    where: { cartId: cart.id },
    include: { product: { include: { category: true } } },
    orderBy: { createdAt: 'asc' },
  });

  const totals = computeTotals(items);
  return { id: cart.id, items, ...totals };
}

export async function addItemToCart(userId: string, productId: string, quantity: number) {
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product || product.status !== ProductStatus.ACTIVE) {
    throw ApiError.notFound('Product not found or unavailable');
  }

  const cart = await getOrCreateCart(userId);
  const existingItem = await prisma.cartItem.findUnique({
    where: { cartId_productId: { cartId: cart.id, productId } },
  });

  const desiredQuantity = (existingItem?.quantity || 0) + quantity;
  if (desiredQuantity > product.stock) {
    throw ApiError.badRequest(
      `Only ${product.stock} unit(s) of "${product.name}" available in stock`
    );
  }

  if (existingItem) {
    await prisma.cartItem.update({
      where: { id: existingItem.id },
      data: { quantity: desiredQuantity },
    });
  } else {
    await prisma.cartItem.create({ data: { cartId: cart.id, productId, quantity } });
  }

  return getCart(userId);
}

export async function updateCartItemQuantity(userId: string, itemId: string, quantity: number) {
  const cart = await getOrCreateCart(userId);
  const item = await prisma.cartItem.findUnique({ where: { id: itemId }, include: { product: true } });
  if (!item || item.cartId !== cart.id) {
    throw ApiError.notFound('Cart item not found');
  }
  if (quantity > item.product.stock) {
    throw ApiError.badRequest(`Only ${item.product.stock} unit(s) of "${item.product.name}" available in stock`);
  }

  await prisma.cartItem.update({ where: { id: itemId }, data: { quantity } });
  return getCart(userId);
}

export async function removeCartItem(userId: string, itemId: string) {
  const cart = await getOrCreateCart(userId);
  const item = await prisma.cartItem.findUnique({ where: { id: itemId } });
  if (!item || item.cartId !== cart.id) {
    throw ApiError.notFound('Cart item not found');
  }
  await prisma.cartItem.delete({ where: { id: itemId } });
  return getCart(userId);
}

export async function clearCart(userId: string) {
  const cart = await getOrCreateCart(userId);
  await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
  return getCart(userId);
}
