const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function run() {
  const syncedNames = new Set();
  
  // mock sync names
  for (let page = 1; page <= 8; page++) {
    const res = await fetch(`https://www.plug.tech/products.json?limit=250&page=${page}&currency=ZMW`);
    const data = await res.json();
    if (!data.products || data.products.length === 0) break;
    data.products.forEach(p => {
        let name = p.title;
        if (name) {
            name = name.replace(/plug\s*-\s*/i, '');
            name = name.replace(/\bplug\b/ig, '').trim();
        }
        syncedNames.add(name);
    });
  }
  
  console.log('Synced names count:', syncedNames.size);
  
  // fetch all products by paginating
  let allProducts = [];
  let from = 0;
  while (true) {
      const { data, error } = await supabase.from('products').select('id, name').range(from, from + 999);
      if (error || !data || data.length === 0) break;
      allProducts.push(...data);
      from += 1000;
  }
  
  console.log('Total products in DB:', allProducts.length);
  
  const toDelete = allProducts.filter(p => !syncedNames.has(p.name));
  console.log('To delete count:', toDelete.length);
  
  const clones = toDelete.filter(p => p.name.includes('12 Mini Blue'));
  console.log('Clones to delete:', clones.map(c => c.name));
}
run().catch(console.error);
