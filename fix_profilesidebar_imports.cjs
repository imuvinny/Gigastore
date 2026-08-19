const fs = require('fs');
let code = fs.readFileSync('src/components/ProfileSidebar.tsx', 'utf-8');

code = code.replace(
  "import { formatProductZMW, getDisplayPriceUSD } from '../utils/pricing';",
  "import { formatRawZMW, calculateBaseZMW } from '../utils';"
);
fs.writeFileSync('src/components/ProfileSidebar.tsx', code);
console.log("Fixed imports");
