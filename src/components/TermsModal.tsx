import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ShieldCheck, Truck, RefreshCw, CheckCircle2 } from 'lucide-react';

interface TermsModalProps {
  onClose: () => void;
}

export function TermsModal({ onClose }: TermsModalProps) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6"
      >
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
        
        <motion.div
          initial={{ y: 50, opacity: 0, scale: 0.95 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 50, opacity: 0, scale: 0.95 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="p-6 sm:p-8 border-b border-gray-100 flex items-center justify-between shrink-0">
            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-black tracking-tighter">Terms of Service</h2>
              <p className="text-sm text-gray-500 mt-1">Store Conditions, Warranty & Policies</p>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full flex items-center justify-center transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Scrollable Content */}
          <div className="p-6 sm:p-8 overflow-y-auto bg-gray-50/50">
            <div className="space-y-8">
              
              {/* Introduction */}
              <section>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Welcome to Gigastore. By placing an order with us, you agree to the following terms and conditions regarding product quality, shipping, and returns. We pride ourselves on delivering premium electronics backed by robust warranties.
                </p>
              </section>

              {/* 90+ Point Inspection */}
              <section className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-green-50 text-green-600 rounded-xl flex items-center justify-center">
                    <CheckCircle2 size={20} />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">90+ Point Inspection</h3>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Every device sold on Gigastore undergoes a rigorous 90+ point inspection process. Our certified technicians test battery health, screen responsiveness, camera functionality, connectivity, and physical components to ensure every device meets our high standards before it reaches you.
                </p>
              </section>

              {/* Device Conditions */}
              <section>
                <h3 className="text-lg font-bold text-gray-900 mb-4 px-2">Device Conditions Explained</h3>
                <div className="grid gap-3">
                  <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                    <h4 className="font-bold text-gray-900 mb-1">Excellent</h4>
                    <p className="text-sm text-gray-600">Nearly flawless appearance. The screen and body are in pristine condition with no visible scratches from 12 inches away. Works perfectly like new.</p>
                  </div>
                  <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                    <h4 className="font-bold text-gray-900 mb-1">Great</h4>
                    <p className="text-sm text-gray-600">Minor cosmetic marks. May have light scratches or scuffs on the body, but the screen remains free of noticeable damage. 100% fully functional.</p>
                  </div>
                  <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                    <h4 className="font-bold text-gray-900 mb-1">Good</h4>
                    <p className="text-sm text-gray-600">Visible scratches or dents. The device shows signs of daily wear and tear, but has been fully tested and works perfectly without any operational issues.</p>
                  </div>
                </div>
              </section>

              {/* Warranty */}
              <section className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                    <ShieldCheck size={20} />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">8-Month Warranty</h3>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed mb-3">
                  All devices are backed by our comprehensive 8-month warranty. This covers manufacturer defects, software issues, and hardware failures that occur under normal use. 
                </p>
                <p className="text-sm text-gray-600 leading-relaxed">
                  <span className="font-bold text-gray-900">Exclusions:</span> The warranty does not cover accidental damage (drops, spills, cracked screens), water damage, or unauthorized third-party repairs.
                </p>
              </section>

              {/* Shipping & Returns */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <section className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-black/5 text-black rounded-xl flex items-center justify-center">
                      <Truck size={20} />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">Shipping Policy</h3>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed mb-2">
                    <span className="font-bold text-gray-900">Standard Delivery:</span> 7-10 business days.
                  </p>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Once your order is verified and dispatched, you will receive tracking information. Shipping fees are calculated at checkout based on cart contents.
                  </p>
                </section>

                <section className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-black/5 text-black rounded-xl flex items-center justify-center">
                      <RefreshCw size={20} />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">Return Policy</h3>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed mb-2">
                    <span className="font-bold text-gray-900">Return Window:</span> 7-15 days.
                  </p>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    If you are not satisfied with your purchase, you may return it within the return window for a refund or exchange, provided the device is in its original sent condition.
                  </p>
                </section>
              </div>

              {/* Footer text */}
              <div className="text-center pb-4">
                <p className="text-xs text-gray-400 font-medium">Gigastore | The Future of Connection. © 2026.</p>
              </div>

            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
