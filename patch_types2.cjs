const fs = require('fs');
let code = fs.readFileSync('src/types.ts', 'utf-8');
code = code.replace(
  /export interface VariantCondition \{\s*name: string;\s*price: number;\s*available: boolean;\s*\}/g,
  'export interface VariantCondition {\n  name: string;\n  price: number;\n  available?: boolean;\n  description?: string;\n}'
);
fs.writeFileSync('src/types.ts', code);
