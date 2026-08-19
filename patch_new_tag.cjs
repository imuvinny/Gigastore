const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');
code = code.replace(
`                       {isNewItem && (
                         <div className="absolute top-3 left-3 z-20 bg-emerald-500 text-black text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider shadow-lg flex items-center gap-1 border border-emerald-400">
                           <Sparkles size={10} /> NEW
                         </div>
                       )}`,
'');
fs.writeFileSync('src/App.tsx', code);
