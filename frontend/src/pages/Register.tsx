import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await register(name, email, password);
      toast.success('Account created!');
      navigate('/');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <h1 className="text-2xl font-bold mb-6">Create Account</h1>
      <form onSubmit={submit} className="space-y-4">
        <input required placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} className="w-full border rounded-md px-3 py-2" />
        <input required type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full border rounded-md px-3 py-2" />
        <input required type="password" minLength={8} placeholder="Password (min 8 chars, 1 letter, 1 number)" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full border rounded-md px-3 py-2" />
        <button type="submit" className="w-full bg-brand-600 text-white py-2 rounded-md">Sign Up</button>
      </form>
      <p className="text-sm mt-4">Already have an account? <Link to="/login" className="text-brand-600">Login</Link></p>
    </div>
  );
}
