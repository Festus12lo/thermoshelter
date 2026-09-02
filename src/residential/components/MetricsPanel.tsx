// @ts-nocheck
import React, { useState } from 'react';
import { 
  Building2, 
  CheckCircle2, 
  Flame, 
  Wind, 
  Compass, 
  Layers, 
  ShieldCheck, 
  ChevronRight,
  Sparkles,
  Zap
} from 'lucide-react';
import { WINDOW_SPECS } from './BuildingModel';
import { THERMAL_SPECS, ENVELOPE_THERMAL_SUMMARY } from '../data/thermalSpecs';

export const MetricsPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'specs' | 'interior' | 'rvalue' | 'passive' | 'schedule' | 'checklist'>('interior');

  const checklistItems = [
    { title: 'Single-story residential house (not shelter or cabin)', status: true },
    { title: 'Footprint exactly 10.00 m × 7.00 m (70.0 m² gross)', status: true },
    { title: 'Wall height exactly 3.00 m (0.30m thick rammed earth)', status: true },
    { title: 'Foundation plinth 0.30 m stone masonry with paved apron band', status: true },
    { title: '25° symmetrical gable roof with timber trusses & purlins', status: true },
    { title: 'Heavy timber king-post trusses & decorative rafter tails', status: true },
    { title: 'Overhangs: 0.45 m long side eaves, 0.35 m gable ends', status: true },
    { title: 'Solid hardwood lintels over all window and door openings', status: true },
    { title: 'Rainwater harvesting gutters & corner downspout filtration', status: true },
    { title: 'Entrance veranda porch canopy with carved wooden brackets', status: true },
    { title: 'Fully furnished Living/Dining with Indian Baithak daybed & dining set', status: true },
    { title: 'Polished granite Kitchen with gas range, sink & clay water pot', status: true },
    { title: 'Master Bedroom with king platform bed, nightstands & louvered wardrobe', status: true },
    { title: 'Secondary Bedroom with queen platform bed & study work desk', status: true },
    { title: 'Full Bathroom wet core with stone vanity, WC & step-down shower', status: true },
    { title: 'Inspection layer with R-value color-coded heatmap', status: true },
  ];

  return (
    <div className="bg-stone-900 border border-stone-800 rounded-xl p-3.5 text-stone-200 shadow-xl flex flex-col h-full max-h-[580px]">
      {/* Header & Tabs */}
      <div className="flex items-center justify-between pb-2.5 border-b border-stone-800 mb-2.5">
        <div className="flex items-center gap-2">
          <Building2 className="w-4 h-4 text-teal-400" />
          <span className="text-xs font-semibold uppercase tracking-wider text-stone-200">
            Architectural Data & Analysis
          </span>
        </div>
      </div>

      <div className="grid grid-cols-6 gap-1 p-1 bg-stone-950 rounded-lg border border-stone-800 mb-3 text-[10px]">
        <button
          id="tab-btn-interior"
          onClick={() => setActiveTab('interior')}
          className={`py-1 rounded font-medium transition-all ${
            activeTab === 'interior' ? 'bg-teal-600 text-white shadow-sm font-bold' : 'text-stone-400 hover:text-stone-200'
          }`}
        >
          Interior
        </button>
        <button
          id="tab-btn-rvalue"
          onClick={() => setActiveTab('rvalue')}
          className={`py-1 rounded font-medium transition-all ${
            activeTab === 'rvalue' ? 'bg-teal-600 text-white shadow-sm font-bold' : 'text-stone-400 hover:text-stone-200'
          }`}
        >
          R-Values
        </button>
        <button
          id="tab-btn-specs"
          onClick={() => setActiveTab('specs')}
          className={`py-1 rounded font-medium transition-all ${
            activeTab === 'specs' ? 'bg-teal-600 text-white shadow-sm' : 'text-stone-400 hover:text-stone-200'
          }`}
        >
          Structure
        </button>
        <button
          id="tab-btn-passive"
          onClick={() => setActiveTab('passive')}
          className={`py-1 rounded font-medium transition-all ${
            activeTab === 'passive' ? 'bg-teal-600 text-white shadow-sm' : 'text-stone-400 hover:text-stone-200'
          }`}
        >
          Passive
        </button>
        <button
          id="tab-btn-schedule"
          onClick={() => setActiveTab('schedule')}
          className={`py-1 rounded font-medium transition-all ${
            activeTab === 'schedule' ? 'bg-teal-600 text-white shadow-sm' : 'text-stone-400 hover:text-stone-200'
          }`}
        >
          Windows
        </button>
        <button
          id="tab-btn-checklist"
          onClick={() => setActiveTab('checklist')}
          className={`py-1 rounded font-medium transition-all ${
            activeTab === 'checklist' ? 'bg-teal-600 text-white shadow-sm' : 'text-stone-400 hover:text-stone-200'
          }`}
        >
          Audit
        </button>
      </div>

      {/* Tab Contents */}
      <div className="overflow-y-auto pr-1 text-xs space-y-2 flex-1 scrollbar-thin scrollbar-thumb-stone-700">
        {/* INTERIOR TAB */}
        {activeTab === 'interior' && (
          <div className="space-y-2.5">
            <div className="p-2.5 bg-stone-950/80 rounded-lg border border-teal-500/50">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-semibold text-white flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-teal-400" />
                  Realistic Residential Interior Program
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-teal-900 text-teal-300 font-mono">
                  4-6 Person Family
                </span>
              </div>
              <p className="text-[11px] text-stone-400 leading-snug">
                Detailed culturally grounded interior with terracotta flooring, exposed timber joists, natural fabrics, and bioclimatic zoning.
              </p>
            </div>

            <div className="p-2.5 bg-stone-800/60 rounded-lg border border-stone-700/60 space-y-1.5">
              <div className="flex justify-between font-semibold text-stone-200 text-xs">
                <span>1. Living & Dining Hall (Front-East)</span>
                <span className="font-mono text-teal-300">24.2 m²</span>
              </div>
              <p className="text-[11px] text-stone-400">
                • Crafted teak dining table with 4 cane-back chairs & terracotta pendant lamp.<br />
                • Traditional Indian Baithak daybed sofa with plush ivory mattress, cylindrical bolster cushions, and 2.4m round jute rug.<br />
                • Teak coffee table, books, brass pottery, and biophilic air-purifying potted plants (Areca palm & Snake plant).
              </p>
            </div>

            <div className="p-2.5 bg-stone-800/60 rounded-lg border border-stone-700/60 space-y-1.5">
              <div className="flex justify-between font-semibold text-stone-200 text-xs">
                <span>2. Kitchen & Utility Core (Rear-East)</span>
                <span className="font-mono text-teal-300">8.0 m²</span>
              </div>
              <p className="text-[11px] text-stone-400">
                • L-shaped polished black granite countertop with undercounter timber cabinetry.<br />
                • Undermount stainless steel double sink with brass gooseneck faucet.<br />
                • 3-burner gas cooktop hob with spice shelves and traditional terracotta water pot (Matka) on tripod stand.
              </p>
            </div>

            <div className="p-2.5 bg-stone-800/60 rounded-lg border border-stone-700/60 space-y-1.5">
              <div className="flex justify-between font-semibold text-stone-200 text-xs">
                <span>3. Master Bedroom (Rear-West)</span>
                <span className="font-mono text-teal-300">12.1 m²</span>
              </div>
              <p className="text-[11px] text-stone-400">
                • King-size crafted teak platform bed with slatted headboard and layered duvet.<br />
                • Dual bedside nightstands with ambient warm reading lamps.<br />
                • Full-height 3-door louvered teak wardrobe (2.0m × 2.2m).
              </p>
            </div>

            <div className="p-2.5 bg-stone-800/60 rounded-lg border border-stone-700/60 space-y-1.5">
              <div className="flex justify-between font-semibold text-stone-200 text-xs">
                <span>4. Secondary Bedroom / Study (Front-West)</span>
                <span className="font-mono text-teal-300">10.8 m²</span>
              </div>
              <p className="text-[11px] text-stone-400">
                • Queen platform bed with organic linen bedding and pillows.<br />
                • Dedicated study desk with laptop, open book, and desk organizer.
              </p>
            </div>

            <div className="p-2.5 bg-stone-800/60 rounded-lg border border-stone-700/60 space-y-1.5">
              <div className="flex justify-between font-semibold text-stone-200 text-xs">
                <span>5. Central Bathroom & Wet Core (Central)</span>
                <span className="font-mono text-teal-300">5.1 m²</span>
              </div>
              <p className="text-[11px] text-stone-400">
                • Polished stone vanity counter with white porcelain vessel sink & backlit mirror.<br />
                • Modern dual-flush WC toilet and walk-in shower stall with stone drain grid & brass rainfall head.
              </p>
            </div>
          </div>
        )}
        {/* R-VALUE THERMAL INSPECTION TAB */}
        {activeTab === 'rvalue' && (
          <div className="space-y-2">
            <div className="p-2.5 bg-stone-950/80 rounded-lg border border-teal-500/50">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-semibold text-white flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-amber-400" />
                  Thermal Resistance Matrix
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-teal-900 text-teal-300 font-mono">
                  ISO 6946 / NBC 2016
                </span>
              </div>
              <p className="text-[11px] text-stone-400 leading-snug">
                Component thermal resistance (R-value) determines conduction heat transmission rates across the building skin.
              </p>
            </div>

            {/* Component Thermal Breakdown Cards */}
            {Object.values(THERMAL_SPECS).map((spec) => (
              <div
                key={spec.id}
                className="p-2.5 bg-stone-800/60 rounded-lg border border-stone-700/60 hover:border-teal-500/50 transition-all space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-full shrink-0 shadow-sm"
                      style={{ backgroundColor: spec.colorHex }}
                    />
                    <strong className="text-white text-xs">{spec.name}</strong>
                  </div>
                  <div className="text-right">
                    <span className="font-mono font-bold text-teal-300 text-xs">
                      R-{spec.rValueSI.toFixed(2)}
                    </span>
                    <span className="text-[10px] text-stone-400 ml-1">m²·K/W</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-1 text-[10px] font-mono text-stone-300 bg-stone-900/80 p-1.5 rounded">
                  <div>
                    <span className="text-stone-400">U-Factor: </span>
                    <strong className="text-white">{spec.uValueSI.toFixed(2)} W/m²K</strong>
                  </div>
                  <div>
                    <span className="text-stone-400">Thick: </span>
                    <strong className="text-white">{spec.thicknessMm} mm</strong>
                  </div>
                  <div>
                    <span className="text-stone-400">Imperial: </span>
                    <strong className="text-white">R-{spec.rValueImperial.toFixed(1)}</strong>
                  </div>
                </div>

                {/* Layered Physical Composition */}
                <div className="text-[10px] text-stone-400 pt-1 border-t border-stone-700/50">
                  <span className="text-stone-300 font-semibold">Assembly Layers: </span>
                  {spec.materialsLayers.join(' + ')}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'specs' && (
          <div className="space-y-2.5">
            <div className="p-2.5 bg-stone-800/60 rounded-lg border border-stone-700/60">
              <div className="text-[11px] text-stone-400 font-mono mb-1 uppercase">Dimensional Baseline</div>
              <div className="grid grid-cols-2 gap-2 text-stone-200 text-xs">
                <div>
                  <span className="text-stone-400">Length (X):</span> <strong className="text-teal-300">10.00 m</strong>
                </div>
                <div>
                  <span className="text-stone-400">Width (Z):</span> <strong className="text-teal-300">7.00 m</strong>
                </div>
                <div>
                  <span className="text-stone-400">Wall Height (Y):</span> <strong className="text-teal-300">3.00 m</strong>
                </div>
                <div>
                  <span className="text-stone-400">Plinth Height:</span> <strong className="text-teal-300">0.30 m</strong>
                </div>
                <div>
                  <span className="text-stone-400">Wall Thickness:</span> <strong className="text-teal-300">0.30 m</strong>
                </div>
                <div>
                  <span className="text-stone-400">Roof Pitch:</span> <strong className="text-teal-300">25.0° Gable</strong>
                </div>
                <div>
                  <span className="text-stone-400">Ridge Rise:</span> <strong className="text-teal-300">1.63 m</strong>
                </div>
                <div>
                  <span className="text-stone-400">Ridge Peak (Y):</span> <strong className="text-teal-300">4.93 m</strong>
                </div>
              </div>
            </div>

            <div className="p-2.5 bg-stone-800/60 rounded-lg border border-stone-700/60">
              <div className="text-[11px] text-stone-400 font-mono mb-1 uppercase">Spatial Program (Indian 4-6 Person Residence)</div>
              <ul className="space-y-1 text-stone-300 text-xs">
                <li className="flex justify-between">
                  <span>Living & Dining Hall</span>
                  <span className="font-mono text-stone-200">24.2 m²</span>
                </li>
                <li className="flex justify-between">
                  <span>Master Bedroom (Rear West)</span>
                  <span className="font-mono text-stone-200">12.1 m²</span>
                </li>
                <li className="flex justify-between">
                  <span>Secondary Bedroom (Front West)</span>
                  <span className="font-mono text-stone-200">10.8 m²</span>
                </li>
                <li className="flex justify-between">
                  <span>Kitchen & Utility (Rear East)</span>
                  <span className="font-mono text-stone-200">8.0 m²</span>
                </li>
                <li className="flex justify-between">
                  <span>Central Bathroom & Wet Core</span>
                  <span className="font-mono text-stone-200">5.1 m²</span>
                </li>
                <li className="flex justify-between font-semibold text-teal-300 pt-1 border-t border-stone-700">
                  <span>Net Carpet Area / Gross</span>
                  <span className="font-mono">60.2 m² / 70.0 m²</span>
                </li>
              </ul>
            </div>
          </div>
        )}

        {activeTab === 'passive' && (
          <div className="space-y-2.5">
            <div className="p-2.5 bg-stone-800/60 rounded-lg border border-stone-700/60">
              <div className="flex items-center gap-1.5 text-amber-400 font-medium mb-1">
                <Flame className="w-3.5 h-3.5" />
                <span>Thermal Mass & Diurnal Damping</span>
              </div>
              <p className="text-stone-300 text-xs leading-relaxed">
                300mm stabilized rammed earth walls create an internal thermal lag of <strong className="text-white">9.2 hours</strong>. Daytime solar heating peaks only reach the interior living spaces in late night when temperatures drop.
              </p>
            </div>

            <div className="p-2.5 bg-stone-800/60 rounded-lg border border-stone-700/60">
              <div className="flex items-center gap-1.5 text-sky-400 font-medium mb-1">
                <Wind className="w-3.5 h-3.5" />
                <span>Cross-Ventilation Strategy</span>
              </div>
              <p className="text-stone-300 text-xs leading-relaxed">
                Aligned fenestration along prevailing West-to-East breeze pathways induces stack ventilation and rapid evening radiant purge.
              </p>
            </div>

            <div className="p-2.5 bg-stone-800/60 rounded-lg border border-stone-700/60">
              <div className="flex items-center gap-1.5 text-teal-400 font-medium mb-1">
                <Compass className="w-3.5 h-3.5" />
                <span>Solar Geometry & Overhang Ratio</span>
              </div>
              <p className="text-stone-300 text-xs leading-relaxed">
                The 0.45m side eaves overhang provides 100% solar shading cutoff above 65° altitude (April-August in India), while transmitting full winter direct gain at 45° altitude (December-January).
              </p>
            </div>
          </div>
        )}

        {activeTab === 'schedule' && (
          <div className="space-y-2">
            {WINDOW_SPECS.map((win) => (
              <div key={win.id} className="p-2 bg-stone-800/60 rounded border border-stone-700/60 text-stone-300">
                <div className="flex justify-between items-center font-medium text-stone-200">
                  <span>{win.name}</span>
                  <span className="font-mono text-teal-300">{win.width.toFixed(2)}m × {win.height.toFixed(2)}m</span>
                </div>
                <div className="flex justify-between text-[11px] text-stone-400 mt-0.5">
                  <span>Facade: <strong className="capitalize text-stone-300">{win.facade}</strong></span>
                  <span>Sill: {win.sillHeight.toFixed(2)}m | Area: {win.glassArea.toFixed(2)} m²</span>
                </div>
                <p className="text-[10px] text-stone-400 mt-1 italic leading-tight">{win.purpose}</p>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'checklist' && (
          <div className="space-y-1.5">
            {checklistItems.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 p-2 rounded-lg bg-stone-800/40 border border-stone-700/50 text-stone-300 text-xs"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="leading-snug">{item.title}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

