import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
async function run() {
  const { data: iphones } = await supabase.from('products').select('name, price, colors').eq('name', 'iPhone 13 Pro (Unlocked)');
  const colors = JSON.parse(`[${iphones[0].colors.join(',')}]`);
  colors.forEach(c => {
    c.storages.forEach(s => {
       s.conditions.forEach(cond => {
          if (cond.price === 7658) {
             console.log(`Found 7658! Color: ${c.name}, Storage: ${s.name}, Condition: ${cond.name}`);
          }
       });
    });
  });
}
run();
