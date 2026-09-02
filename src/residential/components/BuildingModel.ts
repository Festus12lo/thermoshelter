// @ts-nocheck
import * as THREE from 'three';
import { 
  createRammedEarthTexture, 
  createRoofSlateTexture, 
  createPlinthStoneTexture, 
  createWoodTexture, 
  createFloorTileTexture,
  createGraniteTexture,
  createFabricTexture,
  createWovenCaneTexture,
  createJuteRugTexture
} from '../utils/textureGenerator';
import type {} from '../types';
import { THERMAL_SPECS } from '../data/thermalSpecs';
import { buildRealisticStructure } from './StructuralTrussModel';
import { buildRealisticInterior } from './InteriorModel';

export const DEFAULT_DIMENSIONS: BuildingDimensions = {
  length: 10.00,
  width: 7.00,
  wallHeight: 3.00,
  plinthHeight: 0.30,
  wallThickness: 0.30,
  roofPitchDeg: 25.0,
  eavesOverhang: 0.45,
  gableOverhang: 0.35,
};

export const WINDOW_SPECS: WindowSpec[] = [
  {
    id: 'W_FRONT_1',
    facade: 'front',
    name: 'Primary Solar Glazing - West Living',
    width: 1.80,
    height: 1.50,
    sillHeight: 0.80,
    posX: -2.75,
    posZ: 3.50,
    glassArea: 2.70,
    orientation: 'South / Solar Primary',
    purpose: 'High solar heat gain in winter, shaded by 0.45m eaves in peak summer'
  },
  {
    id: 'W_FRONT_2',
    facade: 'front',
    name: 'Primary Solar Glazing - East Dining',
    width: 1.80,
    height: 1.50,
    sillHeight: 0.80,
    posX: 2.75,
    posZ: 3.50,
    glassArea: 2.70,
    orientation: 'South / Solar Primary',
    purpose: 'Natural daylighting and winter direct solar gain'
  },
  {
    id: 'W_LEFT_1',
    facade: 'left',
    name: 'Cross-Ventilation Window - Primary Bedroom',
    width: 1.20,
    height: 1.20,
    sillHeight: 0.90,
    posX: -5.00,
    posZ: 1.60,
    glassArea: 1.44,
    orientation: 'West / Prevailing Breeze',
    purpose: 'Cross-ventilation airflow and evening daylight'
  },
  {
    id: 'W_LEFT_2',
    facade: 'left',
    name: 'Ventilation Window - Utility/Bath',
    width: 1.20,
    height: 1.20,
    sillHeight: 0.90,
    posX: -5.00,
    posZ: -1.60,
    glassArea: 1.44,
    orientation: 'West',
    purpose: 'High-level stack effect and moisture exhaust'
  },
  {
    id: 'W_RIGHT_1',
    facade: 'right',
    name: 'Morning Light Window - Secondary Bedroom',
    width: 1.20,
    height: 1.20,
    sillHeight: 0.90,
    posX: 5.00,
    posZ: 1.60,
    glassArea: 1.44,
    orientation: 'East',
    purpose: 'Gentle morning sun capture with minimal afternoon thermal load'
  },
  {
    id: 'W_RIGHT_2',
    facade: 'right',
    name: 'Kitchen Garden Window',
    width: 1.20,
    height: 1.20,
    sillHeight: 0.90,
    posX: 5.00,
    posZ: -1.60,
    glassArea: 1.44,
    orientation: 'East',
    purpose: 'Kitchen cross-ventilation'
  },
  {
    id: 'W_REAR_1',
    facade: 'rear',
    name: 'Thermal Buffer Window - Bedroom 1',
    width: 1.40,
    height: 1.20,
    sillHeight: 0.90,
    posX: -2.50,
    posZ: -3.50,
    glassArea: 1.68,
    orientation: 'North / Cool Side',
    purpose: 'Diffused daylight without excessive solar radiation heat gain'
  },
  {
    id: 'W_REAR_2',
    facade: 'rear',
    name: 'Thermal Buffer Window - Kitchen',
    width: 1.40,
    height: 1.20,
    sillHeight: 0.90,
    posX: 2.50,
    posZ: -3.50,
    glassArea: 1.68,
    orientation: 'North / Cool Side',
    purpose: 'Consistent glare-free natural task lighting'
  }
];

export const DOOR_SPECS: DoorSpec[] = [
  {
    id: 'D_MAIN',
    name: 'Main Insulated Entrance Door',
    width: 0.90,
    height: 2.10,
    posX: 0.00,
    posZ: 3.50,
    type: 'Solid Teak Composite Insulated Core'
  }
];

/** Helper to generate 3D billboard sprites for R-value annotations */
function createRValueBadgeSprite(
  title: string,
  rValStr: string,
  subtext: string,
  accentColorHex: string
): THREE.Sprite {
  const canvas = document.createElement('canvas');
  canvas.width = 400;
  canvas.height = 140;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.Sprite();

  // Dark glass background
  ctx.fillStyle = 'rgba(15, 23, 42, 0.93)';
  ctx.strokeStyle = accentColorHex;
  ctx.lineWidth = 4;
  
  const r = 16;
  const w = 392, h = 132, x = 4, y = 4;
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Glowing indicator dot
  ctx.fillStyle = accentColorHex;
  ctx.beginPath();
  ctx.arc(36, 42, 10, 0, Math.PI * 2);
  ctx.fill();

  // Component Title
  ctx.font = 'bold 22px system-ui, -apple-system, sans-serif';
  ctx.fillStyle = '#f8fafc';
  ctx.textAlign = 'left';
  ctx.fillText(title, 56, 48);

  // R-Value Badge Box
  ctx.fillStyle = accentColorHex;
  const badgeW = 142;
  ctx.fillRect(w - badgeW - 6, 16, badgeW, 46);
  ctx.font = 'bold 22px monospace, monospace';
  ctx.fillStyle = '#0f172a';
  ctx.textAlign = 'center';
  ctx.fillText(rValStr, w - badgeW / 2 - 6, 47);

  // Subtext (U-value, physical thickness, property)
  ctx.textAlign = 'left';
  ctx.font = '17px system-ui, -apple-system, sans-serif';
  ctx.fillStyle = '#94a3b8';
  ctx.fillText(subtext, 26, 102);

  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  const spriteMat = new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
    depthTest: false,
  });

  const sprite = new THREE.Sprite(spriteMat);
  sprite.scale.set(1.9, 0.66, 1);
  return sprite;
}

export class BuildingModel {
  public rootGroup: THREE.Group;
  public roofGroup: THREE.Group;
  public wallsGroup: THREE.Group;
  public windowsGroup: THREE.Group;
  public doorsGroup: THREE.Group;
  public foundationGroup: THREE.Group;
  public interiorGroup: THREE.Group;
  public dimensionsGroup: THREE.Group;
  public thermalVectorsGroup: THREE.Group;
  public rValueBadgesGroup: THREE.Group;

  private materials: Record<string, THREE.Material> = {};
  private renderMode: RenderMode = 'realistic';
  private isRValueHeatmapActive: boolean = false;
  private dimensions: BuildingDimensions;

  private activeWallMaterial?: THREE.Material;
  private activeRoofMaterial?: THREE.Material;

  constructor(dims: BuildingDimensions = DEFAULT_DIMENSIONS) {
    this.dimensions = dims;
    this.rootGroup = new THREE.Group();
    this.rootGroup.name = 'ThermoShelter_Building';

    this.foundationGroup = new THREE.Group();
    this.foundationGroup.name = 'Foundation_Plinth';

    this.wallsGroup = new THREE.Group();
    this.wallsGroup.name = 'Thermal_Walls';

    this.roofGroup = new THREE.Group();
    this.roofGroup.name = 'Gable_Roof_Assembly';

    this.windowsGroup = new THREE.Group();
    this.windowsGroup.name = 'Windows_Glazing';

    this.doorsGroup = new THREE.Group();
    this.doorsGroup.name = 'Doors_Entrances';

    this.interiorGroup = new THREE.Group();
    this.interiorGroup.name = 'Interior_Partitions';

    this.dimensionsGroup = new THREE.Group();
    this.dimensionsGroup.name = 'Architectural_Dimensions';

    this.thermalVectorsGroup = new THREE.Group();
    this.thermalVectorsGroup.name = 'Thermal_Airflow_Vectors';

    this.rValueBadgesGroup = new THREE.Group();
    this.rValueBadgesGroup.name = 'RValue_3D_Badges';

    this.initMaterials();
    this.buildGeometry();
    this.buildRValueBadges();

    this.rootGroup.add(this.foundationGroup);
    this.rootGroup.add(this.wallsGroup);
    this.rootGroup.add(this.roofGroup);
    this.rootGroup.add(this.windowsGroup);
    this.rootGroup.add(this.doorsGroup);
    this.rootGroup.add(this.interiorGroup);
    this.rootGroup.add(this.dimensionsGroup);
    this.rootGroup.add(this.thermalVectorsGroup);
    this.rootGroup.add(this.rValueBadgesGroup);
  }

  private initMaterials() {
    const rammedEarthTex = createRammedEarthTexture();
    const roofSlateTex = createRoofSlateTexture();
    const plinthStoneTex = createPlinthStoneTexture();
    const woodTex = createWoodTexture();
    const floorTileTex = createFloorTileTexture();
    const graniteTex = createGraniteTexture();
    const fabricCreamTex = createFabricTexture('#f4efe6');
    const fabricRustTex = createFabricTexture('#c26442');
    const fabricTealTex = createFabricTexture('#1e5b56');
    const caneTex = createWovenCaneTexture();
    const juteTex = createJuteRugTexture();

    // 1. Realistic Architectural & Structural PBR Materials
    this.materials['earthWall'] = new THREE.MeshStandardMaterial({
      map: rammedEarthTex,
      roughnessMap: rammedEarthTex,
      roughness: 0.95,
      metalness: 0.02,
      bumpMap: rammedEarthTex,
      bumpScale: 0.15,
      color: 0xeadccb,
    });

    this.materials['roofSlate'] = new THREE.MeshStandardMaterial({
      map: roofSlateTex,
      roughnessMap: roofSlateTex,
      roughness: 0.85,
      metalness: 0.12,
      bumpMap: roofSlateTex,
      bumpScale: 0.12,
      color: 0x3a4047,
    });

    this.materials['roofFascia'] = new THREE.MeshStandardMaterial({
      map: woodTex,
      roughness: 0.75,
      metalness: 0.1,
      color: 0x3d2716,
    });

    this.materials['wood'] = new THREE.MeshStandardMaterial({
      map: woodTex,
      roughness: 0.7,
      metalness: 0.08,
      color: 0x6e472a,
    });

    this.materials['darkWood'] = new THREE.MeshStandardMaterial({
      map: woodTex,
      roughness: 0.65,
      metalness: 0.1,
      color: 0x382214,
    });

    this.materials['metal'] = new THREE.MeshStandardMaterial({
      color: 0x334155,
      roughness: 0.4,
      metalness: 0.8,
    });

    this.materials['copperGutter'] = new THREE.MeshStandardMaterial({
      color: 0x8a5a36,
      roughness: 0.45,
      metalness: 0.75,
    });

    this.materials['plinth'] = new THREE.MeshStandardMaterial({
      map: plinthStoneTex,
      roughnessMap: plinthStoneTex,
      roughness: 0.9,
      metalness: 0.08,
      bumpMap: plinthStoneTex,
      bumpScale: 0.12,
      color: 0x9e988c,
    });

    this.materials['stone'] = this.materials['plinth'];

    this.materials['floor'] = new THREE.MeshStandardMaterial({
      map: floorTileTex,
      roughness: 0.7,
      metalness: 0.05,
      color: 0xbf7854,
    });

    this.materials['woodDoor'] = new THREE.MeshStandardMaterial({
      map: woodTex,
      roughness: 0.6,
      metalness: 0.1,
      color: 0x4a2a16,
    });

    this.materials['frame'] = new THREE.MeshStandardMaterial({
      color: 0x22262a,
      roughness: 0.5,
      metalness: 0.4,
    });

    this.materials['glass'] = new THREE.MeshPhysicalMaterial({
      color: 0xd6e8f5,
      transparent: true,
      opacity: 0.45,
      roughness: 0.05,
      metalness: 0.1,
      transmission: 0.88,
      ior: 1.52,
      reflectivity: 0.7,
    });

    this.materials['interiorWall'] = new THREE.MeshStandardMaterial({
      color: 0xf3ede3,
      roughness: 0.88,
      metalness: 0.02,
    });

    // Interior Finishes & Furniture Materials
    this.materials['granite'] = new THREE.MeshStandardMaterial({
      map: graniteTex,
      roughness: 0.25,
      metalness: 0.15,
      color: 0x1f2926,
    });

    this.materials['fabricCream'] = new THREE.MeshStandardMaterial({
      map: fabricCreamTex,
      roughness: 0.85,
      metalness: 0.02,
      color: 0xf3ede3,
    });

    this.materials['fabricRust'] = new THREE.MeshStandardMaterial({
      map: fabricRustTex,
      roughness: 0.85,
      metalness: 0.02,
      color: 0xc46849,
    });

    this.materials['fabricTeal'] = new THREE.MeshStandardMaterial({
      map: fabricTealTex,
      roughness: 0.85,
      metalness: 0.02,
      color: 0x1c5953,
    });

    this.materials['brass'] = new THREE.MeshStandardMaterial({
      color: 0xd4af37,
      roughness: 0.35,
      metalness: 0.85,
    });

    this.materials['ceramicWhite'] = new THREE.MeshStandardMaterial({
      color: 0xf8fafc,
      roughness: 0.2,
      metalness: 0.05,
    });

    this.materials['glassMirror'] = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      roughness: 0.05,
      metalness: 0.95,
    });

    this.materials['juteRug'] = new THREE.MeshStandardMaterial({
      map: juteTex,
      roughness: 0.95,
      metalness: 0.02,
      color: 0xd4b88f,
    });

    this.materials['caneWoven'] = new THREE.MeshStandardMaterial({
      map: caneTex,
      roughness: 0.8,
      metalness: 0.05,
      color: 0xd9b982,
    });

    this.materials['plantGreen'] = new THREE.MeshStandardMaterial({
      color: 0x2e6f40,
      roughness: 0.6,
      metalness: 0.05,
      side: THREE.DoubleSide,
    });

    this.materials['terracottaClay'] = new THREE.MeshStandardMaterial({
      color: 0xbd5a36,
      roughness: 0.8,
      metalness: 0.05,
    });

    // 2. Scientific R-Value Thermal Resistance Heatmap Materials
    // Deep Indigo / Royal Blue for Maximum Thermal Resistance (Roof: R=4.50 m²·K/W)
    this.materials['rValueRoof'] = new THREE.MeshStandardMaterial({
      color: 0x4f46e5,
      roughness: 0.4,
      metalness: 0.15,
      emissive: 0x1e1b4b,
      emissiveIntensity: 0.25,
    });

    // Teal for High Mass Earthen Envelope (Walls: R=2.10 m²·K/W)
    this.materials['rValueWall'] = new THREE.MeshStandardMaterial({
      color: 0x0d9488,
      roughness: 0.5,
      metalness: 0.1,
      emissive: 0x042f2e,
      emissiveIntensity: 0.2,
    });

    // Lime Green for Internal CSEB Partitions (Interior: R=1.05 m²·K/W)
    this.materials['rValueInterior'] = new THREE.MeshStandardMaterial({
      color: 0x84cc16,
      roughness: 0.5,
      metalness: 0.05,
      emissive: 0x1a2e05,
      emissiveIntensity: 0.2,
    });

    // Amber Yellow for Insulated Teak Door (Door: R=1.10 m²·K/W)
    this.materials['rValueDoor'] = new THREE.MeshStandardMaterial({
      color: 0xeab308,
      roughness: 0.5,
      metalness: 0.1,
      emissive: 0x451a03,
      emissiveIntensity: 0.2,
    });

    // Orange for Stone Plinth Base (Plinth: R=0.80 m²·K/W)
    this.materials['rValuePlinth'] = new THREE.MeshStandardMaterial({
      color: 0xf97316,
      roughness: 0.6,
      metalness: 0.08,
      emissive: 0x431407,
      emissiveIntensity: 0.2,
    });

    // Dark Orange-Red for Window Frames (Frame: R=0.65 m²·K/W)
    this.materials['rValueFrame'] = new THREE.MeshStandardMaterial({
      color: 0xea580c,
      roughness: 0.5,
      metalness: 0.15,
      emissive: 0x431407,
      emissiveIntensity: 0.25,
    });

    // Bright Crimson Red for Low Resistance Glazing Zone (Glazing: R=0.48 m²·K/W)
    this.materials['rValueGlazing'] = new THREE.MeshPhysicalMaterial({
      color: 0xef4444,
      transparent: true,
      opacity: 0.75,
      roughness: 0.1,
      metalness: 0.1,
      transmission: 0.25,
      emissive: 0x7f1d1d,
      emissiveIntensity: 0.4,
    });

    // 3. Alternate Analysis Modes
    this.materials['thermalHighMass'] = this.materials['rValueWall'];
    this.materials['thermalSolarGlass'] = this.materials['rValueGlazing'];
    this.materials['thermalInsulatedRoof'] = this.materials['rValueRoof'];
  }

  private buildGeometry() {
    const { length, width, wallHeight, plinthHeight, wallThickness, roofPitchDeg, eavesOverhang, gableOverhang } = this.dimensions;

    const halfL = length / 2; // 5.00
    const halfW = width / 2;  // 3.50
    const floorY = plinthHeight; // 0.30
    const wallTopY = floorY + wallHeight; // 3.30
    const pitchRad = (roofPitchDeg * Math.PI) / 180;
    const ridgeRise = halfW * Math.tan(pitchRad); // ~1.632 m
    const ridgeY = wallTopY + ridgeRise; // ~4.932 m

    // 1. FOUNDATION PLINTH (0.30m height)
    const plinthGeo = new THREE.BoxGeometry(length, plinthHeight, width);
    const plinthMesh = new THREE.Mesh(plinthGeo, this.materials['plinth']);
    plinthMesh.position.set(0, plinthHeight / 2, 0);
    plinthMesh.castShadow = true;
    plinthMesh.receiveShadow = true;
    plinthMesh.userData = { componentId: 'foundation', title: '0.30m Dressed Stone Foundation Plinth' };
    this.foundationGroup.add(plinthMesh);

    // Foundation Base Edge
    const basePlinthGeo = new THREE.BoxGeometry(length + 0.10, 0.08, width + 0.10);
    const basePlinthMesh = new THREE.Mesh(basePlinthGeo, this.materials['plinth']);
    basePlinthMesh.position.set(0, 0.04, 0);
    basePlinthMesh.receiveShadow = true;
    basePlinthMesh.userData = { componentId: 'foundation', title: 'Stone Masonry Footing Edge' };
    this.foundationGroup.add(basePlinthMesh);

    // Finished Floor
    const floorGeo = new THREE.BoxGeometry(length - 2 * wallThickness, 0.02, width - 2 * wallThickness);
    const floorMesh = new THREE.Mesh(floorGeo, this.materials['floor']);
    floorMesh.position.set(0, floorY + 0.01, 0);
    floorMesh.receiveShadow = true;
    floorMesh.userData = { componentId: 'foundation', title: 'Internal Terracotta/Stone Tiled Floor' };
    this.foundationGroup.add(floorMesh);

    // Entrance Steps
    const step1Geo = new THREE.BoxGeometry(1.50, 0.15, 0.70);
    const step1Mesh = new THREE.Mesh(step1Geo, this.materials['plinth']);
    step1Mesh.position.set(0, 0.075, halfW + 0.35);
    step1Mesh.castShadow = true;
    step1Mesh.receiveShadow = true;
    step1Mesh.userData = { componentId: 'foundation', title: 'Entrance Masonry Step' };
    this.foundationGroup.add(step1Mesh);

    const step2Geo = new THREE.BoxGeometry(1.20, 0.15, 0.35);
    const step2Mesh = new THREE.Mesh(step2Geo, this.materials['plinth']);
    step2Mesh.position.set(0, 0.225, halfW + 0.175);
    step2Mesh.castShadow = true;
    step2Mesh.receiveShadow = true;
    step2Mesh.userData = { componentId: 'foundation', title: 'Entrance Plinth Threshold' };
    this.foundationGroup.add(step2Mesh);

    // 2. EXTERIOR WALLS (0.30m Rammed Earth)
    const addWallBlock = (x: number, y: number, z: number, w: number, h: number, d: number) => {
      const geo = new THREE.BoxGeometry(w, h, d);
      const mesh = new THREE.Mesh(geo, this.materials['earthWall']);
      mesh.position.set(x, y, z);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      mesh.userData = { componentId: 'walls', title: '300mm Rammed Earth Thermal Mass Wall' };
      this.wallsGroup.add(mesh);
      return mesh;
    };

    const addWindow = (x: number, y: number, z: number, w: number, h: number, isSide: boolean) => {
      const frameGroup = new THREE.Group();
      frameGroup.position.set(x, y, z);
      if (isSide) frameGroup.rotation.y = Math.PI / 2;

      // Outer Frame
      const frameThickness = 0.08;
      const frameDepth = wallThickness + 0.05;
      
      const frameShape = new THREE.Shape();
      frameShape.moveTo(-w/2, -h/2);
      frameShape.lineTo(w/2, -h/2);
      frameShape.lineTo(w/2, h/2);
      frameShape.lineTo(-w/2, h/2);
      frameShape.lineTo(-w/2, -h/2);
      
      const holePath = new THREE.Path();
      holePath.moveTo(-w/2 + frameThickness, -h/2 + frameThickness);
      holePath.lineTo(w/2 - frameThickness, -h/2 + frameThickness);
      holePath.lineTo(w/2 - frameThickness, h/2 - frameThickness);
      holePath.lineTo(-w/2 + frameThickness, h/2 - frameThickness);
      holePath.lineTo(-w/2 + frameThickness, -h/2 + frameThickness);
      frameShape.holes.push(holePath);

      const frameGeo = new THREE.ExtrudeGeometry(frameShape, { steps: 1, depth: frameDepth, bevelEnabled: false });
      frameGeo.center();
      const frameMesh = new THREE.Mesh(frameGeo, this.materials['frame']);
      frameMesh.castShadow = true;
      frameMesh.receiveShadow = true;
      frameGroup.add(frameMesh);

      // Glass Pane
      const glassGeo = new THREE.BoxGeometry(w - frameThickness*2, h - frameThickness*2, 0.02);
      const glassMesh = new THREE.Mesh(glassGeo, this.materials['glass']);
      glassMesh.name = 'windowGlass';
      frameGroup.add(glassMesh);

      this.windowsGroup.add(frameGroup);
    };

    const addDoor = (x: number, y: number, z: number, w: number, h: number, isSide: boolean) => {
      const doorGroup = new THREE.Group();
      doorGroup.position.set(x, y, z);
      if (isSide) doorGroup.rotation.y = Math.PI / 2;

      const frameThickness = 0.06;
      const frameDepth = wallThickness + 0.02;
      
      const frameShape = new THREE.Shape();
      frameShape.moveTo(-w/2, -h/2);
      frameShape.lineTo(w/2, -h/2);
      frameShape.lineTo(w/2, h/2);
      frameShape.lineTo(-w/2, h/2);
      frameShape.lineTo(-w/2, -h/2);
      
      const holePath = new THREE.Path();
      holePath.moveTo(-w/2 + frameThickness, -h/2);
      holePath.lineTo(w/2 - frameThickness, -h/2);
      holePath.lineTo(w/2 - frameThickness, h/2 - frameThickness);
      holePath.lineTo(-w/2 + frameThickness, h/2 - frameThickness);
      holePath.lineTo(-w/2 + frameThickness, -h/2);
      frameShape.holes.push(holePath);

      const frameGeo = new THREE.ExtrudeGeometry(frameShape, { steps: 1, depth: frameDepth, bevelEnabled: false });
      frameGeo.center();
      const frameMesh = new THREE.Mesh(frameGeo, this.materials['frame']);
      frameMesh.castShadow = true;
      frameMesh.receiveShadow = true;
      doorGroup.add(frameMesh);

      const panelGeo = new THREE.BoxGeometry(w - frameThickness*2 - 0.01, h - frameThickness - 0.01, 0.05);
      const panelMesh = new THREE.Mesh(panelGeo, this.materials['woodDoor']);
      panelMesh.position.y = frameThickness/2;
      panelMesh.castShadow = true;
      panelMesh.receiveShadow = true;
      
      const handleGeo = new THREE.BoxGeometry(0.12, 0.02, 0.10);
      const handleMesh = new THREE.Mesh(handleGeo, this.materials['brass']);
      handleMesh.position.set(w/2 - frameThickness - 0.15, 0, 0);
      panelMesh.add(handleMesh);

      doorGroup.add(panelMesh);
      this.doorsGroup.add(doorGroup);
    };

    const t = wallThickness; // 0.30

    // Front Wall (Z = +3.35, length = 10.00, height = 3.00)
    const zFront = halfW - t / 2;
    addWallBlock(-4.325, floorY + wallHeight / 2, zFront, 1.35, wallHeight, t);
    addWallBlock(-2.75, floorY + 0.40, zFront, 1.80, 0.80, t);
    addWallBlock(-2.75, floorY + 2.65, zFront, 1.80, 0.70, t);
    addWindow(-2.75, floorY + 1.525, zFront, 1.80, 1.45, false); // Front Left Window

    addWallBlock(-1.15, floorY + wallHeight / 2, zFront, 1.40, wallHeight, t);
    
    addWallBlock(0.00, floorY + 2.55, zFront, 0.90, 0.90, t);
    addDoor(0.00, floorY + 1.05, zFront, 0.90, 2.10, false); // Front Entrance Door
    
    addWallBlock(1.15, floorY + wallHeight / 2, zFront, 1.40, wallHeight, t);
    addWallBlock(2.75, floorY + 0.40, zFront, 1.80, 0.80, t);
    addWallBlock(2.75, floorY + 2.65, zFront, 1.80, 0.70, t);
    addWindow(2.75, floorY + 1.525, zFront, 1.80, 1.45, false); // Front Right Window
    
    addWallBlock(4.325, floorY + wallHeight / 2, zFront, 1.35, wallHeight, t);

    // Rear Wall (Z = -3.35, length = 10.00, height = 3.00)
    const zRear = -halfW + t / 2;
    addWallBlock(-4.10, floorY + wallHeight / 2, zRear, 1.80, wallHeight, t);
    addWallBlock(-2.50, floorY + 0.45, zRear, 1.40, 0.90, t);
    addWallBlock(-2.50, floorY + 2.55, zRear, 1.40, 0.90, t);
    addWindow(-2.50, floorY + 1.50, zRear, 1.40, 1.20, false); // Rear Left Window

    addWallBlock(0.00, floorY + wallHeight / 2, zRear, 3.60, wallHeight, t);
    
    addWallBlock(2.50, floorY + 0.45, zRear, 1.40, 0.90, t);
    addWallBlock(2.50, floorY + 2.55, zRear, 1.40, 0.90, t);
    addWindow(2.50, floorY + 1.50, zRear, 1.40, 1.20, false); // Rear Right Window

    addWallBlock(4.10, floorY + wallHeight / 2, zRear, 1.80, wallHeight, t);

    // Left Side Wall (X = -4.85, width = 6.40)
    const xLeft = -halfL + t / 2;
    addWallBlock(xLeft, floorY + wallHeight / 2, -2.70, t, wallHeight, 1.00);
    addWallBlock(xLeft, floorY + 0.45, -1.60, t, 0.90, 1.20);
    addWallBlock(xLeft, floorY + 2.55, -1.60, t, 0.90, 1.20);
    addWindow(xLeft, floorY + 1.50, -1.60, 1.20, 1.20, true); // Left Window 1

    addWallBlock(xLeft, floorY + wallHeight / 2, 0.00, t, wallHeight, 2.00);
    
    addWallBlock(xLeft, floorY + 0.45, 1.60, t, 0.90, 1.20);
    addWallBlock(xLeft, floorY + 2.55, 1.60, t, 0.90, 1.20);
    addWindow(xLeft, floorY + 1.50, 1.60, 1.20, 1.20, true); // Left Window 2

    addWallBlock(xLeft, floorY + wallHeight / 2, 2.70, t, wallHeight, 1.00);

    // Right Side Wall (X = +4.85, width = 6.40)
    const xRight = halfL - t / 2;
    addWallBlock(xRight, floorY + wallHeight / 2, -2.70, t, wallHeight, 1.00);
    addWallBlock(xRight, floorY + 0.45, -1.60, t, 0.90, 1.20);
    addWallBlock(xRight, floorY + 2.55, -1.60, t, 0.90, 1.20);
    addWindow(xRight, floorY + 1.50, -1.60, 1.20, 1.20, true); // Right Window 1

    addWallBlock(xRight, floorY + wallHeight / 2, 0.00, t, wallHeight, 2.00);
    
    addWallBlock(xRight, floorY + 0.45, 1.60, t, 0.90, 1.20);
    addWallBlock(xRight, floorY + 2.55, 1.60, t, 0.90, 1.20);
    addWindow(xRight, floorY + 1.50, 1.60, 1.20, 1.20, true); // Right Window 2

    addWallBlock(xRight, floorY + wallHeight / 2, 2.70, t, wallHeight, 1.00);

    // 3. TRIANGULAR GABLE WALL ENDS
    const createGableWallMesh = (xPos: number) => {
      const shape = new THREE.Shape();
      shape.moveTo(-halfW, wallTopY);
      shape.lineTo(halfW, wallTopY);
      shape.lineTo(0, ridgeY);
      shape.closePath();

      const extrudeSettings: THREE.ExtrudeGeometryOptions = {
        steps: 1,
        depth: t,
        bevelEnabled: false,
      };

      const geo = new THREE.ExtrudeGeometry(shape, extrudeSettings);
      geo.rotateY(Math.PI / 2);
      
      const mesh = new THREE.Mesh(geo, this.materials['earthWall']);
      if (xPos < 0) {
        mesh.position.set(xPos, 0, 0);
      } else {
        mesh.position.set(xPos - t, 0, 0);
      }
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      mesh.userData = { componentId: 'walls', title: '300mm Rammed Earth Gable End Wall' };
      return mesh;
    };

    this.wallsGroup.add(createGableWallMesh(-halfL));
    this.wallsGroup.add(createGableWallMesh(halfL));

    // 4. GABLE ROOF ASSEMBLY (25 Deg Pitch)
    const roofLength = length + 2 * gableOverhang; // 10.70 m
    const roofHalfWidth = halfW + eavesOverhang; // 3.95 m
    const slopeLength = Math.sqrt(roofHalfWidth * roofHalfWidth + (roofHalfWidth * Math.tan(pitchRad)) * (roofHalfWidth * Math.tan(pitchRad)));
    const roofThick = 0.16;

    // South Roof Plane
    const southRoofGeo = new THREE.BoxGeometry(roofLength, roofThick, slopeLength);
    const southRoofMesh = new THREE.Mesh(southRoofGeo, this.materials['roofSlate']);
    const midZ_South = roofHalfWidth / 2;
    const midY_South = ridgeY - (midZ_South * Math.tan(pitchRad)) + (roofThick / 2);
    southRoofMesh.position.set(0, midY_South, midZ_South);
    southRoofMesh.rotation.x = pitchRad;
    southRoofMesh.castShadow = true;
    southRoofMesh.receiveShadow = true;
    southRoofMesh.userData = { componentId: 'roof', title: 'South Insulated Gable Roof Assembly (R-4.50)' };
    this.roofGroup.add(southRoofMesh);

    // North Roof Plane
    const northRoofGeo = new THREE.BoxGeometry(roofLength, roofThick, slopeLength);
    const northRoofMesh = new THREE.Mesh(northRoofGeo, this.materials['roofSlate']);
    const midZ_North = -roofHalfWidth / 2;
    const midY_North = ridgeY - (-midZ_North * Math.tan(pitchRad)) + (roofThick / 2);
    northRoofMesh.position.set(0, midY_North, midZ_North);
    northRoofMesh.rotation.x = -pitchRad;
    northRoofMesh.castShadow = true;
    northRoofMesh.receiveShadow = true;
    northRoofMesh.userData = { componentId: 'roof', title: 'North Insulated Gable Roof Assembly (R-4.50)' };
    this.roofGroup.add(northRoofMesh);

    // Roof Ridge Cap
    const ridgeCapGeo = new THREE.CylinderGeometry(0.08, 0.08, roofLength + 0.04, 12, 1, false, 0, Math.PI);
    const ridgeCapMesh = new THREE.Mesh(ridgeCapGeo, this.materials['roofSlate']);
    ridgeCapMesh.rotation.z = Math.PI / 2;
    ridgeCapMesh.rotation.x = Math.PI;
    ridgeCapMesh.position.set(0, ridgeY + roofThick / 2 + 0.04, 0);
    ridgeCapMesh.castShadow = true;
    ridgeCapMesh.userData = { componentId: 'roof', title: 'Weatherproof Ventilated Ridge Cap' };
    this.roofGroup.add(ridgeCapMesh);

    // Timber Bargeboards on Gable Ends
    const createBargeboard = (xPos: number) => {
      const bbGroup = new THREE.Group();
      bbGroup.position.set(xPos, 0, 0);

      const bbGeo1 = new THREE.BoxGeometry(0.04, 0.18, slopeLength);
      const bb1 = new THREE.Mesh(bbGeo1, this.materials['roofFascia']);
      bb1.position.set(0, midY_South, midZ_South);
      bb1.rotation.x = pitchRad;
      bb1.castShadow = true;
      bb1.userData = { componentId: 'roof', title: 'Timber Bargeboard Fascia' };
      bbGroup.add(bb1);

      const bb2 = new THREE.Mesh(bbGeo1, this.materials['roofFascia']);
      bb2.position.set(0, midY_North, midZ_North);
      bb2.rotation.x = -pitchRad;
      bb2.castShadow = true;
      bb2.userData = { componentId: 'roof', title: 'Timber Bargeboard Fascia' };
      bbGroup.add(bb2);

      return bbGroup;
    };

    this.roofGroup.add(createBargeboard(-roofLength / 2 + 0.02));
    this.roofGroup.add(createBargeboard(roofLength / 2 - 0.02));

    // Eaves Fascia Board
    const eavesFasciaGeo = new THREE.BoxGeometry(roofLength, 0.16, 0.04);
    const eavesFasciaFront = new THREE.Mesh(eavesFasciaGeo, this.materials['roofFascia']);
    const eavesY = ridgeY - (roofHalfWidth * Math.tan(pitchRad));
    eavesFasciaFront.position.set(0, eavesY, roofHalfWidth);
    eavesFasciaFront.castShadow = true;
    eavesFasciaFront.userData = { componentId: 'roof', title: '0.45m Eaves Timber Fascia' };
    this.roofGroup.add(eavesFasciaFront);

    const eavesFasciaRear = new THREE.Mesh(eavesFasciaGeo, this.materials['roofFascia']);
    eavesFasciaRear.position.set(0, eavesY, -roofHalfWidth);
    eavesFasciaRear.castShadow = true;
    eavesFasciaRear.userData = { componentId: 'roof', title: '0.45m Eaves Timber Fascia' };
    this.roofGroup.add(eavesFasciaRear);

    // 5. WINDOWS & GLAZING
    const createWindow = (spec: WindowSpec) => {
      const winGroup = new THREE.Group();
      winGroup.name = `Window_${spec.id}`;
      const frameDepth = 0.12;
      const frameW = 0.06;

      const railGeo = new THREE.BoxGeometry(spec.width, frameW, frameDepth);
      const railTop = new THREE.Mesh(railGeo, this.materials['frame']);
      railTop.position.set(0, spec.height / 2 - frameW / 2, 0);
      railTop.userData = { componentId: 'windowFrame', title: 'Thermally Broken Window Frame (Top Rail)' };
      winGroup.add(railTop);

      const railBottom = new THREE.Mesh(railGeo, this.materials['frame']);
      railBottom.position.set(0, -spec.height / 2 + frameW / 2, 0);
      railBottom.userData = { componentId: 'windowFrame', title: 'Thermally Broken Window Frame (Bottom Rail)' };
      winGroup.add(railBottom);

      const stileGeo = new THREE.BoxGeometry(frameW, spec.height - 2 * frameW, frameDepth);
      const stileLeft = new THREE.Mesh(stileGeo, this.materials['frame']);
      stileLeft.position.set(-spec.width / 2 + frameW / 2, 0, 0);
      stileLeft.userData = { componentId: 'windowFrame', title: 'Thermally Broken Frame Stile (Left)' };
      winGroup.add(stileLeft);

      const stileRight = new THREE.Mesh(stileGeo, this.materials['frame']);
      stileRight.position.set(spec.width / 2 - frameW / 2, 0, 0);
      stileRight.userData = { componentId: 'windowFrame', title: 'Thermally Broken Frame Stile (Right)' };
      winGroup.add(stileRight);

      if (spec.width >= 1.40) {
        const mullion = new THREE.Mesh(stileGeo, this.materials['frame']);
        mullion.position.set(0, 0, 0);
        mullion.userData = { componentId: 'windowFrame', title: 'Central Mullion Post' };
        winGroup.add(mullion);
      }

      const sillGeo = new THREE.BoxGeometry(spec.width + 0.10, 0.05, frameDepth + 0.10);
      const sillMesh = new THREE.Mesh(sillGeo, this.materials['plinth']);
      sillMesh.position.set(0, -spec.height / 2 - 0.025, 0.03);
      sillMesh.userData = { componentId: 'foundation', title: 'Dressed Stone Window Sill' };
      winGroup.add(sillMesh);

      const glassGeo = new THREE.BoxGeometry(spec.width - 2 * frameW, spec.height - 2 * frameW, 0.02);
      const glassMesh = new THREE.Mesh(glassGeo, this.materials['glass']);
      glassMesh.position.set(0, 0, 0);
      glassMesh.userData = { componentId: 'glazing', title: `Double-Glazed Low-E Unit (${spec.name})` };
      winGroup.add(glassMesh);

      const winCenterY = floorY + spec.sillHeight + spec.height / 2;
      
      if (spec.facade === 'front') {
        winGroup.position.set(spec.posX, winCenterY, halfW - t / 2);
      } else if (spec.facade === 'rear') {
        winGroup.position.set(spec.posX, winCenterY, -halfW + t / 2);
        winGroup.rotation.y = Math.PI;
      } else if (spec.facade === 'left') {
        winGroup.position.set(-halfL + t / 2, winCenterY, spec.posZ);
        winGroup.rotation.y = -Math.PI / 2;
      } else if (spec.facade === 'right') {
        winGroup.position.set(halfL - t / 2, winCenterY, spec.posZ);
        winGroup.rotation.y = Math.PI / 2;
      }

      return winGroup;
    };

    WINDOW_SPECS.forEach(spec => {
      this.windowsGroup.add(createWindow(spec));
    });

    // 6. MAIN ENTRANCE DOOR
    const doorGroup = new THREE.Group();
    doorGroup.name = 'Door_D_MAIN';
    const doorSpec = DOOR_SPECS[0];
    const doorCenterY = floorY + doorSpec.height / 2;
    doorGroup.position.set(doorSpec.posX, doorCenterY, halfW - t / 2);

    const frameDepth = 0.14;
    const dfW = 0.06;
    const topFrame = new THREE.Mesh(new THREE.BoxGeometry(doorSpec.width, dfW, frameDepth), this.materials['frame']);
    topFrame.position.set(0, doorSpec.height / 2 - dfW / 2, 0);
    topFrame.userData = { componentId: 'door', title: 'Insulated Door Frame (Header)' };
    doorGroup.add(topFrame);

    const leftFrame = new THREE.Mesh(new THREE.BoxGeometry(dfW, doorSpec.height - dfW, frameDepth), this.materials['frame']);
    leftFrame.position.set(-doorSpec.width / 2 + dfW / 2, -dfW / 2, 0);
    leftFrame.userData = { componentId: 'door', title: 'Insulated Door Frame (Jamb)' };
    doorGroup.add(leftFrame);

    const rightFrame = new THREE.Mesh(new THREE.BoxGeometry(dfW, doorSpec.height - dfW, frameDepth), this.materials['frame']);
    rightFrame.position.set(doorSpec.width / 2 - dfW / 2, -dfW / 2, 0);
    rightFrame.userData = { componentId: 'door', title: 'Insulated Door Frame (Jamb)' };
    doorGroup.add(rightFrame);

    const doorLeafGeo = new THREE.BoxGeometry(doorSpec.width - 2 * dfW, doorSpec.height - dfW, 0.05);
    const doorLeaf = new THREE.Mesh(doorLeafGeo, this.materials['woodDoor']);
    doorLeaf.position.set(0, -dfW / 2, 0);
    doorLeaf.castShadow = true;
    doorLeaf.userData = { componentId: 'door', title: 'Solid Teak Insulated Composite Door (R-1.10)' };
    doorGroup.add(doorLeaf);

    const handleGeo = new THREE.CylinderGeometry(0.015, 0.015, 0.25, 8);
    const handle = new THREE.Mesh(handleGeo, this.materials['frame']);
    handle.position.set(doorSpec.width / 2 - 0.15, -0.05, 0.04);
    doorGroup.add(handle);

    const canopyGeo = new THREE.BoxGeometry(1.40, 0.06, 0.45);
    const canopy = new THREE.Mesh(canopyGeo, this.materials['roofFascia']);
    canopy.position.set(0, doorSpec.height / 2 + 0.08, 0.20);
    canopy.castShadow = true;
    canopy.userData = { componentId: 'roof', title: 'Entrance Weather Canopy' };
    doorGroup.add(canopy);

    this.doorsGroup.add(doorGroup);

    // 7. INTERIOR PARTITION WALLS
    const partThick = 0.15;
    const partHeight = wallHeight;

    const addInteriorWall = (x: number, z: number, w: number, d: number) => {
      const geo = new THREE.BoxGeometry(w, partHeight, d);
      const mesh = new THREE.Mesh(geo, this.materials['interiorWall']);
      mesh.position.set(x, floorY + partHeight / 2, z);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      mesh.userData = { componentId: 'interior', title: '150mm Stabilized Earth Partition Wall (R-1.05)' };
      this.interiorGroup.add(mesh);
    };

    addInteriorWall(-2.85, -0.50, 3.70, partThick);
    addInteriorWall(2.45, -0.50, 4.50, partThick);
    addInteriorWall(-1.80, -1.85, partThick, 2.70);
    addInteriorWall(1.00, -1.85, partThick, 2.70);
    addInteriorWall(-2.00, 1.80, partThick, 2.80);

    // 8. REALISTIC TIMBER TRUSS STRUCTURE & ENVELOPE DETAILS
    const structureComponents = buildRealisticStructure(this.dimensions, {
      wood: this.materials['wood'],
      darkWood: this.materials['darkWood'],
      metal: this.materials['metal'],
      stone: this.materials['stone'],
      copperGutter: this.materials['copperGutter'],
    });

    this.roofGroup.add(structureComponents.trussGroup);
    this.roofGroup.add(structureComponents.drainageGroup);
    this.wallsGroup.add(structureComponents.lintelsGroup);
    this.foundationGroup.add(structureComponents.verandaGroup);
    this.foundationGroup.add(structureComponents.apronGroup);

    // 9. DETAILED REALISTIC RESIDENTIAL INTERIOR FURNISHINGS
    const interiorFurnishings = buildRealisticInterior(this.dimensions, {
      wood: this.materials['wood'],
      darkWood: this.materials['darkWood'],
      fabricCream: this.materials['fabricCream'],
      fabricRust: this.materials['fabricRust'],
      fabricTeal: this.materials['fabricTeal'],
      granite: this.materials['granite'],
      brass: this.materials['brass'],
      ceramicWhite: this.materials['ceramicWhite'],
      glassMirror: this.materials['glassMirror'],
      juteRug: this.materials['juteRug'],
      caneWoven: this.materials['caneWoven'],
      plantGreen: this.materials['plantGreen'],
      terracottaClay: this.materials['terracottaClay'],
    });
    this.interiorGroup.add(interiorFurnishings);

    this.buildDimensionsOverlay();
  }

  private buildDimensionsOverlay() {
    const { length, width, wallHeight, plinthHeight } = this.dimensions;
    const halfL = length / 2;
    const halfW = width / 2;

    const lineMat = new THREE.LineBasicMaterial({ color: 0x0f766e, linewidth: 2 });

    const p1 = new THREE.Vector3(-halfL, 0.05, halfW + 1.0);
    const p2 = new THREE.Vector3(halfL, 0.05, halfW + 1.0);
    const geo1 = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(-halfL, 0.05, halfW + 0.2), p1, p2, new THREE.Vector3(halfL, 0.05, halfW + 0.2)
    ]);
    this.dimensionsGroup.add(new THREE.Line(geo1, lineMat));

    const p3 = new THREE.Vector3(halfL + 1.0, 0.05, -halfW);
    const p4 = new THREE.Vector3(halfL + 1.0, 0.05, halfW);
    const geo2 = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(halfL + 0.2, 0.05, -halfW), p3, p4, new THREE.Vector3(halfL + 0.2, 0.05, halfW)
    ]);
    this.dimensionsGroup.add(new THREE.Line(geo2, lineMat));

    const p5 = new THREE.Vector3(-halfL - 0.8, plinthHeight, halfW);
    const p6 = new THREE.Vector3(-halfL - 0.8, plinthHeight + wallHeight, halfW);
    const geo3 = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(-halfL - 0.1, plinthHeight, halfW), p5, p6, new THREE.Vector3(-halfL - 0.1, plinthHeight + wallHeight, halfW)
    ]);
    this.dimensionsGroup.add(new THREE.Line(geo3, lineMat));
  }

  /** Builds 3D Floating R-Value Component Badges */
  private buildRValueBadges() {
    const { length, width, wallHeight, plinthHeight, roofPitchDeg } = this.dimensions;
    const halfL = length / 2;
    const halfW = width / 2;
    const pitchRad = (roofPitchDeg * Math.PI) / 180;
    const ridgeRise = halfW * Math.tan(pitchRad);
    const ridgeY = plinthHeight + wallHeight + ridgeRise;

    // 1. Roof Badge (Attached to roofGroup so it lifts smoothly with roof lift)
    const roofBadge = createRValueBadgeSprite(
      'ROOF ASSEMBLY',
      'R-4.50',
      'U=0.22 W/m²K · 160mm Dense Bio-Fiber',
      THERMAL_SPECS.roof.colorHex
    );
    roofBadge.position.set(0, ridgeY + 0.60, 0);
    this.roofGroup.add(roofBadge);

    // 2. South Earth Wall Badge
    const southWallBadge = createRValueBadgeSprite(
      'SOUTH EARTH WALL',
      'R-2.10',
      'U=0.48 W/m²K · 300mm Monolithic Mass (9.2h Lag)',
      THERMAL_SPECS.walls.colorHex
    );
    southWallBadge.position.set(0, plinthHeight + 1.6, halfW + 0.45);
    this.rValueBadgesGroup.add(southWallBadge);

    // 3. North Buffer Wall Badge
    const northWallBadge = createRValueBadgeSprite(
      'NORTH BUFFER WALL',
      'R-2.10',
      'U=0.48 W/m²K · 300mm Stable Thermal Mass',
      THERMAL_SPECS.walls.colorHex
    );
    northWallBadge.position.set(0, plinthHeight + 1.6, -halfW - 0.45);
    this.rValueBadgesGroup.add(northWallBadge);

    // 4. South Glazing Badge
    const glazingBadge = createRValueBadgeSprite(
      'SOLAR GLAZING',
      'R-0.48',
      'U=2.08 W/m²K · Double Low-E Argon',
      THERMAL_SPECS.glazing.colorHex
    );
    glazingBadge.position.set(-2.75, plinthHeight + 1.55, halfW + 0.40);
    this.rValueBadgesGroup.add(glazingBadge);

    // 5. Main Insulated Door Badge
    const doorBadge = createRValueBadgeSprite(
      'INSULATED DOOR',
      'R-1.10',
      'U=0.91 W/m²K · Solid Teak + PU Core',
      THERMAL_SPECS.door.colorHex
    );
    doorBadge.position.set(0.0, plinthHeight + 1.25, halfW + 0.40);
    this.rValueBadgesGroup.add(doorBadge);

    // 6. Foundation Plinth Badge
    const plinthBadge = createRValueBadgeSprite(
      'MASONRY PLINTH',
      'R-0.80',
      'U=1.25 W/m²K · 300mm Stone DPC Base',
      THERMAL_SPECS.foundation.colorHex
    );
    plinthBadge.position.set(3.4, plinthHeight / 2 + 0.05, halfW + 0.45);
    this.rValueBadgesGroup.add(plinthBadge);

    // 7. Interior Partition Wall Badge
    const interiorBadge = createRValueBadgeSprite(
      'CSEB PARTITION',
      'R-1.05',
      'U=0.95 W/m²K · 150mm Internal Mass',
      THERMAL_SPECS.interior.colorHex
    );
    interiorBadge.position.set(-2.85, plinthHeight + 2.1, -0.5);
    this.rValueBadgesGroup.add(interiorBadge);

    // Default visibility
    this.rValueBadgesGroup.visible = false;
  }

  public setRenderMode(mode: RenderMode) {
    this.renderMode = mode;
    this.applyMaterials();
  }

  public setRValueHeatmap(active: boolean) {
    this.isRValueHeatmapActive = active;
    this.applyMaterials();
  }

  private applyMaterials() {
    const isHeatmap = this.isRValueHeatmapActive || this.renderMode === 'thermal';

    if (isHeatmap) {
      // 1. Apply Color-Coded R-Value Heatmap to all components
      this.wallsGroup.traverse(child => {
        if ((child as THREE.Mesh).isMesh) {
          (child as THREE.Mesh).material = this.materials['rValueWall'];
        }
      });

      this.roofGroup.traverse(child => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          // Apply R-value roof material to main roof planes and ridge
          if (mesh.geometry.type === 'BoxGeometry' || mesh.geometry.type === 'CylinderGeometry') {
            mesh.material = this.materials['rValueRoof'];
          }
        }
      });

      this.windowsGroup.traverse(child => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          if (mesh.userData.componentId === 'glazing') {
            mesh.material = this.materials['rValueGlazing'];
          } else if (mesh.userData.componentId === 'windowFrame') {
            mesh.material = this.materials['rValueFrame'];
          } else {
            mesh.material = this.materials['rValuePlinth'];
          }
        }
      });

      this.doorsGroup.traverse(child => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          if (mesh.userData.componentId === 'door') {
            mesh.material = this.materials['rValueDoor'];
          } else if (mesh.userData.componentId === 'roof') {
            mesh.material = this.materials['rValueRoof'];
          } else {
            mesh.material = this.materials['rValueFrame'];
          }
        }
      });

      this.interiorGroup.traverse(child => {
        if ((child as THREE.Mesh).isMesh) {
          (child as THREE.Mesh).material = this.materials['rValueInterior'];
        }
      });

      this.foundationGroup.traverse(child => {
        if ((child as THREE.Mesh).isMesh) {
          (child as THREE.Mesh).material = this.materials['rValuePlinth'];
        }
      });
    } else if (this.renderMode === 'realistic') {
      // Realistic PBR Textures
      this.wallsGroup.traverse(child => {
        if ((child as THREE.Mesh).isMesh) {
          (child as THREE.Mesh).material = this.activeWallMaterial || this.materials['earthWall'];
        }
      });

      this.roofGroup.traverse(child => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          if (mesh.userData.componentId === 'roof' && mesh.geometry.type === 'BoxGeometry') {
            mesh.material = this.activeRoofMaterial || this.materials['roofSlate'];
          }
        }
      });

      this.windowsGroup.traverse(child => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          if (mesh.userData.componentId === 'glazing') {
            mesh.material = this.materials['glass'];
          } else if (mesh.userData.componentId === 'windowFrame') {
            mesh.material = this.materials['frame'];
          } else {
            mesh.material = this.materials['plinth'];
          }
        }
      });

      this.doorsGroup.traverse(child => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          if (mesh.userData.componentId === 'door') {
            mesh.material = this.materials['woodDoor'];
          } else {
            mesh.material = this.materials['frame'];
          }
        }
      });

      this.interiorGroup.traverse(child => {
        if ((child as THREE.Mesh).isMesh) {
          (child as THREE.Mesh).material = this.materials['interiorWall'];
        }
      });

      this.foundationGroup.traverse(child => {
        if ((child as THREE.Mesh).isMesh) {
          (child as THREE.Mesh).material = this.materials['plinth'];
        }
      });
    } else if (this.renderMode === 'cad') {
      const cadMat = new THREE.MeshStandardMaterial({
        color: 0xf5f5f4,
        roughness: 0.9,
        metalness: 0.0,
      });
      this.wallsGroup.traverse(c => { if ((c as THREE.Mesh).isMesh) (c as THREE.Mesh).material = cadMat; });
      this.roofGroup.traverse(c => { if ((c as THREE.Mesh).isMesh) (c as THREE.Mesh).material = cadMat; });
      this.foundationGroup.traverse(c => { if ((c as THREE.Mesh).isMesh) (c as THREE.Mesh).material = cadMat; });
      this.interiorGroup.traverse(c => { if ((c as THREE.Mesh).isMesh) (c as THREE.Mesh).material = cadMat; });
    } else if (this.renderMode === 'wireframe') {
      const wireMat = new THREE.MeshBasicMaterial({
        color: 0x0ea5e9, // A nice tech blue color for wireframe
        wireframe: true,
        transparent: true,
        opacity: 0.8
      });
      this.wallsGroup.traverse(c => { if ((c as THREE.Mesh).isMesh) (c as THREE.Mesh).material = wireMat; });
      this.roofGroup.traverse(c => { if ((c as THREE.Mesh).isMesh) (c as THREE.Mesh).material = wireMat; });
      this.foundationGroup.traverse(c => { if ((c as THREE.Mesh).isMesh) (c as THREE.Mesh).material = wireMat; });
      this.interiorGroup.traverse(c => { if ((c as THREE.Mesh).isMesh) (c as THREE.Mesh).material = wireMat; });
      this.windowsGroup.traverse(c => { if ((c as THREE.Mesh).isMesh) (c as THREE.Mesh).material = wireMat; });
      this.doorsGroup.traverse(c => { if ((c as THREE.Mesh).isMesh) (c as THREE.Mesh).material = wireMat; });
    } else if (this.renderMode === 'xray') {
      const xrayMat = new THREE.MeshStandardMaterial({
        color: 0x94a3b8,
        transparent: true,
        opacity: 0.35,
        roughness: 0.3,
      });
      this.wallsGroup.traverse(c => { if ((c as THREE.Mesh).isMesh) (c as THREE.Mesh).material = xrayMat; });
      this.roofGroup.traverse(c => { if ((c as THREE.Mesh).isMesh) (c as THREE.Mesh).material = xrayMat; });
    }
  }

  public applyCustomMaterials(wallMatId?: string, roofMatId?: string) {
    if (wallMatId && this.materials[wallMatId]) {
      this.activeWallMaterial = this.materials[wallMatId];
    }
    if (roofMatId && this.materials[roofMatId]) {
      this.activeRoofMaterial = this.materials[roofMatId];
    }
    this.applyMaterials();
  }

  public setRoofLift(liftFactor: number) {
    this.roofGroup.position.y = liftFactor * 4.0;
  }

  public setLayerVisibility(layers: {
    roof: boolean;
    walls: boolean;
    windows: boolean;
    interior: boolean;
    foundation: boolean;
    dimensions: boolean;
    thermalVectors?: boolean;
    rValueLabels?: boolean;
    rValueHeatmap?: boolean;
  }) {
    this.roofGroup.visible = layers.roof;
    this.wallsGroup.visible = layers.walls;
    this.windowsGroup.visible = layers.windows;
    this.doorsGroup.visible = layers.windows;
    this.interiorGroup.visible = layers.interior;
    this.foundationGroup.visible = layers.foundation;
    this.dimensionsGroup.visible = layers.dimensions;
    if (layers.thermalVectors !== undefined) {
      this.thermalVectorsGroup.visible = layers.thermalVectors;
    }
    if (layers.rValueLabels !== undefined) {
      this.rValueBadgesGroup.visible = layers.rValueLabels;
    } else if (layers.rValueHeatmap !== undefined) {
      this.rValueBadgesGroup.visible = layers.rValueHeatmap;
    }
  }
}

