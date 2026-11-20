import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { WishlistAPI } from '../services/endpoints';

export default function Wishlist() {
  const [items, setItems] = useState<any[]>([]);
  useEffect(() => { WishlistAPI.list().then((r) => setItems(r.data.data)).catch(() => setItems([])); }, []);
  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold mb-6">My Wishlist</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {items.map((i) => (
          <Link key={i.id} to={`/product/${i.product.slug}`} className="border rounded-lg overflow-hidden hover:shadow-lg">
            <img src={i.product.imageUrl || 'https://via.placeholder.com/300'} className="w-full h-40 object-cover" />
            <div className="p-3">
              <p className="font-medium text-sm truncate">{i.product.name}</p>
              <p className="text-brand-600 font-bold">${Number(i.product.price).toFixed(2)}</p>
            </div>
          </Link>
        ))}
        {items.length === 0 && <p className="text-gray-500 col-span-4">Your wishlist is empty.</p>}
      </div>
    </div>
  );
}
