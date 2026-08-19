const fs = require('fs');
let code = fs.readFileSync('src/components/CartSidebar.tsx', 'utf-8');

const targetStr = `{checkoutState === 'cart' ? (`;

const newStr = `{checkoutState === 'success' ? (
          <div className="fixed inset-0 z-[1000] bg-white flex flex-col items-center justify-center">
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', damping: 15 }}
              className="w-32 h-32 rounded-full border-4 border-black flex items-center justify-center mb-6"
            >
              <svg className="w-16 h-16 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
            </motion.div>
            <motion.h2
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-3xl font-black text-black"
            >
              Payment Successful
            </motion.h2>
          </div>
        ) : checkoutState === 'cart' ? (`;

code = code.replace(targetStr, newStr);

// Now we need to add the 3 second timeout when it hits success
const targetEffectStr = `  const [isSubmitting, setIsSubmitting] = useState(false);`;

const newEffectStr = `  const [isSubmitting, setIsSubmitting] = useState(false);

  import_react_useEffect(() => {
    if (checkoutState === 'success') {
      const timer = setTimeout(() => {
        setCheckoutState('cart');
        onClose();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [checkoutState, onClose]);`;

code = code.replace(targetEffectStr, newEffectStr.replace('import_react_useEffect', 'React.useEffect'));

if (!code.includes("import React, { useState")) {
    if (code.includes("import { useState } from 'react';")) {
        code = code.replace("import { useState } from 'react';", "import React, { useState, useEffect } from 'react';");
        code = code.replace(/React\.useEffect/g, 'useEffect');
    }
}

fs.writeFileSync('src/components/CartSidebar.tsx', code);
console.log("Patched success state in CartSidebar.tsx");
