const fs = require('fs');
let content = fs.readFileSync('src/components/CartSidebar.tsx', 'utf8');

// The checkout container
content = content.replace(
  "className={`relative w-full ${checkoutState === 'checkout' ? 'max-w-4xl flex flex-col md:flex-row' : 'max-w-md flex flex-col'} bg-white h-full shadow-2xl overflow-hidden`}",
  "className={`relative w-full ${checkoutState === 'checkout' ? 'max-w-4xl flex flex-col md:flex-row overflow-y-auto md:overflow-hidden' : 'max-w-md flex flex-col overflow-hidden'} bg-white h-full shadow-2xl`}"
);

// The delivery form panel
content = content.replace(
  "className=\"w-full md:w-[55%] h-full overflow-y-auto p-6 md:p-12 bg-white flex flex-col\"",
  "className=\"w-full md:w-[55%] h-auto md:h-full overflow-y-visible md:overflow-y-auto p-6 md:p-12 bg-white flex flex-col shrink-0\""
);

// The summary panel
content = content.replace(
  "className=\"w-full md:w-[45%] bg-gray-50 h-full overflow-y-auto p-6 md:p-12 border-l border-gray-200\"",
  "className=\"w-full md:w-[45%] bg-gray-50 h-auto md:h-full overflow-y-visible md:overflow-y-auto p-6 md:p-12 border-t md:border-t-0 md:border-l border-gray-200 shrink-0\""
);

fs.writeFileSync('src/components/CartSidebar.tsx', content);
