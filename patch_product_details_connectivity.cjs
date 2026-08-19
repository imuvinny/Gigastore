const fs = require('fs');
let code = fs.readFileSync('src/components/ProductDetailsModal.tsx', 'utf-8');

const targetHeader = `<h3 className="text-sm font-bold text-black uppercase tracking-widest mb-1">Choose Your Color</h3>`;
const newHeader = `{parsedColors.some(c => c.name.toLowerCase().includes('wifi') || c.name.toLowerCase().includes('cellular')) ? (
                <h3 className="text-sm font-bold text-black uppercase tracking-widest mb-1">Select Connectivity</h3>
              ) : (
                <h3 className="text-sm font-bold text-black uppercase tracking-widest mb-1">Choose Your Color</h3>
              )}`;

const targetDesc = `<p className="text-xs text-gray-500 mb-4">A color that matches your style. Designed to stand out.</p>`;
const newDesc = `{parsedColors.some(c => c.name.toLowerCase().includes('wifi') || c.name.toLowerCase().includes('cellular')) ? (
                <p className="text-xs text-gray-500 mb-4">Choose how you want to connect.</p>
              ) : (
                <p className="text-xs text-gray-500 mb-4">A color that matches your style. Designed to stand out.</p>
              )}`;

code = code.replace(targetHeader, newHeader).replace(targetDesc, newDesc);
fs.writeFileSync('src/components/ProductDetailsModal.tsx', code);
console.log("Patched ProductDetailsModal for connectivity");
