import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
async function run() {
  const { error } = await supabase.from('products').upsert([{
      id: crypto.randomUUID(),
      name: 'Test Product ' + Date.now(),
      brand: 'Test Brand',
      price: 100,
      image: '',
      description: '',
      colors: [],
      accentColor: '#000000'
  }]);
  console.log(error);
}
run();
