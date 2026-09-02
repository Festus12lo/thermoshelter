import React, { useState } from 'react';
import { LandingPage } from './components/LandingPage';
import { ConfigurationWizard } from './components/ConfigurationWizard';
import { MainDashboard } from './components/MainDashboard';
import { Login } from './components/Login';
import { LoginPreview } from './components/LoginPreview';
import { DesignDetails } from './components/DesignDetails';
import { MaterialCatalogue } from './components/MaterialCatalogue';
import { ProcurementPlatform } from './components/ProcurementPlatform';
import { ResidentApp } from './residential/ResidentApp';
import { generateDesign } from './api';
import type { DesignRequestPayload } from './api';
import { auth } from './lib/firebase';

type AppState = 'landing' | 'login' | 'preview' | 'configuring' | 'loading' | 'design_details' | 'dashboard' | 'material_catalogue' | 'procurement' | 'resident_dashboard';

export default function App() {
  const [appState, setAppState] = useState<AppState>('landing');
  const [designReport, setDesignReport] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [catalogueOrigin, setCatalogueOrigin] = useState<AppState>('dashboard');
  const [catalogueWallId, setCatalogueWallId] = useState<string>('');
  const [catalogueRoofId, setCatalogueRoofId] = useState<string>('');

  const handleViewCatalogue = (wallId: string, roofId: string, origin: AppState) => {
    setCatalogueWallId(wallId);
    setCatalogueRoofId(roofId);
    setCatalogueOrigin(origin);
    setAppState('material_catalogue');
  };

  const handleStartConfiguration = () => {
    setAppState('login');
  };

  const handleConfigurationSubmit = async (config: DesignRequestPayload) => {
    if (config.purpose === 'resident') {
      setAppState('resident_dashboard');
      return;
    }

    setAppState('loading');
    setError(null);
    try {
      const report = await generateDesign(config);
      setDesignReport(report);
      setAppState('design_details');
    } catch (err: any) {
      setError(err.message || 'Failed to generate design.');
      setAppState('configuring');
    }
  };

  const handleReset = () => {
    setAppState('configuring');
    setDesignReport(null);
    setError(null);
  };

  if (appState === 'loading') {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/10 blur-[100px] rounded-full"></div>
        <div className="relative z-10 flex flex-col items-center">
          <svg className="animate-spin h-12 w-12 text-cyan-400 mb-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <h2 className="text-2xl font-black text-white tracking-widest uppercase">Synthesizing Pareto Optimal Designs</h2>
          <p className="text-slate-400 mt-2 font-mono text-sm">Evaluating Thermodynamic Bounds & Material Procurement...</p>
        </div>
      </div>
    );
  }

  if (appState === 'dashboard') {
    return <MainDashboard 
      designReport={designReport} 
      onReset={handleReset} 
      user={auth.currentUser}
      onViewCatalogue={(wallId, roofId) => handleViewCatalogue(wallId, roofId, 'dashboard')}
    />;
  }

  if (appState === 'configuring') {
    return (
      <div className="relative w-full h-full">
        {error && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-red-500/20 border border-red-500 text-red-200 px-6 py-3 rounded-xl z-50 shadow-2xl backdrop-blur-md">
            <span className="font-bold mr-2">Error:</span> {error}
          </div>
        )}
        <ConfigurationWizard 
          onSubmit={handleConfigurationSubmit} 
          onBack={() => setAppState('dashboard')}
          isSubmitting={false} 
        />
      </div>
    );
  }

  if (appState === 'design_details') {
    return <DesignDetails 
      designReport={designReport} 
      onDeploy={() => setAppState('dashboard')} 
      onViewCatalogue={(wallId, roofId) => handleViewCatalogue(wallId, roofId, 'design_details')}
    />;
  }

  if (appState === 'material_catalogue') {
    return <MaterialCatalogue 
      onBack={() => setAppState(catalogueOrigin)} 
      onShop={(wallId, roofId) => {
        setCatalogueWallId(wallId);
        setCatalogueRoofId(roofId);
        setAppState('procurement');
      }}
      selectedWallId={catalogueWallId}
      selectedRoofId={catalogueRoofId}
    />;
  }

  if (appState === 'procurement') {
    return <ProcurementPlatform
      onBack={() => setAppState('material_catalogue')}
      selectedWallId={catalogueWallId}
      selectedRoofId={catalogueRoofId}
    />;
  }

  if (appState === 'resident_dashboard') {
    return (
      <div className="w-screen h-screen">
        <ResidentApp />
        <button 
          onClick={() => setAppState('configuring')}
          className="absolute top-4 left-4 z-50 bg-stone-900/90 hover:bg-stone-800 text-stone-200 px-4 py-2 rounded-lg border border-stone-700 shadow-xl backdrop-blur-md transition-all text-xs font-semibold"
        >
          &larr; Back to Config
        </button>
      </div>
    );
  }

  if (appState === 'login') {
    return <Login onLogin={() => {
      // Provide mock data so the dashboard renders immediately
      setDesignReport({
        alternatives: [
          {
            id: 'mock-1',
            name: 'Standard Relief Configuration',
            explanation: 'Baseline thermal strategy for emergency relief.',
            avg_indoor_temp_C: 22,
            min_indoor_temp_C: 18,
            max_indoor_temp_C: 26,
            solar_gain_kWh: 15,
            heat_loss_kWh: 8,
            wall_material: 'EPS Insulated Panels',
            roof_material: 'Reflective Polycarbonate',
            time_series: [],
            heat_flow: [],
            comfort: []
          }
        ]
      });
      setAppState('dashboard');
    }} />;
  }

  if (appState === 'preview') {
    return <LoginPreview />;
  }

  return <LandingPage onGetStarted={handleStartConfiguration} />;
}
