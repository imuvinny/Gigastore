const fs = require('fs');
let code = fs.readFileSync('src/components/CartSidebar.tsx', 'utf-8');

const startIdx = code.indexOf('<h2 className="text-xl font-bold mb-4 text-black">Contact</h2>');
const endIdx = code.indexOf('</form>', startIdx) + '</form>'.length;

if (startIdx !== -1 && endIdx !== -1) {
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
                    {isSubmitting ? 'Processing...' : 'Pay Now'}
                  </button>
                </form>`;

  code = code.substring(0, startIdx) + newFormStr + code.substring(endIdx);
  fs.writeFileSync('src/components/CartSidebar.tsx', code);
  console.log("Patched CartSidebar.tsx with form handler successfully!");
} else {
  console.log("Could not find start or end index.");
}
