import React, { useState, useRef, useEffect, useMemo } from 'react';
import { ArrowLeft, ArrowRight, Box, Cpu, FileText, Share2, Download, ChevronUp, ChevronDown, Check, Layers, Sun, Moon, CloudRain, ThermometerSun, Shield, X, Library, Activity, MapPin, Clock } from 'lucide-react';
import { WALL_MATERIALS, ROOF_MATERIALS } from '../constants/materials';
import { ShelterViewer } from '../emergency_shelter/components/ShelterViewer';
import weatherSnapshots from '../assets/weather_snapshots.json';

interface DesignDetailsProps {
  designReport: any;
  onDeploy: () => void;
  onViewCatalogue: (wallId: string, roofId: string) => void;
  onBack?: () => void;
}

const ENVIRONMENTS = [
  { id: 'day', label: 'Daylight', icon: <Sun className="w-4 h-4" />, baseTemp: 25, solarIntensity: 800 }, // Moderate day
  { id: 'night', label: 'Night Ops', icon: <Moon className="w-4 h-4" />, baseTemp: 10, solarIntensity: 0 }, // Cool night
  { id: 'desert', label: 'Desert', icon: <Sun className="w-4 h-4 text-orange-400" />, baseTemp: 45, solarIntensity: 1100 }, // Hot desert
  { id: 'arctic', label: 'Arctic', icon: <CloudRain className="w-4 h-4 text-cyan-200" />, baseTemp: -20, solarIntensity: 300 }, // Freezing
  { id: 'overcast', label: 'Disaster Zone', icon: <CloudRain className="w-4 h-4" />, baseTemp: 18, solarIntensity: 400 }, // Humid/Cloudy
];

const LOCATIONS = [
  { id: 'leh', label: 'Leh (Alpine)' },
  { id: 'shimla', label: 'Shimla (Montane)' },
  { id: 'jaipur', label: 'Jaipur (Semi-Arid)' },
  { id: 'karur', label: 'Karur (Tropical)' },
  { id: 'cherrapunji', label: 'Cherrapunji (Extreme Rain)' },
  { id: 'jaisalmer', label: 'Jaisalmer (Desert)' },
  { id: 'kanyakumari', label: 'Kanyakumari (Coastal)' },
  { id: 'dras', label: 'Dras (Extreme Cold)' },
  { id: 'mumbai', label: 'Mumbai (Urban Humid)' },
  { id: 'delhi', label: 'Delhi (Urban Extreme)' }
];

const RENDER_MODES = [
  { id: 'lit', label: 'PBR Lit' },
  { id: 'wireframe', label: 'Wireframe' },
  { id: 'xray', label: 'X-Ray' },
];

export const DesignDetails: React.FC<DesignDetailsProps> = ({ designReport, onDeploy, onViewCatalogue, onBack }) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  
  // Interactive Panel State
  const [activeWall, setActiveWall] = useState(WALL_MATERIALS[2]); // Default EPS
  const [activeRoof, setActiveRoof] = useState(ROOF_MATERIALS[2]); // Default Galvanized
  const [activeEnv, setActiveEnv] = useState(ENVIRONMENTS[0]); // Default Day
  const [activeMode, setActiveMode] = useState('lit');

  // Live Data State
  const [isLiveData, setIsLiveData] = useState(false);
  const [liveLocation, setLiveLocation] = useState('leh');
  const [liveHour, setLiveHour] = useState(12);

  const iframeRef = useRef<HTMLIFrameElement>(null);

  const config = designReport?.alternatives?.[0] || {
    name: 'Emergency Shelter - Prototype',
  };

  const updateIframe = (payload: any) => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        { type: 'UPDATE_CONFIG', ...payload },
        '*'
      );
    }
  };

  const handleWallChange = (wall: typeof WALL_MATERIALS[0]) => {
    setActiveWall(wall);
    updateIframe({ config: { wallMaterialId: wall.id } });
  };

  const handleRoofChange = (roof: typeof ROOF_MATERIALS[0]) => {
    setActiveRoof(roof);
    updateIframe({ config: { roofMaterialId: roof.id } });
  };

  const handleEnvChange = (env: typeof ENVIRONMENTS[0]) => {
    setActiveEnv(env);
    updateIframe({ environment: env.id });
  };

  const handleModeChange = (mode: string) => {
    setActiveMode(mode);
    updateIframe({ renderMode: mode });
  };

  // Thermodynamics Calculation
  const { currentTemp, currentRadiation, indoorTemp, solarGain, heatLoss } = useMemo(() => {
    // Determine base parameters based on Live Data vs Presets
    let baseT = activeEnv.baseTemp;
    let solarInt = activeEnv.solarIntensity;

    if (isLiveData) {
      // @ts-ignore
      const snapshot = weatherSnapshots[liveLocation];
      if (snapshot && snapshot[liveHour]) {
        baseT = snapshot[liveHour].temperature_2m;
        solarInt = snapshot[liveHour].shortwave_radiation;
      }
    }

    const ambient = baseT;
    const solarDelta = (solarInt / 100) * (1 - (activeRoof.albedo || 0.5));
    const comfortTarget = 24;
    let ambientPull = ambient - comfortTarget; 
    
    // R-value buffers the ambient pull
    const insulationBlock = Math.min((activeWall.rValue || 1.0) / 12, 0.9);
    let baseIndoorTemp = comfortTarget + (ambientPull * (1 - insulationBlock));
    
    // Trapped solar heat is higher with better insulation
    const trappedSolarHeat = solarDelta * (0.5 + insulationBlock);
    
    let indTemp = baseIndoorTemp + trappedSolarHeat;
    if (activeWall.id === 'wall-ceb' && solarInt > 500) indTemp -= 3; // Thermal mass damping

    const baseSolarGain = solarDelta * 5; // Simplified kWh/day estimation
    const hLoss = (Math.abs(ambientPull) * 5) / (activeWall.rValue || 1.0);

    return {
      currentTemp: baseT.toFixed(1),
      currentRadiation: solarInt.toFixed(1),
      indoorTemp: indTemp.toFixed(1),
      solarGain: baseSolarGain.toFixed(1),
      heatLoss: hLoss.toFixed(1)
    };
  }, [activeEnv, activeWall, activeRoof, isLiveData, liveLocation, liveHour]);

  return (
    <div className="h-screen w-full bg-transparent overflow-hidden font-sans relative">
      
      {/* BACKGROUND: 3D Model */}
      <div className="absolute inset-0 z-0">
        <ShelterViewer 
          config={{
            wallMaterialId: activeWall.id,
            roofMaterialId: activeRoof.id,
            weathering: 0.25,
            doorOpen: false,
            doorAngle: 0,
            windowShuttersOpen: true,
            jacksDeployed: true,
            interiorLight: true,
            interiorLightColor: '#ffeaad',
            exteriorLight: true,
            explodedProgress: 0,
            showDimensions: false,
            showHotspots: false,
            roofCutaway: false,
          }}
          renderMode={activeMode as any}
          environment={isLiveData ? 'live' as any : activeEnv.id as any}
          liveSolarIntensity={isLiveData ? Number(currentRadiation) : undefined}
          liveTimeOfDay={isLiveData ? liveHour : undefined}
          liveLocation={isLiveData ? liveLocation : undefined}
          cameraPreset="hero"
          selectedHotspot={null}
          autoRotate={false}
          onSelectHotspot={() => {}}
        />
      </div>

      {/* FOREGROUND UI OVERLAYS */}
      <div className={`absolute inset-0 z-10 transition-opacity duration-500 pointer-events-none ${isDrawerOpen ? 'opacity-0' : 'opacity-100'}`}>
        
        {/* Header Overlay */}
        <div className="absolute top-0 w-full h-20 bg-gradient-to-b from-black/80 to-transparent flex items-center justify-between px-10 pointer-events-none z-10">
          <div className="flex items-center gap-3 text-white font-bold tracking-widest uppercase pointer-events-auto">
            {onBack && (
              <button onClick={onBack} className="p-2 hover:bg-white/10 rounded-full transition-colors mr-2 text-slate-300 hover:text-white" title="Go Back">
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <Box className="w-6 h-6 text-cyan-500" />
            <span className="text-xl tracking-widest">Design Validation</span>
            <span className="text-slate-500">/</span>
            <span className="text-cyan-400 text-sm">{config.name}</span>
          </div>
          <div className="flex items-center gap-6 pointer-events-auto">
            <div className="bg-black/60 backdrop-blur-md border border-slate-700/50 rounded-lg px-4 py-2 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse"></div>
              <span className="text-xs font-mono text-cyan-100 uppercase tracking-widest">Live Physics Engine</span>
            </div>
            <button className="text-slate-400 hover:text-white transition-colors" title="Export Specs">
              <Download className="w-6 h-6" />
            </button>
            <button className="text-slate-400 hover:text-white transition-colors" title="Share Design">
              <Share2 className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Floating Customization Panel (Left Side) */}
        <div 
          className="absolute top-24 bottom-24 left-10 w-[22rem] flex flex-col gap-4 pointer-events-auto overflow-y-auto custom-scrollbar pr-2"
          onPointerDown={(e) => e.stopPropagation()}
          onPointerUp={(e) => e.stopPropagation()}
          onPointerMove={(e) => e.stopPropagation()}
          onWheel={(e) => e.stopPropagation()}
        >
          {/* Environment / Live Data Controls */}
          <div className="bg-black/40 backdrop-blur-2xl border border-white/10 rounded-2xl p-5 shadow-2xl shrink-0 w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Sun className="w-3.5 h-3.5 text-cyan-400" /> Environment Simulation
              </h3>
              
              <div className="flex items-center bg-slate-900/80 rounded-lg p-1 border border-slate-700/50">
                <button
                  onClick={() => setIsLiveData(false)}
                  className={`px-3 py-1 rounded text-[10px] font-bold uppercase tracking-wider transition-colors ${!isLiveData ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-slate-300'}`}
                >
                  Presets
                </button>
                <button
                  onClick={() => setIsLiveData(true)}
                  className={`px-3 py-1 rounded text-[10px] font-bold uppercase tracking-wider transition-colors flex items-center gap-1 ${isLiveData ? 'bg-cyan-900/80 text-cyan-300 border border-cyan-500/50' : 'text-slate-400 hover:text-slate-300'}`}
                >
                  <Activity className="w-3 h-3" /> Live Data
                </button>
              </div>
            </div>

            {!isLiveData ? (
              <div className="grid grid-cols-5 gap-2 mb-4">
                {ENVIRONMENTS.map(env => (
                  <button
                    key={env.id}
                    onClick={() => handleEnvChange(env)}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${
                      activeEnv.id === env.id 
                        ? 'bg-cyan-950/40 border-cyan-500/50 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.15)]' 
                        : 'bg-slate-900/50 border-slate-800 text-slate-500 hover:bg-slate-800 hover:text-slate-300'
                    }`}
                  >
                    <div className="mb-2 opacity-80">{env.icon}</div>
                    <span className="text-[9px] font-bold uppercase tracking-wider text-center">{env.label}</span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="space-y-4 mb-4">
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="text-[9px] font-mono text-slate-500 uppercase tracking-widest mb-1 block">Location / Dataset</label>
                    <div className="relative">
                      <MapPin className="w-3 h-3 absolute left-3 top-1/2 -translate-y-1/2 text-cyan-500" />
                      <select 
                        className="w-full bg-slate-900/80 border border-slate-700 rounded-lg pl-8 pr-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 appearance-none cursor-pointer"
                        value={liveLocation}
                        onChange={(e) => setLiveLocation(e.target.value)}
                      >
                        {LOCATIONS.map(loc => (
                          <option key={loc.id} value={loc.id}>{loc.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="flex-1">
                    <label className="text-[9px] font-mono text-slate-500 uppercase tracking-widest mb-1 block">Real-time Metrics</label>
                    <div className="bg-slate-900/50 border border-slate-800 rounded-lg px-3 py-1.5 flex justify-between items-center h-[34px]">
                       <span className="text-xs font-bold text-white">{currentTemp}°C</span>
                       <span className="text-[10px] text-orange-400">{currentRadiation} W/m²</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-[9px] font-mono text-slate-500 uppercase tracking-widest flex items-center gap-1">
                      <Clock className="w-3 h-3" /> Time of Day (24h)
                    </label>
                    <span className="text-xs font-bold text-cyan-400">{liveHour.toString().padStart(2, '0')}:00</span>
                  </div>
                  <input 
                    type="range" 
                    min="0" 
                    max="23" 
                    value={liveHour}
                    onChange={(e) => setLiveHour(parseInt(e.target.value))}
                    className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-cyan-500 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-[0_0_10px_rgba(6,182,212,0.5)]"
                  />
                  <div className="flex justify-between text-[8px] text-slate-600 font-mono mt-1 px-1">
                    <span>00:00</span>
                    <span>06:00</span>
                    <span>12:00</span>
                    <span>18:00</span>
                    <span>23:00</span>
                  </div>
                </div>
              </div>
            )}

            <div className="flex bg-slate-900/80 p-1 rounded-lg border border-slate-800">
              {RENDER_MODES.map(mode => (
                <button
                  key={mode.id}
                  onClick={() => handleModeChange(mode.id)}
                  className={`flex-1 py-1 text-[10px] font-semibold rounded-md transition-colors ${
                    activeMode === mode.id ? 'bg-cyan-600 text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  {mode.label}
                </button>
              ))}
            </div>
          </div>

          {/* Material Assembly */}
          <div className="bg-black/40 backdrop-blur-2xl border border-white/10 rounded-2xl p-5 shadow-2xl shrink-0">
             <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Shield className="w-3.5 h-3.5 text-cyan-500" /> Structural Assembly
            </h3>
            
            {/* Roof Selection */}
            <div className="mb-5">
              <div className="text-[9px] font-mono text-slate-500 uppercase tracking-widest mb-2 flex justify-between">
                <span>Roofing System</span>
                <span className="text-cyan-400">Albedo: {(activeRoof.albedo || 0).toFixed(2)}</span>
              </div>
              <div className="grid grid-cols-6 gap-1.5 mb-2">
                {ROOF_MATERIALS.map(roof => (
                  <button
                    key={roof.id}
                    onClick={() => handleRoofChange(roof)}
                    title={`${roof.name} (Albedo: ${roof.albedo})`}
                    className={`aspect-square rounded-md border transition-all flex items-center justify-center ${
                      activeRoof.id === roof.id ? 'border-cyan-400 scale-110 shadow-[0_0_10px_rgba(34,211,238,0.3)] z-10' : 'border-transparent hover:scale-105 hover:border-slate-500'
                    }`}
                    style={{ backgroundColor: roof.hex }}
                  />
                ))}
              </div>
              <div className="text-xs font-semibold text-white truncate">{activeRoof.name}</div>
              <div className="text-[10px] text-slate-400 truncate">{activeRoof.desc}</div>
            </div>

            {/* Wall Selection */}
            <div>
              <div className="text-[9px] font-mono text-slate-500 uppercase tracking-widest mb-2 flex justify-between">
                <span>Wall Assembly</span>
                <span className="text-cyan-400">R-{(activeWall.rValue || 0).toFixed(1)}/in</span>
              </div>
              <div className="grid grid-cols-6 gap-1.5 mb-2">
                {WALL_MATERIALS.map(wall => (
                  <button
                    key={wall.id}
                    onClick={() => handleWallChange(wall)}
                    title={`${wall.name} (R-${wall.rValue})`}
                    className={`aspect-square rounded-md border transition-all flex items-center justify-center ${
                      activeWall.id === wall.id ? 'border-cyan-400 scale-110 shadow-[0_0_10px_rgba(34,211,238,0.3)] z-10' : 'border-transparent hover:scale-105 hover:border-slate-500'
                    }`}
                    style={{ backgroundColor: wall.hex }}
                  />
                ))}
              </div>
              <div className="text-xs font-semibold text-white truncate">{activeWall.name}</div>
              <div className="text-[10px] text-slate-400 truncate">{activeWall.desc}</div>
            </div>
          </div>

          {/* Thermodynamics Telemetry */}
          <div className="bg-black/40 backdrop-blur-2xl border border-white/10 rounded-2xl p-5 shadow-2xl shrink-0">
             <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <ThermometerSun className="w-3.5 h-3.5 text-orange-500" /> Thermal Physics Telemetry
            </h3>
            
            <div className="space-y-3">
              <div className="flex justify-between items-end border-b border-white/5 pb-2">
                <div className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Ambient Outside</div>
                <div className="text-sm font-bold text-slate-300">{currentTemp}°C</div>
              </div>
              <div className="flex justify-between items-end border-b border-white/5 pb-2">
                <div className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Est. Indoor Temp</div>
                <div className={`text-xl font-bold ${Number(indoorTemp) > 28 ? 'text-orange-400' : Number(indoorTemp) < 15 ? 'text-blue-400' : 'text-green-400'}`}>
                  {indoorTemp}°C
                </div>
              </div>
              <div className="flex justify-between items-end border-b border-white/5 pb-2">
                <div className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Solar Heat Gain</div>
                <div className="text-sm font-bold text-[#ECA078]">{solarGain} <span className="text-[9px] font-normal text-slate-500">kWh/day</span></div>
              </div>
              <div className="flex justify-between items-end">
                <div className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Heat Loss Rate</div>
                <div className="text-sm font-bold text-blue-300">{heatLoss} <span className="text-[9px] font-normal text-slate-500">W/m²K</span></div>
              </div>
            </div>
          </div>

          {/* Model Export */}
          <button
            onClick={() => {
              const iframe = document.getElementById('shelter-viewer-iframe') as HTMLIFrameElement;
              if (iframe?.contentWindow) {
                iframe.contentWindow.postMessage({ type: 'DOWNLOAD_GLB' }, '*');
              }
            }}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 font-bold text-[11px] tracking-widest uppercase border border-slate-700/50 shadow-lg backdrop-blur-xl transition-all shrink-0"
          >
            <Download className="w-4 h-4" />
            <span>Download Model (GLB)</span>
          </button>

        </div>
      </div>

      {/* PULL-UP DRAWER */}
      <div 
        className={`absolute bottom-0 left-0 w-full bg-[#050505] border-t border-slate-800 shadow-[0_-20px_50px_rgba(0,0,0,0.8)] z-30 transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] ${isDrawerOpen ? 'translate-y-0 h-[85vh]' : 'translate-y-[calc(100%-4rem)] h-[85vh]'}`}
      >
        {/* Drawer Handle */}
        <div 
          onClick={() => setIsDrawerOpen(!isDrawerOpen)}
          className="h-16 w-full flex items-center justify-center cursor-pointer group bg-gradient-to-b from-[#0a0a0a] to-[#050505] hover:from-[#111] border-b border-slate-800/50"
        >
          <div className="flex flex-col items-center gap-1 transition-transform group-hover:-translate-y-1">
            {isDrawerOpen ? <ChevronDown className="w-5 h-5 text-cyan-500" /> : <ChevronUp className="w-5 h-5 text-cyan-500 animate-bounce" />}
            <span className="text-[10px] font-mono text-slate-400 tracking-[0.2em] uppercase group-hover:text-cyan-400 transition-colors">
              {isDrawerOpen ? 'Close Schematics' : 'Pull Up for Schematics'}
            </span>
          </div>
        </div>

        {/* Drawer Content */}
        <div className={`w-full h-[calc(100%-4rem)] overflow-y-auto custom-scrollbar p-10 transition-opacity duration-700 delay-200 ${isDrawerOpen ? 'opacity-100' : 'opacity-0'}`}>
          <div className="max-w-6xl mx-auto space-y-10">
            
            <div className="text-center space-y-4">
              <div className="inline-flex items-center gap-2 bg-slate-900/50 border border-slate-800 rounded-full px-6 py-2">
                <FileText className="w-4 h-4 text-cyan-500" />
                <span className="text-xs font-mono text-cyan-100 uppercase tracking-widest">2D Engineering Schematic</span>
              </div>
              <h2 className="text-3xl font-bold text-white tracking-widest uppercase">Blueprint Analysis</h2>
              <p className="text-slate-500 max-w-2xl mx-auto">Review the generated layout, spatial constraints, and structural boundaries before deploying the design to the operational dashboard.</p>
            </div>

            {/* Large Blueprint Image */}
            <div className="w-full bg-[#0a0a0a] border border-slate-800 rounded-3xl p-4 shadow-2xl relative group overflow-hidden">
               {/* Scanning Line Effect */}
              <div className="absolute top-0 left-0 w-full h-1 bg-cyan-500/50 blur-[2px] opacity-0 group-hover:opacity-100 group-hover:animate-[scan_3s_ease-in-out_infinite] z-20 pointer-events-none"></div>
              
              <div className="relative w-full h-[70vh] bg-black rounded-2xl overflow-hidden flex items-center justify-center">
                <img 
                  src="/blueprint.jpg?v=2" 
                  alt="2D Blueprint Schematic" 
                  className="w-full h-full object-contain filter invert opacity-90 mix-blend-screen transition-transform duration-700 group-hover:scale-105"
                />
              </div>
            </div>

            {/* Action Area */}
            <div className="max-w-2xl mx-auto pt-4 pb-10 flex flex-col md:flex-row gap-4">
              <a 
                href="/blueprint.jpg?v=2" 
                download="emergency_shelter_blueprint.jpg"
                className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-slate-800/50 border border-slate-700 hover:bg-slate-800 hover:border-slate-500 text-slate-300 font-bold text-xs tracking-wider uppercase rounded-xl transition-all"
              >
                <Download className="w-4 h-4" />
                Download Blueprint
              </a>
                          <button
                onClick={() => onViewCatalogue(activeWall.id, activeRoof.id)}
                className="flex-1 group relative flex items-center justify-center gap-3 px-8 py-4 bg-cyan-950/40 border border-cyan-800/50 hover:bg-cyan-900/50 hover:border-cyan-500/50 text-cyan-400 font-bold text-sm tracking-[0.2em] uppercase rounded-xl overflow-hidden transition-all shadow-[0_0_40px_-15px_rgba(6,182,212,0.3)] hover:shadow-[0_0_60px_-15px_rgba(6,182,212,0.5)]"
              >
                <span className="relative z-10 flex items-center gap-2">
                  <Library className="w-5 h-5" />
                  View Materials Catalogue
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-500/10 to-transparent -translate-x-[100%] group-hover:animate-[shimmer_2s_infinite]"></div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
