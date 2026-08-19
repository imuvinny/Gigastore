const fs = require('fs');
let code = fs.readFileSync('src/components/AdminPanel.tsx', 'utf8');
code = code.replace("CheckCircle2, AlertCircle, Plus", "CheckCircle2, AlertCircle, Plus, Settings");
fs.writeFileSync('src/components/AdminPanel.tsx', code);
