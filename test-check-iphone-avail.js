import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
async function run() {
  const { data: iphones } = await supabase.from('products').select('name, price, colors').eq('name', 'iPhone 13 Pro (Unlocked)');
  const colors = JSON.parse(`[${iphones[0].colors.join(',')}]`);
  let minAvail = Infinity;
  colors.forEach(c => {
    c.storages.forEach(s => {
       s.conditions.forEach(cond => {
          if (cond.available) {
             console.log(`Available: ${c.name} ${s.name} ${cond.name} = ${cond.price}`);
             if (cond.price < minAvail) minAvail = cond.price;
          }
       });
    });
  });
  console.log('Min available:', minAvail);
}
run();
