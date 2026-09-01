const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function run() {
  const { data: products, error } = await supabase.from('products').select('id, colors');
  if (error) { console.error(error); return; }
  
  let count = 0;
  for (const p of products) {
    if (p.colors && p.colors.length > 0) {
      let changed = false;
      const newColors = p.colors.map(cStr => {
        try {
          const c = JSON.parse(cStr);
          if (c.storages) {
            c.storages.forEach(s => {
              if (s.conditions) {
                s.conditions.forEach(cond => {
                  if (cond.available === false) {
                    cond.available = true;
                    changed = true;
                  }
                });
              }
              if (s.connectivities) {
                  s.connectivities.forEach(conn => {
                      if (conn.conditions) {
                          conn.conditions.forEach(cond => {
                              if (cond.available === false) {
                                  cond.available = true;
                                  changed = true;
                              }
                          });
                      }
                  });
              }
            });
          }
          return JSON.stringify(c);
        } catch(e) { return cStr; }
      });
      
      if (changed) {
        await supabase.from('products').update({ colors: newColors }).eq('id', p.id);
        count++;
      }
    }
  }
  console.log('Fixed', count, 'products');
}
run();
