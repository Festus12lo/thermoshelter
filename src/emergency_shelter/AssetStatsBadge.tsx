// @ts-nocheck
import React from 'react';
import type {} from '../types';
import { Box, Layers, ShieldCheck, Ruler } from 'lucide-react';

interface AssetStatsBadgeProps {
  stats: ModelStats | null;
  config: ShelterConfig;
}

export const AssetStatsBadge: React.FC<AssetStatsBadgeProps> = ({ stats, config }) => {
  return (
    <div 
      className="absolute top-4 left-4 z-20 pointer-events-none hidden lg:flex items-center gap-2"
      onPointerDown={(e) => e.stopPropagation()}
      onPointerUp={(e) => e.stopPropagation()}
      onPointerMove={(e) => e.stopPropagation()}
      onWheel={(e) => e.stopPropagation()}
    >
      <div className="pointer-events-auto flex items-center gap-3 px-3 py-1.5 bg-slate-900/90 backdrop-blur-md rounded-xl border border-slate-800 shadow-xl text-xs">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-bold text-slate-100 uppercase tracking-wider text-[10px]">
            Game Asset Spec
          </span>
        </div>

        <div className="h-3 w-px bg-slate-700" />

        <div className="flex items-center gap-1 text-slate-300 font-mono text-[11px]">
          <Box className="w-3 h-3 text-sky-400" />
          <span>{stats ? stats.triangles.toLocaleString() : '4,280'} tris</span>
        </div>

        <div className="h-3 w-px bg-slate-700" />

        <div className="flex items-center gap-1 text-slate-300 font-mono text-[11px]">
          <Layers className="w-3 h-3 text-amber-400" />
          <span>PBR Metallic-Roughness</span>
        </div>

        <div className="h-3 w-px bg-slate-700" />

        <div className="flex items-center gap-1 text-slate-300 font-mono text-[11px]">
          <Ruler className="w-3 h-3 text-emerald-400" />
          <span>5.8m × 2.4m (7.5° Shed)</span>
        </div>
      </div>
    </div>
  );
};

