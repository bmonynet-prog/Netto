import { OrderStatus, PaymentStatus, Prisma, Role, UserStatus } from '@prisma/client';
import { prisma } from '../config/prisma';
import { ApiError } from '../utils/ApiError';

const LOW_STOCK_THRESHOLD = 10;

export async function getDashboardStats() {
  const [
    revenueAgg,
    totalOrders,
    totalCustomers,
    totalProducts,
    pendingOrders,
    completedOrders,
    lowStockProducts,
  ] = await Promise.all([
    prisma.order.aggregate({
      _sum: { totalAmount: true },
      where: { paymentStatus: PaymentStatus.PAID },
    }),
    prisma.order.count(),
    prisma.user.count({ where: { role: Role.CUSTOMER } }),
    prisma.product.count(),
    prisma.order.count({ where: { orderStatus: OrderStatus.PENDING } }),
    prisma.order.count({ where: { orderStatus: OrderStatus.DELIVERED } }),
    prisma.product.count({ where: { stock: { lte: LOW_STOCK_THRESHOLD } } }),
  ]);

  return {
    totalRevenue: Number(revenueAgg._sum.totalAmount || 0),
    totalOrders,
    totalCustomers,
    totalProducts,
    pendingOrders,
    completedOrders,
    lowStockProducts,
  };
}

// Sales & orders grouped by day for the last N days (for time-series charts).
export async function getSalesOverTime(days = 30) {
  const since = new Date();
  since.setDate(since.getDate() - days);

  const orders = await prisma.order.findMany({
    where: { createdAt: { gte: since } },
    select: { createdAt: true, totalAmount: true, paymentStatus: true },
    orderBy: { createdAt: 'asc' },
  });

  const map = new Map<string, { date: string; orders: number; revenue: number }>();
  for (const order of orders) {
    const dateKey = order.createdAt.toISOString().slice(0, 10);
    const entry = map.get(dateKey) || { date: dateKey, orders: 0, revenue: 0 };
    entry.orders += 1;
    if (order.paymentStatus === PaymentStatus.PAID) {
      entry.revenue += Number(order.totalAmount);
    }
    map.set(dateKey, entry);
  }

  return Array.from(map.values());
}

export async function getBestSellingProducts(limit = 5) {
  const grouped = await prisma.orderItem.groupBy({
    by: ['productId', 'productName'],
    _sum: { quantity: true },
    orderBy: { _sum: { quantity: 'desc' } },
    take: limit,
  });

  return grouped.map((g) => ({
    productId: g.productId,
    productName: g.productName,
    totalSold: g._sum.quantity || 0,
  }));
}

export async function getCategoryDistribution() {
  const categories = await prisma.category.findMany({
    include: { _count: { select: { products: true } } },
  });
  return categories.map((c) => ({ category: c.name, productCount: c._count.products }));
}

export interface ListUsersParams {
  search?: string;
  role?: Role;
  status?: UserStatus;
  page?: number;
  limit?: number;
}

export async function listUsers(params: ListUsersParams) {
  const page = params.page && params.page > 0 ? params.page : 1;
  const limit = params.limit && params.limit > 0 ? params.limit : 20;
  const skip = (page - 1) * limit;

  const where: Prisma.UserWhereInput = {};
  if (params.search) {
    where.OR = [
      { name: { contains: params.search, mode: 'insensitive' } },
      { email: { contains: params.search, mode: 'insensitive' } },
    ];
  }
  if (params.role) where.role = params.role;
  if (params.status) where.status = params.status;

  const [items, total] = await prisma.$transaction([
    prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        phone: true,
        createdAt: true,
        updatedAt: true,
        _count: { select: { orders: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.user.count({ where }),
  ]);

  return { items, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 } };
}

export async function getUserDetail(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
      phone: true,
      createdAt: true,
      updatedAt: true,
      orders: {
        select: {
          id: true,
          totalAmount: true,
          orderStatus: true,
          paymentStatus: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
      },
    },
  });
  if (!user) throw ApiError.notFound('User not found');
  return user;
}

export async function setUserStatus(userId: string, status: UserStatus) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw ApiError.notFound('User not found');
  if (user.role === Role.SUPER_ADMIN) {
    throw ApiError.forbidden('Cannot change status of a super admin account');
  }
  return prisma.user.update({
    where: { id: userId },
    data: { status },
    select: { id: true, name: true, email: true, role: true, status: true },
  });
}

export async function setUserRole(userId: string, role: Role, requesterRole: Role) {
  if (requesterRole !== Role.SUPER_ADMIN) {
    throw ApiError.forbidden('Only a super admin can change user roles');
  }
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw ApiError.notFound('User not found');

  return prisma.user.update({
    where: { id: userId },
    data: { role },
    select: { id: true, name: true, email: true, role: true, status: true },
  });
}
