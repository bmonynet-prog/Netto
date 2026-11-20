import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess } from '../utils/apiResponse';
import * as orderService from '../services/orderService';

export const createOrder = asyncHandler(async (req: Request, res: Response) => {
  const { customerName, email, phone, address, city, country, postalCode, paymentMethod } = req.body;
  const order = await orderService.createOrder(req.user!.id, {
    customerName,
    email,
    phone,
    address,
    city,
    country,
    postalCode,
    paymentMethod,
  });
  sendSuccess(res, order, 201);
});

export const listMyOrders = asyncHandler(async (req: Request, res: Response) => {
  const { page, limit } = req.query as Record<string, string>;
  const result = await orderService.listOrdersForUser(
    req.user!.id,
    page ? Number(page) : undefined,
    limit ? Number(limit) : undefined
  );
  sendSuccess(res, result.items, 200, { pagination: result.pagination });
});

export const getOrder = asyncHandler(async (req: Request, res: Response) => {
  const order = await orderService.getOrderById(req.params.id, req.user!);
  sendSuccess(res, order);
});

export const updateOrderStatus = asyncHandler(async (req: Request, res: Response) => {
  const order = await orderService.updateOrderStatus(req.params.id, req.body);
  sendSuccess(res, order);
});
