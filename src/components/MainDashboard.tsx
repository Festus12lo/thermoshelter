import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CommandPalette } from './CommandPalette';
import { BentoGrid, itemsSample } from './ui/bento-grid';
import { FlowingMenu } from './ui/flowing-menu';
import type { User as FirebaseUser } from 'firebase/auth';

export interface MainDashboardProps {
  designReport: any;
  onReset: () => void;
  user: FirebaseUser | null;
  onViewCatalogue?: (wallId: string, roofId: string) => void;
  onSystemModuleClick?: (id: string) => void;
}

interface WeatherData {
  temp: number;
  condition: string;
  icon: string;
}

export const MainDashboard: React.FC<MainDashboardProps> = ({ designReport, onReset, user, onViewCatalogue, onSystemModuleClick }) => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(true);
  const [isVibrantTheme, setIsVibrantTheme] = useState(false);
  const [activeModal, setActiveModal] = useState<'blueprint' | 'mesh' | null>(null);

  const handleModuleClick = (id: string) => {
    if (id === 'material' || id === 'thermal') {
      onSystemModuleClick?.(id);
    } else if (id === 'blueprint' || id === 'mesh') {
      setActiveModal(id);
    }
  };

  useEffect(() => {
    // Weather Fetching Logic using Geolocation
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code`);
            const data = await res.json();
            
            const temp = Math.round(data.current.temperature_2m);
            const code = data.current.weather_code;
            
            let condition = "Clear Skies";
            let icon = "wb_sunny";
            
            if (code >= 1 && code <= 3) { condition = "Partly Cloudy"; icon = "partly_cloudy_day"; }
            if (code >= 45 && code <= 48) { condition = "Foggy"; icon = "foggy"; }
            if (code >= 51 && code <= 67) { condition = "Rain"; icon = "rainy"; }
            if (code >= 71 && code <= 77) { condition = "Snow"; icon = "weather_snowy"; }
            if (code >= 95) { condition = "Thunderstorm"; icon = "thunderstorm"; }
            
            setWeather({ temp, condition, icon });
            setWeatherLoading(false);
          } catch (error) {
            setWeatherLoading(false);
          }
        },
        (error) => {
          setWeatherLoading(false);
        }
      );
    } else {
      setWeatherLoading(false);
    }
  }, []);

  return (
    <>
      <div className={`h-full flex flex-col overflow-hidden relative ${isVibrantTheme ? 'theme-vibrant' : ''}`}>

        {/* Desktop Header */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="hidden md:flex justify-between items-end px-10 pt-24 pb-6 z-40 shrink-0 min-w-0 relative"
        >
          <div className="min-w-0 flex-1 pr-4">
            <h1 className="font-sans text-[2.5rem] font-bold text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-100 to-cyan-400 tracking-tight mb-2 truncate leading-none overflow-visible flex gap-2">
              {"Good Morning,".split("").map((char, i) => (
                <motion.span
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ 
                    rotateY: 360,
                    scale: 1.1,
                    color: '#2DD4BF',
                    transition: { duration: 0.4, ease: "easeInOut" }
                  }}
                  transition={{ delay: i * 0.03, type: "spring", stiffness: 150 }}
                  className="inline-block cursor-default"
                >
                  {char === " " ? "\u00A0" : char}
                </motion.span>
              ))}
              <motion.span
                initial={{ opacity: 0, scale: 0.8, filter: "blur(10px)" }}
                animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                whileHover={{ 
                  letterSpacing: '2px', 
                  color: '#ffffff',
                  filter: "drop-shadow(0px 0px 20px rgba(34,211,238,1))",
                  transition: { duration: 0.3 }
                }}
                transition={{ delay: 0.5, duration: 0.8, ease: "easeOut" }}
                className="ml-2 inline-block text-cyan-400 cursor-default"
              >
                {user?.displayName?.split(' ')[0] || 'Executive'}
              </motion.span>
            </h1>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 1 }}
              className="font-sans text-[#8B9BB4] text-[15px] truncate max-w-2xl"
            >
              System overview optimal. All localized environments are operating within established thermal parameters.
            </motion.p>
          </div>
          
          <div className="flex items-center space-x-2 shrink-0 bg-black/40 backdrop-blur-md rounded-full p-1.5 border border-white/10 shadow-xl">
            <button className="w-10 h-10 rounded-full flex items-center justify-center text-[#8B9BB4] hover:text-white hover:bg-white/10 transition-colors relative">
              <span className="material-symbols-outlined text-[20px]">notifications</span>
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            </button>
            <button 
              onClick={() => setIsVibrantTheme(!isVibrantTheme)}
              className="w-10 h-10 rounded-full flex items-center justify-center text-[#8B9BB4] hover:text-white hover:bg-white/10 transition-colors"
              title="Toggle Theme"
            >
              <span className="material-symbols-outlined text-[20px]">contrast</span>
            </button>
          </div>
        </motion.div>

        {/* Dashboard Grid (Flat Minimalist Style) */}
        <main className="flex-grow px-4 pb-4 md:px-10 md:pb-10 overflow-y-auto w-full">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-min h-full">
            
            {/* Top Row */}
            <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Real-time Environment */}
              <div className="group md:col-span-2 bg-black/40 rounded-xl backdrop-blur-xl p-8 flex flex-col relative overflow-hidden border border-white/10 h-[300px] transition-all duration-500 hover:shadow-[0_0_40px_rgba(34,211,238,0.1)] hover:border-cyan-500/30 hover:-translate-y-1 will-change-transform cursor-pointer">
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-0">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[length:4px_4px]" />
                </div>
                <div className="flex justify-between items-start z-10 relative">
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <div className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                      </div>
                      <h2 className="font-mono text-[10px] text-[#8B9BB4] tracking-[0.2em] uppercase">Real-time Environment</h2>
                    </div>
                    <div className="flex items-baseline space-x-4">
                      {weatherLoading ? (
                        <span className="text-5xl font-bold text-white tracking-tight animate-pulse">--°C</span>
                      ) : (
                        <>
                          <span className="text-5xl font-bold text-white tracking-tight">{weather?.temp || 24}°C</span>
                          <span className="text-2xl font-medium text-[#ECA078]">{weather?.condition || 'Clear Skies'}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="text-[#ECA078]">
                    <span className="material-symbols-outlined text-5xl font-light" style={{ fontVariationSettings: "'wght' 200" }}>
                      {weather?.icon || 'light_mode'}
                    </span>
                  </div>
                </div>
                
                {/* Subtle SVG Mountain Chart background */}
                <svg className="absolute bottom-0 left-0 w-full h-32 text-[#232E42]" preserveAspectRatio="none" viewBox="0 0 100 100">
                  <path d="M0,100 L0,80 L20,90 L40,60 L60,85 L80,50 L100,70 L100,100 Z" fill="currentColor" />
                </svg>
              </div>
            </div>

            {/* Active Directives */}
            <div className="group bg-black/40 rounded-xl backdrop-blur-xl p-8 flex flex-col relative overflow-hidden border border-white/10 h-[300px] transition-all duration-500 hover:shadow-[0_0_40px_rgba(236,160,120,0.1)] hover:border-[#ECA078]/30 hover:-translate-y-1 will-change-transform cursor-pointer">
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-0">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[length:4px_4px]" />
              </div>
              <h2 className="font-mono text-[10px] text-[#8B9BB4] mb-6 tracking-[0.2em] uppercase relative z-10">System Activity Logs</h2>
              <div className="space-y-4 flex-grow overflow-y-auto pr-1 custom-scrollbar relative z-10">
                
                <div className="bg-black/30 rounded-lg p-4 flex flex-col items-start space-y-2">
                  <div className="flex items-center space-x-2">
                    <span className="material-symbols-outlined text-white text-[16px] font-light" style={{ fontVariationSettings: "'wght' 200" }}>policy</span>
                    <div className="text-white text-sm font-medium">Protocol Alpha Engaged</div>
                  </div>
                </div>

                <div className="bg-black/30 rounded-lg p-4 flex flex-col items-start space-y-2">
                  <div className="flex items-center space-x-2">
                    <span className="material-symbols-outlined text-[#ECA078] text-[16px] font-light" style={{ fontVariationSettings: "'wght' 200" }}>sync</span>
                    <div className="text-white text-sm font-medium">Firmware V2.4 Syncing</div>
                  </div>
                </div>

              </div>
            </div>

            {/* Bottom Row - 3 equal columns */}
            
            {/* Structural Integrity */}
            <div className="group bg-black/40 rounded-xl backdrop-blur-xl p-6 relative overflow-hidden border border-white/10 flex flex-col justify-between min-h-[160px] transition-all duration-500 hover:shadow-[0_0_30px_rgba(34,211,238,0.1)] hover:border-cyan-500/30 hover:-translate-y-1 will-change-transform cursor-pointer">
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-0">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[length:4px_4px]" />
              </div>
              <div className="flex justify-between items-center mb-4 relative z-10">
                <h2 className="font-mono text-[10px] text-[#8B9BB4] tracking-[0.2em] uppercase">Structural Integrity</h2>
                <div className="w-1.5 h-1.5 rounded-full bg-[#2DD4BF]"></div>
              </div>
              <div className="relative z-10">
                <div className="text-[32px] font-bold text-white mb-4 leading-none">99.8%</div>
                <div className="w-full h-[3px] bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-white/90 w-[99.8%] rounded-full"></div>
                </div>
              </div>
            </div>

            {/* Energy Efficiency */}
            <div className="group bg-black/40 rounded-xl backdrop-blur-xl p-6 relative overflow-hidden border border-white/10 flex flex-col justify-between min-h-[160px] transition-all duration-500 hover:shadow-[0_0_30px_rgba(236,160,120,0.1)] hover:border-[#ECA078]/30 hover:-translate-y-1 will-change-transform cursor-pointer">
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-0">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[length:4px_4px]" />
              </div>
              <div className="flex justify-between items-center mb-4 relative z-10">
                <h2 className="font-mono text-[10px] text-[#8B9BB4] tracking-[0.2em] uppercase">Energy Efficiency</h2>
                <div className="w-1.5 h-1.5 rounded-full bg-[#2DD4BF]"></div>
              </div>
              <div className="relative z-10">
                <div className="text-[32px] font-bold text-white mb-4 leading-none">Optimized</div>
                <div className="flex w-full space-x-1 h-[3px]">
                  <div className="h-full bg-[#ECA078] flex-1 rounded-full"></div>
                  <div className="h-full bg-[#ECA078] flex-1 rounded-full"></div>
                  <div className="h-full bg-[#ECA078]/80 flex-1 rounded-full"></div>
                  <div className="h-full bg-[#ECA078]/40 flex-1 rounded-full"></div>
                  <div className="h-full bg-black/30 flex-1 rounded-full"></div>
                </div>
              </div>
            </div>

            {/* Climate Control */}
            <div className="group bg-black/40 rounded-xl backdrop-blur-xl p-6 relative overflow-hidden border border-white/10 flex flex-col justify-between min-h-[160px] transition-all duration-500 hover:shadow-[0_0_30px_rgba(139,92,246,0.1)] hover:border-indigo-500/30 hover:-translate-y-1 will-change-transform cursor-pointer">
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-0">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[length:4px_4px]" />
              </div>
              <div className="flex justify-between items-center mb-4 relative z-10">
                <h2 className="font-mono text-[10px] text-[#8B9BB4] tracking-[0.2em] uppercase">Climate Control</h2>
                <div className="w-1.5 h-1.5 rounded-full bg-[#2DD4BF]"></div>
              </div>
              <div className="relative z-10">
                <div className="text-[32px] font-bold text-white mb-4 leading-none">Active</div>
                <div className="flex items-center text-[#8B9BB4] font-mono text-[10px] tracking-wider uppercase">
                  <span className="material-symbols-outlined text-[14px] mr-2">ac_unit</span>
                  Cooling cycle engaged
                </div>
              </div>
            </div>

          </div>

          {/* System Modules (BentoGrid Integration) */}
          <div className="mt-8">
            <h2 className="font-mono text-[10px] text-[#8B9BB4] mb-4 tracking-[0.2em] uppercase">System Modules</h2>
            <div className="-mx-4 md:-mx-10">
              <BentoGrid items={itemsSample} onItemClick={handleModuleClick} />
            </div>
          </div>
        </main>
      </div>

      <CommandPalette />

      {/* Blueprint Generator Modal */}
      <AnimatePresence>
        {activeModal === 'blueprint' && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-xl transition-opacity" onClick={() => setActiveModal(null)} />
            <div className="relative w-full max-w-lg bg-[var(--theme-bg-main)]/90 backdrop-blur-3xl border border-[var(--theme-border-card)] rounded-2xl shadow-[0_0_80px_rgba(45,212,191,0.15)] overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(45,212,191,0.15),transparent_50%)] pointer-events-none" />
              
              <div className="p-8 relative z-10">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-2xl font-sans font-bold text-white tracking-tight">Generate Blueprint</h3>
                    <p className="text-sm text-[#8B9BB4] mt-1 font-sans">Select a model to view its detailed CAD schematic.</p>
                  </div>
                  <button onClick={() => setActiveModal(null)} className="text-[#8B9BB4] hover:text-white transition-colors">
                    <span className="material-symbols-outlined">close</span>
                  </button>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <button 
                    onClick={() => { setActiveModal(null); onSystemModuleClick?.('resident_dashboard'); }}
                    className="group relative p-6 rounded-xl border border-white/10 bg-black/40 hover:bg-[#2DD4BF]/10 hover:border-[#2DD4BF]/50 transition-all duration-300 text-left overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent,rgba(255,255,255,0.03),transparent)] translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                    <span className="material-symbols-outlined text-[32px] text-[#2DD4BF] mb-3">house</span>
                    <h4 className="font-semibold text-white">Residential</h4>
                    <p className="text-xs text-[#8B9BB4] mt-1 font-mono uppercase">Passive Heat</p>
                  </button>
                  
                  <button 
                    onClick={() => { setActiveModal(null); onSystemModuleClick?.('duplex_dashboard'); }}
                    className="group relative p-6 rounded-xl border border-white/10 bg-black/40 hover:bg-[#ECA078]/10 hover:border-[#ECA078]/50 transition-all duration-300 text-left overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent,rgba(255,255,255,0.03),transparent)] translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                    <span className="material-symbols-outlined text-[32px] text-[#ECA078] mb-3">domain</span>
                    <h4 className="font-semibold text-white">Duplex</h4>
                    <p className="text-xs text-[#8B9BB4] mt-1 font-mono uppercase">Emergency Relief</p>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Mesh Network Modal */}
        {activeModal === 'mesh' && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/70 backdrop-blur-2xl transition-opacity" onClick={() => setActiveModal(null)} />
            <div className="relative w-full max-w-2xl bg-[#0B101E]/90 border border-cyan-500/20 rounded-2xl shadow-[0_0_100px_rgba(6,182,212,0.15)] overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.1),transparent_70%)] pointer-events-none" />
              
              <div className="p-8 relative z-10 flex flex-col items-center text-center">
                <button onClick={() => setActiveModal(null)} className="absolute top-4 right-4 text-cyan-500/50 hover:text-cyan-400 transition-colors">
                  <span className="material-symbols-outlined">close</span>
                </button>
                
                <div className="relative w-48 h-48 mb-8 flex items-center justify-center">
                  <div className="absolute inset-0 border border-cyan-500/30 rounded-full animate-ping" style={{ animationDuration: '3s' }} />
                  <div className="absolute inset-4 border border-cyan-500/50 rounded-full animate-ping" style={{ animationDuration: '3s', animationDelay: '1s' }} />
                  <div className="absolute inset-8 border border-cyan-500/80 rounded-full animate-ping" style={{ animationDuration: '3s', animationDelay: '2s' }} />
                  <div className="relative z-10 bg-cyan-500 text-black w-12 h-12 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(6,182,212,0.8)]">
                    <span className="material-symbols-outlined">satellite_alt</span>
                  </div>
                </div>
                
                <h3 className="text-3xl font-sans font-bold text-white tracking-tight mb-2">Establishing Uplink</h3>
                <p className="text-cyan-400/80 font-mono text-sm uppercase tracking-widest">Searching for nearby autonomous shelters...</p>
                
                <div className="mt-8 bg-cyan-950/30 border border-cyan-500/20 rounded-lg p-4 w-full max-w-md text-left">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-mono text-cyan-500">Uplink Status</span>
                    <span className="text-xs font-mono text-white animate-pulse">Syncing</span>
                  </div>
                  <div className="w-full bg-cyan-950/50 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-cyan-400 h-full w-[65%] rounded-full shadow-[0_0_10px_rgba(34,211,238,0.8)]" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
