const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');
code = code.replace(
  'w-[90%] h-[90%] md:w-full md:h-full object-contain',
  'w-[90%] h-[90%] object-contain'
);
fs.writeFileSync('src/App.tsx', code);
