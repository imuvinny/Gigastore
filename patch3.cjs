const fs = require('fs');
let content = fs.readFileSync('src/components/CartSidebar.tsx', 'utf8');

// The delivery form panel
content = content.replace(
  "className=\"w-full md:w-[55%] h-auto md:h-full overflow-y-visible md:overflow-y-auto p-6 md:p-12 bg-white flex flex-col shrink-0\"",
  "className=\"w-full md:w-[55%] h-auto md:h-full overflow-y-visible md:overflow-y-auto p-6 md:p-12 bg-white flex flex-col shrink-0 order-2 md:order-1\""
);

// The summary panel
content = content.replace(
  "className=\"w-full md:w-[45%] bg-gray-50 h-auto md:h-full overflow-y-visible md:overflow-y-auto p-6 md:p-12 border-t md:border-t-0 md:border-l border-black/20 shrink-0\"",
  "className=\"w-full md:w-[45%] bg-gray-50 h-auto md:h-full overflow-y-visible md:overflow-y-auto p-6 md:p-12 border-b md:border-b-0 md:border-l border-black/20 shrink-0 order-1 md:order-2\""
);

// In case the summary panel border-t replacement didn't catch, replace border-t with border-b on mobile
content = content.replace(
  "border-t md:border-t-0",
  "border-b md:border-b-0"
);

fs.writeFileSync('src/components/CartSidebar.tsx', content);
