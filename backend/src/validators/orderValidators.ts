import { z } from 'zod';

export const createOrderSchema = z.object({
  body: z.object({
    customerName: z.string().trim().min(2).max(150),
    email: z.string().trim().toLowerCase().email(),
    phone: z.string().trim().min(5).max(30),
    address: z.string().trim().min(3).max(300),
    city: z.string().trim().min(1).max(150),
    country: z.string().trim().min(1).max(150),
    postalCode: z.string().trim().min(1).max(30),
    paymentMethod: z.enum(['STRIPE', 'ABA_PAY', 'COD']).default('COD'),
  }),
  query: z.object({}).optional(),
  params: z.object({}).optional(),
});

export const updateOrderStatusSchema = z.object({
  body: z.object({
    orderStatus: z.enum(['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED']).optional(),
    paymentStatus: z.enum(['PENDING', 'PAID', 'FAILED', 'REFUNDED']).optional(),
  }).refine((data) => data.orderStatus || data.paymentStatus, {
    message: 'At least one of orderStatus or paymentStatus must be provided',
  }),
  query: z.object({}).optional(),
  params: z.object({ id: z.string().uuid() }),
});
