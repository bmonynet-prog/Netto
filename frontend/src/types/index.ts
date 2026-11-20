export interface User {
  id: string; name: string; email: string; role: 'CUSTOMER' | 'ADMIN' | 'SUPER_ADMIN';
  status: 'ACTIVE' | 'DISABLED'; phone?: string | null; createdAt: string; updatedAt: string;
}
export interface Category { id: string; name: string; slug: string; description?: string | null; _count?: { products: number }; }
export interface Product {
  id: string; name: string; slug: string; description: string; price: string | number; stock: number;
  categoryId: string; imageUrl?: string | null; status: 'ACTIVE' | 'INACTIVE'; category?: Category;
  avgRating?: number; ratingCount?: number; reviews?: Review[]; createdAt: string; updatedAt: string;
}
export interface Review { id: string; userId: string; productId: string; rating: number; comment?: string | null; createdAt: string; user?: { id: string; name: string }; }
export interface CartItem { id: string; cartId: string; productId: string; quantity: number; product: Product; }
export interface Cart { id: string; items: CartItem[]; subtotal: number; shippingFee: number; total: number; }
export interface OrderItem { id: string; orderId: string; productId?: string | null; productName: string; productImage?: string | null; price: string | number; quantity: number; }
export interface Order {
  id: string; userId: string; customerName: string; customerEmail: string; customerPhone: string;
  shippingAddress: string; shippingCity: string; shippingCountry: string; postalCode: string;
  subtotal: string | number; shippingFee: string | number; totalAmount: string | number;
  orderStatus: string; paymentStatus: string; paymentMethod: string; items: OrderItem[]; createdAt: string;
}
export interface Pagination { page: number; limit: number; total: number; totalPages: number; }
export interface ApiListResponse<T> { success: boolean; data: T[]; meta?: { pagination: Pagination }; }
export interface ApiResponse<T> { success: boolean; data: T; message?: string; }
