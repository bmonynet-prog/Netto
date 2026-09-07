import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-16">
        <Link to="/" className="text-2xl font-bold text-brand-600">ShopHub</Link>
        <nav className="hidden md:flex gap-6 text-gray-700 font-medium">
          <Link to="/" className="hover:text-brand-600">Home</Link>
          <Link to="/shop" className="hover:text-brand-600">Shop</Link>
          <Link to="/wishlist" className="hover:text-brand-600">Wishlist</Link>
        </nav>
        <div className="flex items-center gap-4">
          <Link to="/cart" className="relative">
            🛒
            {itemCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-brand-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">{itemCount}</span>
            )}
          </Link>
          {user ? (
            <div className="flex items-center gap-3">
              {(user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') && (
                <Link to="/admin" className="text-sm font-semibold text-brand-700">Admin</Link>
              )}
              <Link to="/account" className="text-sm font-medium">{user.name}</Link>
              <button onClick={() => { logout(); navigate('/'); }} className="text-sm text-red-600">Logout</button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link to="/login" className="text-sm font-medium">Login</Link>
              <Link to="/register" className="bg-brand-600 text-white px-3 py-1.5 rounded-md text-sm">Sign Up</Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
