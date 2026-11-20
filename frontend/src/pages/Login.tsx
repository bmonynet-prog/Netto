import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
      toast.success('Welcome back!');
      navigate('/');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <h1 className="text-2xl font-bold mb-6">Login</h1>
      <form onSubmit={submit} className="space-y-4">
        <input required type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full border rounded-md px-3 py-2" />
        <input required type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full border rounded-md px-3 py-2" />
        <button type="submit" className="w-full bg-brand-600 text-white py-2 rounded-md">Login</button>
      </form>
      <p className="text-sm mt-4">No account? <Link to="/register" className="text-brand-600">Sign up</Link></p>
      <p className="text-xs mt-4 text-gray-500">Demo admin: admin@shopdemo.com / Admin@12345<br/>Demo customer: customer1@example.com / Customer@123</p>
    </div>
  );
}
