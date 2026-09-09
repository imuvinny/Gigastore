import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
async function run() {
  const { data: accs } = await supabase.from('products').select('name, price, colors').eq('brand', 'Accessories').limit(2);
  console.log('Accessory:', accs[0].name);
  console.log('Colors:', JSON.stringify(JSON.parse(accs[0].colors[0]), null, 2));
}
run();
