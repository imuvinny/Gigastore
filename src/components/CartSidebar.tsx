import { supabase } from '../lib/supabase';
import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { CartItem, Product } from '../types';
import { X, Minus, Plus, Trash2, ShieldCheck, ChevronRight, ChevronDown, ChevronUp, Package } from 'lucide-react';
import { formatZMW, formatRawZMW, getDisplayPriceUSD, calculateBaseZMW, SHIPPING_FEE_ZMW, calculateShippingFeeZMW, getProductPriceZMW, getProfitMarginZMW, isStarterPackProduct, getStarterPackBundleItems } from '../utils';

interface CartSidebarProps {
  cart: CartItem[];
  user?: any;
  onClose: () => void;
  onUpdateQuantity: (id: string, qty: number) => void;
  onRemove: (id: string) => void;
  onClearCart: () => void;
  onRequireAuth: () => void;
  onViewOrders?: () => void;
}

export function CartSidebar({ cart, user, onClose, onUpdateQuantity, onRemove, onClearCart, onRequireAuth, onViewOrders }: CartSidebarProps) {
  const [checkoutState, setCheckoutState] = useState<'cart' | 'checkout' | 'awaiting_prompt' | 'success' | 'failure'>('cart');
  const [placedOrders, setPlacedOrders] = useState<any[]>([]);
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
  const [expandedBundles, setExpandedBundles] = useState<{ [cartItemId: string]: boolean }>({});
  const [paymentMethod, setPaymentMethod] = useState<'mobile_money' | 'card' | null>(null);
  const [momoOperator, setMomoOperator] = useState<'mtn' | 'airtel' | 'zamtel'>('mtn');
  const [momoPhone, setMomoPhone] = useState<string | null>(null);
  const [cardDetails, setCardDetails] = useState({ number: '', expiry: '', cvv: '', name: '' });
  const [cardError, setCardError] = useState<string | null>(null);
  const [isLencoConfigured, setIsLencoConfigured] = useState(false);

  const toggleBundle = (cartItemId: string) => {
    setExpandedBundles(prev => ({ ...prev, [cartItemId]: prev[cartItemId] === false ? true : false }));
  };

  useEffect(() => {
    fetch('/api/payments/lenco/config')
      .then(res => res.json())
      .then(data => {
        if (data.configured) setIsLencoConfigured(true);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (user && user.email) {
      setFormData(prev => {
        if (
          prev.email === user.email &&
          prev.firstName === (user.user_metadata?.first_name || prev.firstName) &&
          prev.lastName === (user.user_metadata?.last_name || prev.lastName)
        ) {
          return prev;
        }
        return {
          ...prev,
          email: user.email || '',
          firstName: user.user_metadata?.first_name || prev.firstName,
          lastName: user.user_metadata?.last_name || prev.lastName,
        };
      });
      if (user.user_metadata?.phone) {
        setMomoPhone(prev => prev || user.user_metadata.phone);
      }
    }
  }, [user?.id, user?.email]);

  useEffect(() => {
    const targetPhone = momoPhone !== null ? momoPhone : formData.phone;
    if (targetPhone) {
      if (targetPhone.startsWith('076') || targetPhone.startsWith('096')) {
        setMomoOperator('mtn');
      } else if (targetPhone.startsWith('077') || targetPhone.startsWith('097')) {
        setMomoOperator('airtel');
      } else if (targetPhone.startsWith('075') || targetPhone.startsWith('095')) {
        setMomoOperator('zamtel');
      }
    }
  }, [momoPhone, formData.phone]);

  useEffect(() => {
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
  }, [checkoutState, onClose]);

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert("Please sign in or create an account to complete your purchase.");
      onRequireAuth();
      return;
    }
    if (!paymentMethod) {
      alert("Please select a payment method.");
      setIsSubmitting(false);
      return;
    }
    if (!supabase) {
      alert("Database is not connected. Cannot place order.");
      return;
    }
    
    setIsSubmitting(true);
    try {
      const userId = user ? user.id : null;
      
      const ordersToInsert = cart.map(item => ({
        user_id: userId,
        image_url: item.image,
        product_name: item.name + (item.selectedCondition ? ` (${item.selectedCondition.name})` : ''),
        quantity: item.quantity,
        total_price: getProductPriceZMW(item, getDisplayPriceUSD(item.finalPrice || item.price)) * item.quantity,
        customer_name: `${formData.firstName} ${formData.lastName}`.trim(),
        customer_email: formData.email,
        delivery_address: `${formData.address} ${formData.apartment}`.trim(),
        delivery_city: formData.city,
        delivery_postal_code: formData.postalCode,
        delivery_phone: formData.phone,
        delivery_country: formData.country,
        status: 'pending'
      }));

      const { data: insertedOrders, error } = await supabase.from('orders').insert(ordersToInsert).select();
      
      if (error) {
        console.error("Order error:", error);
        alert("Failed to place order: " + error.message);
      } else {
        if (insertedOrders) {
          setPlacedOrders(insertedOrders);
        }
        const logCompanyEarnings = async () => {
          try {
            const earningsToInsert = cart.map((item, idx) => {
              const gross = getProductPriceZMW(item, getDisplayPriceUSD(item.finalPrice || item.price)) * item.quantity;
              const fakeProd: Product = { id: item.id, name: item.name, brand: item.brand, price: item.price, image: item.image, description: '', colors: [], accentColor: '' };
              const margin = getProfitMarginZMW(fakeProd);
              const netProfit = margin * item.quantity;
              const createdOrder = insertedOrders && insertedOrders[idx];
              return {
                order_id: createdOrder?.id || null,
                product_name: item.name + (item.selectedCondition ? ` (${item.selectedCondition.name})` : ''),
                gross_amount: gross,
                net_profit: netProfit,
                currency: 'ZMW',
                notes: `Order placed by ${formData.firstName} ${formData.lastName}`
              };
            });
            await supabase.from('company_earnings').insert(earningsToInsert);
          } catch (e) {
            console.warn("Could not log to company_earnings table:", e);
          }
        };

        // Trigger Lenco Pay Payment if requested
        if (paymentMethod === 'mobile_money') {
          const orderRef = insertedOrders?.[0]?.id || `ORD_${Date.now()}`;
          const targetPhone = momoPhone !== null ? momoPhone : formData.phone;
          try {
            const lencoRes = await fetch('/api/payments/lenco/mobile-money', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                amount: totalZMW,
                phone: targetPhone,
                operator: momoOperator,
                reference: String(orderRef),
                email: formData.email,
                firstName: formData.firstName,
                lastName: formData.lastName
              })
            });

            const lencoData = await lencoRes.json();
            if (lencoData.success) {
              console.log("Lenco Mobile Money initiated successfully:", lencoData);
              setCheckoutState('awaiting_prompt');
              
              // Poll for status
              let attempts = 0;
              let paymentSuccessful = false;
              let paymentFailed = false;

              while (attempts < 30) {
                await new Promise(r => setTimeout(r, 3000));
                const statusRes = await fetch(`/api/payments/lenco/status/${String(orderRef)}`);
                const statusData = await statusRes.json();
                
                if (statusData.success) {
                  if (statusData.data?.status === 'successful') {
                    paymentSuccessful = true;
                    break;
                  } else if (statusData.data?.status === 'failed') {
                    paymentFailed = true;
                    break;
                  }
                }
                attempts++;
              }
              
              if (paymentSuccessful) {
                if (insertedOrders) {
                  const orderIds = insertedOrders.map(o => o.id);
                  await supabase.from('orders').update({ status: 'paid' }).in('id', orderIds);
                  await logCompanyEarnings();
                }
                setCheckoutState('success');
                onClearCart();
              } else {
                setCheckoutState('failure');
              }
              return;
            } else {
              console.warn("Lenco API Notice:", lencoData.error || "Payment prompt pending configuration");
              if (lencoData.error) {
                alert(`Mobile Money Payment Notice:\n${lencoData.error}`);
              }
              setCheckoutState('failure');
              return;
            }
          } catch (mErr) {
            console.error("Lenco Pay network error:", mErr);
            setCheckoutState('failure');
            return;
          }
        } else if (paymentMethod === 'card') {
          setCardError(null);
          const orderRef = insertedOrders?.[0]?.id || `ORD_${Date.now()}`;
          const [expiryMonth, expiryYear] = cardDetails.expiry.split('/').map(s => s.trim());
          
          if (!expiryMonth || !expiryYear || expiryMonth.length !== 2 || expiryYear.length !== 2) {
            setCardError("Enter a valid expiration date");
            setIsSubmitting(false);
            return;
          }
          
          const currentYear = new Date().getFullYear() % 100;
          const currentMonth = new Date().getMonth() + 1;
          const expYearNum = parseInt(expiryYear, 10);
          const expMonthNum = parseInt(expiryMonth, 10);
          
          if (
            expMonthNum < 1 || expMonthNum > 12 || 
            expYearNum < currentYear || 
            (expYearNum === currentYear && expMonthNum < currentMonth)
          ) {
            setCardError("Enter a valid expiration date");
            setIsSubmitting(false);
            return;
          }

          try {
            const lencoRes = await fetch('/api/payments/lenco/card', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                amount: totalZMW,
                reference: String(orderRef),
                email: formData.email,
                firstName: formData.firstName,
                lastName: formData.lastName,
                card: {
                  number: cardDetails.number.replace(/\s/g, ''),
                  cvv: cardDetails.cvv,
                  expiryMonth: expiryMonth || '',
                  expiryYear: expiryYear || ''
                }
              })
            });
            const lencoData = await lencoRes.json();
            if (lencoData.success) {
               // Check if there is a 3DS redirect
               if (lencoData.data?.authorization?.redirect) {
                 window.location.href = lencoData.data.authorization.redirect;
                 return;
               }
               
               // Poll for status like mobile money just in case
               setCheckoutState('awaiting_prompt');
               let attempts = 0;
               let paymentSuccessful = false;
               let paymentFailed = false;

               while (attempts < 30) {
                 await new Promise(r => setTimeout(r, 3000));
                 const statusRes = await fetch(`/api/payments/lenco/status/${String(orderRef)}`);
                 const statusData = await statusRes.json();
                 if (statusData.success) {
                   if (statusData.data?.status === 'successful') {
                     paymentSuccessful = true;
                     break;
                   } else if (statusData.data?.status === 'failed') {
                     paymentFailed = true;
                     break;
                   }
                 }
                 attempts++;
               }
               if (paymentSuccessful) {
                 if (insertedOrders) {
                   const orderIds = insertedOrders.map(o => o.id);
                   await supabase.from('orders').update({ status: 'paid' }).in('id', orderIds);
                   await logCompanyEarnings();
                 }
                 setCheckoutState('success');
                 onClearCart();
               } else {
                 setCheckoutState('failure');
               }
               return;
            } else {
              console.warn("Lenco API Notice:", lencoData.error || "Payment prompt pending configuration");
              if (lencoData.error) {
                alert(`Card Payment Notice:\n${lencoData.error}`);
              }
              setCheckoutState('failure');
              return;
            }
          } catch (mErr) {
            console.error("Lenco Pay network error:", mErr);
            setCheckoutState('failure');
            return;
          }
        }

        setCheckoutState('success');
        onClearCart();
      }
    } catch (err: any) {
      alert("Unexpected error: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStartCheckout = () => {
    if (!user) {
      onRequireAuth();
      return;
    }
    setCheckoutState('checkout');
  };

  const totalBaseUSD = cart.reduce((sum, item) => sum + getDisplayPriceUSD(item.finalPrice || item.price) * item.quantity, 0);
  const subtotalZMW = Math.max(0, calculateBaseZMW(totalBaseUSD) - (SHIPPING_FEE_ZMW * cart.length));
  
  // Actually, wait, if calculateBaseZMW multiplies by 1.15 and 19.51, and we used getDisplayPriceUSD which subtracted $43:
  const exactSubtotalZMW = cart.reduce((sum, item) => sum + getProductPriceZMW(item, getDisplayPriceUSD(item.finalPrice || item.price)) * item.quantity, 0);
  const shippingFeeZMW = calculateShippingFeeZMW(cart);
  const totalZMW = exactSubtotalZMW + shippingFeeZMW;

  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[999] flex justify-end"
    >
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className={`relative w-full ${checkoutState === 'checkout' ? 'max-w-4xl flex flex-col md:flex-row overflow-y-auto md:overflow-hidden' : 'max-w-md flex flex-col overflow-hidden'} bg-white h-full shadow-2xl`}
      >
        {checkoutState === 'success' ? (
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
              className="text-3xl font-black text-black mb-4"
            >
              Payment Successful
            </motion.h2>
            {placedOrders && placedOrders.length > 0 && (
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-center"
              >
                <p className="text-gray-500 mb-6">Order #{placedOrders[0].order_number}</p>
                {onViewOrders && (
                  <button 
                    onClick={() => {
                      onClose();
                      onViewOrders();
                    }}
                    className="bg-black text-white px-8 py-3 rounded-full font-bold hover:scale-105 transition-transform"
                  >
                    View Order
                  </button>
                )}
              </motion.div>
            )}
          </div>
        ) : checkoutState === 'failure' ? (
          <div className="fixed inset-0 z-[1000] bg-white flex flex-col items-center justify-center">
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', damping: 15 }}
              className="w-32 h-32 rounded-full border-4 border-black flex items-center justify-center mb-6"
            >
              <X size={64} className="text-black" />
            </motion.div>
            <motion.h2
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-3xl font-black text-black"
            >
              Payment Failed
            </motion.h2>
          </div>
        ) : checkoutState === 'awaiting_prompt' ? (
          <div className="fixed inset-0 z-[1000] bg-white flex flex-col items-center justify-center p-6 text-center">
            <div className="w-24 h-24 rounded-full border-4 border-gray-200 border-t-black animate-spin mb-8"></div>
            <h2 className="text-2xl font-black text-black mb-4">Approve Payment</h2>
            <p className="text-gray-500 max-w-sm">
              Please check your phone and enter your Mobile Money PIN to approve the transaction. We're waiting for confirmation...
            </p>
          </div>
        ) : checkoutState === 'cart' ? (
          <>
            <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-white">
              <h2 className="text-xl font-bold tracking-tight text-black flex items-center gap-3">
                Your Cart <span className="text-xs bg-black text-white px-2.5 py-1 rounded-full">{itemCount}</span>
              </h2>
              <button onClick={onClose} className="text-gray-400 hover:text-black transition-colors bg-gray-50 p-2 rounded-full">
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50 ">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-400 uppercase tracking-widest text-xs font-bold">
                  <div className="w-20 h-20 mb-6 rounded-full bg-gray-100 flex items-center justify-center">
                    <Trash2 size={28} className="opacity-50" />
                  </div>
                  <p>Your cart is empty</p>
                </div>
              ) : (
                cart.map((item) => {
                  const isStarterPack = isStarterPackProduct(item);
                  const isExpanded = expandedBundles[item.cartItemId] !== false; // default open
                  const bundleItems = isStarterPack ? getStarterPackBundleItems(item, item.selectedColor, item.selectedStorage, item.selectedCondition?.name) : [];

                  return (
                    <div key={item.cartItemId} className="flex flex-col bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                      <div className="flex gap-4">
                        <div className="w-20 h-20 bg-gray-50 rounded-xl flex items-center justify-center p-2 shrink-0 border border-gray-100 relative overflow-hidden">
                          <div className="absolute inset-0 opacity-10" style={{ background: item.accentColor }} />
                          <img src={item.image} alt={item.name} className="w-full h-full object-contain mix-blend-multiply relative z-10" />
                        </div>
                        <div className="flex-1 py-1 flex flex-col min-w-0">
                          <div className="flex justify-between items-start mb-1">
                            <div>
                              <h3 className="font-bold text-sm tracking-tight text-black pr-2">{item.name}</h3>
                              <div className="text-xs text-gray-500 mt-0.5">
                                {item.selectedStorage && item.selectedStorage !== 'N/A' && <span>{item.selectedStorage} • </span>}
                                {item.selectedCondition?.name && <span>{item.selectedCondition.name} • </span>}
                                {item.selectedColor && <span>{item.selectedColor}</span>}
                              </div>
                            </div>
                            <button onClick={() => onRemove(item.cartItemId)} className="text-red-500 hover:text-red-600 shrink-0">
                              <Trash2 size={16} />
                            </button>
                          </div>
                          
                          <div className="flex items-center justify-between mt-auto pt-3">
                            <div className="flex items-center gap-3 bg-gray-50 rounded-lg border border-black/20 px-2 py-1">
                              <button
                                onClick={() => onUpdateQuantity(item.cartItemId, Math.max(1, item.quantity - 1))}
                                className="text-gray-500 hover:text-black"
                              >
                                <Minus size={14} />
                              </button>
                              <span className="text-sm font-bold w-6 text-center text-black">{item.quantity}</span>
                              <button
                                onClick={() => onUpdateQuantity(item.cartItemId, item.quantity + 1)}
                                className="text-gray-500 hover:text-black"
                              >
                                <Plus size={14} />
                              </button>
                            </div>
                            <span className="font-bold text-base text-black">{formatRawZMW(getProductPriceZMW(item, getDisplayPriceUSD(item.finalPrice || item.price)) * item.quantity)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Starter Pack Bundle Components Dropdown */}
                      {isStarterPack && (
                        <div className="mt-3 pt-3 border-t border-gray-100">
                          <button
                            onClick={() => toggleBundle(item.cartItemId)}
                            className="text-xs font-bold text-gray-700 hover:text-black flex items-center gap-1.5 transition-colors"
                          >
                            <span>{isExpanded ? `Hide ${bundleItems.length} items` : `Show ${bundleItems.length} items`}</span>
                            {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                          </button>

                          {isExpanded && (
                            <div className="mt-2.5 bg-neutral-50/90 rounded-xl p-3 border border-neutral-200/80 space-y-2.5">
                              {bundleItems.map((bItem, bIdx) => (
                                <div key={bIdx} className="flex items-start gap-2.5">
                                  <div className="w-7 h-7 rounded-lg bg-white border border-neutral-200 p-0.5 flex items-center justify-center shrink-0">
                                    {bItem.image ? (
                                      <img src={bItem.image} alt="" className="w-full h-full object-contain mix-blend-multiply" />
                                    ) : (
                                      <Package size={14} className="text-gray-400" />
                                    )}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-[11px] font-bold text-black leading-tight">{bItem.name}</p>
                                    {bItem.subtitle && (
                                      <p className="text-[10px] text-gray-500 font-medium mt-0.5">{bItem.subtitle}</p>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {cart.length > 0 && (
              <div className="p-6 border-t border-gray-100 bg-white">
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between items-center text-sm font-medium text-gray-500">
                    <span>Subtotal</span>
                    <span className="text-black font-bold">{formatRawZMW(exactSubtotalZMW)}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm font-medium text-gray-500">
                    <span>Shipping</span>
                    <span className="text-black font-bold">{formatRawZMW(shippingFeeZMW)}</span>
                  </div>
                  <div className="flex justify-between items-end pt-3 border-t border-gray-100">
                    <div className="text-base font-bold text-black">Total</div>
                    <div className="text-2xl font-black text-black tracking-tighter"><span className="text-sm text-gray-400 font-medium mr-1">ZMW</span>{formatRawZMW(totalZMW)}</div>
                  </div>
                </div>

                <button onClick={handleStartCheckout} className="w-full bg-black text-white font-bold text-base py-4 rounded-xl hover:bg-neutral-800 transition-colors shadow-xl shadow-black/10 mb-4">
                  Checkout
                </button>

                <div className="space-y-2 mt-4 text-xs font-medium text-gray-700 flex items-center justify-center gap-1.5">
                  <span>Shipping & Delivery: 7-10 business days.</span>
                </div>
              </div>
            )}
          </>
        ) : (
          /* Checkout View */
          <>
            <div className="w-full md:w-[55%] h-auto md:h-full overflow-y-visible md:overflow-y-auto p-6 md:p-12 bg-white flex flex-col shrink-0 order-2 md:order-1">
              <div className="flex items-center justify-between mb-8">
                <h1 className="text-2xl font-black tracking-tighter text-black">GIGASTORE.</h1>
                <button onClick={() => setCheckoutState('cart')} className="text-sm font-bold text-gray-500 flex items-center gap-1 hover:text-black">
                  <ChevronRight size={16} className="rotate-180" /> Back to Cart
                </button>
              </div>

              <div className="max-w-xl mx-auto w-full">
                <div className="flex items-center gap-4 mb-8 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                  <div className="flex text-[#f59e0b]">
                    {[1,2,3,4,5].map(i => <svg key={i} className="w-6 h-6 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>)}
                  </div>
                  <div>
                    <h3 className="font-black text-sm text-black">REAL REVIEWS. REAL SATISFACTION.</h3>
                    <p className="text-xs text-gray-500">Over 30,000+ 5-star ratings and growing.</p>
                  </div>
                </div>

                <form onSubmit={handleCheckoutSubmit} className="space-y-4 mb-8">
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
                  
                  {/* Payment Method Selector */}
                  <div className="pt-4 border-t border-gray-200">
                    <h2 className="text-xl font-bold mb-3 text-black">
                      Payment Method
                    </h2>

                    <div className="space-y-2.5">
                      {/* Mobile Money Option */}
                      <div 
                        onClick={() => setPaymentMethod(prev => prev === 'mobile_money' ? null : 'mobile_money')}
                        className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === 'mobile_money' ? 'border-black bg-neutral-50' : 'border-gray-200 bg-white hover:border-gray-300'}`}
                      >
                        <div className="flex items-start gap-3">
                          <input
                            type="radio"
                            name="paymentMethod"
                            value="mobile_money"
                            checked={paymentMethod === 'mobile_money'}
                            onChange={() => setPaymentMethod(prev => prev === 'mobile_money' ? null : 'mobile_money')}
                            className="mt-1 accent-black"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-sm text-black">Mobile Money (MTN, Airtel, Zamtel)</span>
                            </div>
                            <p className="text-xs text-gray-500 mt-0.5">Pay directly via USSD prompt on your phone.</p>
                          </div>
                        </div>

                        {paymentMethod === 'mobile_money' && (
                          <div className="mt-3.5 space-y-3 pt-3 border-t border-gray-200/80" onClick={e => e.stopPropagation()}>
                            <div>
                              <label className="block text-xs font-bold text-gray-700 mb-1.5">Select Network Operator</label>
                              <div className="grid grid-cols-3 gap-2">
                                {[
                                  { id: 'mtn', label: 'MTN' },
                                  { id: 'airtel', label: 'Airtel' },
                                  { id: 'zamtel', label: 'Zamtel' }
                                ].map(op => (
                                  <button
                                    key={op.id}
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setMomoOperator(op.id as any);
                                    }}
                                    className={`py-2.5 px-3 rounded-lg text-xs transition-all text-center flex items-center justify-center bg-white text-black ${
                                      momoOperator === op.id 
                                        ? 'border-2 border-black font-black ring-2 ring-black/10 shadow-xs' 
                                        : 'border border-gray-200 hover:border-gray-400 font-bold text-gray-700'
                                    }`}
                                  >
                                    {op.label}
                                  </button>
                                ))}
                              </div>
                            </div>

                            <div>
                              <label className="block text-xs font-bold text-gray-700 mb-1">Mobile Money Phone Number</label>
                              <input
                                type="text"
                                value={momoPhone !== null ? momoPhone : formData.phone}
                                onChange={e => setMomoPhone(e.target.value)}
                                placeholder="e.g. 0971234567 or 0961234567"
                                className="w-full p-3 border border-black rounded-lg bg-white text-gray-900 placeholder:text-gray-400 text-lg font-black tracking-widest text-center focus:outline-none focus:ring-2 focus:ring-black/10"
                              />
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Card Option */}
                      <div 
                        className={`p-3.5 rounded-xl border-2 transition-all ${paymentMethod === 'card' ? 'border-black bg-neutral-50' : 'border-gray-200 bg-white hover:border-gray-300'}`}
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
                          <div className="flex items-center gap-2">
                             <svg viewBox="0 0 24 24" className="h-4 w-auto object-contain" fill="#1434CB">
                                <path d="M9.112 8.262L5.97 15.758H3.92L2.374 9.775c-.094-.368-.175-.503-.461-.658C1.447 8.864.677 8.627 0 8.479l.046-.217h3.3a.904.904 0 01.894.764l.817 4.338 2.018-5.102zm8.033 5.049c.008-1.979-2.736-2.088-2.717-2.972.006-.269.262-.555.822-.628a3.66 3.66 0 011.913.336l.34-1.59a5.207 5.207 0 00-1.814-.333c-1.917 0-3.266 1.02-3.278 2.479-.012 1.079.963 1.68 1.698 2.04.756.367 1.01.603 1.006.931-.005.504-.602.725-1.16.734-.975.015-1.54-.263-1.992-.473l-.351 1.642c.453.208 1.289.39 2.156.398 2.037 0 3.37-1.006 3.377-2.564m5.061 2.447H24l-1.565-7.496h-1.656a.883.883 0 00-.826.55l-2.909 6.946h2.036l.405-1.12h2.488zm-2.163-2.656l1.02-2.815.588 2.815zm-8.16-4.84l-1.603 7.496H8.34l1.605-7.496z"/>
                             </svg>
                             <svg viewBox="0 0 36 24" className="h-6 w-auto object-contain">
                                <circle cx="12" cy="12" r="12" fill="#EB001B"/>
                                <circle cx="24" cy="12" r="12" fill="#F79E1B"/>
                                <path fill="#FF5F00" d="M18 20.485A11.966 11.966 0 0 1 13.515 12 11.966 11.966 0 0 1 18 3.515 11.966 11.966 0 0 1 22.485 12 11.966 11.966 0 0 1 18 20.485z"/>
                             </svg>
                          </div>
                        </div>

                        {paymentMethod === 'card' && (
                          <div className="mt-4 space-y-4">
                            <input
                              type="text"
                              placeholder="Card number"
                              value={cardDetails.number}
                              onChange={(e) => {
                                let val = e.target.value.replace(/\D/g, '');
                                if (val.length > 16) val = val.slice(0, 16);
                                val = val.replace(/(\d{4})(?=\d)/g, '$1 ').trim();
                                setCardDetails(prev => ({ ...prev, number: val }));
                              }}
                              className="w-full p-4 border border-black rounded-xl bg-white text-gray-900 placeholder:text-gray-500 font-bold focus:border-black focus:ring-0 outline-none transition-colors"
                            />
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <input
                                  type="text"
                                  placeholder="MM / YY"
                                  value={cardDetails.expiry}
                                  onChange={(e) => {
                                    setCardError(null);
                                    let val = e.target.value.replace(/\D/g, '');
                                    if (val.length > 4) val = val.slice(0, 4);
                                    if (val.length >= 3) {
                                      val = `${val.slice(0, 2)} / ${val.slice(2)}`;
                                    } else if (val.length === 2 && e.target.value.length > cardDetails.expiry.length) {
                                      val = `${val} / `;
                                    }
                                    setCardDetails(prev => ({ ...prev, expiry: val }));
                                  }}
                                  className={`w-full p-4 border rounded-xl bg-white text-gray-900 placeholder:text-gray-500 font-bold focus:ring-0 outline-none transition-colors ${cardError ? 'border-red-500 focus:border-red-500' : 'border-black focus:border-black'}`}
                                />
                                {cardError && <p className="text-red-500 text-xs mt-1 font-bold">{cardError}</p>}
                              </div>
                              <div className="relative">
                                <input
                                  type="password"
                                  placeholder="CVC"
                                  value={cardDetails.cvv}
                                  onChange={(e) => setCardDetails(prev => ({ ...prev, cvv: e.target.value }))}
                                  className="w-full p-4 border border-black rounded-xl bg-white text-gray-900 placeholder:text-gray-500 font-bold focus:border-black focus:ring-0 outline-none transition-colors"
                                />
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="2" y="6" width="20" height="12" rx="2"></rect>
                                    <path d="M2 10h20"></path>
                                    <text x="14" y="16" fontSize="6" strokeWidth="0" fill="currentColor" fontWeight="bold">123</text>
                                  </svg>
                                </div>
                              </div>
                            </div>
                            <input
                              type="text"
                              placeholder="Name on card"
                              value={cardDetails.name}
                              onChange={(e) => setCardDetails(prev => ({ ...prev, name: e.target.value }))}
                              className="w-full p-4 border border-black rounded-xl bg-white text-gray-900 placeholder:text-gray-500 font-bold focus:border-black focus:ring-0 outline-none transition-colors"
                            />
                            <div className="flex items-center gap-2 mt-2 pl-1">
                              <input type="checkbox" id="billingAddress" defaultChecked className="accent-black w-5 h-5 rounded border-black" />
                              <label htmlFor="billingAddress" className="text-sm font-bold text-gray-700">Use shipping address as billing address</label>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 p-4 bg-gray-50 border border-black/10 rounded-xl text-xs text-gray-700 leading-relaxed font-medium">
                    <strong className="text-black block mb-1">Partnership Notice</strong>
                    To ensure you receive the highest quality certified pre-owned devices, Giga partners with Plug.tech for our fulfillment and certification process. Your device will arrive in their certified packaging.
                  </div>
                  
                  <button type="submit" disabled={isSubmitting} className="w-full bg-black text-white font-bold text-lg py-4 rounded-xl hover:bg-neutral-800 transition-colors mt-6 disabled:opacity-50">
                    {isSubmitting ? 'Processing Payment...' : `Pay ${formatRawZMW(totalZMW)}`}
                  </button>
                </form>
              </div>
            </div>

            <div className="w-full md:w-[45%] bg-gray-50 h-auto md:h-full overflow-y-visible md:overflow-y-auto p-6 md:p-12 border-b md:border-b-0 md:border-l border-black/20 shrink-0 order-1 md:order-2">
              <div className="max-w-md mx-auto">
                <div className="space-y-4 mb-6">
                  {cart.map((item) => {
                    const isStarterPack = isStarterPackProduct(item);
                    const isExpanded = expandedBundles[item.cartItemId] !== false; // default open
                    const bundleItems = isStarterPack ? getStarterPackBundleItems(item, item.selectedColor, item.selectedStorage, item.selectedCondition?.name) : [];

                    return (
                      <div key={item.cartItemId} className="flex flex-col bg-white p-3.5 rounded-xl border border-black/10">
                        <div className="flex gap-4 items-center">
                          <div className="relative w-14 h-14 bg-gray-50 border border-black/10 rounded-lg flex items-center justify-center p-2 shrink-0">
                            <span className="absolute -top-2 -right-2 bg-black text-white w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold z-20">{item.quantity}</span>
                            <div className="absolute inset-0 opacity-10 rounded-lg" style={{ background: item.accentColor }} />
                            <img src={item.image} alt={item.name} className="w-full h-full object-contain mix-blend-multiply relative z-10" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-sm text-black leading-snug truncate">{item.name}</h4>
                            <p className="text-xs font-medium text-gray-500">
                              {item.selectedStorage && item.selectedStorage !== 'N/A' && `${item.selectedStorage} • `}
                              {item.selectedCondition?.name || ''}
                            </p>
                          </div>
                          <div className="font-bold text-sm text-black shrink-0">
                            {formatRawZMW(getProductPriceZMW(item, getDisplayPriceUSD(item.finalPrice || item.price)) * item.quantity)}
                          </div>
                        </div>

                        {/* Bundle Breakdown in Checkout */}
                        {isStarterPack && (
                          <div className="mt-2.5 pt-2 border-t border-gray-100">
                            <button
                              onClick={() => toggleBundle(item.cartItemId)}
                              className="text-[11px] font-bold text-gray-700 hover:text-black flex items-center gap-1 transition-colors"
                            >
                              <span>{isExpanded ? `Hide ${bundleItems.length} items` : `Show ${bundleItems.length} items`}</span>
                              {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                            </button>

                            {isExpanded && (
                              <div className="mt-2 bg-gray-50/90 rounded-lg p-2.5 border border-black/10 space-y-2 text-xs">
                                {bundleItems.map((bItem, bIdx) => (
                                  <div key={bIdx} className="flex items-start gap-2">
                                    <div className="w-6 h-6 rounded bg-white border border-black/10 p-0.5 flex items-center justify-center shrink-0">
                                      {bItem.image ? (
                                        <img src={bItem.image} alt="" className="w-full h-full object-contain mix-blend-multiply" />
                                      ) : (
                                        <Package size={12} className="text-gray-400" />
                                      )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-[11px] font-bold text-black leading-tight">{bItem.name}</p>
                                      {bItem.subtitle && (
                                        <p className="text-[10px] text-gray-500 font-medium">{bItem.subtitle}</p>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="space-y-3 pt-6 border-t border-black/20 mb-6">
                  <div className="flex justify-between items-center text-sm font-medium text-gray-600">
                    <span>Subtotal</span>
                    <span className="text-gray-900 font-bold">{formatRawZMW(exactSubtotalZMW)}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm font-medium text-gray-600">
                    <span>Shipping</span>
                    <span className="text-gray-900 font-bold">
                      {shippingFeeZMW === 1056 ? 'ZK 1,055.54' : formatRawZMW(shippingFeeZMW)}
                    </span>
                  </div>
                </div>

                <div className="flex justify-between items-end pt-6 border-t border-black/20 mb-8">
                  <div className="text-lg font-bold text-black">Total</div>
                  <div className="text-2xl font-black text-black"><span className="text-sm text-gray-500 font-medium mr-1">ZMW</span>{formatRawZMW(totalZMW)}</div>
                </div>
                
                <div className="bg-white p-4 rounded-2xl border border-black/20">
                  <h4 className="font-bold text-sm mb-2">Shop With Confidence</h4>
                  <p className="text-xs text-gray-500 mb-4">Every order is protected and backed by our guarantees.</p>
                  <ul className="space-y-3 text-sm font-medium text-gray-700">
                    <li className="flex gap-3 items-center"><ShieldCheck size={18} className="text-black" /> 12-month warranty included</li>
                    <li className="flex gap-3 items-center"><ShieldCheck size={18} className="text-black" /> Hand-tested by experts</li>
                  </ul>
                </div>
              </div>
            </div>
          </>
        )}
      </motion.div>
    </motion.div>
  );
}
