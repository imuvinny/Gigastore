const fs = require('fs');
let code = fs.readFileSync('src/utils.ts', 'utf-8');

const target = `    l.includes("accessories")
  );
};`;

const newCode = `    l.includes("accessories") ||
    // Specific blocklist for known lifestyle/box images that don't follow the naming convention
    l.includes("142911.925") || // Pixel 6 Pro Sorta Sunny Lifestyle
    l.includes("141357.102") || // Pixel 6 Pro Black Lifestyle
    l.includes("pixel10shopify") // Pixel 10 What's in the box
  );
};`;

code = code.replace(target, newCode);
fs.writeFileSync('src/utils.ts', code);
