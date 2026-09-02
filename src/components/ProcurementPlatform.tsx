import React, { useState } from 'react';
import { ArrowLeft, ShoppingCart, Truck, ExternalLink, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { WALL_MATERIALS, ROOF_MATERIALS } from '../constants/materials';
import type { MaterialDef } from '../constants/materials';

interface ProcurementPlatformProps {
  onBack: () => void;
  selectedWallId?: string;
  selectedRoofId?: string;
}

export const ProcurementPlatform: React.FC<ProcurementPlatformProps> = ({ onBack, selectedWallId, selectedRoofId }) => {
  const [activeTab, setActiveTab] = useState<'selected' | 'all'>('selected');

  // Helper to sort vendors by price (lowest to highest)
  const getSortedVendors = (material: MaterialDef) => {
    return [...material.vendors].sort((a, b) => a.pricePerSqm - b.pricePerSqm);
  };

  const selectedWall = WALL_MATERIALS.find(m => m.id === selectedWallId) || WALL_MATERIALS[2];
  const selectedRoof = ROOF_MATERIALS.find(m => m.id === selectedRoofId) || ROOF_MATERIALS[2];

  const renderMaterialCard = (mat: MaterialDef, isSelected: boolean, type: 'Wall' | 'Roof') => {
    const sortedVendors = getSortedVendors(mat);
    const bestPrice = sortedVendors[0];

    return (
      <div key={mat.id} className={`flex flex-col md:flex-row gap-6 bg-black/40 backdrop-blur-xl border rounded-2xl p-6 transition-all ${isSelected ? 'border-indigo-500/50 shadow-[0_0_30px_-5px_rgba(99,102,241,0.15)]' : 'border-white/10'}`}>
        {/* Product Image & Info */}
        <div className="w-full md:w-1/3 flex flex-col gap-4">
          <div className="w-full h-48 rounded-xl overflow-hidden relative">
            <img src={mat.imageUrl} alt={mat.name} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 to-transparent"></div>
            <div className="absolute top-2 left-2 flex gap-2">
              <span className="bg-black/70 backdrop-blur-md px-2 py-1 rounded text-[10px] font-bold tracking-widest uppercase border border-white/10 text-slate-200">
                {type} System
              </span>
              {isSelected && (
                <span className="bg-indigo-600/90 backdrop-blur-md px-2 py-1 rounded text-[10px] font-bold tracking-widest uppercase border border-indigo-400/50 text-white flex items-center gap-1 shadow-[0_0_15px_rgba(99,102,241,0.8)] relative">
                  <span className="absolute inset-0 bg-indigo-500 rounded animate-ping opacity-20"></span>
                  <CheckCircle2 className="w-3 h-3 relative z-10" /> <span className="relative z-10">Selected</span>
                </span>
              )}
            </div>
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">{mat.name}</h3>
            <p className="text-sm text-slate-400 mt-1">{mat.desc}</p>
            <div className="flex gap-4 mt-3 pt-3 border-t border-slate-800">
              <div className="text-xs font-mono">
                <span className="text-slate-500">Spec: </span>
                <span className="text-indigo-400 font-bold">{type === 'Wall' ? `R-${mat.rValue}` : `Albedo ${mat.albedo}`}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Vendor Comparison */}
        <div className="w-full md:w-2/3 flex flex-col">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
            <ShoppingCart className="w-4 h-4" /> Available Sources (Lowest to Highest)
          </h4>
          
          <div className="flex flex-col gap-3 flex-1">
            {sortedVendors.map((vendor, index) => (
              <div key={vendor.id} className={`flex items-center justify-between p-4 rounded-xl border ${index === 0 ? 'bg-indigo-950/20 border-indigo-900/50' : 'bg-slate-900/40 border-slate-800/50'}`}>
                <div className="flex items-center gap-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${index === 0 ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'}`}>
                    #{index + 1}
                  </div>
                  <div>
                    <div className="font-bold text-slate-200">{vendor.name}</div>
                    <div className="flex items-center gap-3 text-xs mt-1">
                      <span className={`flex items-center gap-1 ${vendor.inStock ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {vendor.inStock ? 'In Stock' : 'Out of Stock'}
                      </span>
                      <span className="text-slate-500">•</span>
                      <span className="flex items-center gap-1 text-slate-400">
                        <Truck className="w-3 h-3" /> {vendor.deliveryDays} days
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <div className="text-lg font-bold text-white">₹{vendor.pricePerSqm.toFixed(2)}</div>
                    <div className="text-[10px] text-slate-500 uppercase tracking-widest">per sq.m</div>
                  </div>
                  <a 
                    href={vendor.url}
                    onClick={(e) => e.preventDefault()} // Mock link
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${index === 0 ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'}`}
                  >
                    View <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-full bg-slate-950 text-slate-200 overflow-y-auto custom-scrollbar p-6 md:p-12 relative">
      <div className="max-w-7xl mx-auto space-y-8 pb-20">
        
        {/* Header */}
        <div className="flex items-center gap-6 pb-6 border-b border-slate-800">
          <button 
            onClick={onBack}
            className="w-12 h-12 flex items-center justify-center rounded-full bg-slate-900 border border-slate-800 hover:bg-slate-800 transition-colors group"
          >
            <ArrowLeft className="w-5 h-5 text-slate-400 group-hover:text-white" />
          </button>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <ShoppingCart className="w-6 h-6 text-indigo-500" />
              <h1 className="text-3xl font-bold tracking-widest uppercase text-white">Procurement Platform</h1>
            </div>
            <p className="text-slate-500 font-mono text-sm mt-1">Sourcing & Price Comparison Network</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-4 border-b border-slate-800 pb-px">
          <button
            onClick={() => setActiveTab('selected')}
            className={`px-6 py-3 font-bold text-sm tracking-widest uppercase transition-colors border-b-2 ${activeTab === 'selected' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
          >
            Required Materials
          </button>
          <button
            onClick={() => setActiveTab('all')}
            className={`px-6 py-3 font-bold text-sm tracking-widest uppercase transition-colors border-b-2 ${activeTab === 'all' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
          >
            All Products
          </button>
        </div>

        {/* Content */}
        <div className="space-y-8 pt-4 overflow-hidden">
          <AnimatePresence mode="wait">
            {activeTab === 'selected' && (
              <motion.div 
                key="selected-tab"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                className="space-y-8"
              >
                {renderMaterialCard(selectedWall, true, 'Wall')}
                {renderMaterialCard(selectedRoof, true, 'Roof')}
              </motion.div>
            )}

            {activeTab === 'all' && (
              <motion.div 
                key="all-tab"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-12"
              >
                <div className="space-y-6">
                  <h2 className="text-lg font-bold text-slate-300 uppercase tracking-widest border-l-2 border-indigo-500 pl-3">Wall Systems</h2>
                  {WALL_MATERIALS.map(mat => renderMaterialCard(mat, mat.id === selectedWallId, 'Wall'))}
                </div>
                <div className="space-y-6">
                  <h2 className="text-lg font-bold text-slate-300 uppercase tracking-widest border-l-2 border-indigo-500 pl-3">Roofing Systems</h2>
                  {ROOF_MATERIALS.map(mat => renderMaterialCard(mat, mat.id === selectedRoofId, 'Roof'))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
};
