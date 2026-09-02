const fs = require('fs');
let newContent = fs.readFileSync('server.ts.new', 'utf8');

newContent = newContent.replace(
  /const data = await response\.json\(\);\s*const products = data\.products;/g,
  `const data = await response.json();
        const products = data.products;
        const toUpsert: any[] = [];`
);
fs.writeFileSync('server.ts.new', newContent);
console.log('Replaced toUpsert block!');
