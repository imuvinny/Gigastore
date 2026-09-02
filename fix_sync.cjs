const fs = require('fs');
const content = fs.readFileSync('server.ts', 'utf8');

let newContent = content.replace(
  /const \{ data: existingProducts \} = await supabase\s*\.from\('products'\)\s*\.select\('id'\)\s*\.eq\('name', name\);\s*const existingProduct = existingProducts\?\.\[0\];\s*if \(!existingProduct\) \{\s*const \{ error: insertError \} = await supabase\s*\.from\('products'\)\s*\.insert\(\[newProductData\]\);\s*if \(insertError\) console\.error\("Insert error:", insertError\.message\);\s*else \{\s*addedCount\+\+;\s*addedItems\.push\(\{ name, brand, price: basePrice, image \}\);\s*\}\s*\} else \{\s*const \{ error: updateError \} = await supabase\s*\.from\('products'\)\s*\.update\(newProductData\)\s*\.eq\('id', existingProduct\.id\);\s*if \(updateError\) console\.error\("Update error:", updateError\.message\);\s*else \{\s*updatedCount\+\+;\s*updatedItems\.push\(\{ name, brand, price: basePrice, image \}\);\s*\}\s*\}/g,
  `
          // Add to batch for upsert
          toUpsert.push(newProductData);
          if (existingMap.has(name)) {
            newProductData.id = existingMap.get(name);
            updatedCount++;
            updatedItems.push({ name, brand, price: basePrice, image });
          } else {
            addedCount++;
            addedItems.push({ name, brand, price: basePrice, image });
          }
`
);

// We need to inject the `existingMap` and `toUpsert` definitions before the loop
newContent = newContent.replace(
  /let exchangeRate = 20.05;/g,
  `const { data: allExisting } = await supabase.from('products').select('id, name');
      const existingMap = new Map((allExisting || []).map(p => [p.name, p.id]));
      let exchangeRate = 20.05;`
);

// We need to initialize `toUpsert` and execute it per page
newContent = newContent.replace(
  /const data = await response\.json\(\);\s*const products = data\.products \|\| \[\];/g,
  `const data = await response.json();
        const products = data.products || [];
        const toUpsert: any[] = [];`
);

newContent = newContent.replace(
  /if \(products\.length < 250\)/g,
  `if (toUpsert.length > 0) {
          const { error: batchError } = await supabase.from('products').upsert(toUpsert);
          if (batchError) console.error("Batch upsert error:", batchError.message);
        }
        if (products.length < 250)`
);


fs.writeFileSync('server.ts.new', newContent);
console.log('Replaced block!');
