
import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Users, DollarSign, ShoppingBag, MapPin, Database, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Product, Order, Visit, CompanyEarning } from '../types';
import { supabase } from '../lib/supabase';
import { getOrderProfitZMW, getOrderFinalZMW } from '../utils';

interface DashboardTabProps {
  products: Product[];
}

export function DashboardTab({ products }: DashboardTabProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [totalVisits, setTotalVisits] = useState<number>(0);
  const [earnings, setEarnings] = useState<CompanyEarning[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      if (!supabase) {
        setLoading(false);
        return;
      }
      
      const { data: ordersData } = await supabase.from('orders').select('*').neq('status', 'pending').order('created_at', { ascending: false });
      if (ordersData) setOrders(ordersData as Order[]);

      const { count: visitsCount } = await supabase.from('visits').select('*', { count: 'exact', head: true });
      if (visitsCount !== null) setTotalVisits(visitsCount);

      const { data: earningsData } = await supabase.from('company_earnings').select('*').order('created_at', { ascending: false });
      if (earningsData) setEarnings(earningsData as CompanyEarning[]);

      setLoading(false);
    }
    
    fetchData();
  }, []);

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    if (!supabase) return;
    try {
      const { error } = await supabase.from('orders').update({ status: newStatus }).eq('id', orderId);
      if (error) throw error;
      setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    } catch (err: any) {
      alert("Failed to update status: " + err.message);
    }
  };

  const currentDate = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  const totalRevenueFromOrders = orders.reduce((acc, o) => acc + getOrderProfitZMW(o), 0);
  const totalNetEarningsFromTable = earnings.length > 0 
    ? earnings.reduce((acc, e) => acc + Number(e.net_profit || 0), 0)
    : totalRevenueFromOrders;

  const totalOrders = orders.length;

  const monthlyRevenue = Array.from({ length: 12 }, (_, i) => {
    const monthName = new Date(0, i).toLocaleString('en-US', { month: 'short' });
    return { name: monthName, value: 0 };
  });

  if (earnings.length > 0) {
    earnings.forEach(e => {
      const date = new Date(e.created_at);
      const monthIndex = date.getMonth();
      monthlyRevenue[monthIndex].value += Number(e.net_profit || 0);
    });
  } else {
    orders.forEach(o => {
      const date = new Date(o.created_at);
      const monthIndex = date.getMonth();
      monthlyRevenue[monthIndex].value += getOrderProfitZMW(o);
    });
  }

  const [dbError, setDbError] = useState(false);

  useEffect(() => {
    async function checkDb() {
      if (supabase) {
        const { error } = await supabase.from('orders').select('id').limit(1);
        if (error && error.code === '42P01') {
          setDbError(true);
        }
      }
    }
    checkDb();
  }, []);

  if (loading) {
    return <div className="p-8 text-gray-400 font-medium">Loading dashboard data...</div>;
  }

  return (
    <div className="space-y-6 text-black font-sans pb-12">
      {dbError && (
        <div className="bg-red-50 border border-red-200 p-4 rounded-2xl text-red-700 mb-6">
          <h4 className="font-bold mb-1">Database Setup Required</h4>
          <p className="text-xs">Please run the SQL commands in <code>supabase_schema.sql</code> to create the <strong>orders</strong> and <strong>visits</strong> tables.</p>
        </div>
      )}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-black text-black tracking-tight">Overview</h3>
          <p className="text-xs font-semibold text-gray-500">{currentDate}</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xl shadow-black/5 flex items-center gap-4"
        >
          <div className="w-14 h-14 bg-black text-white rounded-2xl flex items-center justify-center shrink-0 shadow-md">
            <Users size={24} />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Total Visitors</p>
            <h4 className="text-3xl font-black text-black tracking-tight">{totalVisits}</h4>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xl shadow-black/5 flex items-center gap-4"
        >
          <div className="w-14 h-14 bg-black text-white rounded-2xl flex items-center justify-center shrink-0 shadow-md">
            <DollarSign size={24} />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Company Net Earnings</p>
            <h4 className="text-3xl font-black text-black tracking-tight">K{totalNetEarningsFromTable.toLocaleString()} ZMW</h4>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xl shadow-black/5 flex items-center gap-4"
        >
          <div className="w-14 h-14 bg-black text-white rounded-2xl flex items-center justify-center shrink-0 shadow-md">
            <ShoppingBag size={24} />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Orders</p>
            <h4 className="text-3xl font-black text-black tracking-tight">{totalOrders}</h4>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Chart */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white p-6 md:p-8 rounded-3xl border border-gray-100 shadow-xl shadow-black/5 xl:col-span-2"
        >
          <h4 className="text-lg font-black text-black mb-6">Earnings Profit (Jan - Dec)</h4>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyRevenue} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis dataKey="name" stroke="#a0a0a0" tick={{ fill: '#666', fontSize: 12, fontWeight: 600 }} axisLine={false} tickLine={false} />
                <YAxis stroke="#a0a0a0" tick={{ fill: '#666', fontSize: 12, fontWeight: 600 }} axisLine={false} tickLine={false} tickFormatter={(value) => `K${value}`} />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.08)' }}
                  itemStyle={{ color: '#0284c7', fontWeight: 'bold' }}
                />
                <Bar dataKey="value" fill="#38bdf8" radius={[6, 6, 0, 0]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Top Products */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white p-6 md:p-8 rounded-3xl border border-gray-100 shadow-xl shadow-black/5 flex flex-col"
        >
          <div className="flex items-center justify-between mb-6">
            <h4 className="text-lg font-black text-black">Top Products</h4>
          </div>
          <div className="space-y-3 flex-1 overflow-auto pr-1 max-h-[300px]">
            {(() => {
               // Group orders by product_name
               const productSales: Record<string, { name: string; sold: number; image: string; price: number }> = {};
               
               const extractBaseName = (fullName: string) => {
                  let str = fullName.replace(/\(.*?\)/g, '').trim(); 
                  const bases = ['iPhone 15 Pro Max', 'iPhone 15 Pro', 'iPhone 15 Plus', 'iPhone 15',
                                 'iPhone 14 Pro Max', 'iPhone 14 Pro', 'iPhone 14 Plus', 'iPhone 14',
                                 'iPhone 13 Pro Max', 'iPhone 13 Pro', 'iPhone 13 mini', 'iPhone 13',
                                 'iPhone 12 Pro Max', 'iPhone 12 Pro', 'iPhone 12 mini', 'iPhone 12',
                                 'iPhone 11 Pro Max', 'iPhone 11 Pro', 'iPhone 11', 'iPhone XR', 'iPhone X',
                                 'iPhone SE', 'iPhone 8 Plus', 'iPhone 8', 'iPhone 7 Plus', 'iPhone 7',
                                 'Google Pixel 9 Pro Fold', 'Google Pixel 9 Pro XL', 'Google Pixel 9 Pro', 'Google Pixel 9a', 'Google Pixel 9',
                                 'Google Pixel 8 Pro', 'Google Pixel 8a', 'Google Pixel 8',
                                 'Google Pixel 7 Pro', 'Google Pixel 7a', 'Google Pixel 7',
                                 'Google Pixel 6 Pro', 'Google Pixel 6a', 'Google Pixel 6',
                                 'Samsung Galaxy S24 Ultra', 'Samsung Galaxy S24+', 'Samsung Galaxy S24',
                                 'Samsung Galaxy S23 Ultra', 'Samsung Galaxy S23+', 'Samsung Galaxy S23 FE', 'Samsung Galaxy S23',
                                 'Samsung Galaxy Z Fold', 'Samsung Galaxy Z Flip', 'MacBook Air', 'MacBook Pro', 'iPad Pro', 'iPad Air', 'iPad mini', 'iPad', 'AirPods Pro', 'AirPods Max', 'AirPods'
                                 ];
                  for (let b of bases) {
                     if (str.toLowerCase().includes(b.toLowerCase())) return b;
                  }
                  str = str.replace(/\b(128GB|256GB|512GB|1TB|64GB|32GB|16GB)\b/gi, '');
                  const colors = ['Midnight', 'Starlight', 'Blue', 'Pink', 'Green', 'Red', 'Space Gray', 'Silver', 'Gold', 'Graphite', 'Sierra Blue', 'Alpine Green', 'Purple', 'Yellow', 'Black', 'White', 'Obsidian', 'Bay', 'Porcelain', 'Hazel', 'Rose', 'Mint'];
                  for (let c of colors) {
                      const regex = new RegExp(`\\b${c}\\b`, 'gi');
                      str = str.replace(regex, '');
                  }
                  return str.replace(/\s{2,}/g, ' ').trim() || fullName;
               };

               orders.forEach(order => {
                  const rawName = order.product_name;
                  if (!rawName) return;
                  const name = extractBaseName(rawName);
                  
                  if (!productSales[name]) {
                     const normalizeString = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
                     const normName = normalizeString(name);
                     let matchedProduct = products.find(p => normName.includes(normalizeString(p.name)));
                     
                     if (!matchedProduct) {
                         matchedProduct = products.find(p => normalizeString(p.name).includes(normName));
                     }
                     
                     productSales[name] = { 
                       name, 
                       sold: 0, 
                       image: matchedProduct?.image || 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=100&q=80',
                       price: order.total_price / (order.quantity || 1)
                     };
                  }
                  productSales[name].sold += (order.quantity || 1);
               });
               
               const topSelling = Object.values(productSales).sort((a, b) => b.sold - a.sold).slice(0, 10);
               
               if (topSelling.length === 0) {
                 return <div className="text-sm text-gray-400 text-center py-8 font-medium">No sales yet.</div>;
               }
               
               return topSelling.map((item, index) => (
              <div key={index} className="flex items-center gap-4 bg-gray-50 p-3 rounded-2xl border border-gray-100 hover:bg-gray-100/80 transition-colors">
                <div className="w-12 h-12 rounded-xl bg-white p-2 border border-gray-200 shrink-0 overflow-hidden flex items-center justify-center">
                  <img src={item.image} alt={item.name} className="w-full h-full object-contain mix-blend-multiply" />
                </div>
                <div className="flex-1 min-w-0">
                  <h5 className="text-sm font-bold text-black truncate" title={item.name}>{item.name}</h5>
                  <p className="text-xs font-semibold text-gray-500 mt-0.5">Avg K{Math.round(item.price).toLocaleString()}</p>
                </div>
                <div className="text-right shrink-0">
                  <span className="bg-black text-white text-xs font-bold px-3 py-1 rounded-full">{item.sold} sold</span>
                </div>
              </div>
            ))})()}
          </div>
        </motion.div>
      </div>


      {/* Company Earnings Transaction Logs Table */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.48 }}
        className="bg-white rounded-3xl border border-gray-100 shadow-xl shadow-black/5 overflow-hidden"
      >
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp size={20} className="text-black" />
            <h4 className="text-lg font-black text-black">Company Earnings</h4>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-800">
            <thead className="bg-gray-50 text-gray-500 text-xs font-bold uppercase border-b border-gray-100">
              <tr>
                <th className="px-6 py-4">Transaction ID</th>
                <th className="px-6 py-4">Product Name</th>
                <th className="px-6 py-4">Gross Revenue</th>
                <th className="px-6 py-4">Net Company Profit</th>
                <th className="px-6 py-4">Currency</th>
                <th className="px-6 py-4">Date Logged</th>
                <th className="px-6 py-4">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {earnings.length > 0 ? (
                earnings.slice(0, 10).map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="px-6 py-4 text-xs font-mono font-bold text-gray-400">{item.id.slice(0, 8)}</td>
                    <td className="px-6 py-4 font-bold text-black">{item.product_name}</td>
                    <td className="px-6 py-4 font-bold text-gray-900">K{Number(item.gross_amount).toLocaleString()}</td>
                    <td className="px-6 py-4 font-black text-green-600">+K{Number(item.net_profit).toLocaleString()}</td>
                    <td className="px-6 py-4 text-xs font-bold text-gray-500">{item.currency || 'ZMW'}</td>
                    <td className="px-6 py-4 text-xs font-semibold text-gray-500">{new Date(item.created_at).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-xs font-medium text-gray-500">{item.notes || '—'}</td>
                  </tr>
                ))
              ) : orders.length > 0 ? (
                orders.slice(0, 10).map((o) => {
                  const profit = getOrderProfitZMW(o);
                  const gross = getOrderFinalZMW(o);
                  return (
                    <tr key={o.id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="px-6 py-4 text-xs font-mono font-bold text-gray-400">{o.id.slice(0, 8)}</td>
                      <td className="px-6 py-4 font-bold text-black">{o.product_name}</td>
                      <td className="px-6 py-4 font-bold text-gray-900">K{gross.toLocaleString()}</td>
                      <td className="px-6 py-4 font-black text-green-600">+K{profit.toLocaleString()}</td>
                      <td className="px-6 py-4 text-xs font-bold text-gray-500">ZMW</td>
                      <td className="px-6 py-4 text-xs font-semibold text-gray-500">{new Date(o.created_at).toLocaleDateString()}</td>
                      <td className="px-6 py-4 text-xs font-medium text-gray-500">Estimated from Order #{o.id.slice(0, 6)}</td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-400 font-medium">
                    No financial transaction logs found in company_earnings table yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Orders & Delivery Details Table */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white rounded-3xl border border-gray-100 shadow-xl shadow-black/5 overflow-hidden"
      >
        <div className="p-6 border-b border-gray-100">
          <h4 className="text-lg font-black text-black">Recent Orders & Delivery Details</h4>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-800">
            <thead className="bg-gray-50 text-gray-500 text-xs font-bold uppercase border-b border-gray-100">
              <tr>
                <th className="px-6 py-4">Order ID</th>
                <th className="px-6 py-4">Product</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Delivery Address</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {orders.slice(0, 10).map((order) => {
                const finalZMW = getOrderFinalZMW(order);
                return (
                  <tr key={order.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="px-6 py-4 text-xs font-mono font-bold text-gray-400">
                      {order.order_number || order.id.slice(0, 8)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-black">{order.product_name}</div>
                      <div className="text-xs font-semibold text-gray-500">Qty: {order.quantity}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-black">{order.customer_name}</div>
                      <div className="text-xs font-medium text-gray-500">{order.customer_email}</div>
                      <div className="text-xs font-medium text-gray-500">{order.delivery_phone}</div>
                    </td>
                    <td className="px-6 py-4 max-w-[250px]">
                      <div className="flex items-start gap-2">
                        <MapPin size={14} className="text-gray-400 mt-0.5 shrink-0" />
                        <div className="text-xs font-medium text-gray-700">
                          {order.delivery_address}, {order.delivery_city}
                          {order.delivery_postal_code && `, ${order.delivery_postal_code}`}
                          <div className="text-gray-400">{order.delivery_country}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-black text-base text-black">
                      K{finalZMW.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-xs font-semibold text-gray-500">
                      {new Date(order.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <select 
                        value={order.status}
                        onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                        className={`inline-flex outline-none items-center px-3 py-1 rounded-full text-xs font-bold appearance-none cursor-pointer ${
                          order.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                          order.status === 'On the Way' ? 'bg-indigo-100 text-indigo-800' :
                          order.status === 'Shipped' ? 'bg-blue-100 text-blue-800' :
                          (order.status === 'paid' || order.status === 'Processing') ? 'bg-amber-100 text-amber-800' :
                          'bg-gray-100 text-gray-800'
                        }`}
                      >
                        <option value="paid">Paid (New)</option>
                        <option value="Processing">Processing</option>
                        <option value="Shipped">Shipped</option>
                        <option value="On the Way">On the Way</option>
                        <option value="Delivered">Delivered</option>
                      </select>
                    </td>
                  </tr>
                );
              })}
              {orders.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-400 font-medium">
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
