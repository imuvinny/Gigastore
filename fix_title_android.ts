import fs from 'fs';

let content = fs.readFileSync('server.ts', 'utf-8');

const regex = /item\.vendor === 'Google' \|\| item\.title\.includes\('Pixel'\)/g;
if (regex.test(content)) {
     content = content.replace(regex, `item.vendor === 'Google' || name.includes('Pixel')`);
     fs.writeFileSync('server.ts', content);
}

const regex2 = /item\.vendor === 'Samsung' \|\| item\.title\.includes\('Galaxy'\)/g;
if (regex2.test(content)) {
     content = content.replace(regex2, `item.vendor === 'Samsung' || name.includes('Galaxy')`);
     fs.writeFileSync('server.ts', content);
}

const regex3 = /const t = item\.title\.toLowerCase\(\);/g;
if (regex3.test(content)) {
     content = content.replace(regex3, `const t = name.toLowerCase();`);
     fs.writeFileSync('server.ts', content);
}
console.log('Successfully updated other title usages');
