import { useEffect, useState } from 'react';
import { AdminAPI } from '../services/endpoints';

export default function AdminDashboard() {
  const [data, setData] = useState<any>(null);
  useEffect(() => { AdminAPI.dashboard().then((r) => setData(r.data.data)); }, []);
  if (!data) return <div className="p-8">Loading...</div>;
  const { stats } = data;
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {Object.entries(stats).map(([k, v]) => (
          <div key={k} className="bg-white border rounded-lg p-4 shadow-sm">
            <p className="text-sm text-gray-500 capitalize">{k.replace(/([A-Z])/g, ' $1')}</p>
            <p className="text-2xl font-bold">{typeof v === 'number' && k.toLowerCase().includes('revenue') ? `$${(v as number).toFixed(2)}` : String(v)}</p>
          </div>
        ))}
      </div>
      <div className="bg-white border rounded-lg p-4">
        <h2 className="font-semibold mb-3">Best Selling Products</h2>
        {data.bestSellers.map((b: any) => (
          <div key={b.productId} className="flex justify-between border-b py-2 text-sm">
            <span>{b.productName}</span><span>{b.totalSold} sold</span>
          </div>
        ))}
      </div>
    </div>
  );
}
