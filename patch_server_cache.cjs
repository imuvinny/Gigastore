const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

const targetFetch = 'const response = await fetch(`https://www.plug.tech/collections/${collection}/products.json?limit=250&_t=${Date.now()}`);';
const newFetch = 'const response = await fetch(`https://www.plug.tech/collections/${collection}/products.json?limit=250`);';

code = code.replace(targetFetch, newFetch);
fs.writeFileSync('server.ts', code);
console.log("Patched server.ts fetch cache");
