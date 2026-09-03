import React, { useState } from 'react';
import { ArrowRight, ArrowLeft, Users, Home, Tent, HardHat, Flame, Wind, Droplets, ThermometerSnowflake, Settings2, ShieldCheck, Box } from 'lucide-react';
import { motion } from 'framer-motion';
import type { DesignRequestPayload } from '../api';

interface ConfigurationWizardProps {
  onSubmit: (config: DesignRequestPayload) => void;
  onBack: () => void;
  isSubmitting: boolean;
}

export const ConfigurationWizard: React.FC<ConfigurationWizardProps> = ({ onSubmit, onBack, isSubmitting }) => {
  const [occupants, setOccupants] = useState(4);
  const [purpose, setPurpose] = useState('emergency_shelter'); // emergency_shelter, resident, duplex
  const [thermalObjective, setThermalObjective] = useState('winter_warmth');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      location: 'Leh', // Hardcoded as per constraints or removed
      occupants,
      purpose,
      thermal_objective: thermalObjective,
    });
  };

  const housingTypes = [
    { id: 'emergency_shelter', name: 'Emergency Shelter', icon: <Tent className="w-6 h-6" />, desc: 'Rapid deploy' },
    { id: 'resident', name: 'Resident', icon: <Home className="w-6 h-6" />, desc: 'Permanent setup' },
    { id: 'duplex', name: 'Duplex', icon: <Box className="w-6 h-6" />, desc: 'Multi-level living' },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
      <video 
        autoPlay 
        loop 
        muted 
        playsInline
        className="absolute inset-0 w-full h-full object-cover opacity-30 pointer-events-none mix-blend-screen"
      >
        <source src="/bgv1.mp4" type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20 pointer-events-none mix-blend-overlay"></div>
      <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-[#0a0a0a] pointer-events-none"></div>

      <div className="relative z-10 w-full max-w-5xl bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col lg:flex-row">
        
        {/* Left Side: Info */}
        <div className="lg:w-1/3 bg-black/30 p-10 border-r border-white/10 flex flex-col justify-between relative overflow-hidden">
          {/* Decorative Corner accents */}
          <div className="absolute top-0 left-0 w-16 h-16 border-t-2 border-l-2 border-cyan-500/30 -translate-x-2 -translate-y-2 rounded-tl-xl"></div>
          <div className="absolute bottom-0 right-0 w-16 h-16 border-b-2 border-r-2 border-cyan-500/30 translate-x-2 translate-y-2 rounded-br-xl"></div>

          <div>
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-cyan-500 hover:text-cyan-400 text-xs font-bold tracking-widest uppercase mb-8 transition-colors group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Return to Dashboard
            </button>
            <h2 className="text-4xl font-black text-white tracking-tighter mb-4 uppercase">
              Configure<br /><span className="text-cyan-500">Parameters.</span>
            </h2>
            <p className="text-slate-400 leading-relaxed text-sm mt-6">
              Establish the architectural and thermal baseline. The synthesis engine will align structural integrity with environmental resilience based on your selections.
            </p>
          </div>
          
          <div className="mt-12 space-y-4">
            <div className="p-4 bg-black/20 rounded-lg border border-white/10">
              <div className="text-[10px] font-mono text-cyan-500/70 mb-2 tracking-widest">SYSTEM STATUS</div>
              <div className="text-sm text-slate-300 font-semibold flex items-center gap-3">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500"></span>
                </span>
                Synthesis Engine Ready
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="lg:w-2/3 p-10 lg:p-14">
          <form onSubmit={handleSubmit} className="space-y-10">
            
            {/* Housing Type - Boxy Selection */}
            <div className="space-y-4">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                <Box className="w-4 h-4 text-cyan-500" /> Housing Typology
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {housingTypes.map(type => (
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    key={type.id}
                    type="button"
                    onClick={() => setPurpose(type.id)}
                    className={`relative p-5 rounded-xl border text-left transition-all duration-300 ${
                      purpose === type.id 
                        ? 'bg-slate-800/80 border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.15)]' 
                        : 'bg-slate-900/30 border-slate-800 hover:border-slate-700 hover:bg-slate-800/50'
                    }`}
                  >
                    {purpose === type.id && (
                      <div className="absolute top-3 right-3 text-cyan-500">
                        <ShieldCheck className="w-4 h-4" />
                      </div>
                    )}
                    <div className={`mb-3 ${purpose === type.id ? 'text-cyan-400' : 'text-slate-500'}`}>
                      {type.icon}
                    </div>
                    <div className={`font-bold text-lg mb-1 ${purpose === type.id ? 'text-white' : 'text-slate-300'}`}>
                      {type.name}
                    </div>
                    <div className="text-xs text-slate-500 font-medium">
                      {type.desc}
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Thermal Objective */}
            <div className="space-y-4">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                <Flame className="w-4 h-4 text-cyan-500" /> Thermal Strategy
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { id: 'winter_warmth', label: 'Max Heat Gain' },
                  { id: 'summer_cooling', label: 'Max Heat Rejection' },
                  { id: 'balanced', label: 'Balanced Year-Round' }
                ].map(obj => (
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    key={obj.id}
                    type="button"
                    onClick={() => setThermalObjective(obj.id)}
                    className={`px-4 py-3 text-sm font-semibold rounded-lg border text-center transition-all ${
                      thermalObjective === obj.id 
                        ? 'bg-slate-800 border-slate-600 text-white' 
                        : 'bg-slate-900/30 border-slate-800 text-slate-500 hover:border-slate-700 hover:text-slate-400'
                    }`}
                  >
                    {obj.label}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Submit */}
            <div className="pt-6 mt-6 border-t border-slate-800/50">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full group relative flex items-center justify-center gap-3 px-8 py-5 bg-cyan-950/40 border border-cyan-800/50 hover:bg-cyan-900/50 hover:border-cyan-500/50 text-cyan-400 font-bold text-sm tracking-[0.2em] uppercase rounded-xl overflow-hidden transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {/* Glow effect on hover */}
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/0 via-cyan-500/10 to-cyan-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out"></div>
                
                {isSubmitting ? (
                  <span className="flex items-center gap-3 z-10">
                    <svg className="animate-spin h-5 w-5 text-cyan-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Synthesizing...
                  </span>
                ) : (
                  <span className="flex items-center gap-3 z-10">
                    Synthesize Architecture
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform duration-300" />
                  </span>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
