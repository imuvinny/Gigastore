import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
async function run() {
  const { data } = await supabase.from('products').select('*').ilike('name', '%Pixel%');
  for (const d of data) {
    if (d.name.includes('Pixel 8a') || d.name.includes('Pixel 9') || d.name.includes('Pixel 10a')) {
       console.log(`${d.name} | ID: ${d.id} | Price: ${d.price}`);
    }
  }
}
run();
