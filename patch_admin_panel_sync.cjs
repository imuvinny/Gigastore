const fs = require('fs');
let code = fs.readFileSync('src/components/AdminPanel.tsx', 'utf-8');

const targetStr = `alert(\`Sync complete! Added \${data.addedCount} new products and updated \${data.updatedCount} products.\`);`;
const newStr = `alert(\`Sync complete! Added \${data.addedCount} new products, updated \${data.updatedCount} products, and removed \${data.deletedCount} unavailable products.\`);`;

if (code.includes(targetStr)) {
  code = code.replace(targetStr, newStr);
  fs.writeFileSync('src/components/AdminPanel.tsx', code);
  console.log("Patched AdminPanel.tsx alert message.");
} else {
  console.log("Target string not found in AdminPanel.tsx");
}
