import fs from 'fs';

let content = fs.readFileSync('src/components/DashboardTab.tsx', 'utf-8');

// Fix the undefined variables
content = content.replace(
  '{showTotalRevenue ? `K${totalEarnings.toLocaleString()}` : \'••••••\'}',
  '`K${totalNetEarningsFromTable.toLocaleString()}`'
);

content = content.replace(
  'onClick={() => setShowTotalRevenue(!showTotalRevenue)}',
  ''
);

fs.writeFileSync('src/components/DashboardTab.tsx', content);
