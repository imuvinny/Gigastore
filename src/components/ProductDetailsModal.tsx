import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShieldCheck, RefreshCw, Truck, ChevronLeft, ChevronRight, Heart } from 'lucide-react';
import { Product, VariantCondition } from '../types';
import { formatZMW, getDisplayPriceUSD, formatProductZMW, formatCrossedOutZMW, getSavePercentage, parseColors, isPlugPromoImage, getMinConditionPriceFromColors, getEffectiveConditionPrice } from '../utils';

interface ProductDetailsModalProps {
  key?: React.Key;
  product: Product;
  onClose: () => void;
  onAddToCart: (product: Product, color: string, storage: string, condition: VariantCondition, price: number) => void;
  wishlist?: Product[];
  toggleWishlist?: (product: Product) => void;
}

const COLOR_DICTIONARY: { keys: string[]; name: string; hex: string }[] = [
  { keys: ['space black'], name: 'Space Black', hex: '#1C1C1E' },
  { keys: ['dark blue'], name: 'Dark Blue', hex: '#1B365D' },
  { keys: ['sky blue'], name: 'Sky Blue', hex: '#87CEEB' },
  { keys: ['bay'], name: 'Bay', hex: '#387DB8' },
  { keys: ['blue', 'navy'], name: 'Blue', hex: '#215E7C' },
  { keys: ['black', 'obsidian', 'midnight', 'charcoal', 'graphite', 'space gray', 'space grey'], name: 'Black', hex: '#1E1E1E' },
  { keys: ['white', 'starlight', 'silver', 'cream', 'snow'], name: 'White', hex: '#FFFFFF' },
  { keys: ['alpine green', 'sage'], name: 'Green', hex: '#3B6E4E' },
  { keys: ['green', 'mint'], name: 'Green', hex: '#3B6E4E' },
  { keys: ['pink', 'rose gold'], name: 'Pink', hex: '#E8A8B8' },
  { keys: ['deep purple', 'lavender', 'purple'], name: 'Purple', hex: '#7E6B8F' },
  { keys: ['yellow'], name: 'Yellow', hex: '#F3E37C' },
  { keys: ['red', 'product red'], name: 'Red', hex: '#D02A3A' },
  { keys: ['gold'], name: 'Gold', hex: '#E5D1B8' },
  { keys: ['natural titanium', 'desert titanium', 'titanium'], name: 'Titanium', hex: '#98928A' },
  { keys: ['coral', 'orange'], name: 'Orange', hex: '#FF7F50' },
];

export function getExtractedColor(productName: string): { name: string; hex: string } {
  const cleaned = (productName || '').replace(/bluetooth/gi, '');
  for (const entry of COLOR_DICTIONARY) {
    for (const key of entry.keys) {
      const regex = new RegExp('\\b' + key.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&') + '\\b', 'i');
      if (regex.test(cleaned)) {
        return { name: entry.name, hex: entry.hex };
      }
    }
  }
  if (cleaned.toLowerCase().includes('earpod') || cleaned.toLowerCase().includes('airpod')) {
    return { name: 'White', hex: '#FFFFFF' };
  }
  return { name: 'White', hex: '#FFFFFF' };
}

export function isAudioOrAccessoryProduct(product: { name: string; brand?: string }): boolean {
  const n = (product.name || '').toLowerCase();
  const c = (product.brand || '').toLowerCase();
  return (
    n.includes('earpod') || n.includes('earbud') || n.includes('buds') || n.includes('airpods') ||
    n.includes('speaker') || n.includes('headphone') || n.includes('flip') || n.includes('pill') ||
    n.includes('tune') || n.includes('solo') || n.includes('beat') || n.includes('wire') ||
    n.includes('cable') || n.includes('charger') || n.includes('adapter') || c.includes('audio') ||
    c.includes('earbud') || c.includes('speaker') || c.includes('headphone') || c.includes('airpods') ||
    c.includes('accessories') || n.includes('accessory') || n.includes('case') || n.includes('protector') || 
    n.includes('screen') || n.includes('keyboard') || n.includes('mouse') || n.includes('cover')
  );
}

export function isAccessoryProduct(product: { name: string; brand?: string }): boolean {
  const n = (product.name || '').toLowerCase();
  const c = (product.brand || '').toLowerCase();
  return c.includes('accessories') || n.includes('accessory') || n.includes('case') || 
         n.includes('protector') || n.includes('screen') || n.includes('keyboard') || 
         n.includes('mouse') || n.includes('cover') || n.includes('cable') || 
         n.includes('charger') || n.includes('adapter');
}

export function isWiredEarPodsProduct(product: { name: string; brand?: string }): boolean {
  const n = (product.name || '').toLowerCase();
  return (n.includes('earpods') || n.includes('earpod')) && (n.includes('3.5') || n.includes('lightning') || n.includes('usb') || n.includes('wire') || n.includes('apple'));
}

export function ProductDetailsModal({ product, onClose, onAddToCart, wishlist, toggleWishlist }: ProductDetailsModalProps) {
  const rawParsedColors = useMemo(() => parseColors(product.colors), [product.colors]);
  const minVariantPrice = useMemo(() => getMinConditionPriceFromColors(product.colors), [product.colors]);
  const extractedColor = useMemo(() => getExtractedColor(product.name), [product.name]);
  const isAudio = isAudioOrAccessoryProduct(product);
  const isAccessory = isAccessoryProduct(product);
  const isWired = isWiredEarPodsProduct(product);

  // Normalize parsed colors to match product title color if applicable
  const parsedColors = useMemo(() => {
    if (rawParsedColors.length === 0) return [];
    return rawParsedColors.map((colorObj) => {
      if (
        (colorObj.name.toLowerCase() === 'default' || colorObj.name.toLowerCase() === 'white') &&
        extractedColor.name !== 'White' &&
        extractedColor.name !== 'Default'
      ) {
        return {
          ...colorObj,
          name: extractedColor.name,
          hex: extractedColor.hex
        };
      }
      return colorObj;
    });
  }, [rawParsedColors, extractedColor]);

  const hasVariants = parsedColors.length > 0;

  // Find color matching title if available
  const initialColorChoice = useMemo(() => {
    if (hasVariants) {
      const match = parsedColors.find(c => c.name.toLowerCase() === extractedColor.name.toLowerCase());
      return match || parsedColors[0];
    }
    return null;
  }, [hasVariants, parsedColors, extractedColor]);
  
  const getDefaultSelections = (colorData: any) => {
    if (!colorData || !colorData.storages || colorData.storages.length === 0) {
      return { storage: null, connectivity: null, condition: null };
    }
    let storage = colorData.storages.find((s: any) => {
      if (s.connectivities) {
        return s.connectivities.some((conn: any) => conn.conditions.some((c: any) => c.available));
      }
      return s.conditions?.some((c: any) => c.available);
    }) || colorData.storages[0];

    let connectivity: any = null;
    let condition: any = null;

    if (storage?.connectivities && storage.connectivities.length > 0) {
      connectivity = storage.connectivities.find((conn: any) => conn.conditions.some((c: any) => c.available)) || storage.connectivities[0];
      if (connectivity) {
        condition = connectivity.conditions?.find((c: any) => c.available) || connectivity.conditions?.[0] || null;
      }
    } else if (storage?.conditions) {
      condition = storage.conditions.find((c: any) => c.available) || storage.conditions[0] || null;
    }

    return { storage, connectivity, condition };
  };

  const initialSelections = useMemo(() => {
    return getDefaultSelections(initialColorChoice);
  }, [initialColorChoice]);

  const [selectedColorData, setSelectedColorData] = useState<any>(initialColorChoice);
  const [selectedStorageData, setSelectedStorageData] = useState<any>(initialSelections.storage);
  const [selectedConnectivityData, setSelectedConnectivityData] = useState<any>(initialSelections.connectivity);
  const [selectedConditionData, setSelectedConditionData] = useState<any>(initialSelections.condition);

  const handleSelectColor = (color: any) => {
    setSelectedColorData(color);
    const { storage, connectivity, condition } = getDefaultSelections(color);
    setSelectedStorageData(storage);
    setSelectedConnectivityData(connectivity);
    setSelectedConditionData(condition);
  };

  const handleSelectStorage = (storage: any) => {
    setSelectedStorageData(storage);
    let connectivity: any = null;
    let condition: any = null;
    if (storage?.connectivities && storage.connectivities.length > 0) {
      connectivity = storage.connectivities.find((conn: any) => conn.conditions.some((c: any) => c.available)) || storage.connectivities[0];
      if (connectivity) {
        condition = connectivity.conditions?.find((c: any) => c.available) || connectivity.conditions?.[0] || null;
      }
    } else if (storage?.conditions) {
      condition = storage.conditions.find((c: any) => c.available) || storage.conditions[0] || null;
    }
    setSelectedConnectivityData(connectivity);
    setSelectedConditionData(condition);
  };

  const handleSelectConnectivity = (conn: any) => {
    setSelectedConnectivityData(conn);
    const condition = conn.conditions?.find((c: any) => c.available) || conn.conditions?.[0] || null;
    setSelectedConditionData(condition);
  };

  const connectorOptions = ['3.5MM', 'USB-C', 'Lightning'];
  const initialConnector = useMemo(() => {
    const lower = product.name.toLowerCase();
    if (lower.includes('usb')) return 'USB-C';
    if (lower.includes('lightning')) return 'Lightning';
    return '3.5MM';
  }, [product.name]);

  // Legacy fallback color setup when no JSON variant data exists
  const [legacyColorObj, setLegacyColorObj] = useState(extractedColor);
  const [legacyStorage, setLegacyStorage] = useState('128GB');
  const [selectedConnector, setSelectedConnector] = useState(initialConnector);

  const fallbackConditions = [
    { name: 'Good', price: product.price, description: 'Visible scratches or dents; works like new.', available: true },
    { name: 'Great', price: product.price + 20, description: 'Minor cosmetic marks; works like new.', available: true },
    { name: 'Excellent', price: product.price + 40, description: 'Nearly flawless appearance; works like new.', available: true }
  ];
  const [legacyCondition, setLegacyCondition] = useState(fallbackConditions[1]);

  const hasValidStorage = hasVariants && selectedColorData?.storages?.length > 0 && selectedColorData.storages[0].name !== 'N/A' && selectedColorData.storages[0].name !== '';
  const showStorage = !isAudio && !isWired && (hasVariants ? hasValidStorage : true);

  const handleAdd = () => {
    const chosenColor = hasVariants && selectedColorData ? selectedColorData.name : legacyColorObj.name;
    
    let chosenStorage = 'N/A';
    if (isWired) {
      chosenStorage = selectedConnector;
    } else if (showStorage) {
      if (hasVariants && selectedStorageData) {
        chosenStorage = selectedConnectivityData ? `${selectedStorageData.name} - ${selectedConnectivityData.name}` : selectedStorageData.name;
      } else {
        chosenStorage = legacyStorage;
      }
    }

    const chosenCondition = selectedConditionData || legacyCondition;
    const rawPrice = chosenCondition ? chosenCondition.price : product.price;
    const effectivePrice = getEffectiveConditionPrice(product, rawPrice, minVariantPrice);
    const finalCondition = chosenCondition ? { ...chosenCondition, price: effectivePrice } : { name: 'Good', price: effectivePrice, description: '' };

    onAddToCart(
      product, 
      chosenColor, 
      chosenStorage, 
      finalCondition, 
      effectivePrice
    );
    onClose();
  };
  
  const displayImage = selectedColorData?.image || product.image;
  
  // Extract all available angle images for the active color or product (excluding plug promo/box graphics)
  const activeImages: string[] = useMemo(() => {
    let list: string[] = [];
    if (selectedColorData?.images && selectedColorData.images.length > 0) {
      list = selectedColorData.images;
    } else if (product.images && product.images.length > 0) {
      list = product.images;
    } else if (selectedColorData?.image) {
      list = [selectedColorData.image];
    } else if (product.image) {
      list = [product.image];
    }
    const filtered = list.filter((img) => Boolean(img) && !isPlugPromoImage(img));
    if (filtered.length > 0) return filtered;
    return list.filter(Boolean);
  }, [selectedColorData, product]);

  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Reset index when color selection changes
  useEffect(() => {
    setCurrentImageIndex(0);
  }, [selectedColorData?.name]);

  // Slideshow auto-play effect
  useEffect(() => {
    if (activeImages.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % activeImages.length);
    }, 3500);

    return () => clearInterval(interval);
  }, [activeImages.length]);

  const currentActiveImage = activeImages[currentImageIndex] || activeImages[0] || displayImage;

  const handleNextImage = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % activeImages.length);
  };

  const handlePrevImage = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentImageIndex((prev) => (prev - 1 + activeImages.length) % activeImages.length);
  };

  const currentPrice = selectedConditionData ? selectedConditionData.price : legacyCondition.price;
  
  const conditionDescriptions: Record<string, string> = {
    'Good': 'Visible scratches or dents; works like new. Backed by an 8-month warranty.',
    'Great': 'Minor cosmetic marks; works like new. Backed by an 8-month warranty.',
    'Excellent': 'Nearly flawless appearance; works like new. Backed by an 8-month warranty.'
  };

  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[999] flex items-center justify-center p-2 sm:p-6 overflow-y-auto min-h-full"
      >
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
        
        <motion.div
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 40, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          style={{ WebkitMaskImage: '-webkit-radial-gradient(white, black)' }}
          className="relative w-full max-w-5xl bg-white rounded-[32px] sm:rounded-[40px] shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90dvh] my-auto z-10"
        >
          <button
            onClick={onClose}
            className="absolute top-3 right-3 sm:top-4 sm:right-4 z-30 w-9 h-9 sm:w-10 sm:h-10 bg-black/10 hover:bg-black/20 text-black rounded-full flex items-center justify-center transition-colors shadow-sm"
          >
            <X size={20} className="text-black" />
          </button>

          {/* Left Column: Interactive Product Angle Gallery & Auto-playing Slideshow */}
          <div className="w-full md:w-1/2 bg-white p-4 sm:p-6 md:p-8 flex flex-col items-center justify-between border-b md:border-b-0 md:border-r border-gray-100 shrink-0 md:shrink relative group">
            {/* Main Angle Image Display */}
            <div className="relative w-full max-w-md aspect-square md:aspect-[4/5] flex items-center justify-center my-auto p-2 sm:p-4 max-h-[26vh] sm:max-h-[36vh] md:max-h-none">
              {/* Previous Button */}
              {activeImages.length > 1 && (
                <button
                  onClick={handlePrevImage}
                  className="hidden md:flex absolute left-1 z-20 w-9 h-9 bg-white/90 hover:bg-black hover:text-white rounded-full items-center justify-center shadow-md border border-gray-200 text-black transition-colors transform active:scale-95"
                  aria-label="Previous image"
                >
                  <ChevronLeft size={18} />
                </button>
              )}

              <AnimatePresence mode="wait">
                <motion.img
                  key={currentActiveImage}
                  initial={{ opacity: 0, scale: 0.94 }}
                  animate={{ opacity: 1, scale: 1.0 }}
                  exit={{ opacity: 0, scale: 0.94 }}
                  transition={{ duration: 0.35, ease: "easeOut" }}
                  src={currentActiveImage || undefined}
                  alt={product.name}
                  className="w-[85%] h-[85%] md:w-[80%] md:h-[80%] object-contain mix-blend-multiply select-none"
                />
              </AnimatePresence>

              {/* Next Button */}
              {activeImages.length > 1 && (
                <button
                  onClick={handleNextImage}
                  className="hidden md:flex absolute right-1 z-20 w-9 h-9 bg-white/90 hover:bg-black hover:text-white rounded-full items-center justify-center shadow-md border border-gray-200 text-black transition-colors transform active:scale-95"
                  aria-label="Next image"
                >
                  <ChevronRight size={18} />
                </button>
              )}
            </div>

            {/* Angle Thumbnails & Indicators */}
            {activeImages.length > 1 && (
              <div className="w-full flex flex-col items-center gap-2 mt-2 z-10">
                <div className="flex items-center justify-center gap-2 max-w-full overflow-x-auto p-1.5 scrollbar-none">
                  {activeImages.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentImageIndex(idx)}
                      className={`relative w-12 h-12 rounded-xl bg-white border-2 p-1 overflow-hidden transition-colors duration-200 shrink-0 ${
                        idx === currentImageIndex 
                          ? 'border-black ring-2 ring-black/10 scale-105 shadow-md' 
                          : 'border-gray-200 opacity-60 hover:opacity-100 hover:border-gray-400'
                      }`}
                    >
                      <img 
                        src={img || undefined} 
                        alt={`Thumbnail ${idx + 1}`}
                        className="w-full h-full object-contain mix-blend-multiply"
                      />
                    </button>
                  ))}
                </div>

                {/* Progress Dots */}
                <div className="flex items-center gap-1.5">
                  {activeImages.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentImageIndex(idx)}
                      className={`h-1.5 rounded-full transition-colors duration-300 ${
                        idx === currentImageIndex ? 'w-5 bg-black' : 'w-1.5 bg-gray-300 hover:bg-gray-400'
                      }`}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="w-full md:w-1/2 p-5 sm:p-8 md:p-12 overflow-y-auto flex-1">
            <h2 className="text-3xl md:text-4xl font-black tracking-tighter text-black mb-2">{product.name}</h2>
            
            <div className="flex items-center gap-3 mb-8">
              <div className="flex items-baseline gap-3">
                <span className="text-2xl font-bold text-black">{formatProductZMW(product, getDisplayPriceUSD(currentPrice))}</span>
                <span className="text-sm text-gray-400 line-through">{formatCrossedOutZMW(product, getDisplayPriceUSD(currentPrice))}</span>
                <span className="bg-yellow-400 text-black text-xs font-bold px-2 py-1 rounded-md uppercase tracking-wider">Save {getSavePercentage(product, getDisplayPriceUSD(currentPrice))}%</span>
              </div>
              
              {wishlist && toggleWishlist && (
                <button 
                  onClick={() => toggleWishlist(product)}
                  className="ml-auto p-2 hover:bg-gray-100 rounded-full transition-colors flex items-center justify-center"
                >
                  <Heart 
                    size={24} 
                    className={`transition-colors ${wishlist.some(p => p.id === product.id) ? 'fill-black text-black' : 'text-gray-400 hover:text-black'}`} 
                  />
                </button>
              )}
            </div>

            {/* Colors */}
            {(!isAccessory || (hasVariants && parsedColors.length > 1)) && (
              <div className="mb-8">
                <h3 className="text-sm font-bold text-black uppercase tracking-widest mb-1">COLOR</h3>
                <p className="text-xs text-gray-500 mb-4">A color that matches your style.</p>
                
                <div className="flex flex-wrap gap-3">
                  {hasVariants ? parsedColors.map((color) => (
                    <button
                      key={color.name}
                      onClick={() => handleSelectColor(color)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-full border-2 transition-colors ${
                        selectedColorData?.name === color.name ? 'border-black' : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <span className="w-5 h-5 rounded-full shadow-inner border border-black/10" style={{ backgroundColor: color.hex }} />
                      <span className="text-sm font-medium text-gray-700">{color.name}</span>
                    </button>
                  )) : (
                    <button
                      onClick={() => setLegacyColorObj(legacyColorObj)}
                      className="flex items-center gap-2 px-3 py-2 rounded-full border-2 border-black"
                    >
                      <span className="w-5 h-5 rounded-full shadow-inner border border-black/10" style={{ backgroundColor: legacyColorObj.hex }} />
                      <span className="text-sm font-medium text-gray-700">{legacyColorObj.name}</span>
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Wired EarPods Connector Selection */}
            {isWired && (
              <div className="mb-8">
                <h3 className="text-sm font-bold text-black uppercase tracking-widest mb-1">CONNECTOR</h3>
                <div className="grid grid-cols-1 gap-3">
                  {connectorOptions.map((conn) => (
                    <button
                      key={conn}
                      onClick={() => setSelectedConnector(conn)}
                      className={`text-left p-4 rounded-xl border-2 transition-colors flex justify-between items-center ${
                        selectedConnector === conn ? 'border-black bg-black/5' : 'border-gray-100 hover:border-gray-200'
                      }`}
                    >
                      <span className={`text-sm font-bold ${selectedConnector === conn ? 'text-black' : 'text-gray-700'}`}>{conn}</span>
                      <span className="text-xs font-bold text-black">
                        {formatProductZMW(product, getDisplayPriceUSD(currentPrice))}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Storage (Hidden for Audio/Accessories/Wired EarPods) */}
            {showStorage && (
              <div className="mb-8">
                <h3 className="text-sm font-bold text-black uppercase tracking-widest mb-1">STORAGE</h3>
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
                        onClick={() => isAvailable && handleSelectStorage(storage)}
                        disabled={!isAvailable}
                        className={`text-left p-4 rounded-xl border-2 transition-colors flex justify-between ${
                          !isAvailable ? (selectedStorageData?.name === storage.name ? 'border-gray-300 bg-gray-100 cursor-not-allowed' : 'border-gray-100 cursor-not-allowed bg-gray-50') :
                          selectedStorageData?.name === storage.name ? 'border-black bg-black/5' : 'border-gray-100 hover:border-gray-200'
                        }`}
                      >
                        <span className={`text-sm font-bold ${!isAvailable ? 'text-gray-500' : selectedStorageData?.name === storage.name ? 'text-black' : 'text-gray-700'}`}>{storage.name}</span>
                        {!isAvailable && <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Sold Out</span>}
                      </button>
                    );
                  }) : ['128GB', '256GB', '512GB'].map((storage) => (
                    <button
                      key={storage}
                      onClick={() => setLegacyStorage(storage)}
                      className={`text-left p-4 rounded-xl border-2 transition-colors ${
                        legacyStorage === storage ? 'border-black bg-black/5' : 'border-gray-100 hover:border-gray-200'
                      }`}
                    >
                      <span className={`text-sm font-bold ${legacyStorage === storage ? 'text-black' : 'text-gray-700'}`}>{storage}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {/* Connectivity */}
            {showStorage && selectedStorageData && selectedStorageData.connectivities && selectedStorageData.connectivities.length > 0 && (
              <div className="mb-8">
                <h3 className="text-sm font-bold text-black uppercase tracking-widest mb-1">CONNECTIVITY</h3>
                <div className="grid grid-cols-1 gap-3">
                  {selectedStorageData.connectivities.map((conn: any) => {
                    const isAvailable = conn.conditions.some((c: any) => c.available);
                    return (
                      <button
                        key={conn.name}
                        onClick={() => isAvailable && handleSelectConnectivity(conn)}
                        disabled={!isAvailable}
                        className={`text-left p-4 rounded-xl border-2 transition-colors flex justify-between ${
                          !isAvailable ? (selectedConnectivityData?.name === conn.name ? 'border-gray-300 bg-gray-100 cursor-not-allowed' : 'border-gray-100 cursor-not-allowed bg-gray-50') :
                          selectedConnectivityData?.name === conn.name ? 'border-black bg-black/5' : 'border-gray-100 hover:border-gray-200'
                        }`}
                      >
                        <span className={`text-sm font-bold ${!isAvailable ? 'text-gray-500' : selectedConnectivityData?.name === conn.name ? 'text-black' : 'text-gray-700'}`}>{conn.name}</span>
                        {!isAvailable && <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Sold Out</span>}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Condition */}
            <div className="mb-8">
              <h3 className="text-sm font-bold text-black uppercase tracking-widest mb-1">CONDITION</h3>
              <p className="text-xs text-gray-500 mb-4">Every device passes our 90+ Point Inspection.</p>
              
              <div className="grid grid-cols-1 gap-3">
                {hasVariants ? (selectedConnectivityData ? selectedConnectivityData.conditions : selectedStorageData?.conditions)?.map((cond: any) => (
                  <button
                    key={cond.name}
                    onClick={() => cond.available && setSelectedConditionData(cond)}
                    disabled={!cond.available}
                    className={`text-left p-4 rounded-2xl border-2 transition-colors flex justify-between items-start ${
                      !cond.available ? (selectedConditionData?.name === cond.name ? 'border-gray-300 bg-gray-100 cursor-not-allowed' : 'border-gray-100 cursor-not-allowed bg-gray-50') :
                      selectedConditionData?.name === cond.name ? 'border-2 border-black bg-black/5 shadow-sm' : 'border-gray-100 hover:border-gray-200'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`font-bold ${!cond.available ? 'text-gray-500' : selectedConditionData?.name === cond.name ? 'text-black' : 'text-black'}`}>{cond.name}</span>
                        {!cond.available && <span className="bg-gray-200 text-gray-500 text-[10px] font-bold px-2 py-0.5 rounded uppercase">Sold Out</span>}
                      </div>
                      <div className="text-xs text-gray-500 pr-4">{conditionDescriptions[cond.name] || 'Fully functional. Backed by an 8-month warranty.'}</div>
                    </div>
                    <div className={`font-bold whitespace-nowrap ${!cond.available ? 'text-gray-500' : selectedConditionData?.name === cond.name ? 'text-black' : 'text-black'}`}>
                      {formatProductZMW(product, getDisplayPriceUSD(getEffectiveConditionPrice(product, cond.price, minVariantPrice)))}
                    </div>
                  </button>
                )) : fallbackConditions.map((cond) => (
                  <button
                    key={cond.name}
                    onClick={() => setLegacyCondition(cond)}
                    className={`text-left p-4 rounded-2xl border-2 transition-colors flex justify-between items-start ${
                      legacyCondition.name === cond.name ? 'border-2 border-black bg-black/5 shadow-sm' : 'border-gray-100 hover:border-gray-200'
                    }`}
                  >
                    <div>
                      <div className={`font-bold mb-1 ${legacyCondition.name === cond.name ? 'text-black' : 'text-black'}`}>{cond.name}</div>
                      <div className="text-xs text-gray-500 pr-4">{cond.description}</div>
                    </div>
                    <div className={`font-bold whitespace-nowrap ${legacyCondition.name === cond.name ? 'text-black' : 'text-black'}`}>
                      {formatProductZMW(product, getDisplayPriceUSD(getEffectiveConditionPrice(product, cond.price, minVariantPrice)))}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleAdd}
              disabled={hasVariants && (!selectedConditionData || !selectedConditionData.available)}
              className="w-full bg-black text-white font-bold uppercase tracking-widest py-5 rounded-2xl hover:bg-neutral-900 border border-transparent transition-colors mb-6 shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add to cart
            </button>

            <div className="grid grid-cols-3 gap-4 border-t border-gray-100 pt-6">
              <div className="flex flex-col items-center text-center">
                <ShieldCheck size={24} className="text-black mb-2" />
                <span className="text-xs font-bold text-black mb-1">8-Month Warranty</span>
                <span className="text-[10px] text-gray-500">We back everything with an 8-month warranty.</span>
              </div>
              <div className="flex flex-col items-center text-center">
                <RefreshCw size={24} className="text-black mb-2" />
                <span className="text-xs font-bold text-black mb-1">Hassle-Free Returns</span>
                <span className="text-[10px] text-gray-500">Every order comes with our 7-15 day return policy.</span>
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
