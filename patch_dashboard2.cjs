const fs = require('fs');
let code = fs.readFileSync('src/components/DashboardTab.tsx', 'utf-8');

const target = `  if (loading) {
    return <div className="p-8 text-neutral-400">Loading dashboard data...</div>;
  }`;

const newTarget = `  const [dbError, setDbError] = useState(false);

  useEffect(() => {
    async function checkDb() {
      if (supabase) {
        const { error } = await supabase.from('orders').select('id').limit(1);
        if (error && error.code === '42P01') { // table does not exist
          setDbError(true);
        }
      }
    }
    checkDb();
  }, []);

  if (loading) {
    return <div className="p-8 text-neutral-400">Loading dashboard data...</div>;
  }`;

code = code.replace(target, newTarget);

const target2 = `      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold tracking-tight">Overview</h3>`;

const newTarget2 = `      {dbError && (
        <div className="bg-red-500/20 border border-red-500/50 p-4 rounded-xl text-red-200 mb-6">
          <h4 className="font-bold mb-2">Database Setup Required</h4>
          <p className="text-sm opacity-90">Please run the SQL commands in <code>supabase_schema.sql</code> to create the <strong>orders</strong> and <strong>visits</strong> tables.</p>
        </div>
      )}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold tracking-tight">Overview</h3>`;

code = code.replace(target2, newTarget2);

fs.writeFileSync('src/components/DashboardTab.tsx', code);
console.log("Added DB warning to DashboardTab.tsx");
