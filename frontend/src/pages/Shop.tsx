import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ProductAPI, CategoryAPI } from '../services/endpoints';
import type { Product, Category } from '../types';

export default function Shop() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [params, setParams] = useSearchParams();
  const search = params.get('search') || '';
  const category = params.get('category') || '';
  const sort = params.get('sort') || 'newest';

  useEffect(() => { CategoryAPI.list().then((r) => setCategories(r.data.data)); }, []);
  useEffect(() => {
    ProductAPI.list({ search: search || undefined, category: category || undefined, sort, limit: 24 })
      .then((r) => setProducts(r.data.data));
  }, [search, category, sort]);

  const update = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value); else next.delete(key);
    setParams(next);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <input
          placeholder="Search products..."
          defaultValue={search}
          onKeyDown={(e) => { if (e.key === 'Enter') update('search', (e.target as HTMLInputElement).value); }}
          className="border rounded-md px-3 py-2 flex-1"
        />
        <select value={category} onChange={(e) => update('category', e.target.value)} className="border rounded-md px-3 py-2">
          <option value="">All Categories</option>
          {categories.map((c) => <option key={c.id} value={c.slug}>{c.name}</option>)}
        </select>
        <select value={sort} onChange={(e) => update('sort', e.target.value)} className="border rounded-md px-3 py-2">
          <option value="newest">Newest</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
          <option value="name_asc">Name A-Z</option>
        </select>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {products.map((p) => (
          <Link key={p.id} to={`/product/${p.slug}`} className="border rounded-lg overflow-hidden hover:shadow-lg transition">
            <img src={p.imageUrl || 'https://via.placeholder.com/300'} alt={p.name} className="w-full h-40 object-cover" />
            <div className="p-3">
              <p className="font-medium text-sm truncate">{p.name}</p>
              <p className="text-brand-600 font-bold">${Number(p.price).toFixed(2)}</p>
              <p className="text-xs text-gray-500">{p.stock > 0 ? `${p.stock} in stock` : 'Out of stock'}</p>
            </div>
          </Link>
        ))}
        {products.length === 0 && <p className="col-span-4 text-center text-gray-500 py-12">No products found.</p>}
      </div>
    </div>
  );
}
