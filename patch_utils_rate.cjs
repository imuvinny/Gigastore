const fs = require('fs');
let code = fs.readFileSync('src/utils.ts', 'utf-8');
code = code.replace(
  'export const ZMW_RATE = 21.66;',
  'export const ZMW_RATE = 20.02056;'
);
fs.writeFileSync('src/utils.ts', code);
