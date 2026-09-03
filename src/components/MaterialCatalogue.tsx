import React from 'react';
import { ArrowLeft, Library, ShieldCheck, ThermometerSun, Zap } from 'lucide-react';
import { WALL_MATERIALS as EMERGENCY_WALLS, ROOF_MATERIALS as EMERGENCY_ROOFS } from '../constants/materials';
import { WALL_MATERIALS as RESIDENT_WALLS, ROOF_MATERIALS as RESIDENT_ROOFS } from '../residential/components/MaterialsPanel';

interface MaterialCatalogueProps {
  onBack: () => void;
  onShop: (wallId: string, roofId: string) => void;
  selectedWallId?: string;
  selectedRoofId?: string;
  origin?: string;
}

export const MaterialCatalogue: React.FC<MaterialCatalogueProps> = ({ onBack, onShop, selectedWallId, selectedRoofId, origin }) => {
  const isResidential = origin === 'resident_dashboard';
  const WALLS = isResidential ? RESIDENT_WALLS as any[] : EMERGENCY_WALLS;
  const ROOFS = isResidential ? RESIDENT_ROOFS as any[] : EMERGENCY_ROOFS;

  const selectedWall = WALLS.find((m: any) => m.id === selectedWallId) || WALLS[0];
  const selectedRoof = ROOFS.find((m: any) => m.id === selectedRoofId) || ROOFS[0];

  return (
    <div className="h-full w-full bg-transparent text-slate-200 overflow-y-auto custom-scrollbar relative">
      
      {/* Video Background */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover opacity-50 mix-blend-screen"
        >
          <source src="/bgv1.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-md"></div>
      </div>

      <div className="p-6 md:p-12 relative z-10">
        <div className="max-w-6xl mx-auto space-y-12 pb-20">
        
        {/* Header */}
        <div className="flex items-center gap-6 pb-6 border-b border-slate-800">
          <button 
            onClick={onBack}
            className="w-12 h-12 flex items-center justify-center rounded-full bg-slate-900 border border-slate-800 hover:bg-slate-800 transition-colors group"
          >
            <ArrowLeft className="w-5 h-5 text-slate-400 group-hover:text-white" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <Library className="w-6 h-6 text-cyan-500" />
              <h1 className="text-3xl font-bold tracking-widest uppercase text-white">Materials Catalogue</h1>
            </div>
            <p className="text-slate-500 font-mono text-sm mt-1">Global Procurement & Specification Index</p>
          </div>
          
          <div className="ml-auto">
            <button
              onClick={() => onShop(selectedWall.id, selectedRoof.id)}
              className="group relative flex items-center gap-2 px-6 py-3 bg-indigo-950/40 border border-indigo-800/50 hover:bg-indigo-900/50 hover:border-indigo-500/50 text-indigo-400 font-bold text-xs tracking-[0.2em] uppercase rounded-xl overflow-hidden transition-all shadow-[0_0_20px_-5px_rgba(99,102,241,0.2)] hover:shadow-[0_0_30px_-5px_rgba(99,102,241,0.4)]"
            >
              <span className="relative z-10 flex items-center gap-2">
                Compare Sourcing & Prices
                <ArrowLeft className="w-4 h-4 rotate-180" />
              </span>
            </button>
          </div>
        </div>

        {/* Selected Preferences Section */}
        <section className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-8 relative overflow-hidden shadow-[0_0_40px_-15px_rgba(6,182,212,0.15)]">
          <div className="absolute top-0 right-0 p-6 opacity-10">
            <ShieldCheck className="w-40 h-40 text-cyan-400" />
          </div>
          
          <h2 className="text-sm font-bold text-cyan-400 tracking-widest uppercase mb-6 flex items-center gap-2 relative z-10">
            <ShieldCheck className="w-4 h-4" /> Active Shelter Specifications
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
            {/* Active Wall */}
            <div className="bg-slate-950/50 border border-slate-800/80 rounded-xl p-5 flex items-start gap-4">
              <div className="w-12 h-12 rounded-full border-2 border-slate-700 shadow-inner shrink-0" style={{ backgroundColor: selectedWall.hex }}></div>
              <div>
                <div className="text-[10px] text-slate-500 uppercase font-mono tracking-widest mb-1">Wall System</div>
                <div className="text-lg font-bold text-white mb-2">{selectedWall.name}</div>
                <p className="text-sm text-slate-400 leading-relaxed mb-4">{selectedWall.desc}</p>
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-cyan-950/30 border border-cyan-900/50 rounded-md">
                  <ThermometerSun className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="text-xs font-mono text-cyan-200">R-Value: {selectedWall.rValue}</span>
                </div>
              </div>
            </div>

            {/* Active Roof */}
            <div className="bg-slate-950/50 border border-slate-800/80 rounded-xl p-5 flex items-start gap-4">
              <div className="w-12 h-12 rounded-full border-2 border-slate-700 shadow-inner shrink-0" style={{ backgroundColor: selectedRoof.hex }}></div>
              <div>
                <div className="text-[10px] text-slate-500 uppercase font-mono tracking-widest mb-1">Roofing System</div>
                <div className="text-lg font-bold text-white mb-2">{selectedRoof.name}</div>
                <p className="text-sm text-slate-400 leading-relaxed mb-4">{selectedRoof.desc}</p>
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-950/30 border border-amber-900/50 rounded-md">
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-xs font-mono text-amber-200">Albedo: {selectedRoof.albedo}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Full Catalogue */}
        <section className="space-y-12">
          {/* Wall Materials Grid */}
          <div>
            <h3 className="text-lg font-mono font-bold text-slate-300 uppercase tracking-widest mb-6 border-l-2 border-cyan-500 pl-3">All Wall Materials</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {WALLS.map((mat: any) => (
                <div key={mat.id} className={`bg-slate-900/40 border rounded-xl overflow-hidden flex flex-col transition-all duration-300 hover:-translate-y-1 cursor-pointer ${mat.id === selectedWallId ? 'border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.15)] hover:shadow-[0_10px_30px_rgba(6,182,212,0.2)]' : 'border-slate-800 hover:border-slate-700 hover:shadow-xl hover:shadow-cyan-500/5'}`}>
                  <div className="h-32 w-full relative">
                    {mat.imageUrl && <img src={mat.imageUrl} alt={mat.name} className="w-full h-full object-cover opacity-80" />}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 to-transparent"></div>
                    <div className="absolute top-3 left-3 flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full border border-slate-700 shadow-inner" style={{ backgroundColor: mat.hex }}></div>
                    </div>
                  </div>
                  <div className="p-5 flex-1 flex flex-col">
                    <div className="flex justify-between items-start mb-2">
                      <div className="font-bold text-slate-200">{mat.name}</div>
                      {mat.id === selectedWallId && <div className="text-[9px] text-cyan-400 font-bold uppercase tracking-widest bg-cyan-950/50 px-2 py-1 rounded">Selected</div>}
                    </div>
                    <p className="text-sm text-slate-500 flex-1 mb-4">{mat.desc}</p>
                    <div className="pt-3 border-t border-slate-800 flex justify-between items-center font-mono">
                      <div className="flex flex-col">
                        <span className="text-sm text-slate-600">Thermal R-Value</span>
                        <span className="text-[10px] text-slate-500 font-sans uppercase tracking-wider mt-0.5">Higher = Better Insulation</span>
                      </div>
                      <span className="text-cyan-400 font-bold">{mat.rValue}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Roof Materials Grid */}
          <div>
            <h3 className="text-lg font-mono font-bold text-slate-300 uppercase tracking-widest mb-6 border-l-2 border-amber-500 pl-3">All Roof Materials</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {ROOFS.map((mat: any) => (
                <div key={mat.id} className={`bg-slate-900/40 border rounded-xl overflow-hidden flex flex-col transition-all duration-300 hover:-translate-y-1 cursor-pointer ${mat.id === selectedRoofId ? 'border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.15)] hover:shadow-[0_10px_30px_rgba(245,158,11,0.2)]' : 'border-slate-800 hover:border-slate-700 hover:shadow-xl hover:shadow-amber-500/5'}`}>
                  <div className="h-32 w-full relative">
                    {mat.imageUrl && <img src={mat.imageUrl} alt={mat.name} className="w-full h-full object-cover opacity-80" />}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 to-transparent"></div>
                    <div className="absolute top-3 left-3 flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full border border-slate-700 shadow-inner" style={{ backgroundColor: mat.hex }}></div>
                    </div>
                  </div>
                  <div className="p-5 flex-1 flex flex-col">
                    <div className="flex justify-between items-start mb-2">
                      <div className="font-bold text-slate-200">{mat.name}</div>
                      {mat.id === selectedRoofId && <div className="text-[9px] text-amber-400 font-bold uppercase tracking-widest bg-amber-950/50 px-2 py-1 rounded">Selected</div>}
                    </div>
                    <p className="text-sm text-slate-500 flex-1 mb-4">{mat.desc}</p>
                    <div className="pt-3 border-t border-slate-800 flex justify-between items-center font-mono">
                      <div className="flex flex-col">
                        <span className="text-sm text-slate-600">Solar Albedo</span>
                        <span className="text-[10px] text-slate-500 font-sans uppercase tracking-wider mt-0.5">Higher = More Reflective</span>
                      </div>
                      <span className="text-amber-400 font-bold">{mat.albedo}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

      </div>
      </div>
    </div>
  );
};
