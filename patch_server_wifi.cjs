const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');
code = code.replace(
  "opt.toLowerCase().includes('wifi')",
  "opt.toLowerCase().includes('wifi') || opt.toLowerCase().includes('wi-fi')"
);
fs.writeFileSync('server.ts', code);
console.log('patched');
