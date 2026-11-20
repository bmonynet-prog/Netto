import { Prisma, ProductStatus } from '@prisma/client';
import slugify from 'slugify';
import { prisma } from '../config/prisma';
import { ApiError } from '../utils/ApiError';

export interface ListProductsParams {
  search?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: 'newest' | 'price_asc' | 'price_desc' | 'name_asc' | 'name_desc' | 'popular';
  page?: number;
  limit?: number;
  status?: 'ACTIVE' | 'INACTIVE' | 'ALL';
  includeInactive?: boolean; // for admin usage
}

async function generateUniqueSlug(name: string, excludeId?: string): Promise<string> {
  const base = slugify(name, { lower: true, strict: true });
  let slug = base;
  let counter = 1;
  // Ensure uniqueness in DB
  while (true) {
    const existing = await prisma.product.findUnique({ where: { slug } });
    if (!existing || existing.id === excludeId) break;
    slug = `${base}-${counter}`;
    counter += 1;
  }
  return slug;
}

export async function listProducts(params: ListProductsParams) {
  const page = params.page && params.page > 0 ? params.page : 1;
  const limit = params.limit && params.limit > 0 ? params.limit : 12;
  const skip = (page - 1) * limit;

  const where: Prisma.ProductWhereInput = {};

  if (!params.includeInactive) {
    where.status = ProductStatus.ACTIVE;
  } else if (params.status && params.status !== 'ALL') {
    where.status = params.status as ProductStatus;
  }

  if (params.search) {
    where.OR = [
      { name: { contains: params.search, mode: 'insensitive' } },
      { description: { contains: params.search, mode: 'insensitive' } },
    ];
  }

  if (params.category) {
    where.category = { slug: params.category };
  }

  if (params.minPrice !== undefined || params.maxPrice !== undefined) {
    where.price = {};
    if (params.minPrice !== undefined) where.price.gte = params.minPrice;
    if (params.maxPrice !== undefined) where.price.lte = params.maxPrice;
  }

  let orderBy: Prisma.ProductOrderByWithRelationInput = { createdAt: 'desc' };
  switch (params.sort) {
    case 'price_asc':
      orderBy = { price: 'asc' };
      break;
    case 'price_desc':
      orderBy = { price: 'desc' };
      break;
    case 'name_asc':
      orderBy = { name: 'asc' };
      break;
    case 'name_desc':
      orderBy = { name: 'desc' };
      break;
    case 'newest':
    default:
      orderBy = { createdAt: 'desc' };
  }

  const [items, total] = await prisma.$transaction([
    prisma.product.findMany({
      where,
      orderBy,
      skip,
      take: limit,
      include: {
        category: true,
        reviews: { select: { rating: true } },
      },
    }),
    prisma.product.count({ where }),
  ]);

  const enriched = items.map((p) => {
    const ratingCount = p.reviews.length;
    const avgRating = ratingCount > 0 ? p.reviews.reduce((s, r) => s + r.rating, 0) / ratingCount : 0;
    const { reviews, ...rest } = p;
    return { ...rest, avgRating: Math.round(avgRating * 10) / 10, ratingCount };
  });

  return {
    items: enriched,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    },
  };
}

export async function getProductById(id: string) {
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      category: true,
      reviews: {
        include: { user: { select: { id: true, name: true } } },
        orderBy: { createdAt: 'desc' },
      },
    },
  });
  if (!product) throw ApiError.notFound('Product not found');

  const ratingCount = product.reviews.length;
  const avgRating = ratingCount > 0 ? product.reviews.reduce((s, r) => s + r.rating, 0) / ratingCount : 0;

  return { ...product, avgRating: Math.round(avgRating * 10) / 10, ratingCount };
}

export async function getProductBySlug(slug: string) {
  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      category: true,
      reviews: {
        include: { user: { select: { id: true, name: true } } },
        orderBy: { createdAt: 'desc' },
      },
    },
  });
  if (!product) throw ApiError.notFound('Product not found');

  const ratingCount = product.reviews.length;
  const avgRating = ratingCount > 0 ? product.reviews.reduce((s, r) => s + r.rating, 0) / ratingCount : 0;

  return { ...product, avgRating: Math.round(avgRating * 10) / 10, ratingCount };
}

export interface CreateProductInput {
  name: string;
  description: string;
  price: number;
  stock: number;
  categoryId: string;
  imageUrl?: string;
  status?: ProductStatus;
}

export async function createProduct(input: CreateProductInput) {
  const category = await prisma.category.findUnique({ where: { id: input.categoryId } });
  if (!category) throw ApiError.badRequest('Category does not exist');

  const slug = await generateUniqueSlug(input.name);

  const product = await prisma.product.create({
    data: {
      name: input.name,
      slug,
      description: input.description,
      price: input.price,
      stock: input.stock,
      categoryId: input.categoryId,
      imageUrl: input.imageUrl || null,
      status: input.status || ProductStatus.ACTIVE,
    },
    include: { category: true },
  });
  return product;
}

export interface UpdateProductInput {
  name?: string;
  description?: string;
  price?: number;
  stock?: number;
  categoryId?: string;
  imageUrl?: string;
  status?: ProductStatus;
}

export async function updateProduct(id: string, input: UpdateProductInput) {
  const existing = await prisma.product.findUnique({ where: { id } });
  if (!existing) throw ApiError.notFound('Product not found');

  if (input.categoryId) {
    const category = await prisma.category.findUnique({ where: { id: input.categoryId } });
    if (!category) throw ApiError.badRequest('Category does not exist');
  }

  const data: Prisma.ProductUpdateInput = { ...input };
  if (input.name && input.name !== existing.name) {
    data.slug = await generateUniqueSlug(input.name, id);
  }

  const product = await prisma.product.update({ where: { id }, data, include: { category: true } });
  return product;
}

export async function deleteProduct(id: string) {
  const existing = await prisma.product.findUnique({ where: { id } });
  if (!existing) throw ApiError.notFound('Product not found');

  const orderItemCount = await prisma.orderItem.count({ where: { productId: id } });
  if (orderItemCount > 0) {
    // Preserve historical order data integrity: never hard-delete a product
    // that appears in existing orders. Deactivate it instead.
    await prisma.product.update({ where: { id }, data: { status: ProductStatus.INACTIVE } });
    return { softDeleted: true, message: 'Product referenced by existing orders; marked as inactive instead of deleted.' };
  }

  await prisma.$transaction([
    prisma.cartItem.deleteMany({ where: { productId: id } }),
    prisma.wishlistItem.deleteMany({ where: { productId: id } }),
    prisma.review.deleteMany({ where: { productId: id } }),
    prisma.product.delete({ where: { id } }),
  ]);
  return { softDeleted: false, message: 'Product deleted successfully' };
}
