import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess } from '../utils/apiResponse';
import * as wishlistService from '../services/wishlistService';

export const getWishlist = asyncHandler(async (req: Request, res: Response) => {
  const wishlist = await wishlistService.getWishlist(req.user!.id);
  sendSuccess(res, wishlist);
});

export const addToWishlist = asyncHandler(async (req: Request, res: Response) => {
  const { productId } = req.body;
  const item = await wishlistService.addToWishlist(req.user!.id, productId);
  sendSuccess(res, item, 201);
});

export const removeFromWishlist = asyncHandler(async (req: Request, res: Response) => {
  const result = await wishlistService.removeFromWishlist(req.user!.id, req.params.productId);
  sendSuccess(res, result);
});
