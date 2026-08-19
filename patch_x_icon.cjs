const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// replace my XIcon with FaXTwitter
code = code.replace(
  "import { NotFound404 } from './components/NotFound404';",
  "import { NotFound404 } from './components/NotFound404';\nimport { FaXTwitter } from 'react-icons/fa6';"
);

// remove XIcon definition
code = code.replace(
  /const XIcon = \(\{.*?<\/svg>\n\);\n/s,
  ""
);

// replace <XIcon size={16} /> with <FaXTwitter size={18} />
code = code.replace(
  /<XIcon size=\{16\} \/>/g,
  "<FaXTwitter size={18} />"
);

fs.writeFileSync('src/App.tsx', code);
