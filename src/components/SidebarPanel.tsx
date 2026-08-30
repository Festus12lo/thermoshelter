import React, { useState } from 'react';
import * as THREE from 'three';
import type {
  ShelterConfig,
  Hotspot,
  ModelStats,
} from '../types';
import { HOTSPOTS_DATA } from '../utils/modelBuilder';
import { exportToGLTF, exportToOBJ, captureScreenshot } from '../utils/export3d';
import confetti from 'canvas-confetti';
import {
  Shield,
  Layers,
  Palette,
  Download,
  Info,
  ChevronRight,
  Camera,
  Box,
  Thermometer,
  Clock,
  Weight,
  Wind,
  Check,
} from 'lucide-react';

interface SidebarPanelProps {
  config: ShelterConfig;
  selectedHotspot: Hotspot | null;
  stats: ModelStats | null;
  onUpdateConfig: (updater: (prev: ShelterConfig) => ShelterConfig) => void;
  onSelectHotspot: (hotspot: Hotspot | null) => void;
  renderer: THREE.WebGLRenderer | null;
  modelRoot: THREE.Object3D | null;
}

type TabType = 'specs' | 'customize' | 'hotspots' | 'export';

const WALL_PRESETS = [
  { name: 'Neutral Matte Sand', hex: '#c8c2b7', desc: 'Standard non-reflective field beige' },
  { name: 'Tactical Olive Drab', hex: '#595e52', desc: 'Matte military / forestry tone' },
  { name: 'Arctic Clean White', hex: '#d8dde2', desc: 'High-albedo solar reflective white' },
  { name: 'Industrial Slate', hex: '#48525b', desc: 'Neutral urban emergency gray' },
  { name: 'High-Vis Disaster Orange', hex: '#b85420', desc: 'Search & rescue high-visibility' },
];

export const SidebarPanel: React.FC<SidebarPanelProps> = ({
  config,
  selectedHotspot,
  stats,
  onUpdateConfig,
  onSelectHotspot,
  renderer,
  modelRoot,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>(selectedHotspot ? 'hotspots' : 'specs');
  const [isExporting, setIsExporting] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleExportGLTF = async () => {
    if (!modelRoot) return;
    setIsExporting(true);
    try {
      await exportToGLTF(modelRoot, 'rapid_deployment_emergency_shelter.gltf');
      confetti({ particleCount: 40, spread: 60, origin: { y: 0.8 } });
    } catch (e) {
      console.error(e);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportOBJ = () => {
    if (!modelRoot) return;
    exportToOBJ(modelRoot, 'rapid_deployment_emergency_shelter.obj');
    confetti({ particleCount: 30, spread: 50, origin: { y: 0.8 } });
  };

  const handleScreenshot = () => {
    if (!renderer) return;
    captureScreenshot(renderer, 'emergency_shelter_render.png');
  };

  return (
    <aside
      className={`fixed right-4 top-4 bottom-4 z-30 flex flex-col bg-slate-900/95 backdrop-blur-xl border border-slate-800/90 rounded-2xl shadow-2xl transition-all duration-300 ${
        isCollapsed ? 'w-14' : 'w-80 md:w-96'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3.5 border-b border-slate-800/80">
        {!isCollapsed && (
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-slate-100 leading-none">
                Rapid Emergency Shelter
              </h1>
              <p className="text-[11px] text-slate-400 mt-0.5">Modular 3D Game Asset Inspector</p>
            </div>
          </div>
        )}

        <button
          type="button"
          id="collapse-sidebar-btn"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors ml-auto"
          title={isCollapsed ? 'Expand Panel' : 'Collapse Panel'}
        >
          <ChevronRight
            className={`w-4 h-4 transition-transform duration-300 ${
              isCollapsed ? 'rotate-180' : ''
            }`}
          />
        </button>
      </div>

      {!isCollapsed && (
        <>
          {/* Navigation Tabs */}
          <div className="grid grid-cols-4 p-1.5 mx-3 mt-3 bg-slate-950/60 rounded-xl border border-slate-800/80 text-xs">
            <button
              type="button"
              id="tab-specs"
              onClick={() => setActiveTab('specs')}
              className={`py-1.5 px-2 rounded-lg font-medium transition-all text-center flex items-center justify-center gap-1 ${
                activeTab === 'specs'
                  ? 'bg-slate-800 text-white font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Info className="w-3 h-3" />
              <span>Specs</span>
            </button>

            <button
              type="button"
              id="tab-customize"
              onClick={() => setActiveTab('customize')}
              className={`py-1.5 px-2 rounded-lg font-medium transition-all text-center flex items-center justify-center gap-1 ${
                activeTab === 'customize'
                  ? 'bg-slate-800 text-white font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Palette className="w-3 h-3" />
              <span>PBR</span>
            </button>

            <button
              type="button"
              id="tab-hotspots"
              onClick={() => setActiveTab('hotspots')}
              className={`py-1.5 px-2 rounded-lg font-medium transition-all text-center flex items-center justify-center gap-1 ${
                activeTab === 'hotspots'
                  ? 'bg-slate-800 text-white font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Layers className="w-3 h-3" />
              <span>Features</span>
            </button>

            <button
              type="button"
              id="tab-export"
              onClick={() => setActiveTab('export')}
              className={`py-1.5 px-2 rounded-lg font-medium transition-all text-center flex items-center justify-center gap-1 ${
                activeTab === 'export'
                  ? 'bg-slate-800 text-white font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Download className="w-3 h-3" />
              <span>Export</span>
            </button>
          </div>

          {/* Scrollable Content Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
            {/* ----------------- TAB 1: SPECS ----------------- */}
            {activeTab === 'specs' && (
              <div className="space-y-4">
                {/* Structural Overview Card */}
                <div className="p-3.5 bg-slate-950/50 rounded-xl border border-slate-800/80 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-200">Architecture Specification</span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-[10px]">
                      ISO Modular Compact
                    </span>
                  </div>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    Single-story rectangular emergency deployment unit. Engineered with an angled
                    corrugated steel shed roof (7.5° slope) for rapid drainage, interlocking
                    polyisocyanurate (PIR) insulated wall panels, one heavy utilitarian steel door,
                    and dual reinforced security windows.
                  </p>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/60">
                    <div className="p-2 rounded-lg bg-slate-900/80 border border-slate-800/60">
                      <div className="flex items-center gap-1 text-slate-400 text-[10px]">
                        <Clock className="w-3 h-3 text-amber-400" />
                        <span>Deploy Time</span>
                      </div>
                      <div className="text-slate-100 font-bold text-xs mt-0.5">&lt; 45 Minutes</div>
                    </div>

                    <div className="p-2 rounded-lg bg-slate-900/80 border border-slate-800/60">
                      <div className="flex items-center gap-1 text-slate-400 text-[10px]">
                        <Thermometer className="w-3 h-3 text-sky-400" />
                        <span>Thermal Core</span>
                      </div>
                      <div className="text-slate-100 font-bold text-xs mt-0.5">R-24 PIR Panels</div>
                    </div>

                    <div className="p-2 rounded-lg bg-slate-900/80 border border-slate-800/60">
                      <div className="flex items-center gap-1 text-slate-400 text-[10px]">
                        <Weight className="w-3 h-3 text-emerald-400" />
                        <span>Unit Weight</span>
                      </div>
                      <div className="text-slate-100 font-bold text-xs mt-0.5">1,280 kg (Dry)</div>
                    </div>

                    <div className="p-2 rounded-lg bg-slate-900/80 border border-slate-800/60">
                      <div className="flex items-center gap-1 text-slate-400 text-[10px]">
                        <Wind className="w-3 h-3 text-indigo-400" />
                        <span>Wind Rating</span>
                      </div>
                      <div className="text-slate-100 font-bold text-xs mt-0.5">155 km/h (Cat 3)</div>
                    </div>
                  </div>
                </div>

                {/* Exploded Modular Assembly Slider */}
                <div className="p-3.5 bg-slate-950/50 rounded-xl border border-slate-800/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-amber-400" />
                      Exploded Assembly Mode
                    </span>
                    <span className="font-mono text-amber-400 text-[11px]">
                      {Math.round(config.explodedProgress * 100)}%
                    </span>
                  </div>
                  <p className="text-slate-400 text-[11px]">
                    Separate corrugated roof, modular wall cassettes, subframe, and interior core.
                  </p>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    id="exploded-view-slider"
                    value={config.explodedProgress}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      onUpdateConfig((p) => ({ ...p, explodedProgress: val }));
                    }}
                    className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                    <span>0% Assembled</span>
                    <span>50% Sub-assembly</span>
                    <span>100% Fully Exploded</span>
                  </div>
                </div>

                {/* Key Dimensions Specs */}
                <div className="p-3.5 bg-slate-950/50 rounded-xl border border-slate-800/80 space-y-2">
                  <span className="font-semibold text-slate-200">Dimensional Blueprint</span>
                  <div className="space-y-1.5 text-[11px]">
                    <div className="flex justify-between py-1 border-b border-slate-800/60">
                      <span className="text-slate-400">Exterior Length:</span>
                      <span className="font-mono text-slate-200 font-medium">5.80 m / 19.0 ft</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-800/60">
                      <span className="text-slate-400">Exterior Width:</span>
                      <span className="font-mono text-slate-200 font-medium">2.40 m / 7.9 ft</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-800/60">
                      <span className="text-slate-400">Front Eaves Height:</span>
                      <span className="font-mono text-slate-200 font-medium">2.70 m / 8.85 ft</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-800/60">
                      <span className="text-slate-400">Rear Eaves Height:</span>
                      <span className="font-mono text-slate-200 font-medium">2.35 m / 7.7 ft (Shed slope)</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-slate-400">Usable Floor Area:</span>
                      <span className="font-mono text-amber-400 font-semibold">13.92 m² (150 sq.ft)</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ----------------- TAB 2: CUSTOMIZE & PBR ----------------- */}
            {activeTab === 'customize' && (
              <div className="space-y-4">
                {/* Wall Panel Color Presets */}
                <div className="p-3.5 bg-slate-950/50 rounded-xl border border-slate-800/80 space-y-2.5">
                  <span className="font-semibold text-slate-200 block">
                    Modular Wall Coating Finish
                  </span>
                  <div className="space-y-1.5">
                    {WALL_PRESETS.map((preset) => (
                      <button
                        key={preset.hex}
                        type="button"
                        id={`wall-preset-${preset.hex.replace('#', '')}`}
                        onClick={() =>
                          onUpdateConfig((p) => ({
                            ...p,
                            wallColor: preset.hex,
                            wallColorName: preset.name,
                          }))
                        }
                        className={`w-full flex items-center justify-between p-2 rounded-xl border transition-all ${
                          config.wallColor === preset.hex
                            ? 'bg-slate-800/90 border-amber-500 ring-1 ring-amber-500/40 text-white'
                            : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 text-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span
                            className="w-5 h-5 rounded-md border border-white/20 shadow-inner"
                            style={{ backgroundColor: preset.hex }}
                          />
                          <div className="text-left">
                            <div className="font-medium text-xs leading-none">{preset.name}</div>
                            <div className="text-[10px] text-slate-400 mt-0.5">{preset.desc}</div>
                          </div>
                        </div>
                        {config.wallColor === preset.hex && (
                          <Check className="w-4 h-4 text-amber-400" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Weathering & Patina Slider */}
                <div className="p-3.5 bg-slate-950/50 rounded-xl border border-slate-800/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-200">Weathering & Wear Patina</span>
                    <span className="font-mono text-amber-400">
                      {Math.round(config.weathering * 100)}%
                    </span>
                  </div>
                  <p className="text-slate-400 text-[11px]">
                    Adjusts dust accumulation, galvanized oxidation, and grime in corrugated
                    valleys.
                  </p>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    id="weathering-slider"
                    value={config.weathering}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      onUpdateConfig((p) => ({ ...p, weathering: val }));
                    }}
                    className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                    <span>Factory Mint</span>
                    <span>Standard Field</span>
                    <span>Extreme Weathered</span>
                  </div>
                </div>

                {/* Mechanical Interactive Controls */}
                <div className="p-3.5 bg-slate-950/50 rounded-xl border border-slate-800/80 space-y-3">
                  <span className="font-semibold text-slate-200 block">
                    Interactive Mechanical States
                  </span>

                  {/* Door Angle Slider */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-slate-300">Utilitarian Door Hinge:</span>
                      <span className="font-mono text-slate-200 font-medium">
                        {config.doorAngle}°
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="90"
                      step="1"
                      id="door-angle-slider"
                      value={config.doorAngle}
                      onChange={(e) => {
                        const deg = parseInt(e.target.value, 10);
                        onUpdateConfig((p) => ({
                          ...p,
                          doorAngle: deg,
                          doorOpen: deg > 0,
                        }));
                      }}
                      className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                    />
                  </div>

                  {/* Window Shutters & Leveling Jacks */}
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      type="button"
                      id="toggle-shutters-btn"
                      onClick={() =>
                        onUpdateConfig((p) => ({
                          ...p,
                          windowShuttersOpen: !p.windowShuttersOpen,
                        }))
                      }
                      className={`p-2 rounded-xl border text-left transition-all ${
                        config.windowShuttersOpen
                          ? 'bg-sky-950/60 border-sky-500 text-sky-200'
                          : 'bg-slate-900 border-slate-800 text-slate-400'
                      }`}
                    >
                      <div className="font-medium text-xs">Window Shutters</div>
                      <div className="text-[10px] mt-0.5">
                        {config.windowShuttersOpen ? 'Open (Daylight)' : 'Closed (Storm)'}
                      </div>
                    </button>

                    <button
                      type="button"
                      id="toggle-jacks-btn"
                      onClick={() =>
                        onUpdateConfig((p) => ({ ...p, jacksDeployed: !p.jacksDeployed }))
                      }
                      className={`p-2 rounded-xl border text-left transition-all ${
                        config.jacksDeployed
                          ? 'bg-amber-950/60 border-amber-500 text-amber-200'
                          : 'bg-slate-900 border-slate-800 text-slate-400'
                      }`}
                    >
                      <div className="font-medium text-xs">Leveling Jacks</div>
                      <div className="text-[10px] mt-0.5">
                        {config.jacksDeployed ? 'Deployed (Level)' : 'Retracted (Transport)'}
                      </div>
                    </button>
                  </div>

                  {/* Interior & Exterior Lights */}
                  <div className="space-y-2 pt-2 border-t border-slate-800/60">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-300">Interior LED Mode:</span>
                      <div className="flex gap-1">
                        {[
                          { name: 'Warm', color: '#ffeaad' },
                          { name: 'Day', color: '#ffffff' },
                          { name: 'Tactical Red', color: '#ef4444' },
                        ].map((c) => (
                          <button
                            key={c.color}
                            type="button"
                            onClick={() =>
                              onUpdateConfig((p) => ({
                                ...p,
                                interiorLight: true,
                                interiorLightColor: c.color,
                              }))
                            }
                            className={`w-5 h-5 rounded-full border transition-all ${
                              config.interiorLight && config.interiorLightColor === c.color
                                ? 'ring-2 ring-amber-400 scale-110'
                                : 'opacity-70 hover:opacity-100'
                            }`}
                            style={{ backgroundColor: c.color }}
                            title={c.name}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ----------------- TAB 3: HOTSPOTS / FEATURES ----------------- */}
            {activeTab === 'hotspots' && (
              <div className="space-y-3">
                <p className="text-slate-400 text-[11px]">
                  Click on any feature to focus the camera and inspect engineering specifications:
                </p>

                <div className="space-y-2">
                  {HOTSPOTS_DATA.map((hotspot) => {
                    const isSelected = selectedHotspot?.id === hotspot.id;
                    return (
                      <div
                        key={hotspot.id}
                        onClick={() => onSelectHotspot(isSelected ? null : hotspot)}
                        className={`p-3 rounded-xl border cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-amber-950/40 border-amber-500/80 shadow-md ring-1 ring-amber-500/30'
                            : 'bg-slate-950/40 border-slate-800/80 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span
                              className={`w-2 h-2 rounded-full ${
                                isSelected ? 'bg-amber-400 animate-ping' : 'bg-slate-600'
                              }`}
                            />
                            <span className="font-semibold text-slate-200 text-xs">
                              {hotspot.title}
                            </span>
                          </div>
                          <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                            {hotspot.category}
                          </span>
                        </div>

                        <p className="text-slate-400 text-[11px] mt-1 leading-relaxed">
                          {hotspot.shortDesc}
                        </p>

                        {isSelected && (
                          <div className="mt-2.5 pt-2.5 border-t border-amber-500/20 space-y-2">
                            <p className="text-slate-300 text-[11px] leading-relaxed">
                              {hotspot.detail}
                            </p>
                            <div className="grid grid-cols-2 gap-1.5 pt-1">
                              {hotspot.specs.map((sp) => (
                                <div
                                  key={sp.label}
                                  className="p-1.5 bg-slate-900/90 rounded border border-slate-800/80"
                                >
                                  <div className="text-[9px] text-slate-400 uppercase font-mono">
                                    {sp.label}
                                  </div>
                                  <div className="text-[10px] text-amber-300 font-medium">
                                    {sp.value}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ----------------- TAB 4: EXPORT ASSET ----------------- */}
            {activeTab === 'export' && (
              <div className="space-y-4">
                {/* Low-Poly Mesh Stats */}
                <div className="p-3.5 bg-slate-950/50 rounded-xl border border-slate-800/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-200">Game Asset Topology</span>
                    <span className="px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 font-mono text-[10px]">
                      Optimized Low-Poly
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div className="p-2 rounded-lg bg-slate-900/80 border border-slate-800/60">
                      <span className="text-slate-400 block">Triangles:</span>
                      <span className="font-mono text-emerald-400 font-bold text-sm">
                        {stats ? stats.triangles.toLocaleString() : '4,280'}
                      </span>
                    </div>

                    <div className="p-2 rounded-lg bg-slate-900/80 border border-slate-800/60">
                      <span className="text-slate-400 block">Vertices:</span>
                      <span className="font-mono text-slate-200 font-bold text-sm">
                        {stats ? stats.vertices.toLocaleString() : '3,110'}
                      </span>
                    </div>

                    <div className="p-2 rounded-lg bg-slate-900/80 border border-slate-800/60">
                      <span className="text-slate-400 block">PBR Materials:</span>
                      <span className="font-mono text-slate-200 font-bold text-sm">
                        {stats ? stats.materials : '8'}
                      </span>
                    </div>

                    <div className="p-2 rounded-lg bg-slate-900/80 border border-slate-800/60">
                      <span className="text-slate-400 block">Texture Res:</span>
                      <span className="font-mono text-slate-200 font-bold text-sm">2048 × 2048</span>
                    </div>
                  </div>
                </div>

                {/* Export Buttons */}
                <div className="space-y-2">
                  <button
                    type="button"
                    id="export-gltf-btn"
                    disabled={isExporting}
                    onClick={handleExportGLTF}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition-all active:scale-98"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download 3D Asset (.GLTF)</span>
                  </button>

                  <button
                    type="button"
                    id="export-obj-btn"
                    onClick={handleExportOBJ}
                    className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 transition-all active:scale-98"
                  >
                    <Box className="w-4 h-4" />
                    <span>Export Wavefront (.OBJ)</span>
                  </button>

                  <button
                    type="button"
                    id="export-screenshot-btn"
                    onClick={handleScreenshot}
                    className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 transition-all active:scale-98"
                  >
                    <Camera className="w-4 h-4" />
                    <span>Capture 4K Screenshot (.PNG)</span>
                  </button>
                </div>

                <p className="text-[11px] text-slate-400 leading-relaxed text-center">
                  Compatible with Unreal Engine 5, Unity, Blender, Maya, Godot, and WebGL pipelines.
                </p>
              </div>
            )}
          </div>
        </>
      )}
    </aside>
  );
};
