import React from 'react';
import { Shield } from 'lucide-react';
import type {} from '../types';

export interface MaterialOption {
  id: string;
  name: string;
  desc: string;
  rValue: number;
  albedo: number;
  hex: string;
  imageUrl?: string;
  threeMaterialId: string; // matches id in BuildingModel.ts
  vendors?: {
    id: string;
    name: string;
    pricePerSqm: number;
    deliveryDays: number;
    inStock: boolean;
    url: string;
  }[];
}

export const ROOF_MATERIALS: MaterialOption[] = [
  { id: 'roof-slate', name: '25° Slate Interlocking', desc: 'Heavy thermal mass tiles', rValue: 4.5, albedo: 0.15, hex: '#3a4047', imageUrl: '/materials/slate.jpg', threeMaterialId: 'roofSlate', vendors: [{id: 'v1', name: 'BuildMart', pricePerSqm: 850, deliveryDays: 3, inStock: true, url: '#'}] },
  { id: 'roof-terracotta', name: 'Terracotta Clay Tiles', desc: 'Breathable traditional roof', rValue: 3.2, albedo: 0.35, hex: '#bd5a36', imageUrl: '/materials/terracotta.jpg', threeMaterialId: 'terracottaClay', vendors: [{id: 'v2', name: 'ClayWorks India', pricePerSqm: 450, deliveryDays: 7, inStock: true, url: '#'}] },
  { id: 'roof-metal', name: 'Corrugated Galvanized Metal', desc: 'High reflectivity cool roof', rValue: 2.1, albedo: 0.75, hex: '#e2e8f0', imageUrl: '/materials/galvanized.jpg', threeMaterialId: 'metal', vendors: [{id: 'v3', name: 'Tata Bluescope', pricePerSqm: 320, deliveryDays: 2, inStock: false, url: '#'}] }
];

export const WALL_MATERIALS: MaterialOption[] = [
  { id: 'wall-rammed', name: '300mm Rammed Earth', desc: 'High thermal phase lag', rValue: 2.1, albedo: 0.30, hex: '#0d9488', imageUrl: '/materials/ceb.jpg', threeMaterialId: 'earthWall', vendors: [{id: 'v4', name: 'EarthBuilders Network', pricePerSqm: 1200, deliveryDays: 14, inStock: true, url: '#'}] },
  { id: 'wall-concrete', name: 'Aerated Autoclaved Concrete', desc: 'Lightweight insulation block', rValue: 3.5, albedo: 0.45, hex: '#94a3b8', imageUrl: '/materials/aac_blocks.jpg', threeMaterialId: 'cadMat', vendors: [{id: 'v5', name: 'ACC Blocks', pricePerSqm: 650, deliveryDays: 1, inStock: true, url: '#'}] },
  { id: 'wall-brick', name: 'Exposed Fired Brick', desc: 'Traditional structural masonry', rValue: 1.2, albedo: 0.25, hex: '#b91c1c', imageUrl: '/materials/brick.jpg', threeMaterialId: 'rValueFrame', vendors: [{id: 'v6', name: 'Local Brick Kiln', pricePerSqm: 280, deliveryDays: 4, inStock: true, url: '#'}] }
];

interface MaterialsPanelProps {
  activeRoof: MaterialOption;
  setActiveRoof: (m: MaterialOption) => void;
  activeWall: MaterialOption;
  setActiveWall: (m: MaterialOption) => void;
}

export const MaterialsPanel: React.FC<MaterialsPanelProps> = ({
  activeRoof, setActiveRoof, activeWall, setActiveWall
}) => {
  return (
    <div className="bg-stone-900/95 border border-stone-800 rounded-xl p-4 text-stone-200 shadow-xl backdrop-blur-md space-y-5">
      <div className="flex items-center gap-2 mb-4">
        <Shield className="w-4 h-4 text-cyan-500" />
        <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-300">
          Structural Assembly
        </h3>
      </div>

      {/* Roof Selection */}
      <div>
        <div className="text-[10px] font-mono text-stone-400 uppercase tracking-wider mb-2 flex justify-between">
          <span>Roofing System</span>
          <span className="text-cyan-400">R-{activeRoof.rValue.toFixed(1)} (Albedo: {activeRoof.albedo.toFixed(2)})</span>
        </div>
        <div className="grid grid-cols-3 gap-2 mb-2">
          {ROOF_MATERIALS.map(roof => (
            <button
              key={roof.id}
              onClick={() => setActiveRoof(roof)}
              title={`${roof.name}`}
              className={`aspect-video rounded-md border-2 transition-all flex items-center justify-center ${
                activeRoof.id === roof.id ? 'border-cyan-400 scale-105 shadow-[0_0_10px_rgba(34,211,238,0.2)]' : 'border-transparent opacity-60 hover:opacity-100 hover:scale-105'
              }`}
              style={{ backgroundColor: roof.hex }}
            />
          ))}
        </div>
        <div className="text-sm font-semibold text-stone-100">{activeRoof.name}</div>
        <div className="text-xs text-stone-400 leading-snug mt-1">{activeRoof.desc}</div>
      </div>

      <div className="h-px bg-stone-800 my-2"></div>

      {/* Wall Selection */}
      <div>
        <div className="text-[10px] font-mono text-stone-400 uppercase tracking-wider mb-2 flex justify-between">
          <span>Wall Assembly</span>
          <span className="text-teal-400">R-{activeWall.rValue.toFixed(1)}</span>
        </div>
        <div className="grid grid-cols-3 gap-2 mb-2">
          {WALL_MATERIALS.map(wall => (
            <button
              key={wall.id}
              onClick={() => setActiveWall(wall)}
              title={`${wall.name}`}
              className={`aspect-video rounded-md border-2 transition-all flex items-center justify-center ${
                activeWall.id === wall.id ? 'border-teal-400 scale-105 shadow-[0_0_10px_rgba(45,212,191,0.2)]' : 'border-transparent opacity-60 hover:opacity-100 hover:scale-105'
              }`}
              style={{ backgroundColor: wall.hex }}
            />
          ))}
        </div>
        <div className="text-sm font-semibold text-stone-100">{activeWall.name}</div>
        <div className="text-xs text-stone-400 leading-snug mt-1">{activeWall.desc}</div>
      </div>
    </div>
  );
};
