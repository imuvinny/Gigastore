const fs = require('fs');
let code = fs.readFileSync('src/components/DashboardTab.tsx', 'utf-8');

code = `
import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Users, DollarSign, ShoppingBag, ArrowUpRight, TrendingUp, Package, MapPin } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Product, Order, Visit } from '../types';
import { supabase } from '../lib/supabase';

interface DashboardTabProps {
  products: Product[];
}

export function DashboardTab({ products }: DashboardTabProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [visits, setVisits] = useState<Visit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      if (!supabase) {
        setLoading(false);
        return;
      }
      
      const { data: ordersData } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
      if (ordersData) setOrders(ordersData as Order[]);

      const { data: visitsData } = await supabase.from('visits').select('*');
      if (visitsData) setVisits(visitsData as Visit[]);

      setLoading(false);
    }
    
    fetchData();
  }, []);

  const currentDate = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  const totalRevenue = orders.reduce((acc, o) => acc + Number(o.total_price), 0);
  const totalOrders = orders.length;
  const totalVisits = visits.length;

  // Simple monthly grouping
  const monthlyRevenue = Array.from({ length: 12 }, (_, i) => {
    const monthName = new Date(0, i).toLocaleString('en-US', { month: 'short' });
    return { name: monthName, value: 0 };
  });

  orders.forEach(o => {
    const date = new Date(o.created_at);
    const monthIndex = date.getMonth();
    monthlyRevenue[monthIndex].value += Number(o.total_price);
  });

  if (loading) {
    return <div className="p-8 text-neutral-400">Loading dashboard data...</div>;
  }

  return (
    <div className="space-y-6 text-white font-sans pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold tracking-tight">Overview</h3>
          <p className="text-sm text-neutral-400">{currentDate}</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#1a1a1a] p-6 rounded-2xl border border-[#2a2a2a] flex flex-col"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-[#3ecf8e]/20 rounded-xl flex items-center justify-center text-[#3ecf8e]">
              <Users size={24} />
            </div>
            <div>
              <p className="text-sm text-neutral-400 font-medium">Total Visitors</p>
              <h4 className="text-2xl font-bold">{totalVisits}</h4>
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-[#1a1a1a] p-6 rounded-2xl border border-[#2a2a2a] flex flex-col"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-[#3ecf8e]/20 rounded-xl flex items-center justify-center text-[#3ecf8e]">
              <DollarSign size={24} />
            </div>
            <div>
              <p className="text-sm text-neutral-400 font-medium">Total Revenue</p>
              <h4 className="text-2xl font-bold">K{totalRevenue.toLocaleString()} ZMW</h4>
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-[#1a1a1a] p-6 rounded-2xl border border-[#2a2a2a] flex flex-col"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-[#3ecf8e]/20 rounded-xl flex items-center justify-center text-[#3ecf8e]">
              <ShoppingBag size={24} />
            </div>
            <div>
              <p className="text-sm text-neutral-400 font-medium">Orders</p>
              <h4 className="text-2xl font-bold">{totalOrders}</h4>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Chart */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-[#1a1a1a] p-6 rounded-2xl border border-[#2a2a2a] xl:col-span-2"
        >
          <h4 className="text-lg font-bold mb-6">Revenue (Jan - Dec)</h4>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyRevenue} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                <XAxis dataKey="name" stroke="#666" tick={{ fill: '#888', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis stroke="#666" tick={{ fill: '#888', fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(value) => \`K\${value}\`} />
                <Tooltip 
                  cursor={{ fill: '#222' }}
                  contentStyle={{ backgroundColor: '#111', border: '1px solid #333', borderRadius: '8px' }}
                  itemStyle={{ color: '#3ecf8e', fontWeight: 'bold' }}
                />
                <Bar dataKey="value" fill="#3ecf8e" radius={[4, 4, 0, 0]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Top Products */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-[#1a1a1a] p-6 rounded-2xl border border-[#2a2a2a] flex flex-col"
        >
          <div className="flex items-center justify-between mb-6">
            <h4 className="text-lg font-bold">Top Products</h4>
          </div>
          <div className="space-y-4 flex-1 overflow-auto pr-2 max-h-[300px]">
            {products.slice(0, 5).map((product, i) => {
               // Calculate actual sold count
               const sold = orders.filter(o => o.product_name === product.name).length;
               return (
              <div key={product.id} className="flex items-center gap-4 bg-[#222] p-3 rounded-xl border border-[#333] hover:border-[#444] transition-colors">
                <div className="w-12 h-12 rounded-lg bg-black/50 p-2 border border-white/10 shrink-0 overflow-hidden">
                  <img src={product.image} alt={product.name} className="w-full h-full object-contain drop-shadow-lg" />
                </div>
                <div className="flex-1 min-w-0">
                  <h5 className="text-sm font-bold truncate">{product.name}</h5>
                  <p className="text-xs text-neutral-400 mt-1">K{product.price} ZMW</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-bold text-white">{sold}</p>
                  <p className="text-[10px] text-neutral-500 uppercase tracking-wider">Sold</p>
                </div>
              </div>
            )})}
            {products.length === 0 && (
              <div className="text-sm text-neutral-500 text-center py-8">No products available.</div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Orders & Delivery Details Table */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-[#1a1a1a] rounded-2xl border border-[#2a2a2a] overflow-hidden"
      >
        <div className="p-6 border-b border-[#2a2a2a]">
          <h4 className="text-lg font-bold">Recent Orders & Delivery Details</h4>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-neutral-300">
            <thead className="bg-[#222] text-neutral-400 text-xs uppercase">
              <tr>
                <th className="px-6 py-4 font-medium">Order ID</th>
                <th className="px-6 py-4 font-medium">Product</th>
                <th className="px-6 py-4 font-medium">Customer</th>
                <th className="px-6 py-4 font-medium">Delivery Address</th>
                <th className="px-6 py-4 font-medium">Amount</th>
                <th className="px-6 py-4 font-medium">Date</th>
                <th className="px-6 py-4 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2a2a2a]">
              {orders.slice(0, 10).map((order) => (
                <tr key={order.id} className="hover:bg-[#222]/50 transition-colors">
                  <td className="px-6 py-4 text-xs font-mono text-neutral-500">{order.id.slice(0, 8)}</td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-white">{order.product_name}</div>
                    <div className="text-xs text-neutral-500">Qty: {order.quantity}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-white">{order.customer_name}</div>
                    <div className="text-xs text-neutral-500">{order.customer_email}</div>
                    <div className="text-xs text-neutral-500">{order.delivery_phone}</div>
                  </td>
                  <td className="px-6 py-4 max-w-[250px]">
                    <div className="flex items-start gap-2">
                      <MapPin size={14} className="text-neutral-500 mt-0.5 shrink-0" />
                      <div className="text-xs">
                        {order.delivery_address}, {order.delivery_city}
                        {order.delivery_postal_code && \`, \${order.delivery_postal_code}\`}
                        <div className="text-neutral-500">{order.delivery_country}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-medium text-[#3ecf8e]">
                    K{Number(order.total_price).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-xs text-neutral-400">
                    {new Date(order.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <span className={\`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium \${
                      order.status === 'delivered' ? 'bg-green-500/10 text-green-400' :
                      order.status === 'pending' ? 'bg-yellow-500/10 text-yellow-400' :
                      'bg-blue-500/10 text-blue-400'
                    }\`}>
                      {order.status}
                    </span>
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-neutral-500">
                    No orders found yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
`;

fs.writeFileSync('src/components/DashboardTab.tsx', code);
console.log("Patched DashboardTab.tsx");
