import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { OrderAPI } from '../services/endpoints';
import toast from 'react-hot-toast';

export default function Checkout() {
  const { cart, refreshCart } = useCart();
  const navigate = useNavigate();
  const [form, setForm] = useState({ customerName: '', email: '', phone: '', address: '', city: '', country: '', postalCode: '', paymentMethod: 'COD' });
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await OrderAPI.create(form);
      await refreshCart();
      toast.success('Order placed successfully!');
      navigate(`/orders/${res.data.data.id}`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Checkout failed');
    } finally {
      setLoading(false);
    }
  };

  if (!cart || cart.items.length === 0) {
    return <div className="max-w-xl mx-auto px-4 py-16 text-center text-gray-500">Your cart is empty.</div>;
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold mb-6">Checkout</h1>
      <form onSubmit={submit} className="space-y-4">
        <input required placeholder="Full name" value={form.customerName} onChange={(e) => setForm({ ...form, customerName: e.target.value })} className="w-full border rounded-md px-3 py-2" />
        <input required type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full border rounded-md px-3 py-2" />
        <input required placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full border rounded-md px-3 py-2" />
        <input required placeholder="Address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="w-full border rounded-md px-3 py-2" />
        <div className="grid grid-cols-2 gap-3">
          <input required placeholder="City" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className="border rounded-md px-3 py-2" />
          <input required placeholder="Country" value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} className="border rounded-md px-3 py-2" />
        </div>
        <input required placeholder="Postal code" value={form.postalCode} onChange={(e) => setForm({ ...form, postalCode: e.target.value })} className="w-full border rounded-md px-3 py-2" />
        <select value={form.paymentMethod} onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })} className="w-full border rounded-md px-3 py-2">
          <option value="COD">Cash on Delivery</option>
          <option value="STRIPE">Credit Card (Stripe)</option>
          <option value="ABA_PAY">ABA Pay</option>
        </select>
        <div className="text-right font-bold text-xl">Total: ${cart.total.toFixed(2)}</div>
        <button disabled={loading} type="submit" className="w-full bg-brand-600 text-white py-2 rounded-md disabled:opacity-50">
          {loading ? 'Placing order...' : 'Place Order'}
        </button>
      </form>
    </div>
  );
}
