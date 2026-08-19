const fs = require('fs');
let code = fs.readFileSync('src/components/CartSidebar.tsx', 'utf-8');

const targetEffectStr = `    try {
      const ordersToInsert = cart.map(item => ({`;

const newEffectStr = `    try {
      const { data: { user } } = await supabase.auth.getUser();
      const userId = user ? user.id : null;
      
      const ordersToInsert = cart.map(item => ({
        user_id: userId,
        image_url: item.image,`;

code = code.replace(targetEffectStr, newEffectStr);
fs.writeFileSync('src/components/CartSidebar.tsx', code);
console.log("Patched CartSidebar.tsx to include user_id and image_url");
