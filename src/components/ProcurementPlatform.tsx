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

  const renderMaterialCard = (mat: MaterialDef, isSelected: boolean, type: 'Wall' | 'Roof', index: number = 0) => {
    const sortedVendors = getSortedVendors(mat);
    const bestPrice = sortedVendors[0];

    return (
      <motion.div 
        key={mat.id} 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: index * 0.1, ease: [0.23, 1, 0.32, 1] }}
        className={`flex flex-col md:flex-row gap-6 bg-black/40 backdrop-blur-xl border rounded-2xl p-6 transition-all duration-500 hover:border-indigo-500/40 group ${isSelected ? 'border-indigo-500/50 shadow-[0_0_30px_-5px_rgba(99,102,241,0.15)]' : 'border-white/10'}`}
      >
        {/* Product Image & Info */}
        <div className="w-full md:w-1/3 flex flex-col gap-4">
          <div className="w-full h-48 rounded-xl overflow-hidden relative shadow-lg group-hover:shadow-[0_0_30px_-5px_rgba(99,102,241,0.25)] transition-shadow duration-500">
            <img src={mat.imageUrl} alt={mat.name} className="w-full h-full object-cover transition-transform duration-1000 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:scale-110" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-90"></div>
            <div className="absolute top-2 left-2 flex gap-2">
              <span className="bg-black/70 backdrop-blur-md px-2 py-1 rounded text-[10px] font-bold tracking-widest uppercase border border-white/10 text-slate-200 shadow-lg">
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
            <h3 className="text-xl font-bold text-white group-hover:text-indigo-400 transition-colors duration-300">{mat.name}</h3>
            <p className="text-sm text-slate-400 mt-1 leading-relaxed">{mat.desc}</p>
            <div className="flex gap-4 mt-4 pt-4 border-t border-slate-800/80">
              <div className="text-xs font-mono">
                <span className="text-slate-500 uppercase tracking-widest text-[9px] block mb-1">Spec Rating</span>
                <span className="text-indigo-400 font-bold px-2 py-1 bg-indigo-500/10 rounded-md border border-indigo-500/20">{type === 'Wall' ? `R-${mat.rValue}` : `Albedo ${mat.albedo}`}</span>
              </div>
              <div className="text-xs font-mono">
                <span className="text-slate-500 uppercase tracking-widest text-[9px] block mb-1">Eco Score</span>
                <span className={`font-bold px-2 py-1 rounded-md border ${mat.ecoScore === 'Excellent' || mat.ecoScore === 'Good' ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' : 'text-orange-400 bg-orange-500/10 border-orange-500/20'}`}>
                  {mat.ecoScore}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Vendor Comparison */}
        <div className="w-full md:w-2/3 flex flex-col">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
            <ShoppingCart className="w-4 h-4 text-indigo-500" /> Available Sources (Lowest to Highest)
          </h4>
          
          <div className="flex flex-col gap-3 flex-1">
            {sortedVendors.map((vendor, index) => (
              <div key={vendor.id} className={`flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-xl border transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${index === 0 ? 'bg-indigo-950/20 border-indigo-900/50 hover:border-indigo-500/50 hover:bg-indigo-950/40 hover:shadow-[0_5px_20px_rgba(99,102,241,0.15)]' : 'bg-slate-900/40 border-slate-800/50 hover:bg-slate-800/60 hover:border-slate-600'}`}>
                <div className="flex items-center gap-4 mb-3 sm:mb-0">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${index === 0 ? 'bg-indigo-600 text-white shadow-[0_0_10px_rgba(99,102,241,0.5)]' : 'bg-slate-800 text-slate-400'}`}>
                    #{index + 1}
                  </div>
                  <div>
                    <div className="font-bold text-slate-200 text-sm">{vendor.name}</div>
                    <div className="flex items-center gap-3 text-[11px] mt-1">
                      <span className={`flex items-center gap-1 font-medium ${vendor.inStock ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {vendor.inStock ? 'In Stock' : 'Out of Stock'}
                      </span>
                      <span className="text-slate-600">•</span>
                      <span className="flex items-center gap-1 text-slate-400">
                        <Truck className="w-3 h-3 text-slate-500" /> {vendor.deliveryDays} days
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 sm:gap-6 w-full sm:w-auto justify-between sm:justify-end">
                  <div className="text-right">
                    <div className="text-lg font-bold text-white">₹{vendor.pricePerSqm.toLocaleString('en-IN', {minimumFractionDigits: 2})}</div>
                    <div className="text-[9px] text-slate-500 uppercase tracking-widest mt-0.5">per sq.m</div>
                  </div>
                  <a 
                    href={vendor.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-300 ${index === 0 ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_0_15px_rgba(99,102,241,0.4)] hover:shadow-[0_0_25px_rgba(99,102,241,0.6)]' : 'bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white'}`}
                  >
                    View <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    );
  };

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
                  {WALL_MATERIALS.map((mat, index) => renderMaterialCard(mat, mat.id === selectedWallId, 'Wall', index))}
                </div>
                <div className="space-y-6">
                  <h2 className="text-lg font-bold text-slate-300 uppercase tracking-widest border-l-2 border-indigo-500 pl-3">Roofing Systems</h2>
                  {ROOF_MATERIALS.map((mat, index) => renderMaterialCard(mat, mat.id === selectedRoofId, 'Roof', index))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>
      </div>
    </div>
  );
};
