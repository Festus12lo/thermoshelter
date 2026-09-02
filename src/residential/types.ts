// @ts-nocheck
export interface BuildingDimensions {
  length: number; // 10.00 m
  width: number; // 7.00 m
  wallHeight: number; // 3.00 m
  plinthHeight: number; // 0.30 m
  wallThickness: number; // 0.30 m
  roofPitchDeg: number; // 25 deg
  eavesOverhang: number; // 0.45 m (long sides)
  gableOverhang: number; // 0.35 m (short sides)
}

export type ViewPreset = 
  | 'isometric' 
  | 'front' 
  | 'rear' 
  | 'left' 
  | 'right' 
  | 'top' 
  | 'interior'
  | 'blueprint';

export type RenderMode = 
  | 'realistic' 
  | 'thermal' 
  | 'cad' 
  | 'xray';

export type WeatherCondition = 
  | 'clear' 
  | 'partlyCloudy' 
  | 'overcast' 
  | 'monsoon' 
  | 'goldenHour' 
  | 'heatwave';

export interface SolarSettings {
  timeOfDay: number; // 6.0 to 18.0 (hours)
  season: 'summer' | 'equinox' | 'winter';
  latitude?: number; // 20.59° N (India average)
  solarAltitude?: number;
  solarAzimuth?: number;
  weather: WeatherCondition;
  shadowSoftness: number; // 0.0 (sharp) to 1.0 (very soft/diffuse)
  shadowIntensity: number; // 0.0 to 1.0
  cloudDriftSpeed: number;
  // Live API Additions
  isLiveMode?: boolean;
  liveLocation?: string;
  liveSolarIntensity?: number;
  liveTemp?: number;
}

export type ThermalUnit = 'SI' | 'Imperial';

export interface ComponentThermalSpec {
  id: string;
  name: string;
  category: 'roof' | 'wall' | 'window' | 'interior' | 'foundation' | 'door';
  rValueSI: number; // m²·K/W
  rValueImperial: number; // hr·ft²·°F/BTU
  uValueSI: number; // W/m²·K
  thicknessMm: number;
  conductivityK: number; // W/m·K
  colorHex: string;
  colorThree: number;
  description: string;
  materialsLayers: string[];
}

export interface InspectionLayers {
  roof: boolean;
  walls: boolean;
  windows: boolean;
  interior: boolean;
  foundation: boolean;
  dimensions: boolean;
  sunPath: boolean;
  ventilationFlow: boolean;
  rValueHeatmap: boolean; // Color-coded R-value thermal resistance heatmap overlay
  rValueLabels: boolean; // 3D floating R-value component badges
  roofLift: number; // 0 to 1
}

export interface WindowSpec {
  id: string;
  facade: 'front' | 'rear' | 'left' | 'right';
  name: string;
  width: number;
  height: number;
  sillHeight: number;
  posX: number;
  posZ: number;
  glassArea: number;
  orientation: string;
  purpose: string;
}

export interface DoorSpec {
  id: string;
  name: string;
  width: number;
  height: number;
  posX: number;
  posZ: number;
  type: string;
}

