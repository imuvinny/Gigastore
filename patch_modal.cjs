const fs = require('fs');
let code = fs.readFileSync('src/components/ProductDetailsModal.tsx', 'utf-8');
code = code.replace(
  'animate={{ opacity: 1, scale: 1.15 }}',
  'animate={{ opacity: 1, scale: 1.0 }}'
);
fs.writeFileSync('src/components/ProductDetailsModal.tsx', code);
