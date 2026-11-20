import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess } from '../utils/apiResponse';
import * as authService from '../services/authService';
import { env } from '../config/env';

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: env.isProduction,
  sameSite: 'lax' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

export const register = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password, phone } = req.body;
  const result = await authService.registerUser({ name, email, password, phone });
  res.cookie('token', result.token, COOKIE_OPTIONS);
  sendSuccess(res, result, 201);
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const result = await authService.loginUser({ email, password });
  res.cookie('token', result.token, COOKIE_OPTIONS);
  sendSuccess(res, result, 200);
});

export const logout = asyncHandler(async (_req: Request, res: Response) => {
  res.clearCookie('token');
  sendSuccess(res, { message: 'Logged out successfully' });
});

export const me = asyncHandler(async (req: Request, res: Response) => {
  const user = await authService.getCurrentUser(req.user!.id);
  sendSuccess(res, user);
});

export const changePassword = asyncHandler(async (req: Request, res: Response) => {
  const { currentPassword, newPassword } = req.body;
  const result = await authService.changeUserPassword(req.user!.id, currentPassword, newPassword);
  sendSuccess(res, result);
});

export const updateProfile = asyncHandler(async (req: Request, res: Response) => {
  const user = await authService.updateUserProfile(req.user!.id, req.body);
  sendSuccess(res, user);
});
