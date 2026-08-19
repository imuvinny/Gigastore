import React from 'react';
import { motion } from 'motion/react';
import { Home } from 'lucide-react';

export function NotFound404({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[9999] bg-[#050505] flex flex-col items-center justify-center overflow-hidden">
      {/* Stars background */}
      {[...Array(50)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute bg-white rounded-full"
          style={{
            width: Math.random() * 3 + 'px',
            height: Math.random() * 3 + 'px',
            left: Math.random() * 100 + '%',
            top: Math.random() * 100 + '%',
          }}
          animate={{
            opacity: [0.1, 0.8, 0.1],
          }}
          transition={{
            duration: Math.random() * 3 + 2,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      ))}
      
      {/* Astronaut / Floating Element */}
      <motion.div
        animate={{
          y: [-20, 20, -20],
          rotate: [-10, 10, -10],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="relative z-10 text-8xl mb-8 select-none"
      >
        👨‍🚀
      </motion.div>

      <motion.h1 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-6xl font-black text-white mb-4 tracking-tighter"
      >
        404
      </motion.h1>
      <motion.p 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="text-gray-400 text-lg mb-8 max-w-md text-center"
      >
        Oops! Looks like this social link is lost in space. It hasn't been configured yet.
      </motion.p>

      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        onClick={onClose}
        className="flex items-center gap-2 bg-white text-black px-6 py-3 rounded-full font-bold hover:bg-gray-200 transition-colors z-20 cursor-pointer"
      >
        <Home size={20} />
        Return to Earth
      </motion.button>
    </div>
  );
}
