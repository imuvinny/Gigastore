const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

const targetLoop = `        for (const item of products) {
          const name = item.title;`;

const newLoop = `        // Now we fetch real-time data for each product to bypass Shopify cache
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

code = code.replace(targetLoop, newLoop);

const targetLoopEnd = `      syncedProductNames.add(name);
          
        }`;

const newLoopEnd = `      syncedProductNames.add(name);
          
          }));
        }`;

code = code.replace(targetLoopEnd, newLoopEnd);

// Also need to adapt price from cents to dollars if it's from .js endpoint
// In products.json, price is a string like "289.99"
// In .js, price is a number in cents like 28999
const targetPrice = `const vPrice = parseFloat(v.price);`;
const newPrice = `const vPrice = typeof v.price === 'number' ? v.price / 100 : parseFloat(v.price);`;
code = code.replace(targetPrice, newPrice);

fs.writeFileSync('server.ts', code);
console.log("Patched server.ts with real-time .js fetching");
