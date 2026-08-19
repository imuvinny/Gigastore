const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function run() {
  const { data: products } = await supabase.from('products').select('*');
  let uniqueImages = new Set();
  products.forEach(p => {
    if (p.colors) {
      p.colors.forEach(cStr => {
        try {
          const c = JSON.parse(cStr);
          if (c.images) {
            c.images.forEach(img => uniqueImages.add(img));
          }
        } catch(e) {}
      });
    }
  });
  console.log("Unique images:", uniqueImages.size);
}
run();
