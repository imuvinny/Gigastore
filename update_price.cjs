const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function run() {
  const { data: product } = await supabase.from('products').select('*').ilike('name', '%EarPods (3.5%').single();
  if (product) {
      let colors = product.colors;
      let c = JSON.parse(colors[0]);
      c.storages[0].conditions[0].price = 1;
      colors[0] = JSON.stringify(c);
      await supabase.from('products').update({ price: 1, colors: colors }).eq('id', product.id);
      console.log('updated');
  }
}
run();
