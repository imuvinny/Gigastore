const fs = require('fs');
let code = fs.readFileSync('src/types.ts', 'utf-8');
code = code.replace('export interface VariantCondition {\n  name: string;\n  price: number;\n  available?: boolean;\n}', 'export interface VariantCondition {\n  name: string;\n  price: number;\n  available?: boolean;\n  description?: string;\n}');
fs.writeFileSync('src/types.ts', code);
