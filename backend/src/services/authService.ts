import { prisma } from '../config/prisma';
import { hashPassword, verifyPassword } from '../utils/password';
import { signToken } from '../utils/jwt';
import { ApiError } from '../utils/ApiError';

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
  phone?: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

// Public-safe user shape (never includes passwordHash).
function toPublicUser(user: {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  phone: string | null;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    status: user.status,
    phone: user.phone,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

export async function registerUser(input: RegisterInput) {
  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) {
    throw ApiError.conflict('An account with this email already exists');
  }

  const passwordHash = await hashPassword(input.password);

  const user = await prisma.$transaction(async (tx) => {
    const created = await tx.user.create({
      data: {
        name: input.name,
        email: input.email,
        passwordHash,
        phone: input.phone,
      },
    });
    // Every customer gets a persistent cart created up front.
    await tx.cart.create({ data: { userId: created.id } });
    return created;
  });

  const token = signToken({ userId: user.id, role: user.role });
  return { user: toPublicUser(user), token };
}

export async function loginUser(input: LoginInput) {
  const user = await prisma.user.findUnique({ where: { email: input.email } });
  if (!user) {
    throw ApiError.unauthorized('Invalid email or password');
  }
  if (user.status === 'DISABLED') {
    throw ApiError.forbidden('This account has been disabled. Please contact support.');
  }

  const valid = await verifyPassword(input.password, user.passwordHash);
  if (!valid) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  const token = signToken({ userId: user.id, role: user.role });
  return { user: toPublicUser(user), token };
}

export async function getCurrentUser(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw ApiError.notFound('User not found');
  return toPublicUser(user);
}

export async function changeUserPassword(userId: string, currentPassword: string, newPassword: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw ApiError.notFound('User not found');

  const valid = await verifyPassword(currentPassword, user.passwordHash);
  if (!valid) {
    throw ApiError.badRequest('Current password is incorrect');
  }

  const passwordHash = await hashPassword(newPassword);
  await prisma.user.update({ where: { id: userId }, data: { passwordHash } });
  return { message: 'Password updated successfully' };
}

export async function updateUserProfile(userId: string, data: { name?: string; phone?: string }) {
  const user = await prisma.user.update({ where: { id: userId }, data });
  return toPublicUser(user);
}

export { toPublicUser };
