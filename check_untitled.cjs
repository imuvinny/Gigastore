const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function run() {
  const { data: products } = await supabase.from('products').select('*');
  let untitledPhones = new Set();
  products.forEach(p => {
    if (p.colors) {
      p.colors.forEach(cStr => {
        try {
          const c = JSON.parse(cStr);
          if (c.images) {
            c.images.forEach(img => {
                if (img.includes("Untitled_500x500px")) untitledPhones.add(p.name);
            });
          }
        } catch(e) {}
      });
    }
  });
  console.log(Array.from(untitledPhones));
}
run();
