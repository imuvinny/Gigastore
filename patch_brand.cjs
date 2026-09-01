const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const regexBrand = /const brandMap[\s\S]*?\} else if \(item\.vendor === 'Beats'\) \{[\s\S]*?brand = 'Headphones';[\s\S]*?\}\s*\}/;

const replacementBrand = `          let brand = 'Other';
          const v = item.vendor || '';
          const t = item.product_type || '';
          if (v === 'Apple') {
            if (t === 'Phone' || t === 'Combined Listing' || name.includes('iPhone')) brand = 'Apple Phones';
            else if (t === 'Computer' || name.includes('MacBook')) brand = 'MacBooks';
            else if (t === 'Tablet' || name.includes('iPad')) brand = 'iPads';
            else if (t === 'Hearable' || name.includes('AirPods')) brand = 'AirPods';
            else if (t === 'Wearable' || name.includes('Watch')) brand = 'Apple Watches';
            else if (t === 'Accessory' || t === 'Case') brand = 'Accessories';
          } else if (v === 'Samsung') {
            if (t === 'Tablet' || name.includes('Tab')) brand = 'Samsung Tablets';
            else brand = 'Samsung Phones';
          } else if (v === 'Google') {
            brand = 'Google Phones';
          } else if (t === 'Hearable') {
            if (name.includes('speaker') || name.includes('pill') || v === 'JBL') brand = 'Speakers';
            else brand = 'Headphones';
          } else if (t === 'Accessory' || t === 'Case' || t === 'Screen Protector') {
            brand = 'Accessories';
          }
          
          if (brand === 'Other') {
            if (name.includes('iPhone')) brand = 'Apple Phones';
            else if (name.includes('MacBook')) brand = 'MacBooks';
            else if (name.includes('iPad')) brand = 'iPads';
            else if (name.includes('AirPods')) brand = 'AirPods';
            else if (name.includes('Watch')) brand = 'Apple Watches';
            else if (name.includes('Galaxy')) brand = 'Samsung Phones';
            else if (name.includes('Pixel')) brand = 'Google Phones';
          }`;

code = code.replace(regexBrand, replacementBrand);
fs.writeFileSync('server.ts', code);
console.log("Patched brand logic!");
