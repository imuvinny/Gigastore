import fs from 'fs';

let content = fs.readFileSync('src/components/DashboardTab.tsx', 'utf-8');

const statsCardsRegex = /\{?\/\* Stats Cards \*\/\}?\s*<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-6">[\s\S]*?(?=<div className="grid grid-cols-1 xl:grid-cols-3 gap-6">)/;

const newStatsCards = `{/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
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

      `;

content = content.replace(statsCardsRegex, newStatsCards);
fs.writeFileSync('src/components/DashboardTab.tsx', content);
