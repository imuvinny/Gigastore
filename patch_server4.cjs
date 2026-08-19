const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

const targetDesc = `const description = (item.body_html || '').replace(/(<([^>]+)?>)/gi, "");`;
const newDesc = `const description = (item.body_html || item.description || '').replace(/(<([^>]+)?>)/gi, "");`;
code = code.replace(targetDesc, newDesc);

fs.writeFileSync('server.ts', code);
console.log("Patched server.ts description handling");
