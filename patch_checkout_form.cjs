const fs = require('fs');
let code = fs.readFileSync('src/components/CartSidebar.tsx', 'utf-8');

// We need to replace the checkout form part with a controlled form.
// Since it's a huge component, I will write a script to replace the entire <form> block.

// 1. Add states for the form
code = code.replace(
  `  const [checkoutState, setCheckoutState] = useState<'cart' | 'checkout'>('cart');`,
  `  const [checkoutState, setCheckoutState] = useState<'cart' | 'checkout' | 'success'>('cart');
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    company: '',
    address: '',
    apartment: '',
    city: '',
    postalCode: '',
    phone: '',
    country: 'Zambia'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) {
      alert("Database is not connected. Cannot place order.");
      return;
    }
    
    setIsSubmitting(true);
    try {
      const ordersToInsert = cart.map(item => ({
        product_name: item.name + (item.selectedCondition ? \` (\${item.selectedCondition.name})\` : ''),
        quantity: item.quantity,
        total_price: item.finalPrice || item.price,
        customer_name: \`\${formData.firstName} \${formData.lastName}\`.trim(),
        customer_email: formData.email,
        delivery_address: \`\${formData.address} \${formData.apartment}\`.trim(),
        delivery_city: formData.city,
        delivery_postal_code: formData.postalCode,
        delivery_phone: formData.phone,
        delivery_country: formData.country,
        status: 'pending'
      }));

      const { error } = await supabase.from('orders').insert(ordersToInsert);
      
      if (error) {
        console.error("Order error:", error);
        alert("Failed to place order: " + error.message);
      } else {
        setCheckoutState('success');
        dispatch({ type: 'CLEAR_CART' });
      }
    } catch (err: any) {
      alert("Unexpected error: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };`
);

// 2. Replace the form
const oldFormStr = `<h2 className="text-xl font-bold mb-4 text-black">Contact</h2>
                <div className="mb-8">
                  <input type="email" placeholder="Email" className="w-full p-4 border border-black rounded-xl bg-white text-gray-900 placeholder:text-gray-500 font-bold focus:border-black focus:ring-0 outline-none transition-colors" />
                </div>
                <h2 className="text-xl font-bold mb-4 text-black">Delivery</h2>
                <form className="space-y-4 mb-8">
                  <div>
                    <select className="w-full p-4 border border-black rounded-xl bg-white text-gray-900 font-bold focus:border-black focus:ring-0 outline-none transition-colors appearance-none">
                      <option>Zambia</option>
                    </select>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <input type="text" placeholder="First name" className="w-full p-4 border border-black rounded-xl bg-white text-gray-900 placeholder:text-gray-500 font-bold focus:border-black focus:ring-0 outline-none transition-colors" />
                    <input type="text" placeholder="Last name" className="w-full p-4 border border-black rounded-xl bg-white text-gray-900 placeholder:text-gray-500 font-bold focus:border-black focus:ring-0 outline-none transition-colors" />
                  </div>
                  <input type="text" placeholder="Company (optional)" className="w-full p-4 border border-black rounded-xl bg-white text-gray-900 placeholder:text-gray-500 font-bold focus:border-black focus:ring-0 outline-none transition-colors" />
                  <input type="text" placeholder="Address" className="w-full p-4 border border-black rounded-xl bg-white text-gray-900 placeholder:text-gray-500 font-bold focus:border-black focus:ring-0 outline-none transition-colors" />
                  <input type="text" placeholder="Apartment, suite, etc. (optional)" className="w-full p-4 border border-black rounded-xl bg-white text-gray-900 placeholder:text-gray-500 font-bold focus:border-black focus:ring-0 outline-none transition-colors" />
                  
                  <div className="grid grid-cols-2 gap-4">
                    <input type="text" placeholder="City" className="w-full p-4 border border-black rounded-xl bg-white text-gray-900 placeholder:text-gray-500 font-bold focus:border-black focus:ring-0 outline-none transition-colors" />
                    <input type="text" placeholder="Postal code (optional)" className="w-full p-4 border border-black rounded-xl bg-white text-gray-900 placeholder:text-gray-500 font-bold focus:border-black focus:ring-0 outline-none transition-colors" />
                  </div>
                  
                  <input type="text" placeholder="Phone" className="w-full p-4 border border-black rounded-xl bg-white text-gray-900 placeholder:text-gray-500 font-bold focus:border-black focus:ring-0 outline-none transition-colors" />
                  <div className="mt-6 p-4 bg-gray-50 border border-black/10 rounded-xl text-xs text-gray-700 leading-relaxed font-medium">
                    <strong className="text-black block mb-1">Partnership Notice</strong>
                    To ensure you receive the highest quality certified pre-owned devices, Giga partners with Plug.tech for our fulfillment and certification process. Your device will arrive in their certified packaging.
                  </div>
                  
                  <button type="button" className="w-full bg-black text-white font-bold text-lg py-4 rounded-xl hover:bg-neutral-800 transition-colors mt-6">
                    Continue to Payment
                  </button>
                </form>`;

const newFormStr = `<form onSubmit={handleCheckoutSubmit} className="space-y-4 mb-8">
                  <h2 className="text-xl font-bold mb-4 text-black">Contact</h2>
                  <div className="mb-8">
                    <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="Email" className="w-full p-4 border border-black rounded-xl bg-white text-gray-900 placeholder:text-gray-500 font-bold focus:border-black focus:ring-0 outline-none transition-colors" />
                  </div>
                  <h2 className="text-xl font-bold mb-4 text-black">Delivery</h2>
                  <div>
                    <select value={formData.country} onChange={e => setFormData({...formData, country: e.target.value})} className="w-full p-4 border border-black rounded-xl bg-white text-gray-900 font-bold focus:border-black focus:ring-0 outline-none transition-colors appearance-none">
                      <option>Zambia</option>
                    </select>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <input required type="text" value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} placeholder="First name" className="w-full p-4 border border-black rounded-xl bg-white text-gray-900 placeholder:text-gray-500 font-bold focus:border-black focus:ring-0 outline-none transition-colors" />
                    <input required type="text" value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} placeholder="Last name" className="w-full p-4 border border-black rounded-xl bg-white text-gray-900 placeholder:text-gray-500 font-bold focus:border-black focus:ring-0 outline-none transition-colors" />
                  </div>
                  <input type="text" value={formData.company} onChange={e => setFormData({...formData, company: e.target.value})} placeholder="Company (optional)" className="w-full p-4 border border-black rounded-xl bg-white text-gray-900 placeholder:text-gray-500 font-bold focus:border-black focus:ring-0 outline-none transition-colors" />
                  <input required type="text" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} placeholder="Address" className="w-full p-4 border border-black rounded-xl bg-white text-gray-900 placeholder:text-gray-500 font-bold focus:border-black focus:ring-0 outline-none transition-colors" />
                  <input type="text" value={formData.apartment} onChange={e => setFormData({...formData, apartment: e.target.value})} placeholder="Apartment, suite, etc. (optional)" className="w-full p-4 border border-black rounded-xl bg-white text-gray-900 placeholder:text-gray-500 font-bold focus:border-black focus:ring-0 outline-none transition-colors" />
                  
                  <div className="grid grid-cols-2 gap-4">
                    <input required type="text" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} placeholder="City" className="w-full p-4 border border-black rounded-xl bg-white text-gray-900 placeholder:text-gray-500 font-bold focus:border-black focus:ring-0 outline-none transition-colors" />
                    <input type="text" value={formData.postalCode} onChange={e => setFormData({...formData, postalCode: e.target.value})} placeholder="Postal code (optional)" className="w-full p-4 border border-black rounded-xl bg-white text-gray-900 placeholder:text-gray-500 font-bold focus:border-black focus:ring-0 outline-none transition-colors" />
                  </div>
                  
                  <input required type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="Phone" className="w-full p-4 border border-black rounded-xl bg-white text-gray-900 placeholder:text-gray-500 font-bold focus:border-black focus:ring-0 outline-none transition-colors" />
                  
                  <div className="mt-6 p-4 bg-gray-50 border border-black/10 rounded-xl text-xs text-gray-700 leading-relaxed font-medium">
                    <strong className="text-black block mb-1">Partnership Notice</strong>
                    To ensure you receive the highest quality certified pre-owned devices, Giga partners with Plug.tech for our fulfillment and certification process. Your device will arrive in their certified packaging.
                  </div>
                  
                  <button type="submit" disabled={isSubmitting} className="w-full bg-black text-white font-bold text-lg py-4 rounded-xl hover:bg-neutral-800 transition-colors mt-6 disabled:opacity-50">
                    {isSubmitting ? 'Processing...' : 'Complete Order'}
                  </button>
                </form>`;

code = code.replace(oldFormStr, newFormStr);

const oldSuccessStr = `  if (!isOpen) return null;`;
const newSuccessStr = `  if (!isOpen) return null;
  if (checkoutState === 'success') {
    return (
      <div className="fixed inset-0 z-[100] flex">
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => { setCheckoutState('cart'); onClose(); }} />
        <div className="relative ml-auto w-full max-w-md h-full bg-white flex flex-col justify-center items-center p-8 text-center shrink-0">
          <div className="w-20 h-20 bg-green-100 text-green-500 rounded-full flex items-center justify-center mb-6">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
          </div>
          <h2 className="text-3xl font-black mb-4">Order Received!</h2>
          <p className="text-gray-500 font-medium mb-8">
            Thank you for your order. We have received your delivery details. We will contact you shortly regarding payment via MTN/Airtel Mobile Money.
          </p>
          <button onClick={() => { setCheckoutState('cart'); onClose(); }} className="w-full bg-black text-white font-bold text-lg py-4 rounded-xl hover:bg-neutral-800 transition-colors">
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }`;

code = code.replace(oldSuccessStr, newSuccessStr);

// add import for supabase if needed, wait supabase is already imported in CartSidebar.tsx?
if (!code.includes("import { supabase }")) {
  code = code.replace(`import { useCart } from '../context/CartContext';`, `import { useCart } from '../context/CartContext';\nimport { supabase } from '../lib/supabase';`);
}

fs.writeFileSync('src/components/CartSidebar.tsx', code);
console.log("Patched CartSidebar.tsx with form handler");
