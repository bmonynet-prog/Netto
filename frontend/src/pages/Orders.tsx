import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { OrderAPI } from '../services/endpoints';
import type { Order } from '../types';

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  useEffect(() => { OrderAPI.list().then((r) => setOrders(r.data.data)); }, []);
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold mb-6">My Orders</h1>
      <div className="space-y-4">
        {orders.map((o) => (
          <Link key={o.id} to={`/orders/${o.id}`} className="block border rounded-lg p-4 hover:shadow">
            <div className="flex justify-between">
              <span className="font-medium">#{o.id.slice(0, 8)}</span>
              <span>{o.orderStatus}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-500">
              <span>{new Date(o.createdAt).toLocaleDateString()}</span>
              <span>${Number(o.totalAmount).toFixed(2)}</span>
            </div>
          </Link>
        ))}
        {orders.length === 0 && <p className="text-gray-500">No orders yet.</p>}
      </div>
    </div>
  );
}
