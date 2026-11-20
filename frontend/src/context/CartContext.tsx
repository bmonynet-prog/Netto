import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import { CartAPI } from '../services/endpoints';
import type { Cart } from '../types';
import { useAuth } from './AuthContext';

interface CartContextType {
  cart: Cart | null;
  loading: boolean;
  refreshCart: () => Promise<void>;
  addToCart: (productId: string, quantity?: number) => Promise<void>;
  updateItem: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  itemCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(false);

  const refreshCart = useCallback(async () => {
    if (!user) { setCart(null); return; }
    setLoading(true);
    try {
      const res = await CartAPI.get();
      setCart(res.data.data);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { refreshCart(); }, [refreshCart]);

  const addToCart = async (productId: string, quantity = 1) => {
    const res = await CartAPI.add({ productId, quantity });
    setCart(res.data.data);
  };
  const updateItem = async (itemId: string, quantity: number) => {
    const res = await CartAPI.update(itemId, quantity);
    setCart(res.data.data);
  };
  const removeItem = async (itemId: string) => {
    const res = await CartAPI.remove(itemId);
    setCart(res.data.data);
  };

  const itemCount = cart?.items.reduce((sum, i) => sum + i.quantity, 0) || 0;

  return (
    <CartContext.Provider value={{ cart, loading, refreshCart, addToCart, updateItem, removeItem, itemCount }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
