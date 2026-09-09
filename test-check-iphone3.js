import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
async function run() {
  const { data: iphones } = await supabase.from('products').select('name, price, colors, brand').eq('name', 'iPhone 13 Pro (Unlocked)');
  console.log('iPhone 13 Pro (Unlocked):', iphones[0].price);
  const colors = JSON.parse(iphones[0].colors[0]);
  console.log(JSON.stringify(colors.storages[0].conditions, null, 2));
}
run();
