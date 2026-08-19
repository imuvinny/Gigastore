import fs from 'fs';

let content = fs.readFileSync('src/components/AdminPanel.tsx', 'utf-8');

// Remove confirm from handleSync
content = content.replace(
  "if (!confirm('This will trigger the bot to fetch new products from plug.tech. Are you sure?')) return;",
  ""
);

content = content.replace(
  "alert('Sync failed: ' + data.error);",
  "console.error('Sync failed: ' + data.error);"
);

content = content.replace(
  "alert('Error triggering sync bot: ' + (error.message || 'Unknown error'));",
  "console.error('Error triggering sync bot: ' + (error.message || 'Unknown error'));"
);

// Remove confirm from handleDeleteProduct
content = content.replace(
  "if (!confirm(`Are you sure you want to delete \"${product.name}\"?`)) return;",
  ""
);

content = content.replace(
  "alert('Failed to delete product from database: ' + error.message);",
  "console.error('Failed to delete product from database: ' + error.message);"
);

// Any other alerts?
content = content.replace(/alert\(/g, "console.error(");

fs.writeFileSync('src/components/AdminPanel.tsx', content);
