import fs from 'fs';

let content = fs.readFileSync('src/components/DashboardTab.tsx', 'utf-8');

// Add states for new metrics
content = content.replace(
  'const [totalVisits, setTotalVisits] = useState<number>(0);',
  `const [totalVisits, setTotalVisits] = useState<number>(0);
  const [totalUsers, setTotalUsers] = useState<number>(0);
  const [todaysOrders, setTodaysOrders] = useState<number>(0);
  const [todaysEarnings, setTodaysEarnings] = useState<number>(0);
  const [showTodaysOrders, setShowTodaysOrders] = useState(false);
  const [showTodaysEarnings, setShowTodaysEarnings] = useState(false);`
);

// Update fetchData
const fetchDataRegex = /async function fetchData\(\) \{[\s\S]*?setLoading\(false\);\n    \}/;

const newFetchData = `async function fetchData() {
      if (!supabase) {
        setLoading(false);
        return;
      }
      
      const { data: ordersData } = await supabase.from('orders').select('*').neq('status', 'pending').order('created_at', { ascending: false });
      if (ordersData) {
        setOrders(ordersData as Order[]);
      }

      const { data: visitsData } = await supabase.from('visits').select('visitor_id');
      if (visitsData) {
        setTotalVisits(visitsData.length);
        const uniqueUsers = new Set(visitsData.map(v => v.visitor_id)).size;
        setTotalUsers(uniqueUsers);
      }

      const { data: earningsData } = await supabase.from('company_earnings').select('*').order('created_at', { ascending: false });
      if (earningsData) {
        setEarnings(earningsData as CompanyEarning[]);
      }

      setLoading(false);
    }
    
    fetchData();

    // Setup Realtime Subscriptions
    if (supabase) {
      const ordersSub = supabase.channel('orders-changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
          fetchData();
        })
        .subscribe();

      const earningsSub = supabase.channel('earnings-changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'company_earnings' }, () => {
          fetchData();
        })
        .subscribe();
        
      const visitsSub = supabase.channel('visits-changes')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'visits' }, () => {
          fetchData();
        })
        .subscribe();

      return () => {
        supabase.removeChannel(ordersSub);
        supabase.removeChannel(earningsSub);
        supabase.removeChannel(visitsSub);
      };
    }`;

content = content.replace(fetchDataRegex, newFetchData);

content = content.replace('fetchData();\n  }, []);', '}, []);');

// Add Today's calculations inside component body
content = content.replace(
  'const [dbError, setDbError] = useState(false);',
  `const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const todaysOrdersList = orders.filter(o => new Date(o.created_at) >= startOfToday);
  const todaysEarningsList = earnings.length > 0 
    ? earnings.filter(e => new Date(e.created_at) >= startOfToday)
    : orders.filter(o => new Date(o.created_at) >= startOfToday).map(o => ({ net_profit: getOrderProfitZMW(o) }));
  
  const todaysOrdersCount = todaysOrdersList.length;
  const todaysEarningsTotal = todaysEarningsList.reduce((sum, e) => sum + Number(e.net_profit || 0), 0);

  const [dbError, setDbError] = useState(false);`
);

// Add the new cards
const statsCardsRegex = /<div className="grid grid-cols-1 md:grid-cols-3 gap-6">[\s\S]*?{showTotalRevenue && \([\s\S]*?\}\)/;

const newStatsCards = `<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xl shadow-black/5 flex items-center gap-4"
        >
          <div className="w-14 h-14 bg-black text-white rounded-2xl flex items-center justify-center shrink-0 shadow-md">
            <Users size={24} />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Total Users</p>
            <h4 className="text-3xl font-black text-black tracking-tight">{totalUsers}</h4>
          </div>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          onClick={() => setShowTodaysOrders(!showTodaysOrders)}
          className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xl shadow-black/5 flex items-center gap-4 cursor-pointer hover:border-black/20 hover:shadow-lg transition-all"
        >
          <div className="w-14 h-14 bg-blue-600 text-white rounded-2xl flex items-center justify-center shrink-0 shadow-md">
            <ShoppingBag size={24} />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Today's Orders</p>
            <h4 className="text-3xl font-black text-black tracking-tight">{todaysOrdersCount}</h4>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          onClick={() => setShowTodaysEarnings(!showTodaysEarnings)}
          className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xl shadow-black/5 flex items-center gap-4 cursor-pointer hover:border-black/20 hover:shadow-lg transition-all"
        >
          <div className="w-14 h-14 bg-green-500 text-white rounded-2xl flex items-center justify-center shrink-0 shadow-md">
            <DollarSign size={24} />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Today's Earnings</p>
            <h4 className="text-3xl font-black text-black tracking-tight">K{todaysEarningsTotal.toLocaleString()}</h4>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xl shadow-black/5 flex items-center gap-4 cursor-pointer hover:border-black/20 transition-all"
          onClick={() => setShowTotalRevenue(!showTotalRevenue)}
        >
          <div className="w-14 h-14 bg-black text-white rounded-2xl flex items-center justify-center shrink-0 shadow-md">
            <DollarSign size={24} />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Total Profit</p>
            <h4 className="text-3xl font-black text-black tracking-tight">
              {showTotalRevenue ? \`K\${totalEarnings.toLocaleString()}\` : '••••••'}
            </h4>
          </div>
        </motion.div>
      </div>

      {showTodaysOrders && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-blue-50 border border-blue-100 p-6 rounded-3xl"
        >
          <h4 className="font-bold mb-4 text-blue-900">Today's Orders ({todaysOrdersList.length})</h4>
          <div className="space-y-3">
            {todaysOrdersList.length > 0 ? todaysOrdersList.map(o => (
              <div key={o.id} className="bg-white p-4 rounded-xl shadow-sm text-sm flex justify-between items-center">
                <div>
                  <div className="font-bold">{o.product_name}</div>
                  <div className="text-gray-500">{o.customer_name} • {new Date(o.created_at).toLocaleTimeString()}</div>
                </div>
                <div className="font-bold">K{getOrderFinalZMW(o).toLocaleString()}</div>
              </div>
            )) : <div className="text-sm text-blue-600/70">No orders today yet.</div>}
          </div>
        </motion.div>
      )}

      {showTodaysEarnings && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-green-50 border border-green-100 p-6 rounded-3xl"
        >
          <h4 className="font-bold mb-4 text-green-900">Today's Earnings (K{todaysEarningsTotal.toLocaleString()})</h4>
          <div className="space-y-3">
            {todaysEarningsList.length > 0 ? todaysEarningsList.map((e: any, i) => (
              <div key={e.id || i} className="bg-white p-4 rounded-xl shadow-sm text-sm flex justify-between items-center">
                <div>
                  <div className="font-bold">{e.product_name || 'Order'}</div>
                  <div className="text-gray-500">{new Date(e.created_at || new Date()).toLocaleTimeString()}</div>
                </div>
                <div className="font-bold text-green-600">+K{Number(e.net_profit || 0).toLocaleString()}</div>
              </div>
            )) : <div className="text-sm text-green-600/70">No earnings today yet.</div>}
          </div>
        </motion.div>
      )}`;

content = content.replace(statsCardsRegex, newStatsCards);

fs.writeFileSync('src/components/DashboardTab.tsx', content);
