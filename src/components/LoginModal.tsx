import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, Lock, Key } from 'lucide-react';

interface LoginModalProps {
  onClose: () => void;
  onLogin: () => void;
}

export function LoginModal({ onClose, onLogin }: LoginModalProps) {
  const [email, setEmail] = useState('admin@gigastore.com');
  const [password, setPassword] = useState('admin123');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate auth delay
    setTimeout(() => {
      setIsLoading(false);
      onLogin();
    }, 800);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[999] flex items-center justify-center p-6 bg-black/90 backdrop-blur-md"
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 20 }}
        className="w-full max-w-sm bg-[#1c1c1c] rounded-2xl border border-[#2a2a2a] shadow-2xl p-8"
      >
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3 text-white">
            <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
              <Lock size={20} className="text-[#3ecf8e]" />
            </div>
            <div>
              <h2 className="font-bold tracking-tight">Admin Login</h2>
              <p className="text-xs text-neutral-500 uppercase tracking-widest font-semibold mt-1">Restricted Access</p>
            </div>
          </div>
          <button onClick={onClose} className="text-neutral-500 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2 block">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#111] border border-[#333] rounded-xl px-4 py-3 text-white placeholder-neutral-600 focus:outline-none focus:border-[#3ecf8e] focus:ring-1 focus:ring-[#3ecf8e] transition-all"
              placeholder="admin@gigastore.com"
              required
            />
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2 block">Password</label>
            <div className="relative">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#111] border border-[#333] rounded-xl px-4 py-3 text-white placeholder-neutral-600 focus:outline-none focus:border-[#3ecf8e] focus:ring-1 focus:ring-[#3ecf8e] transition-all"
                placeholder="••••••••"
                required
              />
              <Key size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-600" />
            </div>
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="mt-4 w-full bg-[#3ecf8e] hover:bg-[#32a873] text-black font-bold uppercase tracking-widest py-3.5 rounded-xl transition-colors flex items-center justify-center"
          >
            {isLoading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
}
