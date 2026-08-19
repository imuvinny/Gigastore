const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function run() {
  const { data: products } = await supabase.from('products').select('*');
  products.forEach(p => {
    if (p.name.includes("Google Pixel 6 Pro")) {
      p.colors.forEach(cStr => {
        try {
          const c = JSON.parse(cStr);
          console.log(p.name, c.name, c.images);
        } catch(e) {}
      });
    }
  });
}
run();
