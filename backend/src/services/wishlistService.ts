import { prisma } from '../config/prisma';
import { ApiError } from '../utils/ApiError';

export async function getWishlist(userId: string) {
  return prisma.wishlistItem.findMany({
    where: { userId },
    include: { product: { include: { category: true } } },
    orderBy: { createdAt: 'desc' },
  });
}

export async function addToWishlist(userId: string, productId: string) {
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) throw ApiError.notFound('Product not found');

  const existing = await prisma.wishlistItem.findUnique({
    where: { userId_productId: { userId, productId } },
  });
  if (existing) return existing;

  return prisma.wishlistItem.create({ data: { userId, productId } });
}

export async function removeFromWishlist(userId: string, productId: string) {
  const existing = await prisma.wishlistItem.findUnique({
    where: { userId_productId: { userId, productId } },
  });
  if (!existing) throw ApiError.notFound('Item not found in wishlist');
  await prisma.wishlistItem.delete({ where: { id: existing.id } });
  return { message: 'Removed from wishlist' };
}
