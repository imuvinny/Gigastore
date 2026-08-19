const fs = require('fs');
let code = fs.readFileSync('src/components/ProductDetailsModal.tsx', 'utf-8');
code = code.replace(
  'max-h-[40vh] md:max-h-none">',
  'max-h-[40vh] md:max-h-none p-4 md:p-8">'
);
fs.writeFileSync('src/components/ProductDetailsModal.tsx', code);
