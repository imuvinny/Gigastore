const fs = require('fs');

// Patch CartSidebar.tsx
let cartCode = fs.readFileSync('src/components/CartSidebar.tsx', 'utf-8');
cartCode = cartCode.replace(
  `  onRemove: (id: string) => void;\n}`,
  `  onRemove: (id: string) => void;\n  onClearCart: () => void;\n}`
);
cartCode = cartCode.replace(
  `CartSidebar({ cart, onClose, onUpdateQuantity, onRemove }: CartSidebarProps) {`,
  `CartSidebar({ cart, onClose, onUpdateQuantity, onRemove, onClearCart }: CartSidebarProps) {`
);
cartCode = cartCode.replace(
  `dispatch({ type: 'CLEAR_CART' });`,
  `onClearCart();`
);
fs.writeFileSync('src/components/CartSidebar.tsx', cartCode);

// Patch App.tsx
let appCode = fs.readFileSync('src/App.tsx', 'utf-8');
// Find where CartSidebar is rendered
appCode = appCode.replace(
  `<CartSidebar \n        cart={cart}\n        onClose={() => setIsCartOpen(false)}\n        onUpdateQuantity={updateQuantity}\n        onRemove={removeFromCart}\n      />`,
  `<CartSidebar \n        cart={cart}\n        onClose={() => setIsCartOpen(false)}\n        onUpdateQuantity={updateQuantity}\n        onRemove={removeFromCart}\n        onClearCart={() => setCart([])}\n      />`
);
// just in case format is slightly different
appCode = appCode.replace(
  `onRemove={removeFromCart}`,
  `onRemove={removeFromCart}\n        onClearCart={() => setCart([])}`
);

fs.writeFileSync('src/App.tsx', appCode);
console.log("Patched onClearCart");
