// @ts-nocheck
import React from 'react';
import type {  } from '../types';
import {
  Sun,
  Sunset,
  Moon,
  CloudRain,
  Compass,
  Layers,
  Eye,
  Maximize2,
  Minimize2,
  Box,
  RotateCw,
  DoorOpen,
  Sliders,
  Ruler,
  MapPin,
  Sparkles,
} from 'lucide-react';

interface ViewportControlsProps {
  config: ShelterConfig;
  renderMode: RenderMode;
  environment: EnvironmentPreset;
  cameraPreset: CameraPreset;
  autoRotate: boolean;
  onUpdateConfig: (updater: (prev: ShelterConfig) => ShelterConfig) => void;
  onSelectRenderMode: (mode: RenderMode) => void;
  onSelectEnvironment: (env: EnvironmentPreset) => void;
  onSelectCameraPreset: (preset: CameraPreset) => void;
  onToggleAutoRotate: () => void;
}

export const ViewportControls: React.FC<ViewportControlsProps> = ({
  config,
  renderMode,
  environment,
  cameraPreset,
  autoRotate,
  onUpdateConfig,
  onSelectRenderMode,
  onSelectEnvironment,
  onSelectCameraPreset,
  onToggleAutoRotate,
}) => {
  const envButtons: { id: EnvironmentPreset; label: string; icon: React.ReactNode }[] = [
    { id: 'day', label: 'Daylight', icon: <Sun className="w-3.5 h-3.5" /> },
    { id: 'golden', label: 'Golden Hour', icon: <Sunset className="w-3.5 h-3.5" /> },
    { id: 'night', label: 'Night Ops', icon: <Moon className="w-3.5 h-3.5" /> },
    { id: 'overcast', label: 'Disaster Zone', icon: <CloudRain className="w-3.5 h-3.5" /> },
    { id: 'desert', label: 'Desert', icon: <Compass className="w-3.5 h-3.5" /> },
    { id: 'arctic', label: 'Arctic', icon: <Sparkles className="w-3.5 h-3.5" /> },
  ];

  const renderModes: { id: RenderMode; label: string }[] = [
    { id: 'lit', label: 'PBR Lit' },
    { id: 'wireframe', label: 'Low-Poly Mesh' },
    { id: 'albedo', label: 'Albedo' },
    { id: 'normal', label: 'Normals' },
    { id: 'roughness', label: 'Roughness' },
    { id: 'metallic', label: 'Metallic' },
    { id: 'xray', label: 'X-Ray' },
  ];

  const cameraPresets: { id: CameraPreset; label: string }[] = [
    { id: 'hero', label: '3/4 ISO' },
    { id: 'front', label: 'Front (Door)' },
    { id: 'side', label: 'Side (Shed Slope)' },
    { id: 'roof', label: 'Roof Deck' },
    { id: 'door', label: 'Door Macro' },
    { id: 'window', label: 'Reinforced Window' },
    { id: 'interior', label: 'Interior' },
  ];

  return (
    <div 
      className="absolute top-4 left-4 right-4 z-20 pointer-events-none flex flex-col gap-2.5"
      onPointerDown={(e) => e.stopPropagation()}
      onPointerUp={(e) => e.stopPropagation()}
      onPointerMove={(e) => e.stopPropagation()}
      onWheel={(e) => e.stopPropagation()}
    >
      {/* Top Floating Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        {/* Environment & Lighting Presets */}
        <div className="pointer-events-auto flex items-center gap-1 p-1 bg-slate-900/90 backdrop-blur-md rounded-xl border border-slate-800 shadow-xl">
          <span className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase px-2">
            Atmosphere
          </span>
          {envButtons.map((env) => (
            <button
              key={env.id}
              id={`env-btn-${env.id}`}
              type="button"
              onClick={() => onSelectEnvironment(env.id)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                environment === env.id
                  ? 'bg-amber-500 text-slate-950 shadow-md font-semibold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
              }`}
            >
              {env.icon}
              <span className="hidden sm:inline">{env.label}</span>
            </button>
          ))}
        </div>

        {/* Viewport Render Channels */}
        <div className="pointer-events-auto flex items-center gap-1 p-1 bg-slate-900/90 backdrop-blur-md rounded-xl border border-slate-800 shadow-xl overflow-x-auto max-w-full">
          <Layers className="w-3.5 h-3.5 text-slate-400 ml-1.5" />
          <span className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase px-1">
            Pass
          </span>
          {renderModes.map((mode) => (
            <button
              key={mode.id}
              id={`render-mode-btn-${mode.id}`}
              type="button"
              onClick={() => onSelectRenderMode(mode.id)}
              className={`px-2 py-1 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                renderMode === mode.id
                  ? 'bg-sky-500 text-slate-950 font-semibold shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
              }`}
            >
              {mode.label}
            </button>
          ))}
        </div>
      </div>

      {/* Bottom Floating Toolbar */}
      <div className="pointer-events-auto flex flex-wrap items-center justify-between gap-2 mt-auto">
        {/* Camera Views */}
        <div className="flex items-center gap-1 p-1 bg-slate-900/90 backdrop-blur-md rounded-xl border border-slate-800 shadow-xl overflow-x-auto">
          <Eye className="w-3.5 h-3.5 text-slate-400 ml-1.5" />
          <span className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase px-1">
            Angle
          </span>
          {cameraPresets.map((cam) => (
            <button
              key={cam.id}
              id={`cam-preset-btn-${cam.id}`}
              type="button"
              onClick={() => onSelectCameraPreset(cam.id)}
              className={`px-2 py-1 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                cameraPreset === cam.id
                  ? 'bg-slate-100 text-slate-900 font-semibold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
              }`}
            >
              {cam.label}
            </button>
          ))}
        </div>

        {/* Quick Toggles */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-900/90 backdrop-blur-md rounded-xl border border-slate-800 shadow-xl">
          {/* Auto Rotate */}
          <button
            type="button"
            id="toggle-autorotate-btn"
            onClick={onToggleAutoRotate}
            title="Auto-rotate asset"
            className={`p-1.5 rounded-lg text-xs font-medium flex items-center gap-1 transition-all ${
              autoRotate
                ? 'bg-amber-500 text-slate-950 font-semibold'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
            }`}
          >
            <RotateCw className={`w-3.5 h-3.5 ${autoRotate ? 'animate-spin' : ''}`} />
            <span className="hidden md:inline">Turntable</span>
          </button>

          {/* Door Toggle */}
          <button
            type="button"
            id="toggle-door-btn"
            onClick={() =>
              onUpdateConfig((p) => ({
                ...p,
                doorOpen: !p.doorOpen,
                doorAngle: !p.doorOpen ? 85 : 0,
              }))
            }
            title="Open / Close Utilitarian Door"
            className={`p-1.5 rounded-lg text-xs font-medium flex items-center gap-1 transition-all ${
              config.doorOpen
                ? 'bg-emerald-500 text-slate-950 font-semibold'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
            }`}
          >
            <DoorOpen className="w-3.5 h-3.5" />
            <span className="hidden md:inline">{config.doorOpen ? 'Door (Open)' : 'Door'}</span>
          </button>

          {/* Roof Cutaway */}
          <button
            type="button"
            id="toggle-roof-cutaway-btn"
            onClick={() => onUpdateConfig((p) => ({ ...p, roofCutaway: !p.roofCutaway }))}
            title="Remove roof for interior inspection"
            className={`p-1.5 rounded-lg text-xs font-medium flex items-center gap-1 transition-all ${
              config.roofCutaway
                ? 'bg-indigo-500 text-white font-semibold'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
            }`}
          >
            <Box className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Cutaway</span>
          </button>

          {/* Hotspots Toggle */}
          <button
            type="button"
            id="toggle-hotspots-btn"
            onClick={() => onUpdateConfig((p) => ({ ...p, showHotspots: !p.showHotspots }))}
            title="Toggle interactive 3D hotspot callouts"
            className={`p-1.5 rounded-lg text-xs font-medium flex items-center gap-1 transition-all ${
              config.showHotspots
                ? 'bg-amber-400 text-slate-950 font-semibold'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Hotspots</span>
          </button>

          {/* Dimensions Toggle */}
          <button
            type="button"
            id="toggle-dimensions-btn"
            onClick={() => onUpdateConfig((p) => ({ ...p, showDimensions: !p.showDimensions }))}
            title="Toggle dimensional blueprint measurements"
            className={`p-1.5 rounded-lg text-xs font-medium flex items-center gap-1 transition-all ${
              config.showDimensions
                ? 'bg-sky-400 text-slate-950 font-semibold'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
            }`}
          >
            <Ruler className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Dimensions</span>
          </button>
        </div>
      </div>
    </div>
  );
};

