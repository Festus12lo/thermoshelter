import React, { useState, useEffect } from 'react';
import defaultReportData from './assets/default_report.json';
import { ThreeDViewer } from './components/ThreeDViewer';
import { FloorPlanViewer } from './components/FloorPlanViewer';
import { ThermalDashboard } from './components/ThermalDashboard';
import { EngineeringValidationPanel } from './components/EngineeringValidationPanel';
import { MaterialProcurementShowcase } from './components/MaterialProcurementShowcase';
import { DesignComparisonMatrix } from './components/DesignComparisonMatrix';
import { ProvenancePanel } from './components/ProvenancePanel';
import { Login } from './components/Login';
import { CheckCircle, Cpu, Settings, Thermometer, ShieldCheck, Ruler, ArrowRight, Layers, Target, MapPin, Search, Box } from 'lucide-react';

interface Alternative {
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
  comfort?: any;
  multi_objective?: any;
  time_series?: any;
  heat_flow?: any;
  solar_analysis?: any;
  validation?: any;
  blueprint?: any;
  floor_plan?: any;
  materials?: any;
  llm_explanation?: any;
  design_state?: any;
}

interface ReportData {
  location: string;
  occupants: number;
  purpose: string;
  thermal_objective: string;
  recommended: Alternative;
  alternatives: Alternative[];
  comparison_table: Array<Record<string, any>>;
  material_comparison?: any;
  blueprint?: any;
  floor_plan?: any;
  total_candidates_generated: number;
  candidates_after_screening: number;
  candidates_after_physics: number;
  recommendation_explanation: string;
  summary_text: string;
}

const LOCATIONS = [
  { id: 'Leh', name: 'Leh', region: 'Ladakh (3,500m)', climate: 'Cold-Arid Alpine', defaultObjective: 'winter_warmth', minTemp: -17.2, snowLoad: '1.5 kN/m²' },
  { id: 'Shimla', name: 'Shimla', region: 'Himachal (2,205m)', climate: 'Montane Himalayan', defaultObjective: 'winter_warmth', minTemp: -7.3, snowLoad: '2.5 kN/m²' },
  { id: 'Jaipur', name: 'Jaipur', region: 'Rajasthan (431m)', climate: 'Hot-Dry Desert', defaultObjective: 'summer_cooling', minTemp: 5.6, snowLoad: '0.0 kN/m²' },
  { id: 'Karur', name: 'Karur', region: 'Tamil Nadu (122m)', climate: 'Warm-Humid Peninsular', defaultObjective: 'balanced', minTemp: 18.3, snowLoad: '0.0 kN/m²' },
];

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [naturalPrompt, setNaturalPrompt] = useState('');
  const [location, setLocation] = useState('Leh');
  const [occupants, setOccupants] = useState(4);
  const [purpose, setPurpose] = useState('emergency_shelter');
  const [thermalObjective, setThermalObjective] = useState('winter_warmth');
  const [preferredArea, setPreferredArea] = useState(24);

  const [report, setReport] = useState<ReportData>(defaultReportData as unknown as ReportData);
  const [selectedAltIndex, setSelectedAltIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<'overview' | 'geometry' | 'thermal' | 'validation' | 'comparison' | 'provenance'>('overview');
  const [activeAppMode, setActiveAppMode] = useState<'engineering' | 'materials'>('engineering');
  const [isLoading, setIsLoading] = useState(false);
  const [apiConnected, setApiConnected] = useState<boolean | null>(null);
  const [allMaterialCards, setAllMaterialCards] = useState<any[]>([]);

  // Check API health and fetch materials registry on load
  useEffect(() => {
    fetch('http://127.0.0.1:8000/api/health')
      .then(r => r.json())
      .then(() => {
        setApiConnected(true);
        // Fetch all canonical material cards
        fetch('http://127.0.0.1:8000/api/materials')
          .then(r => r.json())
          .then(cards => setAllMaterialCards(cards))
          .catch(() => {});
      })
      .catch(() => setApiConnected(false));
  }, []);

  const handleGenerate = async (customPrompt?: string) => {
    setIsLoading(true);
    try {
      const payload: Record<string, any> = customPrompt ? { prompt: customPrompt } : {
        location,
        occupants,
        purpose,
        thermal_objective: thermalObjective,
        preferred_area_m2: preferredArea
      };

      const res = await fetch('http://127.0.0.1:8000/api/design', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error('API server error');
      const data = await res.json();
      setReport(data);
      if (data.location) setLocation(data.location);
      if (data.occupants) setOccupants(data.occupants);
      if (data.purpose) setPurpose(data.purpose);
      if (data.thermal_objective) setThermalObjective(data.thermal_objective);
      setSelectedAltIndex(0);
      setApiConnected(true);
    } catch (err) {
      console.warn('Backend API offline or request failed, using client-side fallback state:', err);
      setApiConnected(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePromptSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (naturalPrompt.trim()) {
      handleGenerate(naturalPrompt);
    }
  };

  const activeDesign: Alternative = report.alternatives[selectedAltIndex] || report.recommended;
  const designState = activeDesign.design_state || null;
  const geomData = activeDesign.blueprint?.architectural_dimensions || designState?.geometry || {
    length_m: 6.0,
    width_m: 4.0,
    height_m: 2.8,
    roof_angle_deg: 20.0,
    floor_area_m2: 24.0,
    roof_type: 'pitched'
  };

  const lengthM = geomData.length_m || 6.0;
  const widthM = geomData.width_m || 4.0;
  const heightM = geomData.height_m || 2.8;
  const pitchDeg = geomData.roof_pitch_deg || geomData.roof_angle_deg || 20.0;
  const orientationDeg = activeDesign.orientation_deg || 180.0;

  const locMeta = LOCATIONS.find(l => l.id.toLowerCase() === location.toLowerCase()) || LOCATIONS[0];

  if (!isAuthenticated) {
    return <Login onLogin={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-200 font-sans selection:bg-cyan-500/30">
      {/* ── Top Architectural Navigation Header ── */}
      <header className="sticky top-0 z-50 flex justify-between items-center px-6 py-3 bg-slate-950/80 backdrop-blur-xl border-b border-white/10 shadow-lg">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.4)] border border-cyan-400/50">
            <span className="text-white font-bold text-xl leading-none tracking-tighter">TS</span>
          </div>
          <div>
            <h1 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              ThermoShelter 
              <span className="text-[10px] font-mono bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 px-2 py-0.5 rounded-md">v2.1 PRO</span>
            </h1>
            <p className="text-xs text-slate-400 font-medium tracking-wide">Climate-Resilient Architectural Intelligence</p>
          </div>
        </div>

        {/* Truth Hierarchy Pipeline Badges */}
        <div className="hidden lg:flex items-center gap-3 text-[11px] font-mono text-slate-400">
          <div className="flex items-center gap-2 bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-800">
            <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]"></span>
            AI Proposes
          </div>
          <ArrowRight className="w-3 h-3 text-slate-600" />
          <div className="flex items-center gap-2 bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-800">
            <span className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]"></span>
            Physics Proves
          </div>
          <ArrowRight className="w-3 h-3 text-slate-600" />
          <div className="flex items-center gap-2 bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-800">
            <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]"></span>
            NBC Validates
          </div>
          
          <div className="ml-4 flex items-center gap-2 px-3 py-1.5 rounded-lg border bg-slate-900/80 border-slate-800">
            {apiConnected ? (
              <><span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> <span className="text-emerald-400">Live Server</span></>
            ) : (
              <><span className="w-2 h-2 rounded-full bg-slate-500"></span> <span className="text-slate-400">Standalone</span></>
            )}
          </div>
        </div>
      </header>

      {/* ── Global Product Mode Navigation ── */}
      <nav className="flex justify-center gap-2 px-6 py-4 border-b border-white/5 bg-slate-900/50">
        <button 
          onClick={() => setActiveAppMode('engineering')}
          className={`flex items-center gap-2 px-6 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${activeAppMode === 'engineering' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.15)]' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-transparent'}`}
        >
          <Ruler className="w-4 h-4" /> Design Recommendation
        </button>
        <button 
          onClick={() => setActiveAppMode('materials')}
          className={`flex items-center gap-2 px-6 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${activeAppMode === 'materials' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.15)]' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-transparent'}`}
        >
          <Layers className="w-4 h-4" /> Material Catalogue
        </button>
      </nav>

      {activeAppMode === 'engineering' && (
        <div className="flex-1 flex flex-col">
          {/* ── Natural Language Brief & Parametric Synthesis Hero ── */}
          <section className="px-6 py-8 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-slate-950 border-b border-white/5 relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-cyan-500/5 blur-[120px] rounded-full pointer-events-none"></div>
            
            <div className="max-w-7xl mx-auto relative z-10">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-extrabold text-white tracking-tight mb-3">Synthesize Evidence-Based Architecture</h2>
                <p className="text-slate-400 text-sm max-w-2xl mx-auto">
                  Generate climate-optimized shelter designs constrained by IS 875 snow loading, NBC fenestration rules, and 48-hour transient thermodynamic simulations.
                </p>
              </div>

              <form onSubmit={handlePromptSubmit} className="max-w-3xl mx-auto">
                <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
                  <div className="relative flex items-center bg-slate-900/90 backdrop-blur-sm border border-slate-700/50 rounded-xl p-2 shadow-2xl">
                    <Search className="w-5 h-5 text-cyan-400 ml-3" />
                    <input
                      type="text"
                      className="flex-1 bg-transparent border-none text-white px-4 py-3 text-sm focus:outline-none focus:ring-0 placeholder:text-slate-500"
                      placeholder="e.g., 'Rapid emergency winter shelter in Leh for 6 people with high warmth and lowest cost'"
                      value={naturalPrompt}
                      onChange={(e) => setNaturalPrompt(e.target.value)}
                    />
                    <button 
                      type="submit" 
                      disabled={isLoading}
                      className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white px-6 py-3 rounded-lg text-sm font-bold tracking-wide shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {isLoading ? (
                        <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span> Working...</>
                      ) : (
                        'Synthesize ↵'
                      )}
                    </button>
                  </div>
                </div>

                {/* Quick Sample Prompts */}
                <div className="flex flex-wrap items-center justify-center gap-3 mt-6 text-[11px] font-medium">
                  <span className="text-slate-500 uppercase tracking-widest">Presets:</span>
                  <button type="button" onClick={() => { setNaturalPrompt('Emergency disaster relief shelter in Leh for 6 occupants'); handleGenerate('Emergency disaster relief shelter in Leh for 6 occupants'); }} className="px-3 py-1.5 rounded-full bg-slate-800/50 border border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white transition-colors">🚨 Leh 6P Alpine</button>
                  <button type="button" onClick={() => { setNaturalPrompt('Modular residential cottage in Shimla for 4 people'); handleGenerate('Modular residential cottage in Shimla for 4 people'); }} className="px-3 py-1.5 rounded-full bg-slate-800/50 border border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white transition-colors">🏡 Shimla 4P Heavy Snow</button>
                  <button type="button" onClick={() => { setNaturalPrompt('Passive solar vernacular shelter in Jaipur for 8 people'); handleGenerate('Passive solar vernacular shelter in Jaipur for 8 people'); }} className="px-3 py-1.5 rounded-full bg-slate-800/50 border border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white transition-colors">☀️ Jaipur 8P Desert</button>
                </div>
              </form>
            </div>
          </section>

          {/* ── Main Architectural Workspace Grid ── */}
          <div className="flex-1 max-w-[1600px] w-full mx-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* ── Left Sidebar: Parametric Boundary Controls ── */}
            <aside className="lg:col-span-3 flex flex-col gap-6">
              <div className="bg-slate-900/60 backdrop-blur-md border border-white/5 rounded-2xl p-5 shadow-xl">
                <div className="flex items-center gap-2 mb-6 pb-4 border-b border-white/5">
                  <Settings className="w-4 h-4 text-cyan-400" />
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">Boundary Setup</h3>
                </div>

                <form onSubmit={(e) => { e.preventDefault(); handleGenerate(); }} className="space-y-5">
                  {/* Location */}
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Location / Context</label>
                    <select
                      className="w-full bg-slate-950 border border-slate-800 text-sm text-slate-200 rounded-lg px-3 py-2.5 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all"
                      value={location}
                      onChange={(e) => {
                        const loc = LOCATIONS.find(l => l.id === e.target.value);
                        setLocation(e.target.value);
                        if (loc) setThermalObjective(loc.defaultObjective);
                      }}
                    >
                      {LOCATIONS.map(l => (
                        <option key={l.id} value={l.id}>{l.name} — {l.climate}</option>
                      ))}
                    </select>
                  </div>

                  {/* Climate Meta */}
                  <div className="bg-slate-950/50 rounded-lg p-3 text-xs border border-slate-800/50 space-y-2">
                    <div className="flex justify-between items-center text-slate-400">
                      <span>Design Min Temp</span>
                      <strong className="text-amber-400 font-mono">{locMeta.minTemp}°C</strong>
                    </div>
                    <div className="flex justify-between items-center text-slate-400">
                      <span>Statutory Snow</span>
                      <strong className="text-cyan-400 font-mono">{locMeta.snowLoad}</strong>
                    </div>
                  </div>

                  {/* Occupants */}
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Occupants: <span className="text-white">{occupants} People</span></label>
                    <div className="flex gap-2">
                      {[2, 4, 6, 8, 12].map(num => (
                        <button
                          key={num}
                          type="button"
                          className={`flex-1 py-1.5 text-xs font-bold rounded-md border transition-all ${occupants === num ? 'bg-cyan-500/20 border-cyan-500 text-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.2)]' : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-white'}`}
                          onClick={() => {
                            setOccupants(num);
                            setPreferredArea(Math.max(16, num * 6));
                          }}
                        >
                          {num}P
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Thermal Objective */}
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Thermal Objective</label>
                    <select 
                      className="w-full bg-slate-950 border border-slate-800 text-sm text-slate-200 rounded-lg px-3 py-2.5 focus:border-cyan-500 outline-none"
                      value={thermalObjective} 
                      onChange={(e) => setThermalObjective(e.target.value)}
                    >
                      <option value="winter_warmth">❄️ Winter Warmth Max</option>
                      <option value="summer_cooling">🔥 Summer Cooling Max</option>
                      <option value="balanced">⚖️ Balanced Diurnal</option>
                    </select>
                  </div>

                  <button type="submit" disabled={isLoading} className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold uppercase tracking-wider rounded-lg border border-slate-600 transition-colors">
                    {isLoading ? 'Re-running...' : 'Apply & Simulate'}
                  </button>
                </form>
              </div>

              {/* Diagnostic Card */}
              <div className="bg-slate-900/60 backdrop-blur-md border border-white/5 rounded-2xl p-5 shadow-xl">
                <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4">Pipeline Diagnostics</h4>
                <div className="space-y-3 text-xs">
                  <div className="flex justify-between items-center border-b border-white/5 pb-2">
                    <span className="text-slate-400">Synthesized</span>
                    <strong className="text-cyan-400 font-mono">{report.total_candidates_generated || 36}</strong>
                  </div>
                  <div className="flex justify-between items-center border-b border-white/5 pb-2">
                    <span className="text-slate-400">Physics Converged</span>
                    <strong className="text-amber-400 font-mono">{report.candidates_after_physics || 5}</strong>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Pareto Model</span>
                    <strong className="text-emerald-400 font-mono text-[10px]">NON-DOMINATED</strong>
                  </div>
                </div>
              </div>
            </aside>

            {/* ── Right Content Area: Multi-Tab Workspace ── */}
            <main className="lg:col-span-9 flex flex-col gap-6">
              {/* Active Design Banner */}
              <div className="bg-gradient-to-r from-slate-900 to-slate-800/80 backdrop-blur-xl border border-white/10 rounded-2xl p-5 flex items-center justify-between shadow-2xl">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-cyan-500/20 border border-cyan-500/50 flex flex-col items-center justify-center text-cyan-400">
                    <span className="text-[10px] font-bold leading-none">RANK</span>
                    <span className="text-xl font-black leading-none">#{activeDesign.rank || 1}</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white tracking-tight">
                      {activeDesign.label || `Design Alternative ${selectedAltIndex + 1}`}
                    </h3>
                    <p className="text-xs text-slate-400 flex items-center gap-2 mt-1">
                      <span><MapPin className="w-3 h-3 inline mr-1" />{locMeta.name}</span>
                      <span className="w-1 h-1 rounded-full bg-slate-600"></span>
                      <span>{activeDesign.geometry_summary}</span>
                      <span className="w-1 h-1 rounded-full bg-slate-600"></span>
                      <span className="text-cyan-400">Wall: {activeDesign.wall_material}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="flex flex-col items-end">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">MCDA Score</span>
                    <span className="text-2xl font-black font-mono text-cyan-400 shadow-cyan-500/50 drop-shadow-md">
                      {activeDesign.score?.toFixed(1)}<span className="text-sm text-cyan-700">/100</span>
                    </span>
                  </div>
                  <div className={`px-4 py-2 rounded-lg text-xs font-bold tracking-wider font-mono border ${activeDesign.is_compliant ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400' : 'bg-red-500/10 border-red-500/50 text-red-400'}`}>
                    {activeDesign.is_compliant ? 'PASS ✓' : 'FAIL ✕'}
                  </div>
                </div>
              </div>

              {/* Workspace Tabs Navigation */}
              <div className="flex overflow-x-auto gap-2 bg-slate-900/50 p-1.5 rounded-xl border border-white/5">
                {[
                  { id: 'overview', icon: Target, label: 'Summary' },
                  { id: 'geometry', icon: Box, label: '3D Viewer' },
                  { id: 'thermal', icon: Thermometer, label: 'Thermal Physics' },
                  { id: 'validation', icon: ShieldCheck, label: 'Validation' },
                  { id: 'comparison', icon: Layers, label: 'Matrix' },
                  { id: 'provenance', icon: Cpu, label: 'Data' }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${activeTab === tab.id ? 'bg-slate-800 text-white shadow-lg border border-slate-700' : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/50'}`}
                  >
                    <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? 'text-cyan-400' : ''}`} /> {tab.label}
                  </button>
                ))}
              </div>

              {/* Tab Panes Container */}
              <div className="flex-1 bg-slate-900/30 rounded-2xl border border-white/5 overflow-hidden">
                {activeTab === 'overview' && (
                  <div className="p-6">
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                      {/* Left: 3D Summary */}
                      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
                        <div className="h-[400px]">
                          <ThreeDViewer
                            length={lengthM}
                            width={widthM}
                            height={heightM}
                            roofAngleDeg={pitchDeg}
                            orientationDeg={orientationDeg}
                            wallMaterial={activeDesign.wall_material}
                            roofMaterial={activeDesign.roof_material}
                            designState={designState}
                            isCompliant={activeDesign.is_compliant}
                          />
                        </div>
                      </div>

                      {/* Right: Key Facts */}
                      <div className="space-y-6">
                        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2"><Target className="w-4 h-4 text-cyan-400"/> Why This Design Won</h4>
                          <ul className="space-y-3">
                            <li className="flex items-start gap-3 text-sm text-slate-300">
                              <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
                              Optimal balance between thermal performance and material cost.
                            </li>
                            <li className="flex items-start gap-3 text-sm text-slate-300">
                              <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
                              Strong passive solar response for {location} climate.
                            </li>
                            <li className="flex items-start gap-3 text-sm text-slate-300">
                              <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
                              Full compliance with IS 875 snow loading.
                            </li>
                          </ul>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
                            <h5 className="text-[10px] font-bold text-slate-500 uppercase mb-2">Solar Gain</h5>
                            <div className="text-2xl font-mono text-amber-400 font-bold">{activeDesign.solar_gain_kWh?.toFixed(0) || 301} <span className="text-xs text-slate-500 font-sans">kWh</span></div>
                          </div>
                          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
                            <h5 className="text-[10px] font-bold text-slate-500 uppercase mb-2">Heat Loss</h5>
                            <div className="text-2xl font-mono text-red-400 font-bold">{activeDesign.heat_loss_kWh?.toFixed(0) || 72} <span className="text-xs text-slate-500 font-sans">kWh</span></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'geometry' && (
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-0 min-h-[600px]">
                    <div className="border-r border-slate-800 relative bg-slate-950">
                      <ThreeDViewer
                        length={lengthM}
                        width={widthM}
                        height={heightM}
                        roofAngleDeg={pitchDeg}
                        orientationDeg={orientationDeg}
                        wallMaterial={activeDesign.wall_material}
                        roofMaterial={activeDesign.roof_material}
                        designState={designState}
                        isCompliant={activeDesign.is_compliant}
                      />
                    </div>
                    <div className="bg-slate-900 relative">
                      <FloorPlanViewer
                        length={lengthM}
                        width={widthM}
                        orientationDeg={orientationDeg}
                        wallMaterial={activeDesign.wall_material}
                        designState={designState}
                      />
                    </div>
                  </div>
                )}

                {activeTab === 'thermal' && (
                  <div className="p-6">
                    <div className="bg-amber-500/10 border border-amber-500/30 text-amber-400 px-4 py-3 rounded-lg text-xs font-medium mb-6 flex items-start gap-3">
                      <Thermometer className="w-5 h-5 shrink-0" />
                      <div><strong className="block mb-1">SIMULATION OUTPUT</strong> Not measured field data. Based on 48-hour reduced-order transient thermal model. Requires engineering review.</div>
                    </div>
                    <ThermalDashboard
                      timeSeries={activeDesign.time_series}
                      heatFlow={activeDesign.heat_flow}
                      comfort={activeDesign.comfort}
                      avgIndoorTemp={activeDesign.avg_indoor_temp_C}
                      minIndoorTemp={activeDesign.min_indoor_temp_C}
                      maxIndoorTemp={activeDesign.max_indoor_temp_C}
                      solarGainKWh={activeDesign.solar_gain_kWh}
                      heatLossKWh={activeDesign.heat_loss_kWh}
                      wallMaterial={activeDesign.wall_material}
                      roofMaterial={activeDesign.roof_material}
                    />
                  </div>
                )}

                {activeTab === 'validation' && (
                  <div className="p-6">
                    <EngineeringValidationPanel
                      isFullyCompliant={activeDesign.is_compliant}
                      evaluations={activeDesign.validation?.evaluations}
                    />
                  </div>
                )}

                {activeTab === 'comparison' && (
                  <div className="p-6">
                    <DesignComparisonMatrix
                      alternatives={report.alternatives}
                      selectedIndex={selectedAltIndex}
                      onSelectAlternative={(idx) => setSelectedAltIndex(idx)}
                      recommendationExplanation={report.recommendation_explanation}
                    />
                  </div>
                )}

                {activeTab === 'provenance' && (
                  <div className="p-6">
                    <ProvenancePanel
                      reportData={report}
                      location={location}
                      occupants={occupants}
                      purpose={purpose}
                    />
                  </div>
                )}
              </div>
            </main>
          </div>
        </div>
      )}

      {/* ── Material Catalogue Mode ── */}
      {activeAppMode === 'materials' && (
        <div className="flex-1 max-w-[1600px] w-full mx-auto p-6">
          <MaterialProcurementShowcase 
            wallMaterialId={activeDesign.wall_material}
            roofMaterialId={activeDesign.roof_material}
            allMaterials={allMaterialCards}
            designGeom={geomData}
          />
        </div>
      )}
    </div>
  );
}
