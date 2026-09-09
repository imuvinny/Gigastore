import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
async function run() {
  const { data } = await supabase.from('products').select('*').ilike('name', '%Pixel 10a%');
  const colors = JSON.parse(data[0].colors[0]);
  console.log('Pixel 10a', JSON.stringify(colors.storages[0].conditions, null, 2));

  const { data: data2 } = await supabase.from('products').select('*').ilike('name', '%Pixel 9 Obsidian 128GB (Unlocked)%');
  const colors2 = JSON.parse(data2[0].colors[0]);
  console.log('Pixel 9', JSON.stringify(colors2.storages[0].conditions, null, 2));
}
run();
