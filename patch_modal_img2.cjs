const fs = require('fs');
let code = fs.readFileSync('src/components/ProductDetailsModal.tsx', 'utf-8');
code = code.replace(
  'className="w-full h-full object-contain mix-blend-multiply"',
  'className="w-[85%] h-[85%] md:w-[75%] md:h-[75%] object-contain mix-blend-multiply drop-shadow-xl"'
);
fs.writeFileSync('src/components/ProductDetailsModal.tsx', code);
