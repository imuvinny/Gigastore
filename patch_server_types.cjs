const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');
code = code.replace(
  'Array.from(c.storagesMap.values()).map(sData => ({',
  'Array.from(c.storagesMap.values()).map((sData: any) => ({'
);
code = code.replace(
  'Array.from(colorOptionsMap.values()).map(c => ({',
  'Array.from(colorOptionsMap.values()).map((c: any) => ({'
);
fs.writeFileSync('server.ts', code);
console.log('patched');
