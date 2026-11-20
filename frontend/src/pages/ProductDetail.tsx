import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ProductAPI } from '../services/endpoints';
import type { Product } from '../types';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function ProductDetail() {
  const { slug } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [qty, setQty] = useState(1);
  const { addToCart } = useCart();
  const { user } = useAuth();

  useEffect(() => {
    if (slug) ProductAPI.getBySlug(slug).then((r) => setProduct(r.data.data)).catch(() => setProduct(null));
  }, [slug]);

  if (!product) return <div className="max-w-5xl mx-auto px-4 py-12">Loading...</div>;

  const handleAdd = async () => {
    if (!user) { toast.error('Please login to add items to your cart'); return; }
    try {
      await addToCart(product.id, qty);
      toast.success('Added to cart');
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Failed to add to cart');
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-12 grid md:grid-cols-2 gap-10">
      <img src={product.imageUrl || 'https://via.placeholder.com/500'} alt={product.name} className="w-full rounded-lg object-cover" />
      <div>
        <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
        <p className="text-sm text-gray-500 mb-4">{product.category?.name}</p>
        <p className="text-2xl text-brand-600 font-bold mb-4">${Number(product.price).toFixed(2)}</p>
        <p className="text-gray-700 mb-4">{product.description}</p>
        <p className="mb-4 text-sm">{product.stock > 0 ? `${product.stock} in stock` : <span className="text-red-600">Out of stock</span>}</p>
        <div className="flex items-center gap-3 mb-6">
          <input type="number" min={1} max={product.stock} value={qty} onChange={(e) => setQty(Number(e.target.value))} className="border rounded-md px-3 py-2 w-20" />
          <button disabled={product.stock === 0} onClick={handleAdd} className="bg-brand-600 text-white px-6 py-2 rounded-md disabled:opacity-50">Add to Cart</button>
        </div>
        <div>
          <h2 className="font-semibold mb-2">Reviews ({product.ratingCount || 0}) · ⭐ {product.avgRating || 0}</h2>
          {product.reviews?.map((r) => (
            <div key={r.id} className="border-t py-2">
              <p className="font-medium text-sm">{r.user?.name} — ⭐ {r.rating}</p>
              <p className="text-sm text-gray-600">{r.comment}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
