const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function run() {
  const { data: products } = await supabase.from('products').select('*');
  let untitledImages = new Set();
  products.forEach(p => {
    if (p.colors) {
      p.colors.forEach(cStr => {
        try {
          const c = JSON.parse(cStr);
          if (c.images) {
            c.images.forEach(img => {
                if (img.includes("Untitled_500x500px")) untitledImages.add(img);
            });
          }
        } catch(e) {}
      });
    }
  });
  
  const urls = Array.from(untitledImages);
  console.log("Checking", urls.length, "URLs...");
  for (const url of urls) {
      try {
          const res = await fetch(url, { method: 'HEAD' });
          const len = parseInt(res.headers.get('content-length') || '0', 10);
          if (len > 200000) {
              console.log(url, len);
          }
      } catch (e) {
          console.log("Error", url);
      }
  }
}
run();
