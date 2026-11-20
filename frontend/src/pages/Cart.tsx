import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

export default function Cart() {
  const { cart, updateItem, removeItem } = useCart();
  const navigate = useNavigate();

  if (!cart || cart.items.length === 0) {
    return <div className="max-w-3xl mx-auto px-4 py-16 text-center">
      <p className="text-gray-500 mb-4">Your cart is empty.</p>
      <Link to="/shop" className="text-brand-600 font-medium">Continue shopping →</Link>
    </div>;
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold mb-6">Your Cart</h1>
      <div className="space-y-4 mb-8">
        {cart.items.map((item) => (
          <div key={item.id} className="flex items-center gap-4 border-b pb-4">
            <img src={item.product.imageUrl || 'https://via.placeholder.com/80'} className="w-20 h-20 object-cover rounded" />
            <div className="flex-1">
              <p className="font-medium">{item.product.name}</p>
              <p className="text-brand-600">${Number(item.product.price).toFixed(2)}</p>
            </div>
            <input type="number" min={1} max={item.product.stock} value={item.quantity}
              onChange={(e) => updateItem(item.id, Number(e.target.value))}
              className="border rounded-md w-16 px-2 py-1" />
            <button onClick={() => removeItem(item.id)} className="text-red-600 text-sm">Remove</button>
          </div>
        ))}
      </div>
      <div className="text-right space-y-1">
        <p>Subtotal: ${cart.subtotal.toFixed(2)}</p>
        <p>Shipping: ${cart.shippingFee.toFixed(2)}</p>
        <p className="text-xl font-bold">Total: ${cart.total.toFixed(2)}</p>
        <button onClick={() => navigate('/checkout')} className="mt-4 bg-brand-600 text-white px-6 py-2 rounded-md">Proceed to Checkout</button>
      </div>
    </div>
  );
}
