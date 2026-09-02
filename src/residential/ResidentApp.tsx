// @ts-nocheck
import React, { useState, useRef } from 'react';
import { Toolbar } from './components/Toolbar';
import { ThreeCanvas } from './components/ThreeCanvas';
import { SolarSimulator } from './components/SolarSimulator';
import { LayerControls } from './components/LayerControls';
import { MetricsPanel } from './components/MetricsPanel';
import { MaterialsPanel, ROOF_MATERIALS, WALL_MATERIALS } from './components/MaterialsPanel';
import type { MaterialOption } from './components/MaterialsPanel';
import weatherSnapshots from '../assets/weather_snapshots.json';
import type {} from './types';
import { 
  X, 
  Info, 
  ChevronRight, 
  ChevronLeft, 
  Maximize2, 
  Sparkles, 
  Compass, 
  SlidersHorizontal,
  Download,
  Sun,
  CloudSun,
  CloudRain,
  Sunset,
  ThermometerSun,
  Shield,
  Activity,
  MapPin,
  Clock,
  Thermometer,
  Wind,
  Droplets,
  ArrowLeft,
  Box,
  Share2,
  Library,
  ChevronUp,
  Moon
} from 'lucide-react';

export interface ResidentAppProps {
  onViewCatalogue?: (wallId: string, roofId: string) => void;
}

export function ResidentApp({ onViewCatalogue }: ResidentAppProps) {
  const [viewPreset, setViewPreset] = useState<ViewPreset>('isometric');
  const [renderMode, setRenderMode] = useState<RenderMode>('realistic');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeSidebarTab, setActiveSidebarTab] = useState<'solar' | 'layers' | 'data' | 'materials'>('solar');

  const [activeRoof, setActiveRoof] = useState<MaterialOption>(ROOF_MATERIALS[0]);
  const [activeWall, setActiveWall] = useState<MaterialOption>(WALL_MATERIALS[0]);

  const [solarSettings, setSolarSettings] = useState<SolarSettings>({
    timeOfDay: 14.0, // 2:00 PM
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

  // Automatically fetch live weather data when isLiveMode or time changes
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

  const [layers, setLayers] = useState<InspectionLayers>({
    roof: true,
    walls: true,
    windows: true,
    interior: true,
    foundation: true,
    dimensions: true,
    ventilationFlow: false,
    roofLift: 0,
  });

  const [selectedComponent, setSelectedComponent] = useState<{
    title: string;
    desc: string;
    metrics: string[];
  } | null>(null);

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Thermodynamics Calculation
  const { currentTemp, currentRadiation, indoorTemp, solarGain, heatLoss } = React.useMemo(() => {
    let baseT = 25; // default base temp
    let solarInt = 0;

    if (solarSettings.isLiveMode && solarSettings.liveLocation && solarSettings.liveTemp) {
      baseT = solarSettings.liveTemp;
      solarInt = solarSettings.liveSolarIntensity || 0;
    } else {
      // Fake some preset temps
      switch(solarSettings.weather) {
        case 'clear': baseT = 28; solarInt = 800; break;
        case 'partlyCloudy': baseT = 15; solarInt = 400; break;
        case 'heatwave': baseT = 42; solarInt = 1000; break;
        case 'monsoon': baseT = 24; solarInt = 150; break;
        case 'goldenHour': baseT = 20; solarInt = 200; break;
      }
    }

    const baseSolarGain = (solarInt * (1 - (activeRoof.albedo || 0.5))) / 100;
    const targetTemp = 24;
    const tempDelta = baseT - targetTemp;
    const wallRValue = activeWall.rValue || 1.0;
    const insulationFactor = Math.min(wallRValue / 10, 0.9); 
    const heatFromSun = baseSolarGain * (1 - insulationFactor); 
    
    let indTemp = baseT - (tempDelta * insulationFactor) + heatFromSun;
    if (activeWall.id === 'wall-ceb' && solarInt > 500) indTemp -= 3;

    const hLoss = (Math.abs(tempDelta) * 5) / (activeWall.rValue || 1.0);

    return {
      currentTemp: baseT.toFixed(1),
      currentRadiation: solarInt.toFixed(1),
      indoorTemp: indTemp.toFixed(1),
      solarGain: baseSolarGain.toFixed(1),
      heatLoss: hLoss.toFixed(1)
    };
  }, [solarSettings, activeRoof, activeWall]);

  const handleCaptureScreenshot = () => {
    const canvas = document.querySelector('#thermoshelter-webgl-canvas canvas') as HTMLCanvasElement;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `ThermoShelter_Passive_House_${viewPreset}_${renderMode}.png`;
    a.click();
  };

  return (
    <div className="flex flex-col w-screen h-screen bg-stone-950 text-stone-100 overflow-hidden font-sans select-none">
      {/* Main 3D Viewport + Floating Tool Panels */}
      <div className="relative flex-1 w-full h-full overflow-hidden bg-stone-900">
        {/* 3D WebGL Canvas */}
        <ThreeCanvas
          viewPreset={viewPreset}
          renderMode={renderMode}
          solarSettings={solarSettings}
          layers={layers}
          onSelectComponent={setSelectedComponent}
          activeRoof={activeRoof}
          activeWall={activeWall}
        />

        {/* Viewport Control Badges (Bottom Left) */}
        <div className="absolute bottom-4 left-4 z-10 flex flex-wrap items-center gap-2 pointer-events-auto">
          <div className="bg-stone-900/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-stone-700/80 text-xs text-stone-300 shadow-lg flex items-center gap-3">
            <span className="flex items-center gap-1.5 font-medium">
              <Compass className="w-3.5 h-3.5 text-teal-400" />
              <span>Orbit: Drag | Pan: Right-Click | Zoom: Wheel</span>
            </span>
            <span className="w-px h-3 bg-stone-700"></span>
            <span className="text-stone-400 text-[11px]">Click building parts to inspect</span>
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
              
              <div className="flex items-center bg-slate-900/80 rounded-lg p-1 border border-slate-700/50">
                <button
                  onClick={() => setSolarSettings(s => ({...s, isLiveMode: false}))}
                  className={`px-3 py-1 rounded text-[10px] font-bold uppercase tracking-wider transition-colors ${!solarSettings.isLiveMode ? 'bg-[#3b414f] text-white' : 'text-slate-400 hover:text-slate-300'}`}
                >
                  Presets
                </button>
                <button
                  onClick={() => setSolarSettings(s => ({...s, isLiveMode: true}))}
                  className={`px-3 py-1 rounded text-[10px] font-bold uppercase tracking-wider transition-colors flex items-center gap-1 ${solarSettings.isLiveMode ? 'bg-cyan-900/80 text-cyan-300 border border-cyan-500/50' : 'text-slate-400 hover:text-slate-300'}`}
                >
                  <Activity className="w-3 h-3" /> Live Data
                </button>
              </div>
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
            ) : (
              <div className="space-y-4 mb-4">
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="text-[9px] font-mono text-slate-500 uppercase tracking-widest mb-1 block">Location / Dataset</label>
                    <div className="relative">
                      <MapPin className="w-3 h-3 absolute left-3 top-1/2 -translate-y-1/2 text-cyan-500" />
                      <select 
                        className="w-full bg-slate-900/80 border border-slate-700 rounded-lg pl-8 pr-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 appearance-none cursor-pointer"
                        value={solarSettings.liveLocation}
                        onChange={(e) => setSolarSettings(s => ({...s, liveLocation: e.target.value}))}
                      >
                        <option value="leh">Leh, Ladakh</option>
                        <option value="jaipur">Jaipur, Rajasthan</option>
                        <option value="cherrapunji">Cherrapunji, Meghalaya</option>
                        <option value="chennai">Chennai, Tamil Nadu</option>
                        <option value="nagpur">Nagpur, Maharashtra</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex-1">
                    <label className="text-[9px] font-mono text-slate-500 uppercase tracking-widest mb-1 block">Real-time Metrics</label>
                    <div className="bg-slate-900/50 border border-slate-800 rounded-lg px-3 py-1.5 flex justify-between items-center h-[34px]">
                       <span className="text-xs font-bold text-white">{solarSettings.liveTemp || 0}°C</span>
                       <span className="text-[10px] text-orange-400">{solarSettings.liveSolarIntensity || 0} W/m²</span>
                    </div>
                  </div>
                </div>
                
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

            <div className="flex bg-[#1e222a] p-1 rounded-lg border border-slate-800 mt-2">
              <button onClick={() => setRenderMode('realistic')} className={`flex-1 py-1.5 text-[11px] font-semibold rounded-md transition-colors ${renderMode === 'realistic' ? 'bg-[#00a8cc] text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>PBR Lit</button>
              <button onClick={() => setRenderMode('wireframe')} className={`flex-1 py-1.5 text-[11px] font-semibold rounded-md transition-colors ${renderMode === 'wireframe' ? 'bg-slate-700 text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>Wireframe</button>
              <button onClick={() => setRenderMode('thermal')} className={`flex-1 py-1.5 text-[11px] font-semibold rounded-md transition-colors ${renderMode === 'thermal' ? 'bg-slate-700 text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>Thermal</button>
              <button onClick={() => setRenderMode('xray')} className={`flex-1 py-1.5 text-[11px] font-semibold rounded-md transition-colors ${renderMode === 'xray' ? 'bg-slate-700 text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>X-Ray</button>
            </div>
          </div>

          {/* Structural Assembly */}
          <div className="bg-[#2b303b] backdrop-blur-2xl border border-slate-700/50 rounded-2xl p-5 shadow-2xl shrink-0">
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
              <div className="text-[10px] text-slate-400 truncate">{activeWall.desc}</div>
            </div>
          </div>

          {/* Thermal Physics Telemetry */}
          <div className="bg-[#2b303b] backdrop-blur-2xl border border-slate-700/50 rounded-2xl p-5 shadow-2xl shrink-0">
             <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Activity className="w-3.5 h-3.5 text-cyan-500" /> Thermal Physics Telemetry
            </h3>
            
            <div className="grid grid-cols-2 gap-3">
              {/* Ambient Outside */}
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

              {/* Est Indoor Temp */}
              <div className="bg-cyan-950/30 p-3 rounded-xl border border-cyan-800/50 flex flex-col justify-between relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-16 h-16 bg-cyan-500/10 rounded-full blur-xl -mr-4 -mt-4 transition-transform group-hover:scale-150"></div>
                <div className="flex items-center gap-2 mb-2 relative z-10">
                  <Thermometer className="w-4 h-4 text-cyan-400" />
                  <span className="text-[9px] text-cyan-400 uppercase tracking-wider font-mono">Est. Indoor Temp</span>
                </div>
                <div className="flex items-end justify-between relative z-10">
                  <span className="text-2xl font-bold text-cyan-50 tracking-tighter">{indoorTemp}°</span>
                  <span className="text-[10px] text-cyan-500 mb-1">C</span>
                </div>
              </div>

              {/* Solar Heat Gain */}
              <div className="bg-orange-950/30 p-3 rounded-xl border border-orange-900/50 flex flex-col justify-between">
                <div className="flex items-center gap-2 mb-2">
                  <Sun className="w-4 h-4 text-orange-400" />
                  <span className="text-[9px] text-orange-400/80 uppercase tracking-wider font-mono">Solar Heat Gain</span>
                </div>
                <div className="flex items-end justify-between">
                  <span className="text-xl font-bold text-orange-50 tracking-tighter">{solarGain}</span>
                  <span className="text-[10px] text-orange-500/80 mb-1">kWh/day</span>
                </div>
              </div>

              {/* Heat Loss Rate */}
              <div className="bg-blue-950/30 p-3 rounded-xl border border-blue-900/50 flex flex-col justify-between">
                <div className="flex items-center gap-2 mb-2">
                  <Wind className="w-4 h-4 text-blue-400" />
                  <span className="text-[9px] text-blue-400/80 uppercase tracking-wider font-mono">Heat Loss Rate</span>
                </div>
                <div className="flex items-end justify-between">
                  <span className="text-xl font-bold text-blue-50 tracking-tighter">{heatLoss}</span>
                  <span className="text-[10px] text-blue-500/80 mb-1">W/m²K</span>
                </div>
              </div>
            </div>
          </div>

        </div>


        {/* Selected Component Inspection Overlay Modal */}
        {selectedComponent && (
          <div className="absolute bottom-6 right-6 sm:right-auto sm:left-1/2 sm:-translate-x-1/2 max-w-lg w-full bg-stone-900/95 border border-teal-600/70 p-4 rounded-xl shadow-2xl backdrop-blur-md z-30 animate-in fade-in slide-in-from-bottom-2">
            <div className="flex items-start justify-between gap-3 mb-2">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-teal-400 animate-pulse" />
                <h4 className="text-sm font-semibold text-white">
                  {selectedComponent.title}
                </h4>
              </div>
              <button
                id="btn-close-component-modal"
                onClick={() => setSelectedComponent(null)}
                className="text-stone-400 hover:text-white p-1 rounded-md hover:bg-stone-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-stone-300 leading-relaxed mb-3">
              {selectedComponent.desc}
            </p>

            <div className="grid grid-cols-2 gap-1.5 bg-stone-950/80 p-2 rounded-lg border border-stone-800 text-[11px] font-mono">
              {selectedComponent.metrics.map((metric, idx) => (
                <div key={idx} className="text-teal-300">
                  • {metric}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bottom Drawer Handle */}
        <div 
          className={`absolute bottom-0 left-1/2 -translate-x-1/2 transition-transform duration-500 z-40 ${isDrawerOpen ? 'translate-y-full' : 'translate-y-0'}`}
        >
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
            
            {/* Drawer Header */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-cyan-950/50 rounded-2xl border border-cyan-800/50 flex items-center justify-center">
                  <Box className="w-6 h-6 text-cyan-400" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white tracking-widest uppercase">Architectural Blueprint</h2>
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

            {/* Blueprint Viewer */}
            <div className="w-full bg-black border border-slate-800 rounded-3xl p-4 shadow-2xl relative group overflow-hidden mb-6">
              <div className="absolute top-0 left-0 w-full h-1 bg-cyan-500/50 blur-[2px] opacity-0 group-hover:opacity-100 group-hover:animate-[scan_3s_ease-in-out_infinite] z-20 pointer-events-none"></div>
              <div className="relative w-full h-[50vh] bg-stone-900 rounded-2xl overflow-hidden flex items-center justify-center">
                <img 
                  src="/residential_blueprint.jpg" 
                  alt="2D Blueprint Schematic" 
                  className="w-full h-full object-contain opacity-90 mix-blend-screen transition-transform duration-700 group-hover:scale-105"
                  onError={(e) => {
                    // Fallback to text if image not found
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.parentElement!.innerHTML = '<div class="text-slate-500 text-center"><p class="text-xl font-bold mb-2">Blueprint Visualization Pending</p><p class="text-sm">Please generate or upload the 2D CAD floor plan.</p></div>';
                  }}
                />
              </div>
            </div>

            <div className="flex justify-center gap-4 mb-12">
              <a 
                href="/residential_blueprint.jpg"
                download="residential_blueprint.jpg"
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




