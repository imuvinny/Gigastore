import fs from 'fs';

let content = fs.readFileSync('src/components/DashboardTab.tsx', 'utf-8');

content = content.replace(/alert\(/g, "console.error(");
content = content.replace(/confirm\(/g, "console.error(");

fs.writeFileSync('src/components/DashboardTab.tsx', content);
