import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
async function run() {
  const { data: iphones } = await supabase.from('products').select('name, price, colors').eq('name', 'iPhone 13 Pro (Unlocked)');
  const colors = JSON.parse(iphones[0].colors[0]);
  console.log('iPhone 13 Pro DB price:', iphones[0].price);
  console.log(JSON.stringify(colors.storages[0].conditions, null, 2));
}
run();
