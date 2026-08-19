const fs = require('fs');
let code = fs.readFileSync('src/components/AdminPanel.tsx', 'utf-8');

const targetStr = `    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[999] flex items-center justify-center p-6 bg-black/90 backdrop-blur-md"
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="w-full max-w-5xl h-[85vh] bg-[#1c1c1c] rounded-xl border border-[#2a2a2a] shadow-2xl flex flex-col overflow-hidden font-mono"
      >`;
      
const newStr = `    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[999] bg-[#1c1c1c]"
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="w-full h-full bg-[#1c1c1c] flex flex-col overflow-hidden font-mono"
      >`;

if (code.includes(targetStr)) {
  code = code.replace(targetStr, newStr);
  fs.writeFileSync('src/components/AdminPanel.tsx', code);
  console.log("Patched AdminPanel.tsx to fullscreen");
} else {
  console.log("Target string not found, doing flexible replacement");
  // Try regex
  code = code.replace(/className="fixed inset-0 z-\[999\] flex items-center justify-center p-6 bg-black\/90 backdrop-blur-md"/, 'className="fixed inset-0 z-[999] bg-[#1c1c1c]"');
  code = code.replace(/className="w-full max-w-5xl h-\[85vh\] bg-\[#1c1c1c\] rounded-xl border border-\[#2a2a2a\] shadow-2xl flex flex-col overflow-hidden font-mono"/, 'className="w-full h-full bg-[#1c1c1c] flex flex-col overflow-hidden font-mono"');
  fs.writeFileSync('src/components/AdminPanel.tsx', code);
  console.log("Patched AdminPanel.tsx to fullscreen via regex");
}
