const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function run() {
  const { data: products } = await supabase.from('products').select('*').ilike('name', '%EarPods (3.5%');
  console.log(products);
}
run();
