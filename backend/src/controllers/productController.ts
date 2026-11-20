import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess } from '../utils/apiResponse';
import * as productService from '../services/productService';
import * as reviewService from '../services/reviewService';

export const listProducts = asyncHandler(async (req: Request, res: Response) => {
  const { search, category, minPrice, maxPrice, sort, page, limit } = req.query as Record<string, string>;
  const result = await productService.listProducts({
    search,
    category,
    minPrice: minPrice ? Number(minPrice) : undefined,
    maxPrice: maxPrice ? Number(maxPrice) : undefined,
    sort: sort as productService.ListProductsParams['sort'],
    page: page ? Number(page) : undefined,
    limit: limit ? Number(limit) : undefined,
  });
  sendSuccess(res, result.items, 200, { pagination: result.pagination });
});

export const getProduct = asyncHandler(async (req: Request, res: Response) => {
  const product = await productService.getProductById(req.params.id);
  sendSuccess(res, product);
});

export const getProductBySlug = asyncHandler(async (req: Request, res: Response) => {
  const product = await productService.getProductBySlug(req.params.slug);
  sendSuccess(res, product);
});

export const createProduct = asyncHandler(async (req: Request, res: Response) => {
  const product = await productService.createProduct(req.body);
  sendSuccess(res, product, 201);
});

export const updateProduct = asyncHandler(async (req: Request, res: Response) => {
  const product = await productService.updateProduct(req.params.id, req.body);
  sendSuccess(res, product);
});

export const deleteProduct = asyncHandler(async (req: Request, res: Response) => {
  const result = await productService.deleteProduct(req.params.id);
  sendSuccess(res, result);
});

export const addReview = asyncHandler(async (req: Request, res: Response) => {
  const { rating, comment } = req.body;
  const review = await reviewService.createReview(req.user!.id, req.params.productId, rating, comment);
  sendSuccess(res, review, 201);
});

export const deleteReview = asyncHandler(async (req: Request, res: Response) => {
  const isAdmin = req.user!.role === 'ADMIN' || req.user!.role === 'SUPER_ADMIN';
  const result = await reviewService.deleteReview(req.user!.id, req.params.reviewId, isAdmin);
  sendSuccess(res, result);
});
