const fs = require('fs');
let code = fs.readFileSync('src/components/ProfileSidebar.tsx', 'utf-8');

const targetEffectStr = `  const [userAuth, setUserAuth] = useState<any>(null);`;
const newEffectStr = `  const [userAuth, setUserAuth] = useState<any>(null);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);`;

code = code.replace(targetEffectStr, newEffectStr);

const fetchTargetStr = `        const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        if (data) {`;

const fetchNewStr = `        const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        if (data) {
           // Also fetch orders
           const { data: orders } = await supabase.from('orders').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(5);
           if (orders) setRecentOrders(orders);
           `;

code = code.replace(fetchTargetStr, fetchNewStr);

fs.writeFileSync('src/components/ProfileSidebar.tsx', code);
console.log("Patched ProfileSidebar.tsx to fetch orders");
