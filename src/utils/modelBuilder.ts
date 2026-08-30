import * as THREE from 'three';
import type { ShelterConfig, Hotspot } from '../types';
import {
  generateCorrugatedRoofTextures,
  generateWallPanelTextures,
  generateDoorTexture,
  generateReinforcedWindowTexture,
} from './textureGenerator';

export interface BuiltShelterModel {
  root: THREE.Group;
  doorPivot: THREE.Group;
  windowShutters: THREE.Group[];
  jacksGroup: THREE.Group;
  roofGroup: THREE.Group;
  wallsGroup: THREE.Group;
  chassisGroup: THREE.Group;
  interiorGroup: THREE.Group;
  dimensionGroup: THREE.Group;
  interiorLight: THREE.PointLight;
  materials: {
    roof: THREE.MeshStandardMaterial;
    wall: THREE.MeshStandardMaterial;
    steelFrame: THREE.MeshStandardMaterial;
    door: THREE.MeshStandardMaterial;
    glass: THREE.MeshPhysicalMaterial;
    bars: THREE.MeshStandardMaterial;
    chassis: THREE.MeshStandardMaterial;
    concrete: THREE.MeshStandardMaterial;
  };
  updateConfig: (config: ShelterConfig) => void;
  dispose: () => void;
}

export const SHELTER_DIMENSIONS = {
  length: 5.8, // X axis (meters)
  width: 2.4,  // Z axis (meters)
  heightFront: 2.7, // Y axis front (+Z)
  heightBack: 2.35, // Y axis back (-Z) - ~7.5 deg shed slope
  floorArea: 13.92, // m^2 (~150 sq ft)
};

export const HOTSPOTS_DATA: Hotspot[] = [
  {
    id: 'roof',
    title: 'Corrugated Steel Shed Roof',
    shortDesc: 'Single-pitch angled roof with anti-corrosion galvanized coating',
    detail: 'Designed with a continuous 7.5° slope for rapid rainwater runoff and snow dispersal. Composed of 26-gauge high-tensile corrugated galvanized steel panels fastened to structural C-channel purlins with EPDM-sealed neoprene screws.',
    category: 'Roof',
    position: [0, 2.75, 0.4],
    cameraTarget: [0, 2.5, 0],
    cameraPosition: [2.5, 4.2, 4.0],
    specs: [
      { label: 'Material', value: 'Galvanized Corrugated Steel' },
      { label: 'Pitch Angle', value: '7.5° Shed Slope' },
      { label: 'Snow Load', value: '45 lbs/sq.ft' },
      { label: 'Overhang', value: '250mm front / 150mm side' },
    ],
  },
  {
    id: 'walls',
    title: 'Modular Insulated Sandwich Panels',
    shortDesc: 'Polyisocyanurate (PIR) core with matte powder-coated steel skins',
    detail: '80mm tongue-and-groove interlocking composite panels providing high thermal insulation (R-24 value). Coated with non-reflective matte neutral finish for desert/temperate tactical deployment. Completely fire-retardant class A.',
    category: 'Walls',
    position: [-1.8, 1.4, 1.25],
    cameraTarget: [-1.5, 1.3, 1.2],
    cameraPosition: [-3.2, 2.0, 3.2],
    specs: [
      { label: 'Panel Thickness', value: '80mm PIR Core' },
      { label: 'Thermal Rating', value: 'R-24 (U=0.23 W/m²K)' },
      { label: 'Fire Rating', value: 'ASTM E84 Class A' },
      { label: 'Assembly Method', value: 'Cam-Lock Interlock' },
    ],
  },
  {
    id: 'door',
    title: 'Utilitarian Heavy-Duty Metal Door',
    shortDesc: 'Industrial steel leaf with 3-point slam latch and perimeter seals',
    detail: 'Constructed from reinforced 16-gauge cold-rolled steel with an internal honeycomb insulation core. Equipped with stainless steel lever handle, panic push-bar, triple heavy-duty barrel hinges, and heavy diamond-plate kick protection.',
    category: 'Door',
    position: [1.3, 1.1, 1.25],
    cameraTarget: [1.3, 1.1, 1.2],
    cameraPosition: [1.8, 1.4, 2.8],
    specs: [
      { label: 'Dimensions', value: '900mm × 2050mm' },
      { label: 'Lock Type', value: '3-Point Slam Latch' },
      { label: 'Seal', value: 'Dual EPDM Compression Gasket' },
      { label: 'Egress', value: 'Internal Panic Push Bar' },
    ],
  },
  {
    id: 'windows',
    title: 'Dual Reinforced Security Windows',
    shortDesc: 'Impact-resistant polycarbonate with high-tensile steel mesh grid',
    detail: 'Small-aperture modular security windows (600mm × 600mm) engineered for emergency resilience. Features laminated security glazing reinforced with structural steel crossbars and protective hinged weather shutters.',
    category: 'Windows',
    position: [-1.2, 1.6, 1.25],
    cameraTarget: [-1.2, 1.6, 1.2],
    cameraPosition: [-1.2, 1.8, 2.5],
    specs: [
      { label: 'Glazing', value: 'Double-pane Polycarbonate' },
      { label: 'Protection', value: 'Welded 12mm Steel Bars + Mesh' },
      { label: 'Dimensions', value: '600mm × 600mm (×2 units)' },
      { label: 'Ventilation', value: 'Integrated Micro-Louver' },
    ],
  },
  {
    id: 'chassis',
    title: 'Integrated Steel Chassis & Leveling Jacks',
    shortDesc: 'Skid chassis with 4 corner ISO lifting lugs and screw jacks',
    detail: 'Heavy-duty structural tubular steel base frame with forklift pockets and 4 corner ISO twist-lock corner castings for helicopter sling/crane lift. Includes four manual screw-jack leveling outriggers for uneven terrain.',
    category: 'Chassis',
    position: [2.8, 0.15, 1.15],
    cameraTarget: [2.5, 0.2, 1.0],
    cameraPosition: [3.8, 0.8, 2.2],
    specs: [
      { label: 'Frame', value: 'Hollow Structural Steel (HSS)' },
      { label: 'Leveling Stroke', value: '±300mm per corner' },
      { label: 'Mobility', value: 'Helicopter Lift / Flatbed Tow' },
      { label: 'Ground Clearance', value: '150mm - 450mm' },
    ],
  },
  {
    id: 'vent',
    title: 'Passive Climate Intake & Solar Port',
    shortDesc: 'Weather-shielded louvered ventilation and power bus',
    detail: 'Dual passive air louvers at opposing heights create natural stack-effect air convection. Features a standardized MC4 solar plug-and-play intake gland and a 12V/24V battery management passthrough.',
    category: 'Ventilation',
    position: [-2.85, 2.1, 0.2],
    cameraTarget: [-2.8, 2.0, 0],
    cameraPosition: [-4.2, 2.4, 0.8],
    specs: [
      { label: 'Vent Type', value: 'Weather-Baffled Louver' },
      { label: 'Air Flow Rate', value: '180 m³/h passive stack' },
      { label: 'Solar Port', value: 'MC4 Multi-Gland IP67' },
      { label: 'Filtration', value: 'HEPA / Sand Mesh Screen' },
    ],
  },
];

export function buildEmergencyShelter(config: ShelterConfig): BuiltShelterModel {
  const root = new THREE.Group();
  root.name = 'EmergencyShelter_Root';

  const L = SHELTER_DIMENSIONS.length; // 5.8m
  const W = SHELTER_DIMENSIONS.width;  // 2.4m
  const Hf = SHELTER_DIMENSIONS.heightFront; // 2.7m (+Z)
  const Hb = SHELTER_DIMENSIONS.heightBack;  // 2.35m (-Z)
  const Havg = (Hf + Hb) / 2;

  // 1. Generate PBR Textures
  const roofTextures = generateCorrugatedRoofTextures(config.weathering);
  const wallTextures = generateWallPanelTextures(config.wallColor, config.weathering);
  const doorTexture = generateDoorTexture();
  const windowTexture = generateReinforcedWindowTexture();

  // 2. Materials
  const roofMaterial = new THREE.MeshStandardMaterial({
    map: roofTextures.albedo,
    normalMap: roofTextures.normal,
    roughnessMap: roofTextures.roughness,
    metalnessMap: roofTextures.metalness,
    roughness: 0.45,
    metalness: 0.9,
    side: THREE.DoubleSide,
  });

  const wallMaterial = new THREE.MeshStandardMaterial({
    map: wallTextures.albedo,
    normalMap: wallTextures.normal,
    roughnessMap: wallTextures.roughness,
    metalnessMap: wallTextures.metalness,
    roughness: 0.8,
    metalness: 0.1,
    side: THREE.DoubleSide,
  });

  const steelFrameMaterial = new THREE.MeshStandardMaterial({
    color: '#343a40',
    roughness: 0.5,
    metalness: 0.85,
  });

  const doorMaterial = new THREE.MeshStandardMaterial({
    map: doorTexture,
    roughness: 0.55,
    metalness: 0.65,
  });

  const windowGlassMaterial = new THREE.MeshPhysicalMaterial({
    map: windowTexture,
    color: '#30424d',
    metalness: 0.1,
    roughness: 0.15,
    transmission: 0.65,
    opacity: 0.88,
    transparent: true,
    reflectivity: 0.8,
  });

  const securityBarsMaterial = new THREE.MeshStandardMaterial({
    color: '#1a1d20',
    metalness: 0.95,
    roughness: 0.35,
  });

  const chassisMaterial = new THREE.MeshStandardMaterial({
    color: '#282d32',
    roughness: 0.6,
    metalness: 0.8,
  });

  const concreteMaterial = new THREE.MeshStandardMaterial({
    color: '#555b61',
    roughness: 0.9,
    metalness: 0.05,
  });

  // Groups for modular explosion and interaction
  const chassisGroup = new THREE.Group();
  chassisGroup.name = 'Chassis_Group';

  const wallsGroup = new THREE.Group();
  wallsGroup.name = 'Walls_Group';

  const roofGroup = new THREE.Group();
  roofGroup.name = 'Roof_Group';

  const interiorGroup = new THREE.Group();
  interiorGroup.name = 'Interior_Group';

  const dimensionGroup = new THREE.Group();
  dimensionGroup.name = 'Dimension_Group';

  const jacksGroup = new THREE.Group();
  jacksGroup.name = 'Jacks_Group';

  root.add(chassisGroup);
  root.add(wallsGroup);
  root.add(roofGroup);
  root.add(interiorGroup);
  root.add(dimensionGroup);
  chassisGroup.add(jacksGroup);

  // -------------------------------------------------------------
  // A. BASE CHASSIS & FLOOR FOUNDATION
  // -------------------------------------------------------------
  const chassisH = 0.18;
  const chassisGeo = new THREE.BoxGeometry(L, chassisH, W);
  const chassisMesh = new THREE.Mesh(chassisGeo, chassisMaterial);
  chassisMesh.position.set(0, chassisH / 2, 0);
  chassisMesh.castShadow = true;
  chassisMesh.receiveShadow = true;
  chassisGroup.add(chassisMesh);

  // Floor deck inside
  const floorGeo = new THREE.BoxGeometry(L - 0.15, 0.04, W - 0.15);
  const floorMat = new THREE.MeshStandardMaterial({
    color: '#49423b',
    roughness: 0.7,
    metalness: 0.1,
  });
  const floorMesh = new THREE.Mesh(floorGeo, floorMat);
  floorMesh.position.set(0, chassisH + 0.02, 0);
  floorMesh.receiveShadow = true;
  chassisGroup.add(floorMesh);

  // 4 Corner ISO Castings / Lifting Lugs
  const cornerPositions = [
    [-L / 2, chassisH / 2, -W / 2],
    [L / 2, chassisH / 2, -W / 2],
    [-L / 2, chassisH / 2, W / 2],
    [L / 2, chassisH / 2, W / 2],
  ];

  cornerPositions.forEach(([cx, cy, cz]) => {
    const lugGeo = new THREE.BoxGeometry(0.18, 0.22, 0.18);
    const lugMesh = new THREE.Mesh(lugGeo, steelFrameMaterial);
    lugMesh.position.set(cx, cy, cz);
    lugMesh.castShadow = true;
    chassisGroup.add(lugMesh);

    // Lifting hole
    const holeGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.2, 12);
    holeGeo.rotateX(Math.PI / 2);
    const holeMat = new THREE.MeshBasicMaterial({ color: '#111' });
    const holeMesh = new THREE.Mesh(holeGeo, holeMat);
    holeMesh.position.set(cx, cy, cz);
    chassisGroup.add(holeMesh);
  });

  // Leveling Outrigger Screw Jacks (4 corners)
  cornerPositions.forEach(([cx, , cz]) => {
    const jackPillar = new THREE.Group();
    const legGeo = new THREE.CylinderGeometry(0.035, 0.035, 0.35, 12);
    const legMesh = new THREE.Mesh(legGeo, steelFrameMaterial);
    legMesh.position.y = -0.12;
    legMesh.castShadow = true;
    jackPillar.add(legMesh);

    // Foot pad
    const padGeo = new THREE.CylinderGeometry(0.12, 0.14, 0.03, 16);
    const padMesh = new THREE.Mesh(padGeo, steelFrameMaterial);
    padMesh.position.y = -0.28;
    padMesh.receiveShadow = true;
    jackPillar.add(padMesh);

    jackPillar.position.set(cx * 0.96, 0, cz * 0.96);
    jacksGroup.add(jackPillar);
  });

  // Forklift Pockets
  const forkPockets = [-0.9, 0.9];
  forkPockets.forEach((fx) => {
    const pocketGeo = new THREE.BoxGeometry(0.22, 0.1, W + 0.02);
    const pocketMat = new THREE.MeshBasicMaterial({ color: '#1a1a1a' });
    const pocketMesh = new THREE.Mesh(pocketGeo, pocketMat);
    pocketMesh.position.set(fx, chassisH / 2, 0);
    chassisGroup.add(pocketMesh);
  });

  // -------------------------------------------------------------
  // B. STRUCTURAL CORNER COLUMNS & FRAMING
  // -------------------------------------------------------------
  const colSize = 0.1;
  // Front left, Front right (height = Hf)
  [
    [-L / 2 + colSize / 2, Hf, W / 2 - colSize / 2],
    [L / 2 - colSize / 2, Hf, W / 2 - colSize / 2],
  ].forEach(([px, h, pz]) => {
    const colGeo = new THREE.BoxGeometry(colSize, h, colSize);
    const colMesh = new THREE.Mesh(colGeo, steelFrameMaterial);
    colMesh.position.set(px, chassisH + h / 2, pz);
    colMesh.castShadow = true;
    wallsGroup.add(colMesh);
  });

  // Back left, Back right (height = Hb)
  [
    [-L / 2 + colSize / 2, Hb, -W / 2 + colSize / 2],
    [L / 2 - colSize / 2, Hb, -W / 2 + colSize / 2],
  ].forEach(([px, h, pz]) => {
    const colGeo = new THREE.BoxGeometry(colSize, h, colSize);
    const colMesh = new THREE.Mesh(colGeo, steelFrameMaterial);
    colMesh.position.set(px, chassisH + h / 2, pz);
    colMesh.castShadow = true;
    wallsGroup.add(colMesh);
  });

  // -------------------------------------------------------------
  // C. MODULAR WALL PANELS WITH APERTURES
  // -------------------------------------------------------------
  const wallThick = 0.08;

  // 1. BACK WALL (Solid Insulated Panels, height = Hb)
  const backWallGeo = new THREE.BoxGeometry(L - 0.02, Hb, wallThick);
  const backWallMesh = new THREE.Mesh(backWallGeo, wallMaterial);
  backWallMesh.position.set(0, chassisH + Hb / 2, -W / 2 + wallThick / 2);
  backWallMesh.castShadow = true;
  backWallMesh.receiveShadow = true;
  wallsGroup.add(backWallMesh);

  // 2. FRONT WALL (+Z side, height = Hf)
  // Consists of: Left wall section (with reinforced window), Middle section, Doorway section, Right section
  // Door: width 0.95m, height 2.05m located at X = +1.3m
  // Window 1: width 0.65m, height 0.65m located at X = -1.2m, Y = 1.6m

  // Left solid part: from X = -L/2 (-2.9m) to window left (-1.55m)
  const w1Left = -1.55;
  const w1Right = -0.85;
  const w1Bottom = 1.25;
  const w1Top = 1.95;

  const dLeft = 0.8;
  const dRight = 1.8;
  const dTop = 2.1;

  // Front Sub-panels:
  // Far Left Panel
  const f1W = w1Left - (-L / 2);
  const f1Geo = new THREE.BoxGeometry(f1W, Hf, wallThick);
  const f1Mesh = new THREE.Mesh(f1Geo, wallMaterial);
  f1Mesh.position.set(-L / 2 + f1W / 2, chassisH + Hf / 2, W / 2 - wallThick / 2);
  f1Mesh.castShadow = true;
  wallsGroup.add(f1Mesh);

  // Under window 1
  const underW1W = w1Right - w1Left;
  const underW1Geo = new THREE.BoxGeometry(underW1W, w1Bottom, wallThick);
  const underW1Mesh = new THREE.Mesh(underW1Geo, wallMaterial);
  underW1Mesh.position.set((w1Left + w1Right) / 2, chassisH + w1Bottom / 2, W / 2 - wallThick / 2);
  underW1Mesh.castShadow = true;
  wallsGroup.add(underW1Mesh);

  // Over window 1
  const overW1H = Hf - w1Top;
  const overW1Geo = new THREE.BoxGeometry(underW1W, overW1H, wallThick);
  const overW1Mesh = new THREE.Mesh(overW1Geo, wallMaterial);
  overW1Mesh.position.set((w1Left + w1Right) / 2, chassisH + w1Top + overW1H / 2, W / 2 - wallThick / 2);
  overW1Mesh.castShadow = true;
  wallsGroup.add(overW1Mesh);

  // Center wall (between Window 1 and Door)
  const centerW = dLeft - w1Right;
  const centerGeo = new THREE.BoxGeometry(centerW, Hf, wallThick);
  const centerMesh = new THREE.Mesh(centerGeo, wallMaterial);
  centerMesh.position.set((w1Right + dLeft) / 2, chassisH + Hf / 2, W / 2 - wallThick / 2);
  centerMesh.castShadow = true;
  wallsGroup.add(centerMesh);

  // Over door
  const overDH = Hf - dTop;
  const doorSpanW = dRight - dLeft;
  const overDGeo = new THREE.BoxGeometry(doorSpanW, overDH, wallThick);
  const overDMesh = new THREE.Mesh(overDGeo, wallMaterial);
  overDMesh.position.set((dLeft + dRight) / 2, chassisH + dTop + overDH / 2, W / 2 - wallThick / 2);
  overDMesh.castShadow = true;
  wallsGroup.add(overDMesh);

  // Far right front wall
  const fRightW = L / 2 - dRight;
  const fRightGeo = new THREE.BoxGeometry(fRightW, Hf, wallThick);
  const fRightMesh = new THREE.Mesh(fRightGeo, wallMaterial);
  fRightMesh.position.set(dRight + fRightW / 2, chassisH + Hf / 2, W / 2 - wallThick / 2);
  fRightMesh.castShadow = true;
  wallsGroup.add(fRightMesh);

  // 3. SIDE WALLS (Slanted Trapezoids matching the shed roof pitch)
  function createSlantedSideWall(isLeft: boolean) {
    const shape = new THREE.Shape();
    // Z from -W/2 to W/2
    // at -W/2 (back): Y = Hb
    // at +W/2 (front): Y = Hf
    shape.moveTo(-W / 2, 0);
    shape.lineTo(W / 2, 0);
    shape.lineTo(W / 2, Hf);
    shape.lineTo(-W / 2, Hb);
    shape.closePath();

    const extrudeSettings = {
      steps: 1,
      depth: wallThick,
      bevelEnabled: false,
    };
    const geom = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    // Rotate to face X axis
    geom.rotateY(Math.PI / 2);

    const mesh = new THREE.Mesh(geom, wallMaterial);
    const posX = isLeft ? -L / 2 + wallThick / 2 : L / 2 - wallThick / 2 - wallThick;
    mesh.position.set(posX, chassisH, 0);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    return mesh;
  }

  // Left & Right side walls
  const leftSide = createSlantedSideWall(true);
  const rightSide = createSlantedSideWall(false);
  wallsGroup.add(leftSide);
  wallsGroup.add(rightSide);

  // Side Window (Window 2 on Left Side Wall at X = -L/2)
  const w2FrameGroup = new THREE.Group();
  w2FrameGroup.name = 'Window2_Side';
  w2FrameGroup.position.set(-L / 2 + 0.02, chassisH + 1.5, 0);
  w2FrameGroup.rotation.y = Math.PI / 2;

  // Window 2 Cutout & Frame
  const winW = 0.65;
  const winH = 0.65;
  const wFrameGeo = new THREE.BoxGeometry(winW + 0.08, winH + 0.08, 0.12);
  const wFrameMesh = new THREE.Mesh(wFrameGeo, steelFrameMaterial);
  w2FrameGroup.add(wFrameMesh);

  const wGlassGeo = new THREE.BoxGeometry(winW, winH, 0.02);
  const wGlassMesh = new THREE.Mesh(wGlassGeo, windowGlassMaterial);
  w2FrameGroup.add(wGlassMesh);

  // Security Bars on Window 2
  for (let b = -0.2; b <= 0.2; b += 0.13) {
    const barGeo = new THREE.CylinderGeometry(0.008, 0.008, winH - 0.04, 8);
    const barMesh = new THREE.Mesh(barGeo, securityBarsMaterial);
    barMesh.position.set(b, 0, 0.05);
    w2FrameGroup.add(barMesh);
  }
  // Horizontal crossbar
  const crossBarGeo = new THREE.CylinderGeometry(0.008, 0.008, winW - 0.04, 8);
  crossBarGeo.rotateZ(Math.PI / 2);
  const crossBarMesh = new THREE.Mesh(crossBarGeo, securityBarsMaterial);
  crossBarMesh.position.set(0, 0, 0.05);
  w2FrameGroup.add(crossBarMesh);

  wallsGroup.add(w2FrameGroup);

  // -------------------------------------------------------------
  // D. UTILITARIAN METAL DOOR & FRONT REINFORCED WINDOW
  // -------------------------------------------------------------
  // Door Outer Frame
  const doorFrameW = dRight - dLeft;
  const doorFrameH = dTop;
  const doorFrameGroup = new THREE.Group();
  doorFrameGroup.position.set((dLeft + dRight) / 2, chassisH, W / 2);

  // Outer Steel Jamb
  const jambGeo = new THREE.BoxGeometry(doorFrameW + 0.04, doorFrameH + 0.04, 0.12);
  const jambMesh = new THREE.Mesh(jambGeo, steelFrameMaterial);
  jambMesh.position.set(0, doorFrameH / 2, 0);
  doorFrameGroup.add(jambMesh);

  // Door Pivot (Hinged on the left side: dLeft)
  const doorPivot = new THREE.Group();
  doorPivot.position.set(-doorFrameW / 2 + 0.03, 0, 0.04);

  const doorLeafW = doorFrameW - 0.06;
  const doorLeafH = doorFrameH - 0.05;
  const doorLeafThick = 0.05;

  const doorGeo = new THREE.BoxGeometry(doorLeafW, doorLeafH, doorLeafThick);
  const doorMesh = new THREE.Mesh(doorGeo, doorMaterial);
  // Center of door relative to pivot
  doorMesh.position.set(doorLeafW / 2, doorLeafH / 2, 0);
  doorMesh.castShadow = true;
  doorPivot.add(doorMesh);

  // Door Industrial Latch Handle & Hardware
  const handleGroup = new THREE.Group();
  handleGroup.position.set(doorLeafW - 0.12, 1.0, 0.04);

  // Escutcheon backplate
  const plateGeo = new THREE.BoxGeometry(0.06, 0.22, 0.01);
  const plateMesh = new THREE.Mesh(plateGeo, steelFrameMaterial);
  handleGroup.add(plateMesh);

  // Industrial L-lever handle
  const leverShaftGeo = new THREE.CylinderGeometry(0.012, 0.012, 0.06, 12);
  leverShaftGeo.rotateX(Math.PI / 2);
  const leverShaftMesh = new THREE.Mesh(leverShaftGeo, steelFrameMaterial);
  leverShaftMesh.position.set(0, 0.03, 0.03);
  handleGroup.add(leverShaftMesh);

  const leverHandleGeo = new THREE.CylinderGeometry(0.012, 0.012, 0.14, 12);
  leverHandleGeo.rotateZ(Math.PI / 2);
  const leverHandleMesh = new THREE.Mesh(leverHandleGeo, steelFrameMaterial);
  leverHandleMesh.position.set(0.06, 0.03, 0.06);
  handleGroup.add(leverHandleMesh);

  // 3 Heavy-Duty Barrel Hinges
  [0.25, doorLeafH / 2, doorLeafH - 0.25].forEach((hy) => {
    const hingeGeo = new THREE.CylinderGeometry(0.016, 0.016, 0.08, 12);
    const hingeMesh = new THREE.Mesh(hingeGeo, steelFrameMaterial);
    hingeMesh.position.set(0, hy, -0.01);
    doorPivot.add(hingeMesh);
  });

  // Panic push-bar inside the door
  const pushBarGeo = new THREE.BoxGeometry(doorLeafW * 0.8, 0.04, 0.06);
  const pushBarMat = new THREE.MeshStandardMaterial({ color: '#c5221f', roughness: 0.4 });
  const pushBarMesh = new THREE.Mesh(pushBarGeo, pushBarMat);
  pushBarMesh.position.set(doorLeafW / 2, 1.0, -0.04);
  doorPivot.add(pushBarMesh);

  doorPivot.add(handleGroup);
  doorFrameGroup.add(doorPivot);
  wallsGroup.add(doorFrameGroup);

  // Front Reinforced Window 1 (at X = (w1Left + w1Right)/2, Y = 1.6m)
  const windowShutters: THREE.Group[] = [];
  const w1FrameGroup = new THREE.Group();
  w1FrameGroup.position.set((w1Left + w1Right) / 2, chassisH + 1.6, W / 2);

  const w1FrameMesh = new THREE.Mesh(wFrameGeo.clone(), steelFrameMaterial);
  w1FrameGroup.add(w1FrameMesh);

  const w1GlassMesh = new THREE.Mesh(wGlassGeo.clone(), windowGlassMaterial);
  w1FrameGroup.add(w1GlassMesh);

  // Security bars
  for (let b = -0.2; b <= 0.2; b += 0.13) {
    const barGeo = new THREE.CylinderGeometry(0.008, 0.008, winH - 0.04, 8);
    const barMesh = new THREE.Mesh(barGeo, securityBarsMaterial);
    barMesh.position.set(b, 0, 0.05);
    w1FrameGroup.add(barMesh);
  }
  const crossBarMesh1 = new THREE.Mesh(crossBarGeo.clone(), securityBarsMaterial);
  crossBarMesh1.position.set(0, 0, 0.05);
  w1FrameGroup.add(crossBarMesh1);

  // Storm Shutter / Louver Cover
  const shutterPivot = new THREE.Group();
  shutterPivot.position.set(0, winH / 2 + 0.02, 0.06);
  const shutterGeo = new THREE.BoxGeometry(winW + 0.04, winH + 0.04, 0.02);
  const shutterMesh = new THREE.Mesh(shutterGeo, steelFrameMaterial);
  shutterMesh.position.set(0, -winH / 2, 0);
  shutterPivot.add(shutterMesh);
  w1FrameGroup.add(shutterPivot);
  windowShutters.push(shutterPivot);

  wallsGroup.add(w1FrameGroup);

  // Exterior Lamp over Door
  const lampGroup = new THREE.Group();
  lampGroup.position.set((dLeft + dRight) / 2, chassisH + dTop + 0.25, W / 2 + 0.1);
  const lampHousingGeo = new THREE.BoxGeometry(0.18, 0.08, 0.12);
  const lampHousingMesh = new THREE.Mesh(lampHousingGeo, steelFrameMaterial);
  lampGroup.add(lampHousingMesh);

  const lampLensGeo = new THREE.BoxGeometry(0.14, 0.02, 0.08);
  const lampLensMat = new THREE.MeshStandardMaterial({
    color: '#fffae0',
    emissive: config.exteriorLight ? '#fffae0' : '#000000',
    emissiveIntensity: config.exteriorLight ? 1.5 : 0,
  });
  const lampLensMesh = new THREE.Mesh(lampLensGeo, lampLensMat);
  lampLensMesh.position.set(0, -0.04, 0);
  lampGroup.add(lampLensMesh);

  const exteriorLight = new THREE.PointLight('#ffe8a3', config.exteriorLight ? 2.5 : 0, 8);
  exteriorLight.position.set(0, -0.1, 0.1);
  exteriorLight.castShadow = true;
  lampGroup.add(exteriorLight);

  wallsGroup.add(lampGroup);

  // -------------------------------------------------------------
  // E. CORRUGATED STEEL SLANTED SHED ROOF
  // -------------------------------------------------------------
  const roofOverhangX = 0.3;  // Left/right overhang
  const roofOverhangZf = 0.3; // Front overhang
  const roofOverhangZb = 0.25; // Back overhang

  const roofSpanL = L + roofOverhangX * 2; // ~6.4m
  const roofSpanW = Math.sqrt(Math.pow(W + roofOverhangZf + roofOverhangZb, 2) + Math.pow(Hf - Hb, 2)); // ~3.0m

  // Pitch Angle of the shed roof
  const roofPitchAngle = Math.atan2(Hf - Hb, W); // ~7.5 degrees

  // Build Corrugated Roof Geometry with real physical ripples
  const corrugationPeriods = 32;
  const roofSegsX = corrugationPeriods * 4;
  const roofSegsZ = 16;
  const roofGeo = new THREE.PlaneGeometry(roofSpanL, roofSpanW, roofSegsX, roofSegsZ);

  // Deform plane vertices to create true physical 3D sinusoidal corrugated wave ridges
  const posAttr = roofGeo.attributes.position;
  for (let i = 0; i < posAttr.count; i++) {
    const vx = posAttr.getX(i);
    // Sinusoidal corrugation peak height: 2.2cm amplitude
    const wave = Math.sin((vx / roofSpanL) * Math.PI * 2 * corrugationPeriods) * 0.022;
    posAttr.setZ(i, wave);
  }
  roofGeo.computeVertexNormals();

  const roofMesh = new THREE.Mesh(roofGeo, roofMaterial);
  roofMesh.rotation.x = -Math.PI / 2 - roofPitchAngle;
  roofMesh.position.set(0, chassisH + Havg + 0.04, (roofOverhangZf - roofOverhangZb) / 2);
  roofMesh.castShadow = true;
  roofMesh.receiveShadow = true;
  roofGroup.add(roofMesh);

  // Roof Structural Purlins / Steel Trusses underneath
  const numPurlins = 5;
  for (let p = 0; p < numPurlins; p++) {
    const tz = -W / 2 + (p / (numPurlins - 1)) * W;
    const purlinY = chassisH + Hb + ((tz + W / 2) / W) * (Hf - Hb) - 0.04;
    const purlinGeo = new THREE.BoxGeometry(L, 0.08, 0.05);
    const purlinMesh = new THREE.Mesh(purlinGeo, steelFrameMaterial);
    purlinMesh.position.set(0, purlinY, tz);
    purlinMesh.castShadow = true;
    roofGroup.add(purlinMesh);
  }

  // Front Roof Fascia & Eaves Drip Flashing
  const fasciaGeo = new THREE.BoxGeometry(roofSpanL + 0.04, 0.08, 0.04);
  const fasciaMesh = new THREE.Mesh(fasciaGeo, steelFrameMaterial);
  fasciaMesh.position.set(0, chassisH + Hf + 0.04, W / 2 + roofOverhangZf);
  fasciaMesh.castShadow = true;
  roofGroup.add(fasciaMesh);

  // Rain Gutter Channel on back lower edge
  const gutterGeo = new THREE.BoxGeometry(roofSpanL + 0.02, 0.09, 0.12);
  const gutterMesh = new THREE.Mesh(gutterGeo, steelFrameMaterial);
  gutterMesh.position.set(0, chassisH + Hb - 0.02, -W / 2 - roofOverhangZb);
  gutterMesh.castShadow = true;
  roofGroup.add(gutterMesh);

  // Downspout tube
  const downspoutGeo = new THREE.CylinderGeometry(0.035, 0.035, Hb - 0.1, 12);
  const downspoutMesh = new THREE.Mesh(downspoutGeo, steelFrameMaterial);
  downspoutMesh.position.set(L / 2 + 0.1, chassisH + (Hb - 0.1) / 2, -W / 2 - roofOverhangZb);
  roofGroup.add(downspoutMesh);

  // Solar intake junction / Roof HVAC Vent Cap
  const roofVentGeo = new THREE.CylinderGeometry(0.16, 0.22, 0.18, 16);
  const roofVentMesh = new THREE.Mesh(roofVentGeo, steelFrameMaterial);
  roofVentMesh.position.set(-1.8, chassisH + Havg + 0.14, -0.4);
  roofVentMesh.castShadow = true;
  roofGroup.add(roofVentMesh);

  // -------------------------------------------------------------
  // F. INTERIOR THERMAL CORE & RAPID-DEPLOYMENT FIT-OUT
  // -------------------------------------------------------------
  // 1. Fold-down Emergency Bunk Cots
  [-1.6, 0.2].forEach((bx) => {
    const cotGroup = new THREE.Group();
    cotGroup.position.set(bx, chassisH + 0.45, -W / 2 + 0.45);

    // Frame
    const cFrameGeo = new THREE.BoxGeometry(1.8, 0.05, 0.75);
    const cFrameMesh = new THREE.Mesh(cFrameGeo, steelFrameMaterial);
    cotGroup.add(cFrameMesh);

    // Mattress
    const mattGeo = new THREE.BoxGeometry(1.75, 0.08, 0.7);
    const mattMat = new THREE.MeshStandardMaterial({ color: '#3d4d5c', roughness: 0.9 });
    const mattMesh = new THREE.Mesh(mattGeo, mattMat);
    mattMesh.position.y = 0.06;
    cotGroup.add(mattMesh);

    // Legs
    [
      [-0.8, -0.22, -0.3],
      [0.8, -0.22, -0.3],
      [-0.8, -0.22, 0.3],
      [0.8, -0.22, 0.3],
    ].forEach(([lx, ly, lz]) => {
      const legGeo = new THREE.CylinderGeometry(0.015, 0.015, 0.4, 8);
      const legMesh = new THREE.Mesh(legGeo, steelFrameMaterial);
      legMesh.position.set(lx, ly, lz);
      cotGroup.add(legMesh);
    });

    interiorGroup.add(cotGroup);
  });

  // 2. Modular Lithium Power Bank & Control Rack
  const rackGroup = new THREE.Group();
  rackGroup.position.set(L / 2 - 0.4, chassisH + 0.8, -W / 2 + 0.35);

  const rackFrameGeo = new THREE.BoxGeometry(0.5, 1.4, 0.4);
  const rackFrameMesh = new THREE.Mesh(rackFrameGeo, steelFrameMaterial);
  rackGroup.add(rackFrameMesh);

  // Battery modules with LED status dots
  for (let by = -0.4; by <= 0.4; by += 0.25) {
    const battGeo = new THREE.BoxGeometry(0.44, 0.18, 0.38);
    const battMat = new THREE.MeshStandardMaterial({ color: '#1e2429', roughness: 0.4 });
    const battMesh = new THREE.Mesh(battGeo, battMat);
    battMesh.position.y = by;
    rackGroup.add(battMesh);

    // Status LED
    const ledGeo = new THREE.SphereGeometry(0.012, 8, 8);
    const ledMat = new THREE.MeshBasicMaterial({ color: '#22c55e' });
    const ledMesh = new THREE.Mesh(ledGeo, ledMat);
    ledMesh.position.set(0.23, by, 0.12);
    rackGroup.add(ledMesh);
  }
  interiorGroup.add(rackGroup);

  // 3. First Aid / Emergency Supply Wall Cabinet
  const medCabGeo = new THREE.BoxGeometry(0.55, 0.45, 0.18);
  const medCabMat = new THREE.MeshStandardMaterial({ color: '#e2e8f0', roughness: 0.5 });
  const medCabMesh = new THREE.Mesh(medCabGeo, medCabMat);
  medCabMesh.position.set(-L / 2 + 0.15, chassisH + 1.6, -0.6);
  medCabMesh.rotation.y = Math.PI / 2;

  // Red cross emblem
  const crossGeo1 = new THREE.BoxGeometry(0.04, 0.18, 0.01);
  const crossGeo2 = new THREE.BoxGeometry(0.18, 0.04, 0.01);
  const crossMat = new THREE.MeshBasicMaterial({ color: '#ef4444' });
  const crossMesh1 = new THREE.Mesh(crossGeo1, crossMat);
  crossMesh1.position.set(-L / 2 + 0.25, chassisH + 1.6, -0.6);
  crossMesh1.rotation.y = Math.PI / 2;
  const crossMesh2 = new THREE.Mesh(crossGeo2, crossMat);
  crossMesh2.position.set(-L / 2 + 0.25, chassisH + 1.6, -0.6);
  crossMesh2.rotation.y = Math.PI / 2;

  interiorGroup.add(medCabMesh);
  interiorGroup.add(crossMesh1);
  interiorGroup.add(crossMesh2);

  // 4. Interior Ceiling LED Light Bar
  const ceilLightGeo = new THREE.BoxGeometry(3.0, 0.03, 0.08);
  const ceilLightMat = new THREE.MeshStandardMaterial({
    color: '#ffffff',
    emissive: config.interiorLight ? config.interiorLightColor : '#000000',
    emissiveIntensity: config.interiorLight ? 1.8 : 0,
  });
  const ceilLightMesh = new THREE.Mesh(ceilLightGeo, ceilLightMat);
  ceilLightMesh.position.set(0, chassisH + Havg - 0.08, 0);
  interiorGroup.add(ceilLightMesh);

  const interiorLight = new THREE.PointLight(
    config.interiorLightColor,
    config.interiorLight ? 3.5 : 0,
    9
  );
  interiorLight.position.set(0, chassisH + Havg - 0.2, 0);
  interiorLight.castShadow = true;
  interiorGroup.add(interiorLight);

  // -------------------------------------------------------------
  // G. TECHNICAL 3D DIMENSION GUIDES & LABELS
  // -------------------------------------------------------------
  function createDimensionLine(
    start: [number, number, number],
    end: [number, number, number],
    label: string
  ) {
    const lineGroup = new THREE.Group();
    const points = [new THREE.Vector3(...start), new THREE.Vector3(...end)];
    const geom = new THREE.BufferGeometry().setFromPoints(points);
    const mat = new THREE.LineDashedMaterial({
      color: '#38bdf8',
      dashSize: 0.1,
      gapSize: 0.05,
      linewidth: 2,
    });
    const line = new THREE.Line(geom, mat);
    line.computeLineDistances();
    lineGroup.add(line);

    // End ticks
    const tickGeo = new THREE.CylinderGeometry(0.015, 0.015, 0.2, 8);
    const tickMat = new THREE.MeshBasicMaterial({ color: '#38bdf8' });

    const tick1 = new THREE.Mesh(tickGeo, tickMat);
    tick1.position.set(...start);
    lineGroup.add(tick1);

    const tick2 = new THREE.Mesh(tickGeo, tickMat);
    tick2.position.set(...end);
    lineGroup.add(tick2);

    // Label Sprite
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 64;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#0f172a';
    ctx.roundRect(0, 0, 256, 64, 12);
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#38bdf8';
    ctx.stroke();

    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 26px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, 128, 32);

    const spriteTex = new THREE.CanvasTexture(canvas);
    const spriteMat = new THREE.SpriteMaterial({ map: spriteTex, depthTest: false });
    const sprite = new THREE.Sprite(spriteMat);
    sprite.scale.set(0.9, 0.22, 1);
    sprite.position.set(
      (start[0] + end[0]) / 2,
      (start[1] + end[1]) / 2 + 0.18,
      (start[2] + end[2]) / 2
    );
    lineGroup.add(sprite);

    return lineGroup;
  }

  // Length Dimension (6.0m)
  dimensionGroup.add(
    createDimensionLine([-L / 2, 0.05, W / 2 + 0.7], [L / 2, 0.05, W / 2 + 0.7], '5.80 m (19.0 ft)')
  );
  // Width Dimension (2.4m)
  dimensionGroup.add(
    createDimensionLine([L / 2 + 0.6, 0.05, -W / 2], [L / 2 + 0.6, 0.05, W / 2], '2.40 m (7.9 ft)')
  );
  // Height Front Dimension (2.7m)
  dimensionGroup.add(
    createDimensionLine([-L / 2 - 0.5, 0, W / 2], [-L / 2 - 0.5, chassisH + Hf, W / 2], '2.70 m Front')
  );
  // Height Back Dimension (2.35m)
  dimensionGroup.add(
    createDimensionLine([-L / 2 - 0.5, 0, -W / 2], [-L / 2 - 0.5, chassisH + Hb, -W / 2], '2.35 m Rear')
  );

  // -------------------------------------------------------------
  // UPDATE CONFIG METHOD
  // -------------------------------------------------------------
  function updateConfig(cfg: ShelterConfig) {
    // Door rotation
    const rad = (cfg.doorAngle * Math.PI) / 180;
    doorPivot.rotation.y = rad;

    // Window shutters
    windowShutters.forEach((shutter) => {
      shutter.rotation.x = cfg.windowShuttersOpen ? -Math.PI * 0.45 : 0;
    });

    // Leveling jacks
    jacksGroup.position.y = cfg.jacksDeployed ? -0.18 : 0;

    // Interior lights
    interiorLight.intensity = cfg.interiorLight ? 3.5 : 0;
    interiorLight.color.set(cfg.interiorLightColor);
    ceilLightMat.emissive.set(cfg.interiorLight ? cfg.interiorLightColor : '#000000');
    ceilLightMat.emissiveIntensity = cfg.interiorLight ? 1.8 : 0;

    // Exterior light
    exteriorLight.intensity = cfg.exteriorLight ? 2.5 : 0;
    lampLensMat.emissive.set(cfg.exteriorLight ? '#fffae0' : '#000000');
    lampLensMat.emissiveIntensity = cfg.exteriorLight ? 1.5 : 0;

    // Exploded View Assembly Animation
    const exp = cfg.explodedProgress;
    roofGroup.position.y = exp * 1.5;
    wallsGroup.position.y = exp * 0.4;
    wallsGroup.position.z = exp * 0.2;
    chassisGroup.position.y = -exp * 0.8;
    interiorGroup.position.y = exp * 0.1;

    // Cutaway roof
    roofGroup.visible = !cfg.roofCutaway;

    // Dimensions visibility
    dimensionGroup.visible = cfg.showDimensions;

    // Wall Color update
    wallMaterial.color.set(cfg.wallColor);
  }

  // Initial config apply
  updateConfig(config);

  function dispose() {
    // Traverse and dispose geometries and materials
    root.traverse((obj) => {
      if ((obj as THREE.Mesh).isMesh) {
        const mesh = obj as THREE.Mesh;
        mesh.geometry.dispose();
        if (Array.isArray(mesh.material)) {
          mesh.material.forEach((m) => m.dispose());
        } else if (mesh.material) {
          mesh.material.dispose();
        }
      }
    });
  }

  return {
    root,
    doorPivot,
    windowShutters,
    jacksGroup,
    roofGroup,
    wallsGroup,
    chassisGroup,
    interiorGroup,
    dimensionGroup,
    interiorLight,
    materials: {
      roof: roofMaterial,
      wall: wallMaterial,
      steelFrame: steelFrameMaterial,
      door: doorMaterial,
      glass: windowGlassMaterial,
      bars: securityBarsMaterial,
      chassis: chassisMaterial,
      concrete: concreteMaterial,
    },
    updateConfig,
    dispose,
  };
}
