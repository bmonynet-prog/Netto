import { prisma } from '../config/prisma';
import { ApiError } from '../utils/ApiError';

export async function createReview(userId: string, productId: string, rating: number, comment?: string) {
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) throw ApiError.notFound('Product not found');

  // Optional but good practice: only allow reviews from users who purchased the product.
  const hasPurchased = await prisma.orderItem.findFirst({
    where: { productId, order: { userId, orderStatus: { in: ['DELIVERED', 'SHIPPED', 'CONFIRMED', 'PROCESSING'] } } },
  });
  if (!hasPurchased) {
    throw ApiError.forbidden('You can only review products you have purchased');
  }

  const existing = await prisma.review.findUnique({ where: { userId_productId: { userId, productId } } });
  if (existing) {
    return prisma.review.update({
      where: { id: existing.id },
      data: { rating, comment },
      include: { user: { select: { id: true, name: true } } },
    });
  }

  return prisma.review.create({
    data: { userId, productId, rating, comment },
    include: { user: { select: { id: true, name: true } } },
  });
}

export async function deleteReview(userId: string, reviewId: string, isAdmin: boolean) {
  const review = await prisma.review.findUnique({ where: { id: reviewId } });
  if (!review) throw ApiError.notFound('Review not found');
  if (review.userId !== userId && !isAdmin) {
    throw ApiError.forbidden('You cannot delete this review');
  }
  await prisma.review.delete({ where: { id: reviewId } });
  return { message: 'Review deleted' };
}

export async function listReviewsForAdmin(page = 1, limit = 20) {
  const skip = (page - 1) * limit;
  const [items, total] = await prisma.$transaction([
    prisma.review.findMany({
      include: { user: { select: { id: true, name: true, email: true } }, product: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.review.count(),
  ]);
  return { items, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 } };
}
