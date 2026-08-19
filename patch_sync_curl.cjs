const fs = require('fs');
let code = fs.readFileSync('sync-curl.ts', 'utf-8');
code = code.replace(
  'const stdout = execSync(curlCommand, { maxBuffer: 10 * 1024 * 1024 }).toString();',
  'await new Promise(r => setTimeout(r, 2000));\n      const stdout = execSync(curlCommand, { maxBuffer: 10 * 1024 * 1024 }).toString();'
);
fs.writeFileSync('sync-curl.ts', code);
