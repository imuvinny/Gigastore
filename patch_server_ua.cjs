const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

const targetFetch = 'const response = await fetch(`https://www.plug.tech/collections/${collection}/products.json?limit=250`);';
const newFetch = 'const response = await fetch(`https://www.plug.tech/collections/${collection}/products.json?limit=250`, { headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36", "Accept": "application/json" } });';

code = code.replace(targetFetch, newFetch);
fs.writeFileSync('server.ts', code);
console.log("Patched server.ts fetch User-Agent");
