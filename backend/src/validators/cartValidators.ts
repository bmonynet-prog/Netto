import { z } from 'zod';

export const addToCartSchema = z.object({
  body: z.object({
    productId: z.string().uuid('Invalid product id'),
    quantity: z.coerce.number().int().min(1).max(999).default(1),
  }),
  query: z.object({}).optional(),
  params: z.object({}).optional(),
});

export const updateCartItemSchema = z.object({
  body: z.object({
    quantity: z.coerce.number().int().min(1).max(999),
  }),
  query: z.object({}).optional(),
  params: z.object({ itemId: z.string().uuid() }),
});
