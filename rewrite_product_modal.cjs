const fs = require('fs');

const code = `import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShieldCheck, RefreshCw, Truck } from 'lucide-react';
import { Product, VariantCondition } from '../types';
import { formatZMW, getDisplayPriceUSD, formatProductZMW, formatCrossedOutZMW, parseColors } from '../utils';

interface ProductDetailsModalProps {
  product: Product;
  onClose: () => void;
  onAddToCart: (product: Product, color: string, storage: string, condition: VariantCondition, price: number) => void;
}

export function ProductDetailsModal({ product, onClose, onAddToCart }: ProductDetailsModalProps) {
  const parsedColors = parseColors(product.colors);
  const hasVariants = parsedColors.length > 0;
  
  const [selectedColorData, setSelectedColorData] = useState(parsedColors[0] || null);
  const [selectedStorageData, setSelectedStorageData] = useState<any>(selectedColorData?.storages?.[0] || null);
  const [selectedConnectivityData, setSelectedConnectivityData] = useState<any>(selectedStorageData?.connectivities?.[0] || null);
  
  const [selectedConditionData, setSelectedConditionData] = useState<any>(
      selectedConnectivityData ? selectedConnectivityData.conditions?.[0] : selectedStorageData?.conditions?.[0] || null
  );

  const fallbackColors = ['#000000', '#215E7C', '#A3E4D7'];
  const fallbackColorNames = ['Black', 'Blue', 'Green'];
  const [legacyColor, setLegacyColor] = useState(product.colors?.[0] || fallbackColors[0]);
  const [legacyStorage, setLegacyStorage] = useState('128GB');

  const fallbackConditions = [
    { name: 'Good', price: product.price, description: 'Visible scratches or dents; works like new.', available: true },
    { name: 'Great', price: product.price + 20, description: 'Minor cosmetic marks; works like new.', available: true },
    { name: 'Excellent', price: product.price + 40, description: 'Nearly flawless appearance; works like new.', available: true }
  ];
  const [legacyCondition, setLegacyCondition] = useState(fallbackConditions[1]);

  useEffect(() => {
    if (selectedColorData) {
      let availableStorage = selectedColorData.storages[0];
      for (const s of selectedColorData.storages) {
          if (s.connectivities && s.connectivities.some((conn: any) => conn.conditions.some((c: any) => c.available))) {
              availableStorage = s; break;
          } else if (s.conditions && s.conditions.some((c: any) => c.available)) {
              availableStorage = s; break;
          }
      }
      setSelectedStorageData(availableStorage);
    }
  }, [selectedColorData]);

  useEffect(() => {
    if (selectedStorageData) {
      if (selectedStorageData.connectivities && selectedStorageData.connectivities.length > 0) {
          let availableConn = selectedStorageData.connectivities[0];
          for (const conn of selectedStorageData.connectivities) {
              if (conn.conditions.some((c: any) => c.available)) {
                  availableConn = conn; break;
              }
          }
          setSelectedConnectivityData(availableConn);
      } else {
          setSelectedConnectivityData(null);
          const availableCond = selectedStorageData.conditions?.find((c: any) => c.available) || selectedStorageData.conditions?.[0];
          setSelectedConditionData(availableCond);
      }
    }
  }, [selectedStorageData]);

  useEffect(() => {
      if (selectedConnectivityData) {
          const availableCond = selectedConnectivityData.conditions.find((c: any) => c.available) || selectedConnectivityData.conditions[0];
          setSelectedConditionData(availableCond);
      }
  }, [selectedConnectivityData]);

  const handleAdd = () => {
    if (hasVariants && selectedColorData && selectedStorageData && selectedConditionData) {
      const storageStr = selectedConnectivityData ? \`\${selectedStorageData.name} - \${selectedConnectivityData.name}\` : selectedStorageData.name;
      onAddToCart(
        product, 
        selectedColorData.name, 
        storageStr, 
        selectedConditionData, 
        selectedConditionData.price
      );
    } else {
      onAddToCart(
        product,
        legacyColor,
        legacyStorage,
        legacyCondition,
        legacyCondition.price
      );
    }
    onClose();
  };
  
  const displayImage = selectedColorData?.image || product.image;
  const legacyIndex = fallbackColors.indexOf(legacyColor);
  const hueRotate = hasVariants ? 0 : (legacyIndex * 45);
  
  const currentPrice = selectedConditionData ? selectedConditionData.price : legacyCondition.price;
  
  const conditionDescriptions: Record<string, string> = {
    'Good': 'Visible scratches or dents; works like new. Backed by a 1-year warranty.',
    'Great': 'Minor cosmetic marks; works like new. Backed by a 1-year warranty.',
    'Excellent': 'Nearly flawless appearance; works like new. Backed by a 1-year warranty.'
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[999] flex items-center justify-center p-4 sm:p-6"
      >
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
        
        <motion.div
          initial={{ y: 50, opacity: 0, scale: 0.95 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 50, opacity: 0, scale: 0.95 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-5xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh]"
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 w-10 h-10 bg-black/5 rounded-full flex items-center justify-center hover:bg-black/10 transition-colors"
          >
            <X size={20} className="text-black" />
          </button>

          <div className="w-full md:w-1/2 bg-white p-8 flex items-center justify-center border-b md:border-b-0 md:border-r border-gray-100 shrink-0 md:shrink overflow-hidden">
             <div className="relative w-full max-w-md md:max-w-lg aspect-square md:aspect-[4/5] flex items-center justify-center max-h-[40vh] md:max-h-none">
               <motion.img
                 key={selectedColorData?.name || legacyColor}
                 initial={{ opacity: 0, scale: 0.9 }}
                 animate={{ opacity: 1, scale: 1.15 }}
                 transition={{ duration: 0.3 }}
                 src={displayImage}
                 alt={product.name}
                 className="w-full h-full object-contain mix-blend-multiply"
                 style={{ filter: \`hue-rotate(\${hueRotate}deg)\` }}
               />
             </div>
          </div>

          <div className="w-full md:w-1/2 p-8 md:p-12 overflow-y-auto">
            <h2 className="text-3xl md:text-4xl font-black tracking-tighter text-black mb-2">{product.name}</h2>
            
            <div className="flex items-baseline gap-3 mb-8">
              <span className="text-2xl font-bold text-black">{formatProductZMW(product, getDisplayPriceUSD(currentPrice))}</span>
              <span className="text-sm text-gray-400 line-through">{formatCrossedOutZMW(product, currentPrice)}</span>
              <span className="bg-yellow-400 text-black text-xs font-bold px-2 py-1 rounded-md uppercase tracking-wider">Save 33%</span>
            </div>

            {/* Colors */}
            <div className="mb-8">
              <h3 className="text-sm font-bold text-black uppercase tracking-widest mb-1">Select Color</h3>
              <p className="text-xs text-gray-500 mb-4">A color that matches your style.</p>
              
              <div className="flex flex-wrap gap-3">
                {hasVariants ? parsedColors.map((color) => (
                  <button
                    key={color.name}
                    onClick={() => setSelectedColorData(color)}
                    className={\`flex items-center gap-2 px-3 py-2 rounded-full border-2 transition-all \${
                      selectedColorData?.name === color.name ? 'border-black' : 'border-gray-200 hover:border-gray-300'
                    }\`}
                  >
                    <span className="w-5 h-5 rounded-full shadow-inner border border-black/10" style={{ backgroundColor: color.hex }} />
                    <span className="text-sm font-medium text-gray-700">{color.name}</span>
                  </button>
                )) : fallbackColors.map((color, idx) => (
                  <button
                    key={color}
                    onClick={() => setLegacyColor(color)}
                    className={\`flex items-center gap-2 px-3 py-2 rounded-full border-2 transition-all \${
                      legacyColor === color ? 'border-black' : 'border-gray-200 hover:border-gray-300'
                    }\`}
                  >
                    <span className="w-5 h-5 rounded-full shadow-inner border border-black/10" style={{ backgroundColor: color }} />
                    <span className="text-sm font-medium text-gray-700">{fallbackColorNames[idx] || 'Color'}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Storage */}
            <div className="mb-8">
              <h3 className="text-sm font-bold text-black uppercase tracking-widest mb-1">Select Storage</h3>
              <div className="grid grid-cols-1 gap-3">
                {hasVariants && selectedColorData ? selectedColorData.storages.map((storage: any) => {
                  let isAvailable = false;
                  if (storage.connectivities) {
                      isAvailable = storage.connectivities.some((conn: any) => conn.conditions.some((c: any) => c.available));
                  } else if (storage.conditions) {
                      isAvailable = storage.conditions.some((c: any) => c.available);
                  }
                  return (
                  <button
                    key={storage.name}
                    onClick={() => isAvailable && setSelectedStorageData(storage)}
                    disabled={!isAvailable}
                    className={\`text-left p-4 rounded-xl border-2 transition-all flex justify-between \${
                      selectedStorageData?.name === storage.name ? 'border-black bg-black/5' : 
                      !isAvailable ? 'border-gray-100 opacity-50 cursor-not-allowed bg-white' : 'border-gray-100 hover:border-gray-200'
                    }\`}
                  >
                    <span className={\`text-sm font-bold \${selectedStorageData?.name === storage.name ? 'text-black' : 'text-gray-700'}\`}>{storage.name}</span>
                    {!isAvailable && <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Sold Out</span>}
                  </button>
                )}) : ['128GB', '256GB', '512GB'].map((storage) => (
                  <button
                    key={storage}
                    onClick={() => setLegacyStorage(storage)}
                    className={\`text-left p-4 rounded-xl border-2 transition-all \${
                      legacyStorage === storage ? 'border-black bg-black/5' : 'border-gray-100 hover:border-gray-200'
                    }\`}
                  >
                    <span className={\`text-sm font-bold \${legacyStorage === storage ? 'text-black' : 'text-gray-700'}\`}>{storage}</span>
                  </button>
                ))}
              </div>
            </div>
            
            {/* Connectivity */}
            {selectedStorageData && selectedStorageData.connectivities && selectedStorageData.connectivities.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-sm font-bold text-black uppercase tracking-widest mb-1">Select Connectivity</h3>
                  <div className="grid grid-cols-1 gap-3">
                     {selectedStorageData.connectivities.map((conn: any) => {
                         const isAvailable = conn.conditions.some((c: any) => c.available);
                         return (
                             <button
                                key={conn.name}
                                onClick={() => isAvailable && setSelectedConnectivityData(conn)}
                                disabled={!isAvailable}
                                className={\`text-left p-4 rounded-xl border-2 transition-all flex justify-between \${
                                  selectedConnectivityData?.name === conn.name ? 'border-black bg-black/5' : 
                                  !isAvailable ? 'border-gray-100 opacity-50 cursor-not-allowed bg-white' : 'border-gray-100 hover:border-gray-200'
                                }\`}
                             >
                                <span className={\`text-sm font-bold \${selectedConnectivityData?.name === conn.name ? 'text-black' : 'text-gray-700'}\`}>{conn.name}</span>
                                {!isAvailable && <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Sold Out</span>}
                             </button>
                         );
                     })}
                  </div>
                </div>
            )}

            {/* Condition */}
            <div className="mb-8">
              <h3 className="text-sm font-bold text-black uppercase tracking-widest mb-1">Select Condition</h3>
              <p className="text-xs text-gray-500 mb-4">Every device passes our 90+ Point Inspection.</p>
              
              <div className="grid grid-cols-1 gap-3">
                {hasVariants ? (selectedConnectivityData ? selectedConnectivityData.conditions : selectedStorageData?.conditions)?.map((cond: any) => (
                  <button
                    key={cond.name}
                    onClick={() => cond.available && setSelectedConditionData(cond)}
                    disabled={!cond.available}
                    className={\`text-left p-4 rounded-xl border-2 transition-all flex justify-between items-start \${
                      selectedConditionData?.name === cond.name ? 'border-black bg-black/5' : 
                      !cond.available ? 'border-gray-100 opacity-50 cursor-not-allowed bg-white' : 'border-gray-100 hover:border-gray-200'
                    }\`}
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                         <span className={\`font-bold \${selectedConditionData?.name === cond.name ? 'text-black' : 'text-black'}\`}>{cond.name}</span>
                         {!cond.available && <span className="bg-gray-200 text-gray-500 text-[10px] font-bold px-2 py-0.5 rounded uppercase">Sold Out</span>}
                      </div>
                      <div className="text-xs text-gray-500 pr-4">{conditionDescriptions[cond.name] || 'Fully functional. Backed by a 1-year warranty.'}</div>
                    </div>
                    <div className={\`font-bold whitespace-nowrap \${selectedConditionData?.name === cond.name ? 'text-black' : 'text-black'}\`}>
                      {formatProductZMW(product, getDisplayPriceUSD(cond.price))}
                    </div>
                  </button>
                )) : fallbackConditions.map((cond) => (
                  <button
                    key={cond.name}
                    onClick={() => setLegacyCondition(cond)}
                    className={\`text-left p-4 rounded-xl border-2 transition-all flex justify-between items-start \${
                      legacyCondition.name === cond.name ? 'border-black bg-black/5' : 'border-gray-100 hover:border-gray-200'
                    }\`}
                  >
                    <div>
                      <div className={\`font-bold mb-1 \${legacyCondition.name === cond.name ? 'text-black' : 'text-black'}\`}>{cond.name}</div>
                      <div className="text-xs text-gray-500 pr-4">{cond.description}</div>
                    </div>
                    <div className={\`font-bold whitespace-nowrap \${legacyCondition.name === cond.name ? 'text-black' : 'text-black'}\`}>
                      {formatProductZMW(product, getDisplayPriceUSD(cond.price))}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleAdd}
              disabled={hasVariants && (!selectedConditionData || !selectedConditionData.available)}
              className="w-full bg-black text-white font-bold uppercase tracking-widest py-5 rounded-xl hover:bg-neutral-900 border border-transparent transition-colors mb-6 shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add to cart
            </button>

            <div className="grid grid-cols-3 gap-4 border-t border-gray-100 pt-6">
              <div className="flex flex-col items-center text-center">
                <ShieldCheck size={24} className="text-black mb-2" />
                <span className="text-xs font-bold text-black mb-1">12-Month Warranty</span>
                <span className="text-[10px] text-gray-500">We back everything with a 1-year warranty.</span>
              </div>
              <div className="flex flex-col items-center text-center">
                <RefreshCw size={24} className="text-black mb-2" />
                <span className="text-xs font-bold text-black mb-1">Hassle-Free Returns</span>
                <span className="text-[10px] text-gray-500">Every order comes with our 7-10 day return policy.</span>
              </div>
              <div className="flex flex-col items-center text-center">
                <Truck size={24} className="text-black mb-2" />
                <span className="text-xs font-bold text-black mb-1">Fast Shipping</span>
                <span className="text-[10px] text-gray-500">Takes 7-10 Days for delivery securely.</span>
              </div>
            </div>

          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
`;

fs.writeFileSync('src/components/ProductDetailsModal.tsx', code);
console.log("Rewrote ProductDetailsModal.tsx");
