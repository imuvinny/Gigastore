import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
async function run() {
  const { data } = await supabase.from('products').select('name, price, manualMarginZMW');
  console.log(JSON.stringify(data.filter(d => d.name.includes('Pixel 10a') || d.name.includes('Pixel 9 Obsidian 128GB (Unlocked)')), null, 2));
}
run();
