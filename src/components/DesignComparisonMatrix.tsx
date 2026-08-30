import React from 'react';
import { Trophy, ArrowRight, Eye, CheckCircle2, XCircle } from 'lucide-react';

interface AlternativeItem {
  rank: number;
  label: string;
  archetype_id?: string;
  design_id: string;
  geometry_summary: string;
  orientation_deg: number;
  wall_material: string;
  roof_material: string;
  avg_indoor_temp_C: number;
  min_indoor_temp_C: number;
  max_indoor_temp_C: number;
  solar_gain_kWh: number;
  heat_loss_kWh: number;
  score: number;
  verdict: string;
  is_compliant: boolean;
  explanation: string;
  multi_objective?: {
    comfort_score: number;
    solar_efficiency_score: number;
    economic_cost_score: number;
    embodied_carbon_score: number;
    safety_compliance_score: number;
    composite_utility_score: number;
    is_pareto_optimal: boolean;
  };
}

interface DesignComparisonMatrixProps {
  alternatives: AlternativeItem[];
  selectedIndex: number;
  onSelectAlternative: (index: number) => void;
  recommendationExplanation?: string;
}

export const DesignComparisonMatrix: React.FC<DesignComparisonMatrixProps> = ({
  alternatives = [],
  selectedIndex,
  onSelectAlternative,
  recommendationExplanation,
}) => {
  const recommended = alternatives[0];

  return (
    <div className="flex flex-col gap-6">
      {/* Why Design A Won Banner */}
      <div className="bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-800 to-slate-900 border border-slate-700 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
        {/* Glow behind trophy */}
        <div className="absolute top-0 left-0 w-32 h-32 bg-amber-500/20 blur-[50px] rounded-full pointer-events-none"></div>

        <div className="flex flex-col md:flex-row md:items-start gap-5 relative z-10">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-[0_0_20px_rgba(245,158,11,0.4)] shrink-0">
            <Trophy className="w-7 h-7 text-white" />
          </div>
          <div className="flex-1">
            <h4 className="text-lg font-black text-white tracking-tight flex items-center gap-2 mb-1">
              Pareto Decision Intelligence: Why the Recommended Design Won
              <span className="text-[10px] font-mono bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded uppercase">AI Decision Engine</span>
            </h4>
            <p className="text-xs text-slate-400 mb-4 max-w-3xl leading-relaxed">
              Multi-Objective Composite Utility Optimization across Thermal Comfort, Passive Solar, Economic Sourcing, and Statutory Safety.
            </p>
            <p className="text-sm text-slate-300 bg-slate-950/50 p-4 rounded-xl border border-slate-800/50 leading-relaxed italic">
              "{recommendationExplanation || (recommended ? recommended.explanation : 'Evaluated and ranked using non-dominated Pareto frontier optimization.')}"
            </p>
          </div>
        </div>

        {recommended?.multi_objective && (
          <div className="mt-8 grid grid-cols-2 md:grid-cols-5 gap-4 relative z-10">
            {[
              { label: 'Thermal Comfort', score: recommended.multi_objective.comfort_score, color: 'text-cyan-400' },
              { label: 'Solar Harvest', score: recommended.multi_objective.solar_efficiency_score, color: 'text-amber-400' },
              { label: 'Cost Efficiency', score: recommended.multi_objective.economic_cost_score, color: 'text-emerald-400' },
              { label: 'Carbon Neutrality', score: recommended.multi_objective.embodied_carbon_score, color: 'text-green-400' },
            ].map((metric, i) => (
              <div key={i} className="bg-slate-950/40 border border-slate-800/50 rounded-xl p-3 flex flex-col items-center justify-center">
                <span className={`text-2xl font-black font-mono tracking-tighter ${metric.color}`}>{metric.score.toFixed(0)}</span>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider text-center mt-1">{metric.label}</span>
              </div>
            ))}
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 flex flex-col items-center justify-center col-span-2 md:col-span-1">
              <span className="text-2xl font-black font-mono tracking-tighter text-amber-400 shadow-amber-500/50 drop-shadow-md">
                {recommended.multi_objective.composite_utility_score.toFixed(1)}<span className="text-xs text-amber-600">/100</span>
              </span>
              <span className="text-[10px] font-bold text-amber-500 uppercase tracking-wider text-center mt-1 flex items-center gap-1"><Trophy className="w-3 h-3" /> Composite Score</span>
            </div>
          </div>
        )}
      </div>

      {/* Side-by-Side Alternatives Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden flex flex-col">
        <div className="px-6 py-5 border-b border-slate-800 bg-slate-950/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h4 className="text-sm font-bold text-white tracking-wide">Generated Shelter Archetypes & Simulation Matrix</h4>
          <p className="text-xs text-slate-500">Click any row to load its 3D model, floor plan, and thermal physics.</p>
        </div>

        <div className="w-full overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="bg-slate-950 text-slate-400 text-[10px] uppercase tracking-wider font-bold border-b border-slate-800">
                <th className="p-4 pl-6 font-semibold">Rank</th>
                <th className="p-4 font-semibold">Archetype / Purpose</th>
                <th className="p-4 font-semibold">Dimensions</th>
                <th className="p-4 font-semibold">Wall / Roof Core</th>
                <th className="p-4 font-semibold text-right">Avg °C</th>
                <th className="p-4 font-semibold text-right">Min °C</th>
                <th className="p-4 font-semibold text-right">Gain / Loss</th>
                <th className="p-4 font-semibold text-center">Code</th>
                <th className="p-4 font-semibold text-center">Score</th>
                <th className="p-4 pr-6 font-semibold text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50 text-sm">
              {alternatives.map((alt, idx) => {
                const isSelected = idx === selectedIndex;
                const isTop = idx === 0;

                return (
                  <tr
                    key={alt.design_id || idx}
                    className={`group cursor-pointer transition-colors ${
                      isSelected 
                        ? 'bg-cyan-500/10 hover:bg-cyan-500/15' 
                        : isTop 
                          ? 'bg-amber-500/5 hover:bg-amber-500/10' 
                          : 'bg-slate-900 hover:bg-slate-800/80'
                    }`}
                    onClick={() => onSelectAlternative(idx)}
                  >
                    <td className="p-4 pl-6">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black font-mono text-xs ${
                        isTop ? 'bg-amber-500 text-slate-900 shadow-[0_0_10px_rgba(245,158,11,0.5)]' : 'bg-slate-800 text-slate-400 group-hover:bg-slate-700'
                      }`}>
                        #{alt.rank || idx + 1}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-slate-200">{alt.archetype_id || 'PASSIVE_OPTIMAL'}</div>
                      <div className="text-[11px] text-slate-500 max-w-[200px] truncate" title={alt.label}>{alt.label}</div>
                    </td>
                    <td className="p-4">
                      <div className="font-mono text-xs text-slate-300 bg-slate-950/50 px-2 py-1 rounded border border-slate-800 inline-block">
                        {alt.geometry_summary}
                      </div>
                      <div className="text-[10px] text-slate-500 mt-1">{alt.orientation_deg?.toFixed(0)}° (South)</div>
                    </td>
                    <td className="p-4">
                      <div className="font-semibold text-cyan-400 text-xs truncate max-w-[150px]" title={alt.wall_material}>{alt.wall_material}</div>
                      <div className="text-[11px] text-amber-400/80 mt-0.5 truncate max-w-[150px]" title={alt.roof_material}>{alt.roof_material}</div>
                    </td>
                    <td className="p-4 text-right font-mono font-bold text-slate-300">
                      {alt.avg_indoor_temp_C?.toFixed(1)}°
                    </td>
                    <td className={`p-4 text-right font-mono font-bold ${alt.min_indoor_temp_C < 0 ? 'text-blue-400 drop-shadow-[0_0_5px_rgba(96,165,250,0.5)]' : 'text-slate-300'}`}>
                      {alt.min_indoor_temp_C?.toFixed(1)}°
                    </td>
                    <td className="p-4 text-right text-xs">
                      <div className="text-amber-400 font-mono font-semibold">+{alt.solar_gain_kWh?.toFixed(0)}k</div>
                      <div className="text-red-400 font-mono font-semibold">-{alt.heat_loss_kWh?.toFixed(0)}k</div>
                    </td>
                    <td className="p-4 text-center">
                      <div className={`inline-flex items-center justify-center p-1.5 rounded-md ${alt.is_compliant ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                        {alt.is_compliant ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <div className={`inline-block px-2.5 py-1 rounded-lg font-black font-mono text-sm border ${
                        isTop ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' : 'bg-slate-800 text-slate-300 border-slate-700'
                      }`}>
                        {alt.score?.toFixed(1)}
                      </div>
                    </td>
                    <td className="p-4 pr-6 text-center">
                      <button
                        type="button"
                        className={`flex items-center justify-center w-full py-1.5 rounded-lg text-xs font-bold transition-all border ${
                          isSelected 
                            ? 'bg-cyan-500 text-slate-900 border-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.4)]' 
                            : 'bg-slate-800 text-slate-400 border-slate-700 group-hover:bg-slate-700 group-hover:text-white'
                        }`}
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectAlternative(idx);
                        }}
                      >
                        {isSelected ? (
                          <><Eye className="w-3.5 h-3.5 mr-1" /> Active</>
                        ) : (
                          <>Load <ArrowRight className="w-3.5 h-3.5 ml-1" /></>
                        )}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
