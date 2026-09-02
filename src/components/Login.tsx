import React, { useState, useEffect } from 'react';
import { Lock, User, ChevronRight, ShieldCheck, Mail, Check, Shield } from 'lucide-react';
import { motion } from 'framer-motion';
import { auth, googleProvider } from '../lib/firebase';
import { signInWithPopup } from 'firebase/auth';

interface LoginProps {
  onLogin: () => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    if (!auth || !googleProvider) {
      console.error("Firebase is not configured. Please add your credentials to .env.local");
      alert("Firebase is not configured. Please check your environment variables.");
      return;
    }

    setIsGoogleLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
      onLogin(); // Trigger app state transition to dashboard
    } catch (error: any) {
      console.error('Error with Google Sign In:', error.message);
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate network delay for a premium feel
    setTimeout(() => {
      onLogin();
    }, 1200);
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row font-sans text-slate-900 bg-white selection:bg-amber-500/30">
      
      {/* Left Panel: Hero Video Imagery */}
      <div className="hidden md:flex md:w-[65%] relative bg-slate-900 overflow-hidden">
        {/* Video Background */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 h-full w-full object-cover scale-[1.02]"
          style={{ filter: 'contrast(1.15) saturate(1.2) brightness(0.7)' }}
        >
          <source src="/i_mean_i_dont_want_to_know_abo.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-cyan-900/10 via-transparent to-black/80"></div>
        
        {/* Overlay Content */}
        <div className="absolute inset-0 flex items-center justify-center z-10 px-8 text-white text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, filter: 'blur(10px)' }}
            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
            transition={{ duration: 1.2, delay: 0.2, ease: "easeOut" }}
            className="flex flex-col items-center"
          >
            <div 
              className="text-5xl md:text-6xl font-bold text-white mb-6 max-w-lg leading-tight drop-shadow-2xl tracking-tight"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Precision in every detail.
            </div>
            <motion.p 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.8, ease: "easeOut" }}
              className="text-xl md:text-2xl text-white/90 max-w-md drop-shadow-lg font-light tracking-wide"
            >
              Experience the new standard of resilient design.
            </motion.p>
          </motion.div>
        </div>
      </div>

      {/* Right Panel: Utility Form Container */}
      <div className="w-full md:w-[35%] flex items-center justify-center p-6 lg:p-10 relative bg-white overflow-y-auto">
        
        {/* Header - Positioned at top center */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="absolute top-16 left-0 w-full flex flex-col items-center text-center px-6"
        >
          <div className="flex items-center justify-center gap-2 mb-6">
            <Shield className="text-amber-500 w-8 h-8" strokeWidth={2.5} />
            <span className="text-xl font-bold text-slate-900 tracking-tight">Executive Suite</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight mb-2">Welcome back</h1>
          <p className="text-base text-slate-500 font-medium">Please enter your details to sign in.</p>
        </motion.div>

        {/* Centered Form */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="w-full max-w-sm mt-24"
        >
          {/* Form */}
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-1.5 group/input">
              <label className="block text-sm font-semibold text-slate-700" htmlFor="email">Email</label>
              <div className="relative">
                <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-400 group-focus-within/input:text-amber-500 transition-colors duration-300" />
                <input 
                  className="w-full py-4 pr-4 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:bg-white focus:border-amber-400 focus:ring-4 focus:ring-amber-400/20 transition-all placeholder:text-slate-400 outline-none" 
                  style={{ paddingLeft: '5rem' }}
                  id="email" 
                  placeholder="name@company.com" 
                  required 
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>
            
            <div className="space-y-1.5 group/input">
              <label className="block text-sm font-semibold text-slate-700" htmlFor="password">Password</label>
              <div className="relative">
                <Lock className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-400 group-focus-within/input:text-amber-500 transition-colors duration-300" />
                <input 
                  className="w-full py-4 pr-4 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:bg-white focus:border-amber-400 focus:ring-4 focus:ring-amber-400/20 transition-all placeholder:text-slate-400 outline-none" 
                  style={{ paddingLeft: '5rem' }}
                  id="password" 
                  placeholder="••••••••" 
                  required 
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-3 cursor-pointer group">
                <div className="relative flex items-center">
                  <input className="peer h-4 w-4 rounded-sm border-slate-300 text-amber-500 focus:ring-amber-500 transition-colors cursor-pointer checked:border-amber-500 checked:bg-amber-500" type="checkbox" defaultChecked />
                </div>
                <span className="text-sm font-medium text-slate-500 group-hover:text-slate-900 transition-colors select-none">Remember me</span>
              </label>
              <button type="button" className="text-sm text-amber-500 font-bold hover:text-amber-600 hover:underline decoration-amber-500 underline-offset-4 transition-all">
                Forgot password?
              </button>
            </div>

            <button 
              className="w-full h-12 flex items-center justify-center gap-2 bg-amber-400 hover:bg-amber-500 text-slate-900 text-sm font-bold rounded-lg shadow-[0_4px_20px_rgba(0,0,0,0.05)] hover:shadow-[0_6px_24px_rgba(251,191,36,0.25)] transition-all duration-300 active:scale-[0.98] mt-2 group/btn" 
              type="submit"
              disabled={isSubmitting}
            >
              <span>{isSubmitting ? 'Signing In...' : 'Sign In'}</span>
              {!isSubmitting && <ChevronRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />}
            </button>
          </form>

          {/* Divider */}
          <div className="relative mt-12 mb-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-3 bg-white text-slate-400 text-xs font-bold uppercase tracking-widest">Or continue with</span>
            </div>
          </div>

          {/* Social Logins */}
          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={handleGoogleSignIn}
              disabled={isGoogleLoading}
              className="flex items-center justify-center gap-2 h-12 w-full bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:border-slate-300 text-slate-700 text-sm font-bold transition-all duration-200 group disabled:opacity-70 disabled:cursor-not-allowed" 
              type="button"
            >
              {isGoogleLoading ? (
                <svg className="animate-spin h-5 w-5 text-slate-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <svg className="w-5 h-5 group-hover:scale-105 transition-transform" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"></path>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path>
                </svg>
              )}
              {isGoogleLoading ? 'Connecting...' : 'Google'}
            </button>
            <button className="flex items-center justify-center gap-2 h-12 w-full bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:border-slate-300 text-slate-700 text-sm font-bold transition-all duration-200 group" type="button">
              <svg aria-hidden="true" className="w-5 h-5 group-hover:scale-105 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                <path clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" fillRule="evenodd"></path>
              </svg>
              GitHub
            </button>
          </div>
          
          <p className="text-center text-sm text-slate-500 pt-6 font-medium">
            Don't have an account? <button className="font-bold text-amber-500 hover:text-amber-600 hover:underline underline-offset-4 transition-all">Request access</button>
          </p>
        </motion.div>
      </div>

    </div>
  );
};
