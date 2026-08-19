const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

const targetDel = `      if (!fetchAllError && allProducts) {
        for (const p of allProducts) {
          if (!syncedProductNames.has(p.name)) {
            const { error: deleteError } = await supabase.from('products').delete().eq('id', p.id);
            if (deleteError) {
              console.error("Delete error:", deleteError.message);
            } else {
              deletedCount++;
            }
          }
        }
      }`;

const newDel = `      if (!fetchAllError && allProducts && addedCount > 0) { // Safety guard
        // Disable deleting to prevent data loss on 429 rate limit
      }`;

code = code.replace(targetDel, newDel);
fs.writeFileSync('server.ts', code);
console.log("Patched server.ts delete guard");
