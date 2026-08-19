import fs from 'fs';

let content = fs.readFileSync('server.ts', 'utf-8');

const regex = /const margin = getProfitMarginZMW\(\{ name: item\.title, brand, price: rawPlugZmw \}\);/g;
if (regex.test(content)) {
     content = content.replace(regex, `const margin = getProfitMarginZMW({ name: name, brand, price: rawPlugZmw });`);
     fs.writeFileSync('server.ts', content);
     console.log('Successfully updated margin logic');
} else {
    console.log('Could not find margin logic');
}
