const fs = require('fs');
let code = fs.readFileSync('src/utils.ts', 'utf-8');

// We just want to use the true plug tech price (USD) * Exchange Rate, with NO extra markup.
// Let's modify MARKUP_MULTIPLIER
code = code.replace('export const MARKUP_MULTIPLIER = 1.15;', 'export const MARKUP_MULTIPLIER = 1.0;');

// Let's modify getProductPriceZMW to just return baseZmwPrice
code = code.replace(
/export const getProductPriceZMW = \(product: Product, baseZmwPrice: number\) => \{[\s\S]*?return baseZMW \+ marginZMW;\n\};/,
`export const getProductPriceZMW = (product: Product, baseZmwPrice: number) => {
  return baseZmwPrice;
};`
);

fs.writeFileSync('src/utils.ts', code);
