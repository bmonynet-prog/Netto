import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess } from '../utils/apiResponse';
import * as adminService from '../services/adminService';
import * as orderService from '../services/orderService';
import * as reviewService from '../services/reviewService';
import { Role, UserStatus } from '@prisma/client';

export const getDashboard = asyncHandler(async (_req: Request, res: Response) => {
  const [stats, salesOverTime, bestSellers, categoryDistribution] = await Promise.all([
    adminService.getDashboardStats(),
    adminService.getSalesOverTime(30),
    adminService.getBestSellingProducts(5),
    adminService.getCategoryDistribution(),
  ]);
  sendSuccess(res, { stats, salesOverTime, bestSellers, categoryDistribution });
});

export const listUsers = asyncHandler(async (req: Request, res: Response) => {
  const { search, role, status, page, limit } = req.query as Record<string, string>;
  const result = await adminService.listUsers({
    search,
    role: role as Role,
    status: status as UserStatus,
    page: page ? Number(page) : undefined,
    limit: limit ? Number(limit) : undefined,
  });
  sendSuccess(res, result.items, 200, { pagination: result.pagination });
});

export const getUserDetail = asyncHandler(async (req: Request, res: Response) => {
  const user = await adminService.getUserDetail(req.params.id);
  sendSuccess(res, user);
});

export const setUserStatus = asyncHandler(async (req: Request, res: Response) => {
  const { status } = req.body as { status: UserStatus };
  const user = await adminService.setUserStatus(req.params.id, status);
  sendSuccess(res, user);
});

export const setUserRole = asyncHandler(async (req: Request, res: Response) => {
  const { role } = req.body as { role: Role };
  const user = await adminService.setUserRole(req.params.id, role, req.user!.role);
  sendSuccess(res, user);
});

export const listAllOrders = asyncHandler(async (req: Request, res: Response) => {
  const { search, status, paymentStatus, page, limit } = req.query as Record<string, string>;
  const result = await orderService.listAllOrders({
    search,
    status: status as any,
    paymentStatus: paymentStatus as any,
    page: page ? Number(page) : undefined,
    limit: limit ? Number(limit) : undefined,
  });
  sendSuccess(res, result.items, 200, { pagination: result.pagination });
});

export const listAllProducts = asyncHandler(async (req: Request, res: Response) => {
  const productService = await import('../services/productService');
  const { search, category, status, sort, page, limit } = req.query as Record<string, string>;
  const result = await productService.listProducts({
    search,
    category,
    status: (status as any) || 'ALL',
    sort: sort as any,
    page: page ? Number(page) : undefined,
    limit: limit ? Number(limit) : undefined,
    includeInactive: true,
  });
  sendSuccess(res, result.items, 200, { pagination: result.pagination });
});

export const listAllReviews = asyncHandler(async (req: Request, res: Response) => {
  const { page, limit } = req.query as Record<string, string>;
  const result = await reviewService.listReviewsForAdmin(
    page ? Number(page) : undefined,
    limit ? Number(limit) : undefined
  );
  sendSuccess(res, result.items, 200, { pagination: result.pagination });
});

export const deleteReviewAdmin = asyncHandler(async (req: Request, res: Response) => {
  const result = await reviewService.deleteReview(req.user!.id, req.params.reviewId, true);
  sendSuccess(res, result);
});
