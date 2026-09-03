import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Terminal, Database, Cpu, Lightbulb, Rocket, Activity, Zap } from 'lucide-react';

export const DeveloperDashboard: React.FC = () => {
  const initialLogs = [
    "[SYSTEM] Booting ThermoShelter Core v3.1.4...",
    "[AUTH] Firebase connection established.",
    "[PHYSICS] Loading Thermodynamic Engine (Conceptual Models)...",
    "[API] Connecting to Open-Meteo Global Weather Service... OK",
    "[API] Connecting to Material Properties Database... OK",
    "[SYSTEM] Pareto optimization algorithms ready.",
    "[ROUTING] SidebarLayout initialized with FlowingMenu.",
    "[RENDER] WebGL context active for 3D visualization.",
    "[INFO] System fully operational. Awaiting simulation directives."
  ];

  const [logs] = useState<string[]>(initialLogs);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" as any } }
  };

  return (
    <div className="w-full h-full overflow-y-auto bg-transparent text-white selection:bg-cyan-500/30">
      
      {/* Background Gradients & Video */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover opacity-50 mix-blend-screen"
        >
          <source src="/bgv1.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-[#0A0E17]/60 backdrop-blur-sm"></div>
        <div className="absolute top-0 left-1/4 w-[80vw] max-w-[800px] h-[80vw] max-h-[800px] bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.15)_0%,transparent_70%)] rounded-full -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-1/4 w-[60vw] max-w-[600px] h-[60vw] max-h-[600px] bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.15)_0%,transparent_70%)] rounded-full translate-y-1/2"></div>
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px] opacity-20 [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_70%)]"></div>
      </div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 max-w-7xl mx-auto px-6 py-16 md:px-12 md:py-24 space-y-24"
      >
        
        {/* Hero Section */}
        <motion.div variants={itemVariants} className="text-center space-y-6">
          <h1 className="text-4xl md:text-6xl font-sans font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-indigo-400 to-purple-400">
            System Architecture & Physics Engine
          </h1>
          <p className="text-[#8B9BB4] text-lg md:text-xl max-w-3xl mx-auto font-mono">
            An inside look at the methodologies, data pipelines, and conceptual thermodynamics powering the ThermoShelter platform.
          </p>
        </motion.div>

        {/* System Logs */}
        <motion.div variants={itemVariants} className="relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/20 to-indigo-500/20 rounded-2xl blur-lg"></div>
          <div className="relative bg-[#0A0E17] border border-[#1C2538] rounded-2xl overflow-hidden shadow-2xl">
            <div className="bg-[#121927] px-4 py-3 flex items-center border-b border-[#1C2538]">
              <div className="flex gap-2 mr-4">
                <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                <div className="w-3 h-3 rounded-full bg-amber-500/80"></div>
                <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
              </div>
              <Terminal className="w-4 h-4 text-cyan-400 mr-2" />
              <span className="text-xs font-mono text-cyan-500 tracking-wider">system_boot.log</span>
            </div>
            <div className="p-6 font-mono text-sm h-64 overflow-y-auto flex flex-col justify-end">
              <div className="space-y-2">
                {logs.map((log, index) => (
                  <motion.div 
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`${log.includes('INFO') ? 'text-green-400' : log.includes('ERROR') ? 'text-red-400' : 'text-slate-300'}`}
                  >
                    <span className="text-slate-500 mr-2">{new Date().toISOString().split('T')[1].substring(0, 8)}</span>
                    {log}
                  </motion.div>
                ))}
                {logs.length === 9 && (
                  <motion.div 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: [0, 1, 0] }} 
                    transition={{ repeat: Infinity, duration: 1 }}
                    className="w-2 h-4 bg-cyan-400 mt-2"
                  />
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Thermodynamic Methodologies (Conceptual) */}
        <motion.div variants={itemVariants} className="space-y-12">
          <div className="flex items-center gap-4">
            <Activity className="w-8 h-8 text-indigo-400" />
            <h2 className="text-3xl font-bold tracking-tight">Thermodynamic Methodologies</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-black/40 backdrop-blur-xl p-8 rounded-2xl border border-white/10 hover:border-indigo-500/50 transition-colors group">
              <div className="w-12 h-12 bg-indigo-500/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Zap className="w-6 h-6 text-indigo-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Heat Conduction Resistance</h3>
              <p className="text-slate-400 leading-relaxed text-sm">
                Instead of complex calculus, our system relies on the concept of <strong>Thermal Resistance (R-Value)</strong>. Think of it like a dam holding back water: materials with high R-values (like Aerogel) act as strong dams, preventing outside heat from leaking in during summer, and preventing inside heat from escaping during winter. We sum the resistances of all wall layers to determine the shelter's overall insulating strength.
              </p>
            </div>

            <div className="bg-black/40 backdrop-blur-xl p-8 rounded-2xl border border-white/10 hover:border-amber-500/50 transition-colors group">
              <div className="w-12 h-12 bg-amber-500/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Lightbulb className="w-6 h-6 text-amber-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Solar Albedo (Reflectivity)</h3>
              <p className="text-slate-400 leading-relaxed text-sm">
                Solar heat gain is managed through <strong>Albedo</strong>—the measure of how much sunlight a surface reflects versus absorbs. A pure white or highly reflective roof acts like a mirror, bouncing the sun's energy away before it can heat the structure. In our engine, we pair high-albedo materials (like reflective poly-coatings) with the local climate data to aggressively cut cooling costs in hot environments.
              </p>
            </div>
            
            <div className="bg-black/40 backdrop-blur-xl p-8 rounded-2xl border border-white/10 hover:border-emerald-500/50 transition-colors group">
              <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Activity className="w-6 h-6 text-emerald-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Passive Ventilation Dynamics</h3>
              <p className="text-slate-400 leading-relaxed text-sm">
                We simulate the <strong>Stack Effect</strong>. Hot air naturally rises and escapes through high vents, creating a vacuum that pulls cooler, fresh air in through lower openings. By conceptually mapping prevailing wind directions and interior volume, our engine recommends window and vent placements that harness natural breezes, drastically reducing the need for active air conditioning.
              </p>
            </div>

            <div className="bg-black/40 backdrop-blur-xl p-8 rounded-2xl border border-white/10 hover:border-rose-500/50 transition-colors group">
              <div className="w-12 h-12 bg-rose-500/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Database className="w-6 h-6 text-rose-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Thermal Mass Delay</h3>
              <p className="text-slate-400 leading-relaxed text-sm">
                Heavy, dense materials like rammed earth or concrete have high <strong>Thermal Mass</strong>. They act like thermal "sponges," soaking up the intense daytime heat and slowly releasing it at night when temperatures drop. This conceptual model allows our system to recommend heavy wall materials for desert climates with extreme temperature swings between day and night.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Datasets & Sources */}
        <motion.div variants={itemVariants} className="space-y-8">
          <div className="flex items-center gap-4">
            <Database className="w-8 h-8 text-cyan-400" />
            <h2 className="text-3xl font-bold tracking-tight">Data Integration Layer</h2>
          </div>
          <div className="bg-[#0A0E17] border border-[#1C2538] rounded-2xl p-8 shadow-xl">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-white border-b border-cyan-500/30 pb-2">Climate Data</h4>
                <ul className="space-y-3 text-sm text-slate-400">
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5 shrink-0"></span>
                    <span><strong>Open-Meteo API:</strong> Live ingestion of hyper-local temperature, humidity, and wind data.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5 shrink-0"></span>
                    <span><strong>Historical Patterns:</strong> 10-year seasonal averages for baseline simulation.</span>
                  </li>
                </ul>
              </div>

              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-white border-b border-indigo-500/30 pb-2">Material Properties</h4>
                <ul className="space-y-3 text-sm text-slate-400">
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 shrink-0"></span>
                    <span><strong>ASHRAE Standards:</strong> R-values and thermal conductivity profiles for global materials.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 shrink-0"></span>
                    <span><strong>Procurement Costs:</strong> Aggregated pricing data mapped to localized logistics nodes.</span>
                  </li>
                </ul>
              </div>

              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-white border-b border-purple-500/30 pb-2">User Telemetry</h4>
                <ul className="space-y-3 text-sm text-slate-400">
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-1.5 shrink-0"></span>
                    <span><strong>Firebase Auth:</strong> Secure identity management and preference syncing.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-1.5 shrink-0"></span>
                    <span><strong>Session State:</strong> Real-time caching of active design parameters.</span>
                  </li>
                </ul>
              </div>

            </div>
          </div>
        </motion.div>

        {/* Future Roadmap */}
        <motion.div variants={itemVariants} className="relative pb-24">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-cyan-900/20 pointer-events-none rounded-3xl"></div>
          <div className="relative border border-white/10 bg-black/40 backdrop-blur-xl p-10 rounded-3xl overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 p-12 opacity-10">
              <Rocket className="w-48 h-48 text-cyan-400" />
            </div>
            
            <div className="flex items-center gap-4 mb-6 relative z-10">
              <Cpu className="w-8 h-8 text-cyan-400 animate-pulse" />
              <h2 className="text-3xl font-bold tracking-tight text-white">Future Roadmap: Generative AI Integration</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 relative z-10">
              <div>
                <p className="text-cyan-100/70 leading-relaxed mb-6">
                  The next evolution of ThermoShelter bridges the gap between hard physics and conversational intelligence. By integrating Large Language Models (LLMs), the platform will transform from an analytical tool into an active, intelligent design collaborator.
                </p>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/20 border border-cyan-400/50 text-cyan-300 text-sm font-semibold shadow-[0_0_15px_rgba(34,211,238,0.2)]">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                  </span>
                  In Development
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-black/40 border border-cyan-500/20 p-5 rounded-xl">
                  <h4 className="text-cyan-400 font-bold mb-2 flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px]">forum</span>
                    Conversational Architect AI
                  </h4>
                  <p className="text-sm text-slate-400">
                    A chatbot assistant that allows users to prompt design changes naturally. ("Make this shelter 20% more insulated" or "Find cheaper local materials for this build"). The AI will parse the intent, map it to the physics engine, and update the 3D model instantly.
                  </p>
                </div>

                <div className="bg-black/40 border border-indigo-500/20 p-5 rounded-xl">
                  <h4 className="text-indigo-400 font-bold mb-2 flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px]">psychology</span>
                    Predictive Anomaly Detection
                  </h4>
                  <p className="text-sm text-slate-400">
                    Using machine learning models trained on historical weather and structural performance, the AI will proactively warn users if a proposed configuration is likely to suffer from condensation, mold, or thermal bridging over a 10-year lifespan.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

      </motion.div>
    </div>
  );
};
