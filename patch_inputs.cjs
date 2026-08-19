const fs = require('fs');
let code = fs.readFileSync('src/components/CartSidebar.tsx', 'utf-8');

const target = `{paymentMethod === 'card' && (
                          <div className="mt-4 space-y-3">
                            <input
                              type="text"
                              placeholder="Card number"
                              value={cardDetails.number}
                              onChange={(e) => setCardDetails(prev => ({ ...prev, number: e.target.value }))}
                              className="w-full p-3 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:border-black focus:ring-1 focus:ring-black"
                            />
                            <div className="grid grid-cols-2 gap-3">
                              <input
                                type="text"
                                placeholder="Expiration date (MM / YY)"
                                value={cardDetails.expiry}
                                onChange={(e) => setCardDetails(prev => ({ ...prev, expiry: e.target.value }))}
                                className="w-full p-3 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:border-black focus:ring-1 focus:ring-black"
                              />
                              <input
                                type="text"
                                placeholder="Security code"
                                value={cardDetails.cvv}
                                onChange={(e) => setCardDetails(prev => ({ ...prev, cvv: e.target.value }))}
                                className="w-full p-3 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:border-black focus:ring-1 focus:ring-black"
                              />
                            </div>
                            <input
                              type="text"
                              placeholder="Name on card"
                              value={cardDetails.name}
                              onChange={(e) => setCardDetails(prev => ({ ...prev, name: e.target.value }))}
                              className="w-full p-3 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:border-black focus:ring-1 focus:ring-black"
                            />
                            <div className="flex items-center gap-2 mt-2">
                              <input type="checkbox" id="billingAddress" defaultChecked className="accent-black w-4 h-4 rounded" />
                              <label htmlFor="billingAddress" className="text-sm font-medium text-gray-700">Use shipping address as billing address</label>
                            </div>
                          </div>
                        )}`;

const replacement = `{paymentMethod === 'card' && (
                          <div className="mt-4 space-y-3">
                            <input
                              type="text"
                              placeholder="Card number"
                              value={cardDetails.number}
                              onChange={(e) => setCardDetails(prev => ({ ...prev, number: e.target.value }))}
                              className="w-full p-3 border border-gray-300 rounded-lg text-sm bg-white text-gray-900 placeholder:text-gray-500 font-medium focus:outline-none focus:border-black focus:ring-1 focus:ring-black"
                            />
                            <div className="grid grid-cols-2 gap-3">
                              <input
                                type="text"
                                placeholder="Expiration date (MM / YY)"
                                value={cardDetails.expiry}
                                onChange={(e) => setCardDetails(prev => ({ ...prev, expiry: e.target.value }))}
                                className="w-full p-3 border border-gray-300 rounded-lg text-sm bg-white text-gray-900 placeholder:text-gray-500 font-medium focus:outline-none focus:border-black focus:ring-1 focus:ring-black"
                              />
                              <input
                                type="password"
                                placeholder="Security code"
                                value={cardDetails.cvv}
                                onChange={(e) => setCardDetails(prev => ({ ...prev, cvv: e.target.value }))}
                                className="w-full p-3 border border-gray-300 rounded-lg text-sm bg-white text-gray-900 placeholder:text-gray-500 font-medium focus:outline-none focus:border-black focus:ring-1 focus:ring-black"
                              />
                            </div>
                            <input
                              type="text"
                              placeholder="Name on card"
                              value={cardDetails.name}
                              onChange={(e) => setCardDetails(prev => ({ ...prev, name: e.target.value }))}
                              className="w-full p-3 border border-gray-300 rounded-lg text-sm bg-white text-gray-900 placeholder:text-gray-500 font-medium focus:outline-none focus:border-black focus:ring-1 focus:ring-black"
                            />
                            <div className="flex items-center gap-2 mt-2">
                              <input type="checkbox" id="billingAddress" defaultChecked className="accent-black w-4 h-4 rounded border-gray-300" />
                              <label htmlFor="billingAddress" className="text-sm font-medium text-gray-700">Use shipping address as billing address</label>
                            </div>
                          </div>
                        )}`;

code = code.replace(target, replacement);

const iconsTarget = `<div className="flex items-center gap-1">
                             <img src="https://upload.wikimedia.org/wikipedia/commons/4/41/Visa_Logo.png" alt="Visa" className="h-4 object-contain" />
                             <img src="https://upload.wikimedia.org/wikipedia/commons/a/a4/Mastercard_2019_logo.svg" alt="Mastercard" className="h-5 object-contain" />
                          </div>`;
const iconsReplacement = `<div className="flex items-center gap-1">
                             <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 16" className="h-3.5 object-contain mr-1">
                                <path fill="#1434CB" d="M21.22 15.68l3.18-9.87h5.11l-3.18 9.87h-5.11zm11.39-9.66c-1.02-.27-2.18-.46-3.41-.46-3.77 0-6.42 1.83-6.44 4.45-.02 1.94 1.87 3.02 3.3 3.65 1.47.66 1.97 1.08 1.97 1.67-.02.9-.115 1.34-1.89 1.34-1.57 0-2.42-.23-3.69-.73l-.53-.22-.44 2.8c.92.42 2.61.78 4.38.8 3.99 0 6.6-1.82 6.63-4.63.02-1.54-.92-2.7-3.18-3.7-1.33-.63-2.14-1.05-2.14-1.68.02-.58.7-.1 1.77-.1 1.31 0 2.22.25 2.99.56l.36.14.33-2.82zm14.73 9.66l-2.67-6.84c-.38-1-.7-1.58-1.51-1.92-1.37-.58-3.49-1.08-4.9-1.34l.32 1.46c.8.25 1.71.58 2.63.92.68.25.88.58 1.14 1.46l2.36 6.27h5.36L42 5.81h-4.32c-.78 0-1.37.23-1.69.96L30.13 15.68h5.36l1.07-2.78h6.54l.6 2.78h3.64zm-6.24-5.23c.31-.83 1.51-4.04 1.51-4.04l.31-1.12.18 1.08 2.27 4.08h-4.27zM15.42 5.81l-4.14 9.87H5.92L4.01 7.28C3.86 6.51 3.73 6.26 3.1 5.92 1.9 5.31.55 4.96.11 4.79l.2-1.33c.8-.23 2.53-.46 3.79-.48 1.09-.02 1.97.23 2.33 1.3l1.8 7.28 2.87-7.28h4.32z"/>
                             </svg>
                             <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 24" className="h-5 object-contain">
                                <circle cx="12" cy="12" r="12" fill="#EB001B"/>
                                <circle cx="24" cy="12" r="12" fill="#F79E1B"/>
                                <path fill="#FF5F00" d="M18 20.485A11.966 11.966 0 0 1 13.515 12 11.966 11.966 0 0 1 18 3.515 11.966 11.966 0 0 1 22.485 12 11.966 11.966 0 0 1 18 20.485z"/>
                             </svg>
                          </div>`;
                          
code = code.replace(iconsTarget, iconsReplacement);                          
fs.writeFileSync('src/components/CartSidebar.tsx', code);
