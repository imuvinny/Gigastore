const fs = require('fs');
let code = fs.readFileSync('src/components/AdminPanel.tsx', 'utf8');
code = code.replace("Plus } from 'lucide-react';", "Plus, Settings } from 'lucide-react';");
fs.writeFileSync('src/components/AdminPanel.tsx', code);
