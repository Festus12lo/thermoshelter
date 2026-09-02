import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { ArrowDown } from 'lucide-react';
import { LiquidMetalButton } from './ui/liquid-metal-button';

/**
 * HARD CONSTRAINT: This landing page must contain ZERO location-related content.
 * No location, climate zones, cities, countries, weather locations, geographic
 * selection, or location-based inputs. The landing page is purely a product
 * introduction and entry point. All user configuration begins only after the
 * user clicks START DESIGNING.
 */

interface LandingPageProps {
  onGetStarted?: () => void;
}

export function LandingPage({ onGetStarted }: LandingPageProps) {
  const [activeSection, setActiveSection] = useState<0 | 1>(0);

  // Mouse Parallax
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  const handleMouseMove = (e: React.MouseEvent) => {
    const { clientX, clientY } = e;
    const { innerWidth, innerHeight } = window;
    const x = (clientX / innerWidth - 0.5) * 20; // max 20px movement
    const y = (clientY / innerHeight - 0.5) * 20;
    mouseX.set(x);
    mouseY.set(y);
  };

  const bgX = useTransform(mouseX, [-20, 20], [-10, 10]);
  const bgY = useTransform(mouseY, [-20, 20], [-10, 10]);

  useEffect(() => {
    let lastWheelTime = 0;
    
    const handleWheel = (e: WheelEvent) => {
      const now = Date.now();
      if (now - lastWheelTime < 1000) return; // 1 second debounce to prevent rapid double-scrolling
      
      if (e.deltaY > 30 && activeSection === 0) {
        setActiveSection(1);
        lastWheelTime = now;
      } else if (e.deltaY < -30 && activeSection === 1) {
        setActiveSection(0);
        lastWheelTime = now;
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown' || e.key === 'PageDown' || e.key === ' ') {
        if (activeSection === 0) setActiveSection(1);
      } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
        if (activeSection === 1) setActiveSection(0);
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [activeSection]);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black font-sans selection:bg-cyan-500/30" onMouseMove={handleMouseMove}>
      
      {/* Fixed Video Background */}
      <motion.div className="absolute inset-0 z-0 pointer-events-none" style={{ x: bgX, y: bgY }}>
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 h-full w-full object-cover scale-[1.02]"
          style={{ filter: 'contrast(1.15) saturate(1.2) brightness(0.75)' }}
        >
          <source src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260405_171521_25968ba2-b594-4b32-aab7-f6b69398a6fa.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/70 mix-blend-multiply"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-black/10 to-black/80"></div>
      </motion.div>

      <AnimatePresence mode="wait">
        {activeSection === 0 && (
          <motion.div 
            key="hero"
            initial={{ opacity: 0, scale: 1.1, filter: 'blur(10px)' }}
            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, scale: 0.9, y: -100, filter: 'blur(10px)', transition: { duration: 0.8, ease: "easeInOut" } }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 z-10"
          >
            {/* Tagline */}
            <motion.p
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-[10px] md:text-xs uppercase tracking-[0.35em] text-cyan-400/80 font-semibold mb-8 drop-shadow-md"
            >
              CLIMATE-RESILIENT ARCHITECTURAL INTELLIGENCE
            </motion.p>

            {/* Headline */}
            <h1 className="text-5xl md:text-7xl lg:text-[7rem] font-black text-white tracking-tighter leading-[1.05] max-w-6xl mx-auto w-full flex flex-col items-center justify-center">
              <div className="flex flex-wrap justify-center gap-x-4 lg:gap-x-8">
                {["Design", "Shelters", "That"].map((word, i) => (
                  <motion.span 
                    key={i} 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + i * 0.1 }}
                    className="drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)]"
                  >
                    {word}
                  </motion.span>
                ))}
              </div>
              <motion.span 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6 }}
                className="block mt-4 text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-blue-500 to-indigo-600 bg-[length:200%_auto]"
              >
                <motion.span
                  animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
                  transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                  className="bg-clip-text"
                >
                  Survive the Climate.
                </motion.span>
              </motion.span>
            </h1>

            {/* Sub-description */}
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="mt-10 text-lg md:text-xl text-slate-300 max-w-3xl font-light leading-relaxed drop-shadow-md"
            >
              Architecture shouldn't be guesswork. ThermoShelter combines AI generation, thermodynamic physics, structural engineering, and real-world material data to create better-performing shelter designs.
            </motion.p>

            {/* Scroll Indicator */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5 }}
              className="absolute bottom-12 flex flex-col items-center justify-center opacity-70 cursor-pointer"
              onClick={() => setActiveSection(1)}
            >
              <span className="text-[10px] uppercase tracking-widest text-cyan-400 mb-3 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]">
                Scroll to begin
              </span>
              <motion.div animate={{ y: [0, 10, 0] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}>
                <ArrowDown className="w-5 h-5 text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]" />
              </motion.div>
            </motion.div>
          </motion.div>
        )}

        {activeSection === 1 && (
          <motion.div
            key="cta"
            initial={{ opacity: 0, scale: 0.9, y: 100, filter: 'blur(10px)' }}
            animate={{ opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, scale: 1.1, filter: 'blur(10px)', transition: { duration: 0.8, ease: "easeInOut" } }}
            transition={{ duration: 1.0, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 z-10 overflow-y-auto"
          >
            <div className="max-w-2xl mx-auto flex flex-col items-center gap-12 my-auto py-20">
              <div className="flex flex-col items-center gap-6">
                <h2 className="text-5xl md:text-6xl font-black text-white tracking-tighter leading-[1.05] drop-shadow-2xl">
                  Ready to shape the future?
                </h2>
                <p className="text-slate-300 text-lg md:text-xl font-light leading-relaxed">
                  Initialize the configuration sequence. Define your material constraints, and let AI synthesize the optimal shelter blueprint.
                </p>
              </div>
    
              <div className="flex justify-center scale-125 hover:scale-150 transition-transform duration-500">
                <LiquidMetalButton label="GET STARTED" onClick={onGetStarted} />
              </div>
            </div>
            
            {/* Scroll Up Indicator */}
            <motion.div
              className="absolute top-12 flex flex-col items-center justify-center opacity-70 cursor-pointer"
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              onClick={() => setActiveSection(0)}
            >
              <ArrowDown className="w-5 h-5 text-white rotate-180 mb-3 drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]" />
              <span className="text-[10px] uppercase tracking-widest text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]">
                Go back
              </span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
