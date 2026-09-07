import { api } from './api';

export const AuthAPI = {
  register: (data: any) => api.post('/auth/register', data),
  login: (data: any) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  me: () => api.get('/auth/me'),
  changePassword: (data: any) => api.put('/auth/change-password', data),
  updateProfile: (data: any) => api.put('/auth/profile', data),
};

export const ProductAPI = {
  list: (params: any) => api.get('/products', { params }),
  getBySlug: (slug: string) => api.get(`/products/slug/${slug}`),
  getById: (id: string) => api.get(`/products/${id}`),
  create: (data: any) => api.post('/products', data),
  update: (id: string, data: any) => api.put(`/products/${id}`, data),
  remove: (id: string) => api.delete(`/products/${id}`),
  addReview: (productId: string, data: any) => api.post(`/products/${productId}/reviews`, data),
};

export const CategoryAPI = {
  list: () => api.get('/categories'),
  create: (data: any) => api.post('/categories', data),
  update: (id: string, data: any) => api.put(`/categories/${id}`, data),
  remove: (id: string) => api.delete(`/categories/${id}`),
};

export const CartAPI = {
  get: () => api.get('/cart'),
  add: (data: any) => api.post('/cart', data),
  update: (itemId: string, quantity: number) => api.put(`/cart/${itemId}`, { quantity }),
  remove: (itemId: string) => api.delete(`/cart/${itemId}`),
};

export const OrderAPI = {
  create: (data: any) => api.post('/orders', data),
  list: (params?: any) => api.get('/orders', { params }),
  getById: (id: string) => api.get(`/orders/${id}`),
  updateStatus: (id: string, data: any) => api.put(`/orders/${id}/status`, data),
};

export const WishlistAPI = {
  list: () => api.get('/wishlist'),
  add: (productId: string) => api.post('/wishlist', { productId }),
  remove: (productId: string) => api.delete(`/wishlist/${productId}`),
};

export const AdminAPI = {
  dashboard: () => api.get('/admin/dashboard'),
  users: (params?: any) => api.get('/admin/users', { params }),
  userDetail: (id: string) => api.get(`/admin/users/${id}`),
  setUserStatus: (id: string, status: string) => api.put(`/admin/users/${id}/status`, { status }),
  setUserRole: (id: string, role: string) => api.put(`/admin/users/${id}/role`, { role }),
  orders: (params?: any) => api.get('/admin/orders', { params }),
  products: (params?: any) => api.get('/admin/products', { params }),
  reviews: (params?: any) => api.get('/admin/reviews', { params }),
  deleteReview: (id: string) => api.delete(`/admin/reviews/${id}`),
};
