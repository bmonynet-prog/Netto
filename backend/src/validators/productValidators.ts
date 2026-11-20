import { z } from 'zod';

export const createProductSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2).max(200),
    description: z.string().trim().min(5).max(5000),
    price: z.coerce.number().positive('Price must be greater than 0'),
    stock: z.coerce.number().int().min(0, 'Stock cannot be negative'),
    categoryId: z.string().uuid('Invalid category id'),
    imageUrl: z.string().trim().url().optional().or(z.literal('')),
    status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
  }),
  query: z.object({}).optional(),
  params: z.object({}).optional(),
});

export const updateProductSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2).max(200).optional(),
    description: z.string().trim().min(5).max(5000).optional(),
    price: z.coerce.number().positive().optional(),
    stock: z.coerce.number().int().min(0).optional(),
    categoryId: z.string().uuid().optional(),
    imageUrl: z.string().trim().url().optional().or(z.literal('')),
    status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
  }),
  query: z.object({}).optional(),
  params: z.object({ id: z.string().uuid() }),
});

export const listProductsQuerySchema = z.object({
  body: z.object({}).optional(),
  query: z.object({
    search: z.string().trim().optional(),
    category: z.string().trim().optional(),
    minPrice: z.coerce.number().optional(),
    maxPrice: z.coerce.number().optional(),
    sort: z.enum(['newest', 'price_asc', 'price_desc', 'name_asc', 'name_desc', 'popular']).optional(),
    page: z.coerce.number().int().min(1).optional(),
    limit: z.coerce.number().int().min(1).max(100).optional(),
    status: z.enum(['ACTIVE', 'INACTIVE', 'ALL']).optional(),
  }),
  params: z.object({}).optional(),
});

export const createReviewSchema = z.object({
  body: z.object({
    rating: z.coerce.number().int().min(1).max(5),
    comment: z.string().trim().max(2000).optional(),
  }),
  query: z.object({}).optional(),
  params: z.object({ productId: z.string().uuid() }),
});
