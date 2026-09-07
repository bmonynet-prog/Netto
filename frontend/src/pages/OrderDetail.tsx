import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { OrderAPI } from '../services/endpoints';
import type { Order } from '../types';

export default function OrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState<Order | null>(null);
  useEffect(() => { if (id) OrderAPI.getById(id).then((r) => setOrder(r.data.data)); }, [id]);
  if (!order) return <div className="max-w-3xl mx-auto px-4 py-12">Loading...</div>;
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold mb-2">Order #{order.id.slice(0, 8)}</h1>
      <p className="mb-1">Status: <span className="font-medium">{order.orderStatus}</span></p>
      <p className="mb-4">Payment: <span className="font-medium">{order.paymentStatus}</span> ({order.paymentMethod})</p>
      <div className="border rounded-lg p-4 mb-4">
        <p className="font-medium mb-2">Shipping to:</p>
        <p>{order.customerName} — {order.customerPhone}</p>
        <p>{order.shippingAddress}, {order.shippingCity}, {order.shippingCountry} {order.postalCode}</p>
      </div>
      <div className="space-y-2 mb-4">
        {order.items.map((it) => (
          <div key={it.id} className="flex justify-between border-b py-2">
            <span>{it.productName} × {it.quantity}</span>
            <span>${(Number(it.price) * it.quantity).toFixed(2)}</span>
          </div>
        ))}
      </div>
      <div className="text-right">
        <p>Subtotal: ${Number(order.subtotal).toFixed(2)}</p>
        <p>Shipping: ${Number(order.shippingFee).toFixed(2)}</p>
        <p className="font-bold text-xl">Total: ${Number(order.totalAmount).toFixed(2)}</p>
      </div>
    </div>
  );
}
