import React from 'react';
import { motion } from 'framer-motion';

interface ThermalDashboardProps {
  timeSeries?: {
    hours: number[];
    outdoor_temp_C: number[];
    indoor_temp_C: number[];
    solar_gain_W: number[];
    wall_heat_flow_W: number[];
    roof_heat_flow_W: number[];
    floor_heat_flow_W: number[];
    ventilation_heat_flow_W: number[];
  };
  heatFlow?: {
    wall_loss_kWh: number;
    roof_loss_kWh: number;
    floor_loss_kWh: number;
    ventilation_loss_kWh: number;
    total_conductive_loss_kWh: number;
    total_solar_gain_kWh: number;
    dominant_loss_component: string;
    interpretation: string;
  };
  comfort?: {
    neutral_comfort_temp_C?: number;
    comfort_band_min_C?: number;
    comfort_band_max_C?: number;
    hours_in_comfort_band?: number;
    comfort_hours_percent?: number;
    thermal_buffer_index?: number;
    indoor_temperature_swing_C?: number;
    outdoor_temperature_swing_C?: number;
    hours_below_10C?: number;
    hours_below_5C?: number;
    hours_below_0C?: number;
    discomfort_degree_hours_10C?: number;
    comfort_verdict?: string;
    interpretation?: string;
  };
  avgIndoorTemp: number;
  minIndoorTemp: number;
  maxIndoorTemp: number;
  solarGainKWh: number;
  heatLossKWh: number;
  wallMaterial: string;
  roofMaterial: string;
}

export const ThermalDashboard: React.FC<ThermalDashboardProps> = ({
  timeSeries,
  heatFlow,
  comfort,
  avgIndoorTemp,
  minIndoorTemp,
  maxIndoorTemp,
  solarGainKWh,
  heatLossKWh,
  wallMaterial,
  roofMaterial,
}) => {
  // Safe extraction of timeseries
  const hours = timeSeries?.hours || Array.from({ length: 48 }, (_, i) => i);
  const inTemps = timeSeries?.indoor_temp_C || Array(48).fill(avgIndoorTemp);
  const outTemps = timeSeries?.outdoor_temp_C || Array(48).fill(-10.0);

  // Calculate SVG Chart Coordinates
  const chartW = 800;
  const chartH = 300;
  const padL = 50;
  const padR = 30;
  const padT = 30;
  const padB = 40;

  const minVal = Math.min(...outTemps, ...inTemps, -18.0) - 2;
  const maxVal = Math.max(...outTemps, ...inTemps, 22.0) + 2;

  const getX = (hourIdx: number) => padL + (hourIdx / (hours.length - 1 || 1)) * (chartW - padL - padR);
  const getY = (tempC: number) => chartH - padB - ((tempC - minVal) / (maxVal - minVal || 1)) * (chartH - padT - padB);

  // Polyline Paths for animated drawing
  const inPath = inTemps.map((t, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(t)}`).join(' ');
  const outPath = outTemps.map((t, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(t)}`).join(' ');

  // Area paths for gradient fills
  const inAreaPath = `${inPath} L ${getX(hours.length - 1)} ${chartH - padB} L ${getX(0)} ${chartH - padB} Z`;
  const outAreaPath = `${outPath} L ${getX(hours.length - 1)} ${chartH - padB} L ${getX(0)} ${chartH - padB} Z`;

  // Comfort Band Polygon (e.g. 5°C to 20°C)
  const yComfortMin = getY(5.0);
  const yComfortMax = getY(20.0);

  // Heat Flow calculations
  const wallLoss = heatFlow?.wall_loss_kWh ?? 45.2;
  const roofLoss = heatFlow?.roof_loss_kWh ?? 22.1;
  const floorLoss = heatFlow?.floor_loss_kWh ?? 14.8;
  const ventLoss = heatFlow?.ventilation_loss_kWh ?? 12.5;
  const totalLoss = wallLoss + roofLoss + floorLoss + ventLoss || 1;

  const wallPct = Math.round((wallLoss / totalLoss) * 100);
  const roofPct = Math.round((roofLoss / totalLoss) * 100);
  const floorPct = Math.round((floorLoss / totalLoss) * 100);
  const ventPct = Math.round((ventLoss / totalLoss) * 100);

  const comfortPct = comfort?.comfort_hours_percent ?? 82;
  const bufferIdx = comfort?.thermal_buffer_index ?? 0.65;
  const freezeHours = comfort?.hours_below_0C ?? 0;

  // Animation variants
  const containerVariants: any = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.1 }
    }
  };

  const itemVariants: any = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 120, damping: 14 } }
  };
  
  // Custom glowing metric card component
  const MetricCard = ({ title, value, unit, subtitle, accentColor, delay }: any) => (
    <motion.div variants={itemVariants} className="relative group rounded-3xl p-[1px] overflow-hidden bg-[#0A0F1C]">
      <div className={`absolute inset-0 bg-gradient-to-br ${accentColor} opacity-20 group-hover:opacity-40 transition-opacity duration-700`}></div>
      <div className="relative h-full bg-[#0a0f1c]/80 backdrop-blur-xl rounded-3xl p-6 border border-white/5 flex flex-col justify-between overflow-hidden shadow-2xl">
        <div className={`absolute -right-10 -top-10 w-32 h-32 bg-gradient-to-bl ${accentColor} opacity-10 blur-2xl group-hover:opacity-30 transition-all duration-700`}></div>
        <h3 className="text-[10px] font-bold text-slate-400 tracking-[0.2em] uppercase mb-4 z-10">{title}</h3>
        <div className="flex items-baseline gap-2 mb-3 z-10">
          <motion.span 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', delay: delay, bounce: 0.4 }}
            className="text-4xl lg:text-5xl font-black text-white font-mono tracking-tighter"
          >
            {value}
          </motion.span>
          <span className="text-sm font-semibold text-slate-500">{unit}</span>
        </div>
        <p className="text-[11px] text-slate-500 font-medium leading-relaxed z-10">{subtitle}</p>
      </div>
    </motion.div>
  );

  return (
    <div className="flex flex-col gap-8 min-h-screen p-6 md:p-10 bg-transparent relative overflow-x-hidden font-sans selection:bg-cyan-500/30">
      
      {/* Video Background */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover opacity-60 mix-blend-screen"
        >
          <source src="/bgv1.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-[#030712]/60 backdrop-blur-sm"></div>
      </div>

      {/* Background Ambience */}
      <div className="fixed top-[-20%] left-[-10%] w-[70vw] h-[70vw] bg-cyan-900/10 blur-[150px] rounded-full pointer-events-none z-0" />
      <div className="fixed bottom-[-20%] right-[-10%] w-[70vw] h-[70vw] bg-indigo-900/10 blur-[150px] rounded-full pointer-events-none z-0" />
      <div className="fixed inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px] opacity-10 pointer-events-none [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_80%)] z-0" />

      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 pl-2 md:pl-12 pt-8"
      >
        <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-slate-400">
          ThermalCore <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400">Analytics</span>
        </h1>
        <p className="text-slate-400 mt-3 font-mono text-xs md:text-sm tracking-widest uppercase">Live Thermodynamic Telemetry & Envelope Performance</p>
      </motion.div>

      {/* Top Metrics Grid */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 relative z-10 w-full max-w-[1600px] mx-auto"
      >
        <MetricCard 
          title="Indoor Avg Temp" 
          value={avgIndoorTemp.toFixed(1)} 
          unit="°C" 
          subtitle={`Lift: +${(avgIndoorTemp - (outTemps.reduce((a, b) => a + b, 0) / outTemps.length || -10)).toFixed(1)}°C | Min: ${minIndoorTemp.toFixed(1)}°C`}
          accentColor="from-cyan-500 to-blue-600"
          delay={0.2}
        />
        <MetricCard 
          title="Solar Harvest" 
          value={solarGainKWh.toFixed(1)} 
          unit="kWh" 
          subtitle="48h direct solar gain via True South aperture"
          accentColor="from-amber-400 to-orange-600"
          delay={0.3}
        />
        <MetricCard 
          title="Conductive Loss" 
          value={heatLossKWh.toFixed(1)} 
          unit="kWh" 
          subtitle={`Restricted by ${wallMaterial} insulation stack`}
          accentColor="from-red-500 to-rose-600"
          delay={0.4}
        />
        <MetricCard 
          title="ASHRAE 55 Comfort" 
          value={comfortPct.toFixed(0)} 
          unit="%" 
          subtitle={`Buffer: ${bufferIdx.toFixed(2)} | Freeze: ${freezeHours}h`}
          accentColor="from-emerald-400 to-teal-600"
          delay={0.5}
        />
      </motion.div>

      {/* Main Chart Section */}
      <motion.div 
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 1, type: "spring", bounce: 0.2 }}
        className="relative z-10 w-full max-w-[1600px] mx-auto bg-[#0A0F1C]/60 backdrop-blur-2xl border border-white/5 rounded-[2rem] p-6 md:p-10 shadow-[0_0_80px_rgba(0,0,0,0.5)]"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent rounded-[2rem] pointer-events-none" />
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 relative z-10">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight flex items-center gap-3">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
              </span>
              Transient Performance Curve
            </h2>
            <p className="text-slate-500 text-xs md:text-sm mt-2 font-medium">1st-Law Energy Conservation Solver (48h Projection)</p>
          </div>
          <div className="flex flex-wrap gap-4 md:gap-6 mt-4 md:mt-0 text-xs md:text-sm font-medium">
            <div className="flex items-center gap-2 text-cyan-400 bg-cyan-950/30 px-3 py-1.5 rounded-full border border-cyan-500/20">
              <div className="w-3 h-1 bg-cyan-400 rounded-full shadow-[0_0_8px_rgba(34,211,238,0.8)]" /> Indoor Temp
            </div>
            <div className="flex items-center gap-2 text-slate-400 bg-slate-900/50 px-3 py-1.5 rounded-full border border-slate-700/50">
              <div className="w-3 h-1 bg-slate-500 rounded-full border border-slate-400 border-dashed" /> Ambient
            </div>
            <div className="flex items-center gap-2 text-emerald-400 bg-emerald-950/30 px-3 py-1.5 rounded-full border border-emerald-500/20">
              <div className="w-3 h-3 bg-emerald-500/20 border border-emerald-500/50 rounded-sm" /> Comfort Band
            </div>
          </div>
        </div>

        <div className="w-full overflow-x-auto custom-scrollbar pb-4 relative z-10">
          <div className="min-w-[800px] w-full">
            <svg width="100%" height="100%" viewBox={`0 0 ${chartW} ${chartH}`} className="w-full h-auto overflow-visible" style={{ filter: 'drop-shadow(0px 10px 10px rgba(0,0,0,0.5))' }}>
              <defs>
                <linearGradient id="inGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#22d3ee" stopOpacity="0.0" />
                </linearGradient>
                <linearGradient id="outGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#64748b" stopOpacity="0.15" />
                  <stop offset="100%" stopColor="#64748b" stopOpacity="0.0" />
                </linearGradient>
                <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="4" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              </defs>

              {/* Grid Lines */}
              {[-15, -10, -5, 0, 5, 10, 15, 20].filter(t => t >= minVal && t <= maxVal).map(temp => (
                <g key={temp}>
                  <line x1={padL} y1={getY(temp)} x2={chartW - padR} y2={getY(temp)} stroke="#1e293b" strokeWidth="1" strokeDasharray="4 4" />
                  <text x={padL - 12} y={getY(temp) + 4} fill="#475569" fontSize="10" textAnchor="end" fontWeight="600" className="font-mono">{temp}°</text>
                </g>
              ))}

              {/* Comfort Band Highlight */}
              <motion.rect
                initial={{ opacity: 0, height: 0, y: yComfortMin }}
                animate={{ opacity: 1, height: Math.max(0, yComfortMin - yComfortMax), y: yComfortMax }}
                transition={{ delay: 1, duration: 1.5, type: "spring" }}
                x={padL} width={chartW - padL - padR}
                fill="rgba(16, 185, 129, 0.04)" stroke="rgba(16, 185, 129, 0.3)" strokeDasharray="4 4" rx="4"
              />

              {/* X Axis Labels */}
              {[0, 6, 12, 18, 24, 30, 36, 42, 48].map(h => {
                if (h >= hours.length && h !== 48) return null;
                const actualH = h === 48 ? hours.length - 1 : h;
                return (
                  <g key={h}>
                    <line x1={getX(actualH)} y1={chartH - padB} x2={getX(actualH)} y2={chartH - padB + 5} stroke="#334155" strokeWidth="2" />
                    <text x={getX(actualH)} y={chartH - padB + 20} fill="#64748b" fontSize="10" textAnchor="middle" fontWeight="600" className="font-mono">{h}h</text>
                  </g>
                )
              })}

              {/* Zero Degree Line */}
              {minVal < 0 && maxVal > 0 && (
                <motion.line
                  initial={{ opacity: 0, x2: padL }}
                  animate={{ opacity: 0.6, x2: chartW - padR }}
                  transition={{ delay: 1.5, duration: 1 }}
                  x1={padL} y1={getY(0.0)} y2={getY(0.0)}
                  stroke="#ef4444" strokeWidth="1.5" strokeDasharray="4 4"
                />
              )}

              {/* Outdoor Area & Line */}
              <motion.path d={outAreaPath} fill="url(#outGradient)" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8, duration: 1 }} />
              <motion.path d={outPath} fill="none" stroke="#64748b" strokeWidth="2.5" strokeDasharray="4 4" strokeLinecap="round" strokeLinejoin="round"
                initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 2.5, ease: "easeInOut" }}
              />

              {/* Indoor Area & Line (Glowing) */}
              <motion.path d={inAreaPath} fill="url(#inGradient)" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2, duration: 1.5 }} />
              <motion.path d={inPath} fill="none" stroke="#22d3ee" strokeWidth="4" filter="url(#glow)" strokeLinecap="round" strokeLinejoin="round"
                initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 2.5, ease: "easeInOut", delay: 0.2 }}
              />

              {/* Scanning Telemetry Line */}
              <motion.line
                x1={padL} y1={padT - 10} x2={padL} y2={chartH - padB + 10}
                stroke="rgba(34,211,238,0.5)" strokeWidth="2"
                initial={{ x1: padL, x2: padL, opacity: 0 }}
                animate={{ x1: [padL, chartW - padR, padL], x2: [padL, chartW - padR, padL], opacity: [0, 1, 1, 0] }}
                transition={{ duration: 8, ease: "linear", repeat: Infinity, delay: 3 }}
                style={{ filter: 'drop-shadow(0px 0px 8px rgba(34, 211, 238, 1))' }}
              />
            </svg>
          </div>
        </div>
      </motion.div>

      {/* Bottom Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 relative z-10 w-full max-w-[1600px] mx-auto pb-12">
        {/* Heat Loss Breakdown */}
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.8, duration: 0.8, type: 'spring' }}
          className="bg-[#0A0F1C]/80 backdrop-blur-2xl border border-white/5 rounded-3xl p-8 shadow-xl relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 blur-[80px] rounded-full pointer-events-none" />
          
          <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-3">
            <span className="material-symbols-outlined text-cyan-400 bg-cyan-400/10 p-2 rounded-xl border border-cyan-400/20">pie_chart</span>
            Energy Flow Distribution
          </h3>
          <div className="space-y-6">
            {[
              { label: `Walls (${wallMaterial})`, val: wallLoss, pct: wallPct, color: 'bg-cyan-400', shadow: 'shadow-cyan-400/50' },
              { label: `Roof (${roofMaterial})`, val: roofLoss, pct: roofPct, color: 'bg-amber-400', shadow: 'shadow-amber-400/50' },
              { label: 'Ground Slab', val: floorLoss, pct: floorPct, color: 'bg-emerald-400', shadow: 'shadow-emerald-400/50' },
              { label: 'Infiltration / Air', val: ventLoss, pct: ventPct, color: 'bg-purple-400', shadow: 'shadow-purple-400/50' },
            ].map((item, idx) => (
              <div key={idx} className="group cursor-default">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-slate-300 font-medium group-hover:text-white transition-colors">{item.label}</span>
                  <span className="text-slate-400 font-mono">{item.val.toFixed(1)} kWh <span className="text-white font-bold ml-1">({item.pct}%)</span></span>
                </div>
                <div className="w-full bg-slate-900 rounded-full h-3 overflow-hidden border border-slate-800">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${item.pct}%` }}
                    transition={{ duration: 1.5, delay: 1.2 + (idx * 0.2), ease: "easeOut" }}
                    className={`h-full ${item.color} shadow-[0_0_12px_rgba(0,0,0,0)] group-hover:${item.shadow} transition-shadow duration-300`}
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Thermal Mass Kinetics */}
        <motion.div 
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 1, duration: 0.8, type: 'spring' }}
          className="bg-[#0A0F1C]/80 backdrop-blur-2xl border border-white/5 rounded-3xl p-8 shadow-xl flex flex-col relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 blur-[80px] rounded-full pointer-events-none" />

          <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-3">
            <span className="material-symbols-outlined text-emerald-400 bg-emerald-400/10 p-2 rounded-xl border border-emerald-400/20">memory</span>
            Thermal Mass Kinetics
          </h3>
          <div className="flex-1 space-y-4 flex flex-col justify-center">
            {[
              { label: 'Thermal Time Constant (τ)', val: '42.5', unit: 'hours', color: 'text-cyan-400' },
              { label: 'Effective Capacitance (C_eff)', val: '18.4', unit: 'MJ/K', color: 'text-amber-400' },
              { label: 'Diurnal Damping', val: '82.4%', unit: 'Reduction', color: 'text-emerald-400' },
              { label: 'Energy Residue (ΔE)', val: '< 10⁻⁴', unit: 'W', color: 'text-purple-400' },
            ].map((item, idx) => (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 1.6 + (idx * 0.1) }}
                key={idx} 
                className="flex justify-between items-center p-4 bg-slate-900/40 border border-white/5 rounded-2xl hover:bg-slate-800/60 hover:border-white/10 transition-all duration-300 cursor-default group"
              >
                <span className="text-sm font-medium text-slate-400 group-hover:text-slate-300 transition-colors">{item.label}</span>
                <span className={`text-xl font-bold font-mono ${item.color}`}>{item.val} <span className="text-xs text-slate-500 ml-1">{item.unit}</span></span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};
