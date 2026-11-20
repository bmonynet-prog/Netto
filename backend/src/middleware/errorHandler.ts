import { NextFunction, Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import { ZodError } from 'zod';
import { ApiError } from '../utils/ApiError';
import { sendError } from '../utils/apiResponse';
import { env } from '../config/env';

// Centralized error handler. Keep this as the LAST middleware registered.
export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction) {
  // Known application errors
  if (err instanceof ApiError) {
    return sendError(res, err.message, err.statusCode, err.details);
  }

  // Zod validation errors
  if (err instanceof ZodError) {
    const details = err.errors.map((e) => ({ path: e.path.join('.'), message: e.message }));
    return sendError(res, 'Validation failed', 422, details);
  }

  // Prisma known request errors (unique constraint, FK violation, etc.)
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      const target = (err.meta?.target as string[] | undefined)?.join(', ') || 'field';
      return sendError(res, `A record with this ${target} already exists`, 409);
    }
    if (err.code === 'P2003') {
      return sendError(res, 'Related record not found (foreign key constraint failed)', 400);
    }
    if (err.code === 'P2025') {
      return sendError(res, 'Record not found', 404);
    }
    return sendError(res, 'Database request error', 400);
  }

  // Fallback: log full error server-side, but never leak internals to client.
  // eslint-disable-next-line no-console
  console.error('[Unhandled Error]', err);
  const message = env.isProduction ? 'Something went wrong' : (err as Error)?.message || 'Something went wrong';
  return sendError(res, message, 500);
}

export function notFoundHandler(req: Request, res: Response) {
  return sendError(res, `Route not found: ${req.method} ${req.originalUrl}`, 404);
}
