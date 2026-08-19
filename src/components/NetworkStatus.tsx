import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { WifiOff, Search, WifiHigh } from 'lucide-react';

interface NetworkStatusProps {
  isLoading?: boolean;
}

export function NetworkStatus({ isLoading }: NetworkStatusProps) {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [isUnstable, setIsUnstable] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    if (isLoading && !isOffline) {
      const timer = setTimeout(() => {
        setIsUnstable(true);
      }, 60000); // 1 minute
      return () => clearTimeout(timer);
    } else {
      setIsUnstable(false);
    }
  }, [isLoading, isOffline]);

  const showScreen = isOffline || isUnstable;

  return (
    <AnimatePresence>
      {showScreen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-sm flex flex-col items-center justify-center p-4 text-center overflow-hidden"
        >
          <div className="relative max-w-md w-full">
            {/* Spotlight Effect */}
            <motion.div 
              initial={{ x: -100, y: -100, opacity: 0 }}
              animate={{ 
                x: [-10, 10, -10], 
                y: [-10, 10, -10],
                opacity: 0.8
              }}
              transition={{ 
                repeat: Infinity, 
                duration: 4, 
                ease: "easeInOut" 
              }}
              className="absolute -top-32 -left-32 w-64 h-64 bg-yellow-100/10 rounded-full blur-3xl pointer-events-none"
            />
            <div className="flex flex-col items-center space-y-6">
              <div className="relative">
                <motion.div
                  animate={{ rotate: [-5, 5, -5] }}
                  transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                  className="bg-white/10 p-6 rounded-3xl"
                >
                  {isOffline ? <WifiOff size={64} className="text-white" /> : <WifiHigh size={64} className="text-white animate-pulse" />}
                </motion.div>
              </div>
              <div className="space-y-2">
                <h2 className="text-3xl font-black text-white tracking-tight">
                  {isOffline ? "Oops! You're Offline" : "Oops! Your connection is Unstable"}
                </h2>
                <p className="text-gray-400 font-medium">
                  {isOffline 
                    ? "Looks like your internet connection went exploring in the dark. Don't worry, we're waiting right here with a flashlight."
                    : "Data is taking longer than usual to load. It might be due to a slow or unstable network."}
                </p>
              </div>
              <div className="flex items-center gap-4 pt-8">
                <button 
                  onClick={() => window.location.reload()}
                  className="bg-white text-black px-8 py-4 rounded-xl font-bold tracking-widest uppercase hover:bg-gray-200 transition-colors"
                >
                  Retry Connection
                </button>
              </div>
              
              <div className="pt-12 flex justify-center opacity-30">
                <Search size={48} className="text-white animate-pulse" />
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
