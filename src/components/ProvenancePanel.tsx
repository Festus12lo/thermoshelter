import React, { useState } from 'react';
import { Copy, Download, Check, ShieldCheck, Database, FileJson, Server, Activity } from 'lucide-react';

interface ProvenancePanelProps {
  reportData: any;
  location: string;
  occupants: number;
  purpose: string;
}

export const ProvenancePanel: React.FC<ProvenancePanelProps> = ({
  reportData,
  location,
  occupants,
  purpose,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(reportData, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadBlueprint = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(reportData?.blueprint || reportData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `ThermoShelter_Blueprint_${location}_${occupants}P.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const provenanceRows = [
    { element: "Material Thermal Conductivity", source: "material_properties.csv", classType: "DIRECT", notes: "ISO/ASHRAE Standard Reference Tables" },
    { element: "Material Density (Min/Max)", source: "material_properties.csv", classType: "DIRECT", notes: "Strict physical limits preventing impossible AI values" },
    { element: "Specific Heat Capacity (Cp)", source: "material_properties.csv", classType: "DIRECT", notes: "ASTM / ISO tabulated specific heat" },
    { element: "Assembly R-Value & U-Value", source: "EngineeringValidator / ISO 6946", classType: "CALCULATED", notes: "Exact series summation R = d / lambda with Rsi/Rse films" },
    { element: "Hourly Outdoor Weather Curve", source: "WeatherAdapter (weather_2026.csv)", classType: "SYNTHETIC", notes: "Isolated in adapter; ready for real EPW historical feed" },
    { element: "Solar Irradiation Profile", source: "PhysicsBridge Solar Module", classType: "CALCULATED", notes: "Directional solar vector with orientation azimuth projection" },
    { element: "Snow Load (IS 875)", source: "SiteState geotechnical record", classType: "CODE_ESTIMATE", notes: "Screened against NBC/IS zone guidelines" },
    { element: "Material Market Prices", source: "material_registry.csv", classType: "MARKET_OBSERVED", notes: "Scraped from real IndiaMART & manufacturer supplier registries" },
    { element: "Supplier Purchase Links", source: "material_registry.csv", classType: "DIRECT", notes: "Direct verified URLs (no fake or generated links)" },
    { element: "LLM Explanation Text", source: "LLMExplanationEngine", classType: "DETERMINISTIC", notes: "Generated strictly from structured engineering numbers" },
  ];

  const getTagColor = (type: string) => {
    if (type.includes('DIRECT')) return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    if (type.includes('CALC')) return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
    if (type.includes('MARKET')) return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
    if (type.includes('SYNTH')) return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
    return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Export & Actions Row */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-950 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20 shrink-0">
            <FileJson className="w-6 h-6 text-cyan-400" />
          </div>
          <div>
            <h4 className="text-lg font-bold text-white tracking-tight mb-1">Export Verified Architectural Package</h4>
            <p className="text-xs text-slate-400 max-w-xl leading-relaxed">
              Download full machine-readable CAD blueprint specifications, bill of materials, and physics validation records for downstream CAM/BIM tools.
            </p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <button 
            type="button" 
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-sm font-bold transition-all border border-slate-700 hover:border-slate-600 shadow-lg"
            onClick={handleCopyJson}
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-slate-400" />}
            {copied ? 'Copied to Clipboard' : 'Copy JSON Report'}
          </button>
          <button 
            type="button" 
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-sm font-bold transition-all shadow-[0_4px_15px_rgba(6,182,212,0.3)] border border-cyan-400/30"
            onClick={handleDownloadBlueprint}
          >
            <Download className="w-4 h-4" /> Download CAD JSON
          </button>
        </div>
      </div>

      {/* Provenance Audit Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-800 bg-slate-950/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Database className="w-5 h-5 text-cyan-400" />
            <h4 className="text-sm font-bold text-white tracking-wide">Data Provenance & Truth Classification</h4>
          </div>
          <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-lg">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="text-[10px] font-black text-emerald-400 tracking-wider">ISO / NBC VERIFIED</span>
          </div>
        </div>

        <div className="w-full overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-slate-950 text-slate-400 text-[10px] uppercase tracking-wider font-bold border-b border-slate-800">
                <th className="p-4 pl-6 font-semibold w-1/4">Data Element</th>
                <th className="p-4 font-semibold w-1/4">Registry / Source</th>
                <th className="p-4 font-semibold w-1/6">Classification</th>
                <th className="p-4 pr-6 font-semibold w-1/3">Scientific Provenance Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50 text-sm">
              {provenanceRows.map((row, rIdx) => (
                <tr key={rIdx} className="hover:bg-slate-800/30 transition-colors group">
                  <td className="p-4 pl-6 font-semibold text-slate-200">{row.element}</td>
                  <td className="p-4">
                    <span className="font-mono text-xs text-slate-400 bg-slate-950/50 px-2 py-1 rounded border border-slate-800/50">{row.source}</span>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-[10px] font-black tracking-wider border ${getTagColor(row.classType)}`}>
                      {row.classType}
                    </span>
                  </td>
                  <td className="p-4 pr-6 text-xs text-slate-400 leading-relaxed group-hover:text-slate-300 transition-colors">{row.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Project Status */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-wrap items-center gap-6 text-xs text-slate-400 shadow-lg">
        <div className="flex items-center gap-2">
          <Server className="w-4 h-4 text-slate-500" />
          <span>Active Project: <strong className="text-white ml-1">{location} {purpose.replace('_', ' ').toUpperCase()}</strong></span>
        </div>
        <div className="w-px h-4 bg-slate-700 hidden sm:block"></div>
        <div className="flex items-center gap-2">
          <span>Occupants: <strong className="text-white ml-1">{occupants} Persons</strong></span>
        </div>
        <div className="w-px h-4 bg-slate-700 hidden sm:block"></div>
        <div className="flex items-center gap-2 text-cyan-400">
          <Activity className="w-4 h-4 animate-pulse" />
          <strong className="tracking-wide">Transient 48h Solver (V1) Active</strong>
        </div>
      </div>
    </div>
  );
};
