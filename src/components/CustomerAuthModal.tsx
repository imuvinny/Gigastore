import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ArrowRight, Check, MailCheck, UserCheck } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface CustomerAuthModalProps {
  onClose: () => void;
  onSuccess: () => void;
  onAdminLogin?: () => void;
  onTermsClick?: () => void;
}

type AuthStep = 'SIGN_IN' | 'SIGN_UP' | 'VERIFY_EMAIL' | 'SUCCESS';

export function CustomerAuthModal({ onClose, onSuccess, onAdminLogin, onTermsClick }: CustomerAuthModalProps) {
  const [step, setStep] = useState<AuthStep>('SIGN_IN');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Sign up specific fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [newsOptIn, setNewsOptIn] = useState(true);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (email.toLowerCase() === 'vincentlewa6@gmail.com' && onAdminLogin) {
      onAdminLogin();
      return;
    }
    if (!supabase) {
      setError("Authentication is not configured.");
      return;
    }
    
    setIsLoading(true);
    setError('');

    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (signInError) throw signInError;
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    if (!supabase) {
      setError("Authentication is not configured.");
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      const { error: signInError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
          queryParams: {
            prompt: 'consent select_account'
          }
        }
      });
      if (signInError) throw signInError;
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (email.toLowerCase() === 'vincentlewa6@gmail.com' && onAdminLogin) {
      onAdminLogin();
      return;
    }
    if (!supabase) {
      setError("Authentication is not configured.");
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
            phone_number: phone,
          }
        }
      });
      if (signUpError) throw signUpError;
      
      // Check if email verification is required
      if (data.user && data.user.identities && data.user.identities.length === 0) {
          setError("User already exists");
          setIsLoading(false);
          return;
      }

      setStep('VERIFY_EMAIL');
    } catch (err: any) {
      setError(err.message || 'Sign up failed');
    } finally {
      setIsLoading(false);
    }
  };

  // UI for different steps
  const renderSignIn = () => (
    <motion.div
      key="sign-in"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="w-full flex flex-col"
    >
      <div className="w-full text-left mb-6">
        <h2 className="text-2xl font-bold text-black mb-1">Sign in</h2>
        <p className="text-gray-500 text-sm">Sign in or create an account</p>
      </div>

      <form onSubmit={handleSignIn} className="w-full flex flex-col gap-4">
        <div className="relative">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-white border border-gray-200 rounded-2xl px-5 py-4 text-black placeholder-gray-400 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all"
            placeholder="Email"
            required
          />
        </div>
        
        <div className="relative">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-white border border-gray-200 rounded-2xl px-5 py-4 text-black placeholder-gray-400 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all"
            placeholder="Password"
            required
          />
        </div>

        {error && <p className="text-red-500 text-sm font-medium">{error}</p>}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-[#5d3fd3] hover:bg-[#4b33a8] active:scale-[0.98] text-white font-medium py-4 rounded-2xl transition-all duration-200 flex items-center justify-center relative group shadow-sm disabled:opacity-50 disabled:hover:scale-100 disabled:hover:bg-[#5d3fd3]"
        >
          {isLoading ? 'Please wait...' : 'Continue with email'}
          {!isLoading && <ArrowRight size={18} className="absolute right-6 opacity-0 group-hover:opacity-100 transition-opacity" />}
        </button>
        
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={isLoading}
          className="w-full bg-white border border-gray-200 hover:bg-gray-50 hover:shadow-sm hover:border-gray-300 active:scale-[0.98] text-black font-medium py-4 rounded-2xl transition-all duration-200 flex items-center justify-center gap-3 relative disabled:opacity-50 disabled:hover:scale-100 disabled:hover:shadow-none"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            <path fill="none" d="M1 1h22v22H1z" />
          </svg>
          Continue with Google
        </button>
        
        
        <button
          type="button"
          onClick={() => { setError(''); setStep('SIGN_UP'); }}
          className="text-sm text-gray-500 hover:text-black transition-colors font-medium mt-6"
        >
          Don't have an account? Create one
        </button>

        <p className="text-xs text-gray-500 text-center mt-6">
          By continuing, you agree to our <button type="button" onClick={onTermsClick} className="underline hover:text-black">Terms of service</button>
        </p>
      </form>
    </motion.div>
  );

  const renderSignUp = () => (
    <motion.div
      key="sign-up"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="w-full flex flex-col"
    >
      <div className="w-full text-left mb-6">
        <h2 className="text-2xl font-bold text-black mb-1">Create account</h2>
        <p className="text-gray-500 text-sm">Enter your details to register</p>
      </div>

      <form onSubmit={handleSignUp} className="w-full flex flex-col gap-4">
        <div className="flex gap-4">
          <input
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="w-1/2 bg-white border border-gray-200 rounded-2xl px-5 py-4 text-black placeholder-gray-400 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all"
            placeholder="First Name"
            required
          />
          <input
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="w-1/2 bg-white border border-gray-200 rounded-2xl px-5 py-4 text-black placeholder-gray-400 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all"
            placeholder="Last Name"
            required
          />
        </div>

        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full bg-white border border-gray-200 rounded-2xl px-5 py-4 text-black placeholder-gray-400 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all"
          placeholder="Phone Number"
          required
        />

        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full bg-white border border-gray-200 rounded-2xl px-5 py-4 text-black placeholder-gray-400 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all"
          placeholder="Email Address"
          required
        />
        
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full bg-white border border-gray-200 rounded-2xl px-5 py-4 text-black placeholder-gray-400 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all"
          placeholder="Password"
          required
          minLength={6}
        />

        {error && <p className="text-red-500 text-sm font-medium">{error}</p>}

        <div className="flex items-center gap-3 mt-2">
          <button
            type="button"
            onClick={() => setNewsOptIn(!newsOptIn)}
            className={`w-6 h-6 rounded-md border flex items-center justify-center transition-colors ${newsOptIn ? 'bg-[#1b4332] border-[#1b4332]' : 'border-gray-300'}`}
          >
            {newsOptIn && <Check size={14} className="text-white" />}
          </button>
          <span className="text-sm text-black font-medium">Email me with news and offers</span>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-[#5d3fd3] hover:bg-[#4b33a8] text-white font-medium py-4 rounded-2xl transition-colors flex items-center justify-center relative group mt-2"
        >
          {isLoading ? 'Creating...' : 'Create Account'}
          {!isLoading && <ArrowRight size={18} className="absolute right-6 opacity-0 group-hover:opacity-100 transition-opacity" />}
        </button>

        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={isLoading}
          className="w-full bg-white border border-gray-200 hover:bg-gray-50 hover:shadow-sm hover:border-gray-300 active:scale-[0.98] text-black font-medium py-4 rounded-2xl transition-all duration-200 flex items-center justify-center gap-3 relative disabled:opacity-50 disabled:hover:scale-100 disabled:hover:shadow-none mt-2"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            <path fill="none" d="M1 1h22v22H1z" />
          </svg>
          Continue with Google
        </button>
        
        <button
          type="button"
          onClick={() => { setError(''); setStep('SIGN_IN'); }}
          className="text-sm text-gray-500 hover:text-black transition-colors font-medium mt-6"
        >
          Already have an account? Sign in
        </button>

        <p className="text-xs text-gray-500 text-center mt-6">
          By continuing, you agree to our <button type="button" onClick={onTermsClick} className="underline hover:text-black">Terms of service</button>
        </p>
      </form>
    </motion.div>
  );

  const renderVerifyEmail = () => (
    <motion.div
      key="verify-email"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="w-full flex flex-col items-center text-center py-8"
    >
      <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-6 text-[#5d3fd3]">
        <MailCheck size={40} />
      </div>
      <h2 className="text-2xl font-bold text-black mb-3">Verify your email</h2>
      <p className="text-gray-500 text-sm mb-8 px-4">
        We've sent a verification link to <span className="font-bold text-black">{email}</span>. 
        Please check your inbox and click the link to activate your account.
      </p>
      
      <button
        onClick={() => setStep('SUCCESS')}
        className="text-[#5d3fd3] font-bold hover:underline mb-4"
      >
        I have verified my email
      </button>

      <button
        onClick={() => setStep('SIGN_IN')}
        className="text-sm text-gray-500 hover:text-black"
      >
        Back to Sign in
      </button>
    </motion.div>
  );

  const renderSuccess = () => (
    <motion.div
      key="success"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="w-full flex flex-col items-center text-center py-8"
    >
      <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-6 text-green-500">
        <UserCheck size={40} />
      </div>
      <h2 className="text-2xl font-bold text-black mb-3">Account Created!</h2>
      <p className="text-gray-500 text-sm mb-8 px-4">
        Your account has been verified and created successfully. You can now sign in to your Gigastore account.
      </p>
      
      <button
        onClick={() => setStep('SIGN_IN')}
        className="w-full bg-[#5d3fd3] hover:bg-[#4b33a8] text-white font-medium py-4 rounded-2xl transition-colors"
      >
        Sign In Now
      </button>
    </motion.div>
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[999] flex items-center justify-center p-0 sm:p-6 bg-black/60 backdrop-blur-sm"
    >
      <div className="absolute inset-0" onClick={onClose} />
      
      <motion.div
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 20 }}
        className="w-full h-full sm:h-auto sm:max-w-md bg-white sm:rounded-[2rem] shadow-2xl relative flex flex-col overflow-y-auto"
      >
        <button 
          onClick={onClose} 
          className="absolute top-6 right-6 text-black/50 hover:text-black transition-colors z-10 bg-gray-100 p-2 rounded-full"
        >
          <X size={20} />
        </button>

        <div className="p-8 md:p-10 flex flex-col items-center flex-1">
          <h1 className="text-2xl font-black tracking-tighter text-black mb-8">GIGASTORE.</h1>
          
          <AnimatePresence mode="wait">
            {step === 'SIGN_IN' && renderSignIn()}
            {step === 'SIGN_UP' && renderSignUp()}
            {step === 'VERIFY_EMAIL' && renderVerifyEmail()}
            {step === 'SUCCESS' && renderSuccess()}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
}
