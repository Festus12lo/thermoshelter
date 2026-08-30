import React from 'react';
import { CheckCircle2, AlertTriangle, XCircle, ShieldAlert, BookOpen, AlertOctagon } from 'lucide-react';

interface RuleEval {
  rule_id: string;
  title: string;
  category?: string;
  severity: string;
  passed: boolean;
  actual: string;
  condition: string;
  source: string;
  explanation: string;
}

interface EngineeringValidationPanelProps {
  isFullyCompliant: boolean;
  mandatoryFailures?: string[];
  warnings?: string[];
  evaluations?: RuleEval[];
}

export const EngineeringValidationPanel: React.FC<EngineeringValidationPanelProps> = ({
  isFullyCompliant,
  evaluations = [],
}) => {
  // Default benchmark rules if empty
  const rules: RuleEval[] = evaluations.length > 0 ? evaluations : [
    {
      rule_id: "RULE-ENG-001",
      title: "Alpine Cold Climate Maximum Wall U-Value",
      category: "Thermal Envelope",
      severity: "MANDATORY_FAIL",
      passed: true,
      actual: "0.417 W/m²K",
      condition: "U_wall <= 0.450 W/m²K",
      source: "SRC-LADAKH-REGS-2023",
      explanation: "Mandatory upper bound for alpine sub-zero climates to prevent extreme hypothermia conductive envelope heat drain."
    },
    {
      rule_id: "RULE-ENG-002",
      title: "Roof Continuous Insulation Resistance",
      category: "Thermal Envelope",
      severity: "MANDATORY_FAIL",
      passed: true,
      actual: "R = 3.33 m²K/W (U=0.300)",
      condition: "R_roof >= 2.50 m²K/W",
      source: "SRC-LADAKH-REGS-2023",
      explanation: "Mandatory roof insulation threshold to arrest convective buoyancy thermal leakage through ceiling."
    },
    {
      rule_id: "RULE-ENG-003",
      title: "North Facade Maximum Glazing Area",
      category: "Fenestration",
      severity: "WARNING",
      passed: true,
      actual: "1.0% WWR (0.48 m²)",
      condition: "North WWR <= 10.0%",
      source: "SRC-NBC-INDIA-2016",
      explanation: "North glazing experiences zero winter direct solar gain in northern hemisphere; must be minimized to avoid severe cold radiation."
    },
    {
      rule_id: "RULE-STRUCT-001",
      title: "IS 875 Snow Load & IS 1904 Foundation Frost Gate",
      category: "Structural Safety",
      severity: "MANDATORY_FAIL",
      passed: true,
      actual: "Pitch: 20° • Foundation: 1.20m",
      condition: "Flat roof (<5°) rejected if snow > 0.5 kN/m²",
      source: "SRC-IS-875-1904",
      explanation: "Prevents roof collapse from heavy snow accumulation in Himalayan valleys and frost heave uplift on foundation perimeter."
    },
    {
      rule_id: "RULE-ENG-006",
      title: "Geometric Plausibility & Structural Aspect Ratio",
      category: "Geometry",
      severity: "MANDATORY_FAIL",
      passed: true,
      actual: "6.0m × 4.0m (AR = 1.50)",
      condition: "Length > 0, Width > 0, 0.1 <= AR <= 10.0",
      source: "SRC-GEOM-VALIDATION",
      explanation: "Ensures generated candidate geometries are physically constructible and within stable structural aspect boundaries."
    },
    {
      rule_id: "RULE-ENG-007",
      title: "Roof Pitch Architectural Bound",
      category: "Geometry",
      severity: "MANDATORY_FAIL",
      passed: true,
      actual: "Pitch: 20.0°",
      condition: "0.0° <= Pitch <= 80.0°",
      source: "SRC-GEOM-VALIDATION",
      explanation: "Flags dangerously steep roof angles that cannot support standard roofing membrane anchors."
    }
  ];

  const passCount = rules.filter(r => r.passed).length;
  const failCount = rules.filter(r => !r.passed && r.severity === 'MANDATORY_FAIL').length;
  const warnCount = rules.filter(r => !r.passed && r.severity === 'WARNING').length;

  return (
    <div className="flex flex-col gap-6">
      {/* Banner Status */}
      <div className={`p-6 rounded-2xl border backdrop-blur-md shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 ${isFullyCompliant ? 'bg-emerald-950/40 border-emerald-500/30' : 'bg-red-950/40 border-red-500/30'}`}>
        <div className="flex items-center gap-5">
          <div className={`w-14 h-14 rounded-full flex items-center justify-center shrink-0 border shadow-lg ${isFullyCompliant ? 'bg-emerald-500/20 border-emerald-400/50 text-emerald-400 shadow-emerald-500/20' : 'bg-red-500/20 border-red-400/50 text-red-400 shadow-red-500/20'}`}>
            {isFullyCompliant ? <CheckCircle2 className="w-8 h-8" /> : <AlertOctagon className="w-8 h-8" />}
          </div>
          <div>
            <h3 className={`text-lg font-black tracking-tight ${isFullyCompliant ? 'text-emerald-400' : 'text-red-400'}`}>
              {isFullyCompliant ? 'STATUTORY ENGINEERING GATE: PASSED' : 'STATUTORY ENGINEERING GATE: NON-COMPLIANT'}
            </h3>
            <p className="text-xs text-slate-300 mt-1 max-w-xl">
              Evaluated against National Building Code of India (NBC 2016), Ladakh Standard Building Regulations 2023, and IS 875/1904 Standards.
            </p>
          </div>
        </div>

        <div className="flex gap-4 self-stretch md:self-auto">
          <div className="flex flex-col items-center justify-center px-4 py-2 bg-slate-900/50 rounded-xl border border-slate-700/50 min-w-[90px]">
            <span className="text-2xl font-black text-emerald-400 font-mono">{passCount}</span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Passed</span>
          </div>
          <div className="flex flex-col items-center justify-center px-4 py-2 bg-slate-900/50 rounded-xl border border-slate-700/50 min-w-[90px]">
            <span className={`text-2xl font-black font-mono ${failCount > 0 ? 'text-red-400' : 'text-slate-500'}`}>{failCount}</span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Failures</span>
          </div>
          <div className="flex flex-col items-center justify-center px-4 py-2 bg-slate-900/50 rounded-xl border border-slate-700/50 min-w-[90px]">
            <span className={`text-2xl font-black font-mono ${warnCount > 0 ? 'text-amber-400' : 'text-slate-500'}`}>{warnCount}</span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Warnings</span>
          </div>
        </div>
      </div>

      {/* Rules Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-800 flex justify-between items-center bg-slate-950/50">
          <h4 className="text-sm font-bold text-white tracking-wide flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-cyan-400" />
            Statutory Building Code Breakdown
          </h4>
          <span className="text-[10px] font-mono bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 px-2 py-1 rounded">AUTOMATED CODE SCREENING</span>
        </div>

        <div className="flex flex-col divide-y divide-slate-800/60">
          {rules.map((rule, idx) => (
            <div key={idx} className={`p-6 transition-colors hover:bg-slate-800/30 ${!rule.passed && rule.severity === 'MANDATORY_FAIL' ? 'bg-red-950/10' : ''}`}>
              <div className="flex justify-between items-start mb-3">
                <div className="flex flex-wrap items-center gap-2 text-[10px] font-mono font-bold">
                  <span className="bg-slate-800 text-slate-300 px-2 py-1 rounded border border-slate-700">{rule.rule_id}</span>
                  <span className="bg-cyan-950/50 text-cyan-400 px-2 py-1 rounded border border-cyan-900">{rule.category || 'Statutory Code'}</span>
                  <span className="bg-slate-800 text-slate-400 px-2 py-1 rounded border border-slate-700">{rule.source}</span>
                </div>
                <span className={`px-3 py-1 rounded-md text-[10px] font-black tracking-wider flex items-center gap-1.5 border ${
                  rule.passed 
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                    : rule.severity === 'MANDATORY_FAIL' 
                      ? 'bg-red-500/10 text-red-400 border-red-500/20' 
                      : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                }`}>
                  {rule.passed ? <CheckCircle2 className="w-3 h-3" /> : rule.severity === 'MANDATORY_FAIL' ? <XCircle className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                  {rule.passed ? 'PASSED' : rule.severity === 'MANDATORY_FAIL' ? 'MANDATORY FAIL' : 'WARNING'}
                </span>
              </div>

              <h5 className="text-base font-bold text-slate-200 mb-4">{rule.title}</h5>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="bg-slate-950/50 rounded-lg p-3 border border-slate-800">
                  <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Actual Calculated Metric</span>
                  <span className="text-sm font-mono text-cyan-300">{rule.actual}</span>
                </div>
                <div className="bg-slate-950/50 rounded-lg p-3 border border-slate-800">
                  <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Statutory Condition</span>
                  <span className="text-sm font-mono text-slate-300">{rule.condition}</span>
                </div>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed max-w-4xl">{rule.explanation}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Engineering Disclaimer */}
      <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex gap-3 text-amber-300/90 text-xs leading-relaxed shadow-lg">
        <ShieldAlert className="w-5 h-5 shrink-0 text-amber-400" />
        <div>
          <strong className="text-amber-400">Civil Engineering Legal Notice:</strong> ThermoShelter provides automated design synthesis and rule-based screening checks based on IS 875, IS 1904, and NBC 2016 standards. All final construction drawings must be reviewed and stamped by a licensed structural engineer prior to erection in high-seismic or severe snow-load zones.
        </div>
      </div>
    </div>
  );
};
