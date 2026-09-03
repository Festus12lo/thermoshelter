import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Activity, Settings, Bell, LogOut, Hexagon } from 'lucide-react';
import { auth } from '../lib/firebase';

interface UserProfilePanelProps {
  isOpen: boolean;
  onClose: () => void;
  onSignOut: () => void;
}

export const UserProfilePanel: React.FC<UserProfilePanelProps> = ({ isOpen, onClose, onSignOut }) => {
  const user = auth?.currentUser;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[2000]"
          />
          
          <motion.div
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md border-l border-white/10 z-[2001] flex flex-col shadow-2xl overflow-hidden"
          >
            {/* Video Background for the panel */}
            <div className="absolute inset-0 z-0 pointer-events-none">
              <video
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-cover opacity-60 mix-blend-screen"
              >
                <source src="/bgv1.mp4" type="video/mp4" />
              </video>
              <div className="absolute inset-0 bg-[#0A0E17]/60 backdrop-blur-md"></div>
            </div>

            {/* Header */}
            <div className="p-6 border-b border-white/10 flex items-center justify-between bg-black/20 relative z-10">
              <h2 className="text-xl font-bold font-sans text-white drop-shadow-md">Command Center</h2>
              <button 
                onClick={onClose}
                className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/20 backdrop-blur-lg flex items-center justify-center text-slate-200 hover:text-white transition-all border border-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Profile Info */}
            <div className="p-8 text-center border-b border-white/5 relative overflow-hidden z-10">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Hexagon className="w-48 h-48 text-cyan-500" />
              </div>
              <div className="relative z-10">
                <div className="w-24 h-24 mx-auto bg-gradient-to-tr from-cyan-500 to-indigo-500 rounded-full p-1 mb-4 shadow-[0_0_30px_rgba(34,211,238,0.3)]">
                  <div className="w-full h-full bg-black rounded-full flex items-center justify-center">
                    <User className="w-10 h-10 text-cyan-400" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold font-sans text-white mb-1">
                  {user?.displayName || 'Lead Architect'}
                </h3>
                <p className="text-cyan-400 font-mono text-sm">{user?.email || 'System Admin'}</p>
                <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-semibold">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  Online
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 relative z-10">
              
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-widest text-slate-500 font-sans">Recent Activity</h4>
                <div className="bg-white/5 rounded-2xl p-4 border border-white/5 hover:border-cyan-500/30 transition-colors group cursor-pointer">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-cyan-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Activity className="w-5 h-5 text-cyan-400" />
                    </div>
                    <div>
                      <p className="text-white font-medium text-sm">Deployed Duplex Model</p>
                      <p className="text-slate-400 text-xs mt-1">Zone C • 2 hours ago</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white/5 rounded-2xl p-4 border border-white/5 hover:border-indigo-500/30 transition-colors group cursor-pointer">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-indigo-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Settings className="w-5 h-5 text-indigo-400" />
                    </div>
                    <div>
                      <p className="text-white font-medium text-sm">Updated Pareto Preferences</p>
                      <p className="text-slate-400 text-xs mt-1">Cost optimized • 5 hours ago</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-widest text-slate-500 font-sans">System</h4>
                <button className="w-full bg-white/5 rounded-2xl p-4 border border-white/5 hover:bg-white/10 transition-colors flex items-center justify-between group">
                  <div className="flex items-center gap-3 text-slate-300 group-hover:text-white">
                    <Bell className="w-5 h-5" />
                    <span className="font-medium text-sm">Notifications</span>
                  </div>
                  <div className="w-6 h-6 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-bold">
                    3
                  </div>
                </button>
                <button className="w-full bg-white/5 rounded-2xl p-4 border border-white/5 hover:bg-white/10 transition-colors flex items-center gap-3 text-slate-300 group-hover:text-white">
                  <Settings className="w-5 h-5" />
                  <span className="font-medium text-sm">Preferences</span>
                </button>
              </div>

            </div>

            {/* Footer */}
            <div className="p-6 border-t border-white/5 bg-black/20 relative z-10">
              <button 
                onClick={onSignOut}
                className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-red-500/10 text-red-400 font-bold hover:bg-red-500/20 transition-colors border border-red-500/20 hover:border-red-500/40"
              >
                <LogOut className="w-5 h-5" />
                Disconnect Session
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
