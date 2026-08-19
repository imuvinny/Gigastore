const fs = require('fs');
let code = fs.readFileSync('sync-wayback.ts', 'utf-8');
code = code.replace('?limit=250', '');
fs.writeFileSync('sync-wayback.ts', code);
