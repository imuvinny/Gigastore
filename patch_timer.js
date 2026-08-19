const fs = require('fs');
let code = fs.readFileSync('src/components/CartSidebar.tsx', 'utf-8');
code = code.replace(
`  useEffect(() => {
    if (checkoutState === 'success' || checkoutState === 'failure') {
      const timer = setTimeout(() => {
        setCheckoutState('cart');
        onClose();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [checkoutState, onClose]);`,
`  useEffect(() => {
    if (checkoutState === 'success') {
      const timer = setTimeout(() => {
        setCheckoutState('cart');
        onClose();
      }, 3000);
      return () => clearTimeout(timer);
    } else if (checkoutState === 'failure') {
      const timer = setTimeout(() => {
        setCheckoutState('checkout');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [checkoutState, onClose]);`);
fs.writeFileSync('src/components/CartSidebar.tsx', code);
