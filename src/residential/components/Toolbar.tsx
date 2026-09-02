// @ts-nocheck
import React from 'react';
import { 
  Eye, 
  Layers, 
  Sun, 
  Maximize2, 
  Sliders, 
  Home, 
  ArrowUp, 
  Box, 
  Activity, 
  FileText, 
  Wind, 
  Ruler, 
  Camera
} from 'lucide-react';
import type {} from '../types';

interface ToolbarProps {
  viewPreset: ViewPreset;
  setViewPreset: (preset: ViewPreset) => void;
  renderMode: RenderMode;
  setRenderMode: (mode: RenderMode) => void;
  layers: InspectionLayers;
  setLayers: React.Dispatch<React.SetStateAction<InspectionLayers>>;
  onCaptureScreenshot: () => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  viewPreset,
  setViewPreset,
  renderMode,
  setRenderMode,
  layers,
  setLayers,
  onCaptureScreenshot,
}) => {
  const viewPresets: { id: ViewPreset; label: string; sub: string }[] = [
    { id: 'isometric', label: 'Isometric', sub: '3D Overview' },
    { id: 'front', label: 'Front (South)', sub: 'Solar Facade' },
    { id: 'rear', label: 'Rear (North)', sub: 'Cool Buffer' },
    { id: 'left', label: 'Left (West)', sub: 'Wind Ingress' },
    { id: 'right', label: 'Right (East)', sub: 'Morning Sun' },
    { id: 'top', label: 'Top (Plan)', sub: 'Roof & Footprint' },
    { id: 'interior', label: 'Interior', sub: 'Living Walkthrough' },
  ];

  const renderModes: { id: RenderMode; label: string; icon: React.ReactNode }[] = [
    { id: 'realistic', label: 'Realistic PBR', icon: <Box className="w-4 h-4" /> },
    { id: 'thermal', label: 'Thermal Envelope', icon: <Activity className="w-4 h-4" /> },
    { id: 'cad', label: 'Technical CAD', icon: <FileText className="w-4 h-4" /> },
    { id: 'xray', label: 'X-Ray Structure', icon: <Eye className="w-4 h-4" /> },
  ];

  return (
    <header className="bg-stone-900 border-b border-stone-800 text-stone-100 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 shadow-lg z-20">
      {/* Brand & Project Identity */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-teal-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
          TS
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-sm font-semibold tracking-wide text-white">ThermoShelter</h1>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-teal-900/80 text-teal-300 font-mono border border-teal-700">
              PASSIVE HOUSE 3D
            </span>
          </div>
          <p className="text-[11px] text-stone-400">10m × 7m Single-Story Indian Climate-Responsive Residence</p>
        </div>
      </div>

      {/* Camera Elevation Views */}
      <div className="flex items-center gap-1 bg-stone-800/80 p-1 rounded-lg border border-stone-700/60 overflow-x-auto max-w-full">
        {viewPresets.map((vp) => (
          <button
            key={vp.id}
            id={`btn-view-${vp.id}`}
            onClick={() => setViewPreset(vp.id)}
            className={`px-2.5 py-1 text-xs rounded font-medium transition-all whitespace-nowrap flex flex-col items-center ${
              viewPreset === vp.id
                ? 'bg-teal-600 text-white shadow-sm'
                : 'text-stone-300 hover:bg-stone-700/70 hover:text-white'
            }`}
          >
            <span>{vp.label}</span>
          </button>
        ))}
      </div>

      {/* Render Mode Selectors */}
      <div className="flex items-center gap-1 bg-stone-800/80 p-1 rounded-lg border border-stone-700/60">
        {renderModes.map((rm) => (
          <button
            key={rm.id}
            id={`btn-mode-${rm.id}`}
            onClick={() => setRenderMode(rm.id)}
            className={`px-2.5 py-1 text-xs rounded font-medium transition-all flex items-center gap-1.5 whitespace-nowrap ${
              renderMode === rm.id
                ? 'bg-amber-600 text-white shadow-sm'
                : 'text-stone-300 hover:bg-stone-700/70 hover:text-white'
            }`}
          >
            {rm.icon}
            <span>{rm.label}</span>
          </button>
        ))}
      </div>

      {/* Quick Action: Screenshot */}
      <div className="flex items-center gap-2">
        <button
          id="btn-capture-render"
          onClick={onCaptureScreenshot}
          title="Export High-Resolution Canvas Image"
          className="p-1.5 text-xs rounded bg-stone-800 text-stone-200 hover:bg-stone-700 border border-stone-700 flex items-center gap-1.5 transition-all"
        >
          <Camera className="w-4 h-4 text-teal-400" />
          <span className="hidden sm:inline">Snapshot</span>
        </button>
      </div>
    </header>
  );
};

