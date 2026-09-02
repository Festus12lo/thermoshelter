// @ts-nocheck
import React from 'react';
import { 
  Layers, 
  ArrowUpCircle, 
  Wind, 
  Ruler, 
  Flame, 
  Tag, 
  Eye, 
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import type {} from '../types';

interface LayerControlsProps {
  layers: InspectionLayers;
  setLayers: React.Dispatch<React.SetStateAction<InspectionLayers>>;
}

export const LayerControls: React.FC<LayerControlsProps> = ({ layers, setLayers }) => {
  const toggleLayer = (key: keyof InspectionLayers) => {
    setLayers((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="bg-stone-900/95 border border-stone-800 rounded-xl p-3.5 text-stone-200 shadow-xl backdrop-blur-md">
      <div className="flex items-center justify-between gap-2 mb-2.5">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-teal-400" />
          <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-300">
            Inspection & Thermal Layers
          </h3>
        </div>
      </div>

      {/* Primary Inspection Layer: R-Value Heatmap & 3D Badges */}
      <div className="mb-3 p-2.5 bg-stone-950/80 rounded-xl border border-stone-800 space-y-2">
        <div className="flex items-center justify-between text-[11px] font-semibold text-stone-300">
          <span className="flex items-center gap-1.5 text-teal-400">
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            Thermal Performance Overlays
          </span>
          {layers.rValueHeatmap && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-teal-900/80 text-teal-300 font-mono border border-teal-700">
              Active Heatmap
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 gap-1.5">
          <button
            id="toggle-rvalue-heatmap"
            onClick={() => toggleLayer('rValueHeatmap')}
            className={`px-2.5 py-2 text-xs rounded-lg border font-medium flex items-center justify-between transition-all ${
              layers.rValueHeatmap
                ? 'bg-teal-950/90 text-teal-200 border-teal-500 shadow-md ring-1 ring-teal-500/30'
                : 'bg-stone-900 text-stone-400 border-stone-800 hover:border-stone-700'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <Flame className={`w-3.5 h-3.5 ${layers.rValueHeatmap ? 'text-teal-400' : 'text-stone-500'}`} />
              <span>R-Value Heatmap</span>
            </span>
            <span className={`w-2 h-2 rounded-full ${layers.rValueHeatmap ? 'bg-teal-400 animate-pulse' : 'bg-stone-700'}`} />
          </button>

          <button
            id="toggle-rvalue-labels"
            onClick={() => toggleLayer('rValueLabels')}
            className={`px-2.5 py-2 text-xs rounded-lg border font-medium flex items-center justify-between transition-all ${
              layers.rValueLabels
                ? 'bg-amber-950/80 text-amber-200 border-amber-500 shadow-md ring-1 ring-amber-500/30'
                : 'bg-stone-900 text-stone-400 border-stone-800 hover:border-stone-700'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <Tag className={`w-3.5 h-3.5 ${layers.rValueLabels ? 'text-amber-400' : 'text-stone-500'}`} />
              <span>3D R-Value Badges</span>
            </span>
            <span className={`w-2 h-2 rounded-full ${layers.rValueLabels ? 'bg-amber-400' : 'bg-stone-700'}`} />
          </button>
        </div>
      </div>

      {/* Exploded Roof Lift Slider */}
      <div className="mb-3 p-2 bg-stone-800/60 rounded-lg border border-stone-700/60">
        <div className="flex justify-between items-center text-xs mb-1">
          <span className="flex items-center gap-1.5 text-stone-300 font-medium">
            <ArrowUpCircle className="w-3.5 h-3.5 text-teal-400" />
            Exploded Roof Lift
          </span>
          <span className="font-mono text-teal-400 text-[11px]">
            {Math.round(layers.roofLift * 4.0 * 10) / 10}m
          </span>
        </div>
        <input
          id="slider-roof-lift"
          type="range"
          min="0"
          max="1"
          step="0.02"
          value={layers.roofLift}
          onChange={(e) =>
            setLayers((prev) => ({ ...prev, roofLift: parseFloat(e.target.value) }))
          }
          className="w-full h-1.5 bg-stone-700 rounded-lg appearance-none cursor-pointer accent-teal-500"
        />
        <div className="flex justify-between text-[10px] text-stone-400 mt-1">
          <span>Seated on Walls</span>
          <span>Lifted 4.0m</span>
        </div>
      </div>

      {/* Structural & Analytical Layer Toggles */}
      <div className="grid grid-cols-2 gap-1.5">
        <button
          id="toggle-layer-roof"
          onClick={() => toggleLayer('roof')}
          className={`px-2.5 py-1.5 text-xs rounded-lg border font-medium flex items-center justify-between transition-all ${
            layers.roof
              ? 'bg-stone-800 text-stone-100 border-teal-600/70'
              : 'bg-stone-900/50 text-stone-500 border-stone-800'
          }`}
        >
          <span>Gable Roof</span>
          <span className={`w-2 h-2 rounded-full ${layers.roof ? 'bg-teal-400' : 'bg-stone-600'}`} />
        </button>

        <button
          id="toggle-layer-walls"
          onClick={() => toggleLayer('walls')}
          className={`px-2.5 py-1.5 text-xs rounded-lg border font-medium flex items-center justify-between transition-all ${
            layers.walls
              ? 'bg-stone-800 text-stone-100 border-teal-600/70'
              : 'bg-stone-900/50 text-stone-500 border-stone-800'
          }`}
        >
          <span>Earth Walls</span>
          <span className={`w-2 h-2 rounded-full ${layers.walls ? 'bg-teal-400' : 'bg-stone-600'}`} />
        </button>

        <button
          id="toggle-layer-windows"
          onClick={() => toggleLayer('windows')}
          className={`px-2.5 py-1.5 text-xs rounded-lg border font-medium flex items-center justify-between transition-all ${
            layers.windows
              ? 'bg-stone-800 text-stone-100 border-teal-600/70'
              : 'bg-stone-900/50 text-stone-500 border-stone-800'
          }`}
        >
          <span>Glazing & Openings</span>
          <span className={`w-2 h-2 rounded-full ${layers.windows ? 'bg-teal-400' : 'bg-stone-600'}`} />
        </button>

        <button
          id="toggle-layer-interior"
          onClick={() => toggleLayer('interior')}
          className={`px-2.5 py-1.5 text-xs rounded-lg border font-medium flex items-center justify-between transition-all ${
            layers.interior
              ? 'bg-stone-800 text-stone-100 border-teal-600/70'
              : 'bg-stone-900/50 text-stone-500 border-stone-800'
          }`}
        >
          <span>Interior Partitions</span>
          <span className={`w-2 h-2 rounded-full ${layers.interior ? 'bg-teal-400' : 'bg-stone-600'}`} />
        </button>

        <button
          id="toggle-layer-dimensions"
          onClick={() => toggleLayer('dimensions')}
          className={`px-2.5 py-1.5 text-xs rounded-lg border font-medium flex items-center justify-between transition-all ${
            layers.dimensions
              ? 'bg-stone-800 text-teal-300 border-teal-500 shadow-sm'
              : 'bg-stone-900/50 text-stone-500 border-stone-800'
          }`}
        >
          <span className="flex items-center gap-1">
            <Ruler className="w-3 h-3" />
            <span>3D Dimensions</span>
          </span>
          <span className={`w-2 h-2 rounded-full ${layers.dimensions ? 'bg-teal-400' : 'bg-stone-600'}`} />
        </button>

        <button
          id="toggle-layer-airflow"
          onClick={() => toggleLayer('ventilationFlow')}
          className={`px-2.5 py-1.5 text-xs rounded-lg border font-medium flex items-center justify-between transition-all ${
            layers.ventilationFlow
              ? 'bg-stone-800 text-sky-300 border-sky-500 shadow-sm'
              : 'bg-stone-900/50 text-stone-500 border-stone-800'
          }`}
        >
          <span className="flex items-center gap-1">
            <Wind className="w-3 h-3 text-sky-400" />
            <span>Wind Vectors</span>
          </span>
          <span className={`w-2 h-2 rounded-full ${layers.ventilationFlow ? 'bg-sky-400' : 'bg-stone-600'}`} />
        </button>
      </div>
    </div>
  );
};

