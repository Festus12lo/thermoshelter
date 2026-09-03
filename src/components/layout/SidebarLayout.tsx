import React, { useState } from 'react';
import { PillNav, type PillNavItem } from '../ui/PillNav';
import { UserProfilePanel } from '../UserProfilePanel';
import { User, Activity } from 'lucide-react';
import { auth } from '../../lib/firebase';

interface SidebarLayoutProps {
  children: React.ReactNode;
  appState: string;
  setAppState: (state: any) => void;
  designReport: any;
  onViewCatalogue: (wallId: string, roofId: string, origin: any) => void;
}

export const SidebarLayout: React.FC<SidebarLayoutProps> = ({ 
  children, 
  appState, 
  setAppState, 
  designReport,
  onViewCatalogue 
}) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const user = auth.currentUser;

  const navItems: PillNavItem[] = [
    { 
      id: 'dashboard',
      label: 'Dashboard', 
      onClick: () => setAppState('dashboard')
    },
    { 
      id: 'configuring',
      label: 'Design', 
      onClick: () => setAppState('configuring') 
    },
    { 
      id: 'material_catalogue',
      label: 'Catalogue', 
      onClick: () => {
        let wallId = 'eps';
        let roofId = 'galvanized';
        if (designReport?.alternatives?.[0]) {
          const alt = designReport.alternatives[0];
          if (alt.wall_material?.toLowerCase().includes('aerogel')) wallId = 'aerogel';
          else if (alt.wall_material?.toLowerCase().includes('pir')) wallId = 'pir';
          else if (alt.wall_material?.toLowerCase().includes('hempcrete')) wallId = 'hempcrete';
          else if (alt.wall_material?.toLowerCase().includes('rammed')) wallId = 'ceb';
          else if (alt.wall_material?.toLowerCase().includes('hollow')) wallId = 'hollow_polymer';
          
          if (alt.roof_material?.toLowerCase().includes('low-e')) roofId = 'low_e_alu';
          else if (alt.roof_material?.toLowerCase().includes('reflective')) roofId = 'cool_roof';
          else if (alt.roof_material?.toLowerCase().includes('terracotta')) roofId = 'terracotta';
          else if (alt.roof_material?.toLowerCase().includes('green')) roofId = 'green_roof';
          else if (alt.roof_material?.toLowerCase().includes('absorbent')) roofId = 'solar_absorbent';
        }
        const origin = (appState === 'material_catalogue' || appState === 'procurement') ? 'dashboard' : appState;
        onViewCatalogue(wallId, roofId, origin);
      }
    },
    { 
      id: 'developer_view',
      label: 'Developer',
      onClick: () => setAppState('developer_view')
    }
  ];

  return (
    <div className="flex flex-col h-screen bg-[#0A0E17] overflow-hidden text-white font-sans relative">
      
      {/* Dynamic Video Background */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover opacity-60 mix-blend-screen"
        >
          <source src="/dashboard.mp4" type="video/mp4" />
        </video>
        {/* Subtle overlay gradient to ensure text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0E17] via-transparent to-[#0A0E17]/80" />
      </div>

      {/* Top Header Layer */}
      <header className="absolute top-0 left-0 right-0 h-20 px-6 lg:px-12 flex justify-between items-center z-40 pointer-events-none">
        <div className="flex items-center gap-3">
          {appState === 'dashboard' && (
            <>
              <div className="w-10 h-10 bg-cyan-500/20 rounded-xl flex items-center justify-center border border-cyan-500/50 shadow-[0_0_15px_rgba(34,211,238,0.2)]">
                <Activity className="w-5 h-5 text-cyan-400" />
              </div>
              <h1 className="text-xl font-bold font-sans tracking-tight text-white hidden sm:block">
                Thermo<span className="text-cyan-400">Shelter</span>
              </h1>
            </>
          )}
        </div>

        {/* Profile Avatar Button */}
        <button 
          onClick={() => setIsProfileOpen(true)}
          className="pointer-events-auto flex items-center gap-3 bg-black/40 backdrop-blur-md border border-white/10 p-1.5 pr-4 rounded-full hover:bg-white/10 transition-colors group"
        >
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-cyan-500 to-indigo-500 p-[2px]">
            <div className="w-full h-full bg-black rounded-full flex items-center justify-center overflow-hidden">
              <User className="w-5 h-5 text-white" />
            </div>
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-sm font-bold leading-tight">{user?.displayName || 'Lead Architect'}</p>
            <p className="text-[10px] text-cyan-400 font-mono tracking-widest uppercase">Online</p>
          </div>
        </button>
      </header>
      
      {/* Main Content Area */}
      <div className="flex-1 w-full h-full overflow-hidden relative z-10">
        {children}
      </div>

      {/* Floating Bottom Dock (PillNav) */}
      <div className="absolute bottom-6 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none">
        <PillNav 
          logo={<Activity className="w-6 h-6" />}
          items={navItems}
          activeId={appState === 'procurement' ? 'material_catalogue' : appState}
          baseColor="rgb(6, 182, 212)" // cyan-500
          pillColor="#000000"
          hoveredPillTextColor="#000000"
          pillTextColor="#ffffff"
        />
      </div>

      {/* User Profile Slide-Out Panel */}
      <UserProfilePanel 
        isOpen={isProfileOpen} 
        onClose={() => setIsProfileOpen(false)} 
        onSignOut={() => auth.signOut().then(() => setAppState('landing'))} 
      />

    </div>
  );
};
