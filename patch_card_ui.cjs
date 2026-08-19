const fs = require('fs');
let code = fs.readFileSync('src/components/CartSidebar.tsx', 'utf-8');

const target = `                      {/* Card Option */}
                      <div 
                        onClick={() => setPaymentMethod(prev => prev === 'card' ? null : 'card')}
                        className={\`p-3.5 rounded-xl border-2 cursor-pointer transition-all \${paymentMethod === 'card' ? 'border-black bg-neutral-50' : 'border-gray-200 bg-white hover:border-gray-300'}\`}
                      >
                        <div className="flex items-start gap-3">
                          <input
                            type="radio"
                            name="paymentMethod"
                            value="card"
                            checked={paymentMethod === 'card'}
                            onChange={() => setPaymentMethod(prev => prev === 'card' ? null : 'card')}
                            className="mt-1 accent-black"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-sm text-black">Debit / Credit Card (Visa & Mastercard)</span>
                            </div>
                            <p className="text-xs text-gray-500 mt-0.5">Pay securely via Lenco Card Collection Gateway.</p>
                          </div>
                        </div>
                      </div>`;

const replacement = `                      {/* Card Option */}
                      <div 
                        className={\`p-3.5 rounded-xl border-2 transition-all \${paymentMethod === 'card' ? 'border-black bg-neutral-50' : 'border-gray-200 bg-white hover:border-gray-300'}\`}
                      >
                        <div className="flex items-center justify-between cursor-pointer" onClick={() => setPaymentMethod(prev => prev === 'card' ? null : 'card')}>
                          <div className="flex items-start gap-3">
                            <input
                              type="radio"
                              name="paymentMethod"
                              value="card"
                              checked={paymentMethod === 'card'}
                              onChange={() => setPaymentMethod(prev => prev === 'card' ? null : 'card')}
                              className="mt-1 accent-black"
                            />
                            <div className="flex-1 min-w-0">
                              <span className="font-bold text-sm text-black">Credit or Debit Card</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                             <img src="https://upload.wikimedia.org/wikipedia/commons/4/41/Visa_Logo.png" alt="Visa" className="h-4 object-contain" />
                             <img src="https://upload.wikimedia.org/wikipedia/commons/a/a4/Mastercard_2019_logo.svg" alt="Mastercard" className="h-5 object-contain" />
                          </div>
                        </div>

                        {paymentMethod === 'card' && (
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
                        )}
                      </div>`;

code = code.replace(target, replacement);
fs.writeFileSync('src/components/CartSidebar.tsx', code);
