const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace(
  'className="absolute right-0 bottom-0 w-full md:w-[65%] h-[85%] md:h-[95%] flex items-end justify-center md:justify-end opacity-40 md:opacity-100 pointer-events-none z-0"',
  'className="absolute md:right-0 bottom-0 w-full md:w-[65%] h-[60%] md:h-[95%] flex items-end justify-center md:justify-end opacity-60 md:opacity-100 pointer-events-none z-0 px-4 md:px-0"'
);

content = content.replace(
  'className="w-full h-full object-contain object-bottom mix-blend-lighten drop-shadow-[0_0_80px_rgba(255,255,255,0.15)] origin-bottom md:pr-12"',
  'className="w-[90%] md:w-full h-[90%] md:h-full object-contain object-bottom mix-blend-lighten drop-shadow-[0_0_80px_rgba(255,255,255,0.15)] origin-bottom md:pr-12"'
);

fs.writeFileSync('src/App.tsx', content);
