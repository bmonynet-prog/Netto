import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ProductAPI, CategoryAPI } from '../services/endpoints';
import type { Product, Category } from '../types';

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    ProductAPI.list({ limit: 8, sort: 'newest' }).then((r) => setProducts(r.data.data));
    CategoryAPI.list().then((r) => setCategories(r.data.data));
  }, []);

  return (
    <div>
      <section className="bg-gradient-to-r from-brand-700 to-brand-500 text-white py-20 px-4 text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">Shop Smarter, Live Better</h1>
        <p className="text-lg mb-8 opacity-90">Discover quality products across Electronics, Fashion, Beauty & more.</p>
        <Link to="/shop" className="bg-white text-brand-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100">Shop Now</Link>
      </section>

      <section className="max-w-7xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold mb-6">Shop by Category</h2>
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          {categories.map((c) => (
            <Link key={c.id} to={`/shop?category=${c.slug}`} className="bg-gray-100 hover:bg-brand-50 rounded-lg p-4 text-center font-medium">
              {c.name}
            </Link>
          ))}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold mb-6">Featured Products</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {products.map((p) => (
            <Link key={p.id} to={`/product/${p.slug}`} className="border rounded-lg overflow-hidden hover:shadow-lg transition">
              <img src={p.imageUrl || 'https://via.placeholder.com/300'} alt={p.name} className="w-full h-40 object-cover" />
              <div className="p-3">
                <p className="font-medium text-sm truncate">{p.name}</p>
                <p className="text-brand-600 font-bold">${Number(p.price).toFixed(2)}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
