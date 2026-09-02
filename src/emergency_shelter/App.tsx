// @ts-nocheck
import React, { useState } from 'react';
import * as THREE from 'three';
import type {  } from './types';
import { ShelterViewer } from './components/ShelterViewer';
import { ViewportControls } from './components/ViewportControls';
import { SidebarPanel } from './components/SidebarPanel';
import { AssetStatsBadge } from './components/AssetStatsBadge';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';
import { MousePointer, Move, ZoomIn } from 'lucide-react';

const INITIAL_CONFIG: ShelterConfig = {
  wallMaterialId: 'eps',
  roofMaterialId: 'galvanized',
  weathering: 0.25,
  doorOpen: false,
  doorAngle: 0,
  windowShuttersOpen: true,
  jacksDeployed: true,
  interiorLight: true,
  interiorLightColor: '#ffeaad',
  exteriorLight: true,
  explodedProgress: 0,
  showDimensions: false,
  showHotspots: true,
  roofCutaway: false,
};

export default function App() {
  const [config, setConfig] = useState<ShelterConfig>(INITIAL_CONFIG);
  const [renderMode, setRenderMode] = useState<RenderMode>('lit');
  const [environment, setEnvironment] = useState<EnvironmentPreset>('day');
  const [cameraPreset, setCameraPreset] = useState<CameraPreset>('hero');
  const [selectedHotspot, setSelectedHotspot] = useState<Hotspot | null>(null);
  const [autoRotate, setAutoRotate] = useState<boolean>(false);
  const [stats, setStats] = useState<ModelStats | null>(null);

  const [rendererInstance, setRendererInstance] = useState<THREE.WebGLRenderer | null>(null);
  const [modelRootInstance, setModelRootInstance] = useState<THREE.Object3D | null>(null);

  const urlParams = new URLSearchParams(window.location.search);
  const isEmbed = urlParams.get('embed') === 'true';

  React.useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const data = event.data;
      if (data && data.type === 'UPDATE_CONFIG') {
        if (data.config) setConfig(prev => ({ ...prev, ...data.config }));
        if (data.renderMode) setRenderMode(data.renderMode);
        if (data.environment) setEnvironment(data.environment);
        if (data.cameraPreset) setCameraPreset(data.cameraPreset);
      }
      if (data && data.type === 'DOWNLOAD_GLB' && modelRootInstance) {
        const exporter = new GLTFExporter();
        exporter.parse(
          modelRootInstance,
          function (result) {
            const output = result instanceof ArrayBuffer ? result : JSON.stringify(result);
            const blob = new Blob([output as BlobPart], { type: 'application/octet-stream' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.style.display = 'none';
            link.href = url;
            link.download = 'emergency_shelter.glb';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
          },
          function (error) {
            console.error('An error happened during GLTF export', error);
          },
          { binary: true }
        );
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [modelRootInstance]);

  return (
    <div className="relative w-screen h-screen bg-slate-950 text-slate-100 overflow-hidden font-sans select-none">
      {/* Top Floating Model Stats Bar */}
      {!isEmbed && <AssetStatsBadge stats={stats} config={config} />}

      {/* Main 3D Viewport Controls (Top Toolbar & Bottom Angle Presets) */}
      {!isEmbed && (
        <ViewportControls
          config={config}
          renderMode={renderMode}
          environment={environment}
          cameraPreset={cameraPreset}
          autoRotate={autoRotate}
          onUpdateConfig={setConfig}
          onSelectRenderMode={setRenderMode}
          onSelectEnvironment={setEnvironment}
          onSelectCameraPreset={(preset) => {
            setCameraPreset(preset);
            setSelectedHotspot(null);
          }}
          onToggleAutoRotate={() => setAutoRotate((prev) => !prev)}
        />
      )}

      {/* 3D WebGL Canvas Scene */}
      <ShelterViewer
        config={config}
        renderMode={renderMode}
        environment={environment}
        cameraPreset={cameraPreset}
        selectedHotspot={selectedHotspot}
        autoRotate={autoRotate}
        onSelectHotspot={(hp) => {
          setSelectedHotspot(hp);
        }}
        onStatsCalculated={setStats}
        rendererRefOut={(r, root) => {
          setRendererInstance(r);
          setModelRootInstance(root);
        }}
      />

      {/* Right Drawer Inspector & Customization Panel */}
      {!isEmbed && (
        <SidebarPanel
          config={config}
          selectedHotspot={selectedHotspot}
          stats={stats}
          onUpdateConfig={setConfig}
          onSelectHotspot={setSelectedHotspot}
          renderer={rendererInstance}
          modelRoot={modelRootInstance}
        />
      )}

      {/* Bottom Left Navigation Hints */}
      {!isEmbed && (
        <div className="absolute bottom-4 left-4 z-20 pointer-events-none hidden md:flex items-center gap-3 px-3 py-1.5 bg-slate-900/80 backdrop-blur-md rounded-xl border border-slate-800/80 text-[11px] text-slate-400">
          <div className="flex items-center gap-1">
            <MousePointer className="w-3 h-3 text-slate-300" />
            <span>Left-Drag: Orbit</span>
          </div>
          <div className="h-2.5 w-px bg-slate-700" />
          <div className="flex items-center gap-1">
            <Move className="w-3 h-3 text-slate-300" />
            <span>Right-Drag: Pan</span>
          </div>
          <div className="h-2.5 w-px bg-slate-700" />
          <div className="flex items-center gap-1">
            <ZoomIn className="w-3 h-3 text-slate-300" />
            <span>Scroll: Zoom</span>
          </div>
        </div>
      )}
    </div>
  );
}

