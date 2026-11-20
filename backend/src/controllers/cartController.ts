import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess } from '../utils/apiResponse';
import * as cartService from '../services/cartService';

export const getCart = asyncHandler(async (req: Request, res: Response) => {
  const cart = await cartService.getCart(req.user!.id);
  sendSuccess(res, cart);
});

export const addToCart = asyncHandler(async (req: Request, res: Response) => {
  const { productId, quantity } = req.body;
  const cart = await cartService.addItemToCart(req.user!.id, productId, quantity);
  sendSuccess(res, cart, 201);
});

export const updateCartItem = asyncHandler(async (req: Request, res: Response) => {
  const { quantity } = req.body;
  const cart = await cartService.updateCartItemQuantity(req.user!.id, req.params.itemId, quantity);
  sendSuccess(res, cart);
});

export const removeCartItem = asyncHandler(async (req: Request, res: Response) => {
  const cart = await cartService.removeCartItem(req.user!.id, req.params.itemId);
  sendSuccess(res, cart);
});

export const clearCart = asyncHandler(async (req: Request, res: Response) => {
  const cart = await cartService.clearCart(req.user!.id);
  sendSuccess(res, cart);
});
