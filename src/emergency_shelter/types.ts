// @ts-nocheck
export interface ShelterConfig {
  wallMaterialId: string;
  roofMaterialId: string;
  weathering: number; // 0 to 1
  doorOpen: boolean;
  doorAngle: number; // 0 to 90 deg
  windowShuttersOpen: boolean;
  jacksDeployed: boolean;
  interiorLight: boolean;
  interiorLightColor: string;
  exteriorLight: boolean;
  explodedProgress: number; // 0 to 1
  showDimensions: boolean;
  showHotspots: boolean;
  roofCutaway: boolean;
}

export type RenderMode = 'lit' | 'wireframe' | 'albedo' | 'normal' | 'roughness' | 'metallic' | 'ao' | 'xray';

export type EnvironmentPreset = 'day' | 'golden' | 'night' | 'overcast' | 'desert' | 'arctic';

export type CameraPreset = 'hero' | 'front' | 'side' | 'roof' | 'door' | 'window' | 'interior' | 'ortho';

export interface Hotspot {
  id: string;
  title: string;
  shortDesc: string;
  detail: string;
  category: 'Roof' | 'Walls' | 'Door' | 'Windows' | 'Chassis' | 'Ventilation';
  position: [number, number, number];
  cameraTarget: [number, number, number];
  cameraPosition: [number, number, number];
  specs: { label: string; value: string }[];
}

export interface ModelStats {
  triangles: number;
  vertices: number;
  materials: number;
  drawCalls: number;
  dimensions: {
    length: number; // meters
    width: number;
    heightFront: number;
    heightBack: number;
    floorArea: number;
  };
}

