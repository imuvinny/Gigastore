const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

// Undo the fetch bypass logic
const targetLoop = `        // Now we fetch real-time data for each product to bypass Shopify cache
        const BATCH_SIZE = 5;
        for (let i = 0; i < products.length; i += BATCH_SIZE) {
          const batch = products.slice(i, i + BATCH_SIZE);
          await Promise.all(batch.map(async (cachedItem) => {
             let item = cachedItem;
             try {
                 const res = await fetch(\`https://www.plug.tech/products/\${cachedItem.handle}.js\`);
                 if (res.ok) {
                     const realItem = await res.json();
                     item = realItem;
                 }
             } catch(e) {
                 console.error("Failed to fetch real item", cachedItem.handle);
             }
             
             const name = item.title;`;

const newLoop = `        for (const item of products) {
          const name = item.title;`;
code = code.replace(targetLoop, newLoop);

const targetLoopEnd = `             if (updateError) console.error("Update error:", updateError.message);
             else updatedCount++;
          }
          })); // close Promise.all
        }`;

const newLoopEnd = `             if (updateError) console.error("Update error:", updateError.message);
             else updatedCount++;
          }
        }`;
code = code.replace(targetLoopEnd, newLoopEnd);

// Fix the fetch url to remove currency=ZMW
code = code.replace('?limit=250&currency=ZMW&_t=', '?limit=250&_t=');

fs.writeFileSync('server.ts', code);
console.log("Patched server.ts successfully");
