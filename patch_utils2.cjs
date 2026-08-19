const fs = require('fs');
let code = fs.readFileSync('src/utils.ts', 'utf-8');

const getProductPriceZMW = `export const getProductPriceZMW = (product: Product, baseZmwPrice: number) => {
  const n = product.name.toLowerCase();
  const c = (product.brand || '').toLowerCase();
  
  if (product.manualMarginZMW !== undefined && product.manualMarginZMW !== null) {
    return baseZmwPrice + Number(product.manualMarginZMW);
  }

  const isPhoneOrTablet = n.includes('iphone') || n.includes('pixel') || n.includes('galaxy') || n.includes('phone') || c.includes('phone') || n.includes('ipad') || n.includes('tablet') || c.includes('ipad');
  const isLaptop = n.includes('macbook') || n.includes('laptop') || c.includes('macbook');
  const isSpeaker = n.includes('speaker') || n.includes('pill') || c.includes('speaker');
  const isEarbud = n.includes('airpods') || n.includes('earbud') || n.includes('headphones') || n.includes('beats') || n.includes('bose') || c.includes('airpods') || c.includes('headphones') || n.includes('buds');

  let margin = 100;
  
  if (isLaptop) {
    margin = 2000;
  } else if (isPhoneOrTablet) {
    if (baseZmwPrice > 13000) {
      margin = (baseZmwPrice * 0.05) + 600;
    } else {
      margin = 600;
    }
  } else if (isSpeaker) {
    margin = 400;
  } else if (isEarbud) {
    margin = 200;
  }

  return baseZmwPrice + margin;
};`;

code = code.replace(
/export const getProductPriceZMW = \(product: Product, baseZmwPrice: number\) => \{[\s\S]*?\};/,
getProductPriceZMW
);

fs.writeFileSync('src/utils.ts', code);
