// @ts-nocheck
import React, { useState } from 'react';
import { ThreeCanvas } from './components/ThreeCanvas';
import { MaterialsPanel, ROOF_MATERIALS, WALL_MATERIALS } from '../residential/components/MaterialsPanel';
import type { MaterialOption } from '../residential/components/MaterialsPanel';
import weatherSnapshots from '../assets/weather_snapshots.json';
import type { ViewPreset, RenderMode, SolarSettings } from '../types';
import { 
  X, Compass, Download, Sun, CloudSun, CloudRain, Sunset, 
  ThermometerSun, Shield, Activity, MapPin, Clock, Thermometer, 
  Wind, Box, Library, ChevronUp, Layers, Moon
} from 'lucide-react';

export interface DuplexAppProps {
  thermalObjective?: string;
  onViewCatalogue?: (wallId: string, roofId: string) => void;
}

export function DuplexApp({ thermalObjective, onViewCatalogue }: DuplexAppProps) {
  const [viewPreset, setViewPreset] = useState<ViewPreset>('isometric');
  const [renderMode, setRenderMode] = useState<RenderMode>('realistic');
  
  // Determine defaults based on thermal objective
  const initialWall = React.useMemo(() => {
    if (thermalObjective === 'winter_warmth') return WALL_MATERIALS.find(w => w.id === 'aerogel') || WALL_MATERIALS[0];
    if (thermalObjective === 'summer_cooling') return WALL_MATERIALS.find(w => w.id === 'pir') || WALL_MATERIALS[0];
    if (thermalObjective === 'balanced') return WALL_MATERIALS.find(w => w.id === 'hempcrete') || WALL_MATERIALS[0];
    return WALL_MATERIALS[0];
  }, [thermalObjective]);

  const initialRoof = React.useMemo(() => {
    if (thermalObjective === 'winter_warmth') return ROOF_MATERIALS.find(r => r.id === 'solar_absorbent') || ROOF_MATERIALS[0];
    if (thermalObjective === 'summer_cooling') return ROOF_MATERIALS.find(r => r.id === 'cool_roof') || ROOF_MATERIALS[0];
    if (thermalObjective === 'balanced') return ROOF_MATERIALS.find(r => r.id === 'galvanized') || ROOF_MATERIALS[0];
    return ROOF_MATERIALS[0];
  }, [thermalObjective]);

  const [activeRoof, setActiveRoof] = useState<MaterialOption>(initialRoof);
  const [activeWall, setActiveWall] = useState<MaterialOption>(initialWall);

  const [solarSettings, setSolarSettings] = useState<SolarSettings>({
    timeOfDay: 14.0,
    season: 'winter', 
    solarAltitude: 45,
    solarAzimuth: 15,
    weather: 'clear',
    shadowSoftness: 0.2,
    shadowIntensity: 0.95,
    cloudDriftSpeed: 1.0,
    isLiveMode: false,
    liveLocation: 'leh'
  });

  const [layers, setLayers] = useState({
    terrace: true,
    upper: true,
    ground: true,
  });

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  React.useEffect(() => {
    if (solarSettings.isLiveMode && solarSettings.liveLocation) {
      const snap = weatherSnapshots[solarSettings.liveLocation as keyof typeof weatherSnapshots];
      const currentHour = Math.floor(solarSettings.timeOfDay);
      if (snap && snap[currentHour]) {
        setSolarSettings(prev => ({
          ...prev,
          liveSolarIntensity: snap[currentHour].shortwave_radiation,
          liveTemp: snap[currentHour].temperature_2m,
        }));
      }
    }
  }, [solarSettings.isLiveMode, solarSettings.liveLocation, solarSettings.timeOfDay]);

  const { currentTemp, indoorTemp, solarGain, heatLoss } = React.useMemo(() => {
    let baseT = 25;
    let solarInt = 0;

    if (solarSettings.isLiveMode && solarSettings.liveLocation && solarSettings.liveTemp) {
      baseT = solarSettings.liveTemp;
      solarInt = solarSettings.liveSolarIntensity || 0;
    } else {
      switch(solarSettings.weather) {
        case 'clear': baseT = 28; solarInt = 800; break;
        case 'partlyCloudy': baseT = 15; solarInt = 400; break;
        case 'heatwave': baseT = 42; solarInt = 1000; break;
        case 'monsoon': baseT = 24; solarInt = 150; break;
        case 'goldenHour': baseT = 20; solarInt = 200; break;
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

    const baseSolarGain = solarDelta * 5; // Simplified kWh/day estimation
    const hLoss = (Math.abs(ambientPull) * 5) / (activeWall.rValue || 1.0);

    return {
      currentTemp: baseT.toFixed(1),
      indoorTemp: indTemp.toFixed(1),
      solarGain: baseSolarGain.toFixed(1),
      heatLoss: hLoss.toFixed(1)
    };
  }, [solarSettings, activeRoof, activeWall]);

  return (
    <div className="flex flex-col w-screen h-screen bg-stone-950 text-stone-100 overflow-hidden font-sans select-none">
      <div className="relative flex-1 w-full h-full overflow-hidden bg-stone-900">
        
        <ThreeCanvas
          viewPreset={viewPreset}
          renderMode={renderMode}
          solarSettings={solarSettings}
          layers={layers}
          activeRoof={activeRoof}
          activeWall={activeWall}
        />

        <div className="absolute bottom-4 left-4 z-10 flex flex-wrap items-center gap-2 pointer-events-auto">
          <div className="bg-stone-900/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-stone-700/80 text-xs text-stone-300 shadow-lg flex items-center gap-3">
            <span className="flex items-center gap-1.5 font-medium">
              <Compass className="w-3.5 h-3.5 text-teal-400" />
              <span>Orbit: Drag | Pan: Right-Click | Zoom: Wheel</span>
            </span>
          </div>
        </div>

        {/* View Presets */}
        <div className="absolute top-4 right-4 z-10 flex flex-col gap-2 pointer-events-auto">
          <div className="bg-stone-900/90 backdrop-blur-md p-1 rounded-xl border border-stone-700 shadow-lg flex flex-col gap-1">
            {['isometric', 'top', 'front', 'rear', 'left', 'right', 'interior'].map(preset => (
              <button 
                key={preset}
                onClick={() => setViewPreset(preset as ViewPreset)}
                className={`px-3 py-1.5 text-[10px] font-bold uppercase rounded-lg transition-colors ${
                  viewPreset === preset ? 'bg-cyan-500 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                {preset}
              </button>
            ))}
          </div>
          
          {/* Layer Controls */}
          <div className="bg-stone-900/90 backdrop-blur-md p-3 rounded-xl border border-stone-700 shadow-lg mt-4 flex flex-col gap-2 w-32">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-2"><Layers className="w-3 h-3" /> Layers</h4>
            
            <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer hover:text-white">
              <input type="checkbox" checked={layers.terrace} onChange={e => setLayers({...layers, terrace: e.target.checked})} className="accent-cyan-500" />
              Terrace Roof
            </label>
            <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer hover:text-white">
              <input type="checkbox" checked={layers.upper} onChange={e => setLayers({...layers, upper: e.target.checked})} className="accent-cyan-500" />
              Upper Floor
            </label>
            <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer hover:text-white">
              <input type="checkbox" checked={layers.ground} onChange={e => setLayers({...layers, ground: e.target.checked})} className="accent-cyan-500" />
              Ground Floor
            </label>
          </div>
        </div>

        {/* Floating Customization Panel (Left Side) */}
        <div 
          className="absolute top-10 bottom-10 left-10 w-[22rem] flex flex-col gap-4 pointer-events-auto overflow-y-auto custom-scrollbar pr-2"
          onPointerDown={(e) => e.stopPropagation()}
          onPointerUp={(e) => e.stopPropagation()}
          onPointerMove={(e) => e.stopPropagation()}
          onWheel={(e) => e.stopPropagation()}
        >
          {/* Environment Simulation */}
          <div className="bg-[#2b303b] backdrop-blur-2xl border border-slate-700/50 rounded-2xl p-5 shadow-2xl shrink-0 w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Sun className="w-3.5 h-3.5 text-cyan-400" /> Environment Simulation
              </h3>
            </div>

            {!solarSettings.isLiveMode ? (
              <div className="grid grid-cols-5 gap-2 mb-4">
                {[
                  { id: 'clear', label: 'Daylight', icon: <Sun className="w-4 h-4" /> },
                  { id: 'night', label: 'Night Ops', icon: <Moon className="w-4 h-4" /> },
                  { id: 'heatwave', label: 'Desert', icon: <ThermometerSun className="w-4 h-4" /> },
                  { id: 'partlyCloudy', label: 'Arctic', icon: <CloudSun className="w-4 h-4" /> },
                  { id: 'monsoon', label: 'Disaster Zone', icon: <CloudRain className="w-4 h-4" /> }
                ].map(env => (
                  <button
                    key={env.id}
                    onClick={() => setSolarSettings(s => ({...s, weather: env.id as any}))}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${
                      solarSettings.weather === env.id 
                        ? 'bg-transparent border-cyan-500 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.15)]' 
                        : 'bg-[#1e222a] border-slate-800 text-slate-500 hover:bg-[#252a34] hover:text-slate-300'
                    }`}
                  >
                    <div className="mb-2 opacity-80">{env.icon}</div>
                    <span className="text-[9px] font-bold uppercase tracking-wider text-center leading-tight">{env.label}</span>
                  </button>
                ))}
              </div>
            ) : null}

            <div className="space-y-4 mb-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-[9px] font-mono text-slate-500 uppercase tracking-widest flex items-center gap-1">
                    <Clock className="w-3 h-3" /> Time of Day (24h)
                  </label>
                  <span className="text-xs font-bold text-cyan-400">{Math.floor(solarSettings.timeOfDay).toString().padStart(2, '0')}:00</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="23" 
                  value={solarSettings.timeOfDay}
                  onChange={(e) => setSolarSettings(s => ({...s, timeOfDay: parseInt(e.target.value)}))}
                  className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-cyan-500 [&::-webkit-slider-thumb]:rounded-full"
                />
              </div>
            </div>

            <div className="flex bg-[#1e222a] p-1 rounded-lg border border-slate-800 mt-2">
              <button onClick={() => setRenderMode('realistic')} className={`flex-1 py-1.5 text-[11px] font-semibold rounded-md transition-colors ${renderMode === 'realistic' ? 'bg-[#00a8cc] text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>PBR Lit</button>
              <button onClick={() => setRenderMode('wireframe')} className={`flex-1 py-1.5 text-[11px] font-semibold rounded-md transition-colors ${renderMode === 'wireframe' ? 'bg-slate-700 text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>Wireframe</button>
              <button onClick={() => setRenderMode('thermal')} className={`flex-1 py-1.5 text-[11px] font-semibold rounded-md transition-colors ${renderMode === 'thermal' ? 'bg-slate-700 text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>Thermal</button>
            </div>
          </div>

          {/* Structural Assembly */}
          <div className="bg-[#2b303b] backdrop-blur-2xl border border-slate-700/50 rounded-2xl p-5 shadow-2xl shrink-0">
             <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Shield className="w-3.5 h-3.5 text-cyan-500" /> Structural Assembly
            </h3>
            
            <div className="mb-5">
              <div className="text-[9px] font-mono text-slate-500 uppercase tracking-widest mb-2 flex justify-between">
                <span>Terrace Finish</span>
                <span className="text-cyan-400">Albedo: {(activeRoof.albedo || 0).toFixed(2)}</span>
              </div>
              <div className="grid grid-cols-6 gap-1.5 mb-2">
                {ROOF_MATERIALS.map(roof => (
                  <button
                    key={roof.id}
                    onClick={() => setActiveRoof(roof)}
                    title={`${roof.name} (Albedo: ${roof.albedo})`}
                    className={`aspect-square rounded-md border transition-all flex items-center justify-center ${
                      activeRoof.id === roof.id ? 'border-cyan-400 scale-110 shadow-[0_0_10px_rgba(34,211,238,0.3)] z-10' : 'border-transparent hover:scale-105 hover:border-slate-500'
                    }`}
                    style={{ backgroundColor: roof.hex }}
                  />
                ))}
              </div>
              <div className="text-xs font-semibold text-white truncate">{activeRoof.name}</div>
            </div>

            <div>
              <div className="text-[9px] font-mono text-slate-500 uppercase tracking-widest mb-2 flex justify-between">
                <span>Wall Assembly</span>
                <span className="text-cyan-400">R-{(activeWall.rValue || 0).toFixed(1)}/in</span>
              </div>
              <div className="grid grid-cols-6 gap-1.5 mb-2">
                {WALL_MATERIALS.map(wall => (
                  <button
                    key={wall.id}
                    onClick={() => setActiveWall(wall)}
                    title={`${wall.name} (R-${wall.rValue})`}
                    className={`aspect-square rounded-md border transition-all flex items-center justify-center ${
                      activeWall.id === wall.id ? 'border-cyan-400 scale-110 shadow-[0_0_10px_rgba(34,211,238,0.3)] z-10' : 'border-transparent hover:scale-105 hover:border-slate-500'
                    }`}
                    style={{ backgroundColor: wall.hex }}
                  />
                ))}
              </div>
              <div className="text-xs font-semibold text-white truncate">{activeWall.name}</div>
            </div>
          </div>

          {/* Thermal Physics Telemetry */}
          <div className="bg-[#2b303b] backdrop-blur-2xl border border-slate-700/50 rounded-2xl p-5 shadow-2xl shrink-0">
             <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Activity className="w-3.5 h-3.5 text-cyan-500" /> Thermal Physics Telemetry
            </h3>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-900/50 p-3 rounded-xl border border-slate-700/50 flex flex-col justify-between">
                <div className="flex items-center gap-2 mb-2">
                  <CloudSun className="w-4 h-4 text-slate-400" />
                  <span className="text-[9px] text-slate-400 uppercase tracking-wider font-mono">Ambient Outside</span>
                </div>
                <div className="flex items-end justify-between">
                  <span className="text-2xl font-bold text-white tracking-tighter">{currentTemp}°</span>
                  <span className="text-[10px] text-slate-500 mb-1">C</span>
                </div>
              </div>

              <div className="bg-cyan-950/30 p-3 rounded-xl border border-cyan-800/50 flex flex-col justify-between relative overflow-hidden group">
                <div className="flex items-center gap-2 mb-2 relative z-10">
                  <Thermometer className="w-4 h-4 text-cyan-400" />
                  <span className="text-[9px] text-cyan-400 uppercase tracking-wider font-mono">Est. Indoor Temp</span>
                </div>
                <div className="flex items-end justify-between relative z-10">
                  <span className="text-2xl font-bold text-cyan-50 tracking-tighter">{indoorTemp}°</span>
                  <span className="text-[10px] text-cyan-500 mb-1">C</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Drawer Handle */}
        <div className={`absolute bottom-0 left-1/2 -translate-x-1/2 transition-transform duration-500 z-40 ${isDrawerOpen ? 'translate-y-full' : 'translate-y-0'}`}>
          <button 
            onClick={() => setIsDrawerOpen(true)}
            className="flex flex-col items-center gap-1 bg-black/60 backdrop-blur-md px-8 py-3 rounded-t-2xl border border-slate-700/50 border-b-0 text-cyan-400 hover:text-cyan-300 hover:bg-black/80 transition-all group"
          >
            <ChevronUp className="w-5 h-5 group-hover:-translate-y-1 transition-transform" />
            <span className="text-[10px] font-bold tracking-[0.2em] uppercase">Pull Up for Schematics</span>
          </button>
        </div>

        {/* BOTTOM DRAWER (Blueprint & Catalogue) */}
        <div className={`absolute bottom-0 left-0 w-full h-[85vh] bg-[#0a0a0a]/95 backdrop-blur-3xl border-t border-slate-700/80 transform transition-transform duration-500 ease-in-out z-50 overflow-y-auto ${isDrawerOpen ? 'translate-y-0' : 'translate-y-full'}`}>
          <div className="w-full max-w-6xl mx-auto px-6 py-8">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-cyan-950/50 rounded-2xl border border-cyan-800/50 flex items-center justify-center">
                  <Box className="w-6 h-6 text-cyan-400" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white tracking-widest uppercase">Duplex Architectural Blueprint</h2>
                  <p className="text-slate-500 text-sm">Review spatial constraints and material catalogues.</p>
                </div>
              </div>
              <button 
                onClick={() => setIsDrawerOpen(false)}
                className="p-3 bg-slate-800/50 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="w-full bg-black border border-slate-800 rounded-3xl p-4 shadow-2xl relative group overflow-hidden mb-6">
              <div className="absolute top-0 left-0 w-full h-1 bg-cyan-500/50 blur-[2px] opacity-0 group-hover:opacity-100 group-hover:animate-[scan_3s_ease-in-out_infinite] z-20 pointer-events-none"></div>
              <div className="relative w-full h-[50vh] bg-stone-900 rounded-2xl overflow-hidden flex items-center justify-center">
                <img 
                  src="/duplex_blueprint.jpg?v=2" 
                  alt="2D Blueprint Schematic" 
                  className="w-full h-full object-contain opacity-90 mix-blend-screen transition-transform duration-700 group-hover:scale-105"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.parentElement!.innerHTML = '<div class="text-slate-500 text-center"><p class="text-xl font-bold mb-2">Blueprint Visualization Pending</p><p class="text-sm">Please generate or upload the 2D CAD floor plan.</p></div>';
                  }}
                />
              </div>
            </div>

            <div className="flex justify-center gap-4 mb-12">
              <a 
                href="/duplex_blueprint.jpg"
                download="duplex_blueprint.jpg"
                className="flex items-center justify-center gap-2 px-8 py-3 bg-slate-800/80 border border-slate-700 hover:bg-slate-700 hover:border-slate-500 text-slate-300 font-bold text-xs tracking-wider uppercase rounded-xl transition-all"
              >
                <Download className="w-4 h-4" />
                Download Blueprint
              </a>
              <button 
                onClick={() => onViewCatalogue?.(activeWall.id, activeRoof.id)}
                className="flex items-center justify-center gap-2 px-8 py-3 bg-cyan-900/40 border border-cyan-800/50 hover:bg-cyan-800/60 text-cyan-400 font-bold text-xs tracking-wider uppercase rounded-xl transition-all"
              >
                <Library className="w-4 h-4" />
                Product Catalogue
              </button>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
