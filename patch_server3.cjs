const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

// fix images logic for .js endpoint
const targetImage1 = `const image = item.images && item.images.length > 0 ? item.images[0].src : '';`;
const newImage1 = `const image = item.images && item.images.length > 0 ? (typeof item.images[0] === 'string' ? item.images[0] : item.images[0].src) : '';`;
code = code.replace(targetImage1, newImage1);

const targetImage2 = `const matchedImg = item.images.find(img => img.src && img.src.toLowerCase().replace(/[^a-z0-9]/g, '').includes(colorLower));
              if (matchedImg) imgUrl = matchedImg.src;`;
const newImage2 = `const matchedImg = item.images.find(img => {
                  const src = typeof img === 'string' ? img : img.src;
                  return src && src.toLowerCase().replace(/[^a-z0-9]/g, '').includes(colorLower);
              });
              if (matchedImg) imgUrl = typeof matchedImg === 'string' ? matchedImg : matchedImg.src;`;
code = code.replace(targetImage2, newImage2);

fs.writeFileSync('server.ts', code);
console.log("Patched server.ts images handling");
