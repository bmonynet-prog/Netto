import { Request, Response, NextFunction } from 'express';
import { Role } from '@prisma/client';
import { verifyToken } from '../utils/jwt';
import { ApiError } from '../utils/ApiError';
import { prisma } from '../config/prisma';
import { asyncHandler } from '../utils/asyncHandler';

// Augment Express Request with the authenticated user.
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: Role;
        email: string;
        name: string;
      };
    }
  }
}

function extractToken(req: Request): string | null {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.slice(7);
  }
  if (req.cookies && req.cookies.token) {
    return req.cookies.token;
  }
  return null;
}

// Requires a valid JWT. Loads the current user from the DB (so disabled
// accounts / role changes take effect immediately, not just at login time).
export const requireAuth = asyncHandler(async (req: Request, _res: Response, next: NextFunction) => {
  const token = extractToken(req);
  if (!token) {
    throw ApiError.unauthorized('Authentication required');
  }

  let payload;
  try {
    payload = verifyToken(token);
  } catch {
    throw ApiError.unauthorized('Invalid or expired token');
  }

  const user = await prisma.user.findUnique({ where: { id: payload.userId } });
  if (!user) {
    throw ApiError.unauthorized('User no longer exists');
  }
  if (user.status === 'DISABLED') {
    throw ApiError.forbidden('This account has been disabled');
  }

  req.user = { id: user.id, role: user.role, email: user.email, name: user.name };
  next();
});

// Optional auth: attaches req.user if a valid token is present, but does not
// reject the request otherwise. Useful for endpoints with public + personalized data.
export const attachUserIfPresent = asyncHandler(async (req: Request, _res: Response, next: NextFunction) => {
  const token = extractToken(req);
  if (!token) return next();
  try {
    const payload = verifyToken(token);
    const user = await prisma.user.findUnique({ where: { id: payload.userId } });
    if (user && user.status !== 'DISABLED') {
      req.user = { id: user.id, role: user.role, email: user.email, name: user.name };
    }
  } catch {
    // ignore invalid token for optional auth
  }
  next();
});

// Role-based authorization. Must be used after requireAuth.
export function requireRole(...roles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      throw ApiError.unauthorized('Authentication required');
    }
    if (!roles.includes(req.user.role)) {
      throw ApiError.forbidden('You do not have permission to perform this action');
    }
    next();
  };
}

export const requireAdmin = requireRole('ADMIN', 'SUPER_ADMIN');
