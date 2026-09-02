// @ts-nocheck
import * as THREE from 'three';
import type {} from '../types';

export interface StructureMaterials {
  wood: THREE.Material;
  darkWood: THREE.Material;
  metal: THREE.Material;
  stone: THREE.Material;
  copperGutter: THREE.Material;
}

/**
 * Generates realistic timber roof trusses, purlins, rafter tails,
 * wall plates, timber lintels, veranda canopy supports, and rainwater drainage.
 */
export function buildRealisticStructure(
  dims: BuildingDimensions,
  materials: StructureMaterials
): {
  trussGroup: THREE.Group;
  verandaGroup: THREE.Group;
  drainageGroup: THREE.Group;
  lintelsGroup: THREE.Group;
  apronGroup: THREE.Group;
} {
  const { length, width, wallHeight, plinthHeight, wallThickness, roofPitchDeg, eavesOverhang, gableOverhang } = dims;

  const halfL = length / 2; // 5.00
  const halfW = width / 2;  // 3.50
  const wallTopY = plinthHeight + wallHeight; // 3.30
  const pitchRad = (roofPitchDeg * Math.PI) / 180;
  const ridgeRise = halfW * Math.tan(pitchRad); // ~1.632 m
  const ridgeY = wallTopY + ridgeRise; // ~4.932 m
  const roofLength = length + 2 * gableOverhang; // 10.70 m
  const roofHalfWidth = halfW + eavesOverhang; // 3.95 m
  const slopeLength = Math.sqrt(roofHalfWidth * roofHalfWidth + (roofHalfWidth * Math.tan(pitchRad)) ** 2);

  // 1. ROOF TRUSS & RAFTER SYSTEM
  const trussGroup = new THREE.Group();
  trussGroup.name = 'Structural_Timber_Trusses';

  // Timber Wall Plates (running along top of exterior walls)
  const plateWidth = wallThickness - 0.04; // 0.26m
  const plateHeight = 0.08;
  
  // South Wall Plate
  const plateSouth = new THREE.Mesh(
    new THREE.BoxGeometry(length, plateHeight, plateWidth),
    materials.wood
  );
  plateSouth.position.set(0, wallTopY - plateHeight / 2, halfW - wallThickness / 2);
  plateSouth.castShadow = true;
  trussGroup.add(plateSouth);

  // North Wall Plate
  const plateNorth = new THREE.Mesh(
    new THREE.BoxGeometry(length, plateHeight, plateWidth),
    materials.wood
  );
  plateNorth.position.set(0, wallTopY - plateHeight / 2, -halfW + wallThickness / 2);
  plateNorth.castShadow = true;
  trussGroup.add(plateNorth);

  // Heavy Timber Trusses at key structural intervals
  const trussXPositions = [-3.8, -1.3, 1.3, 3.8];
  const trussBeamWidth = 0.12;
  const trussBeamDepth = 0.16;

  trussXPositions.forEach((xPos) => {
    const singleTruss = new THREE.Group();
    singleTruss.position.set(xPos, 0, 0);

    // A. Bottom Tie Beam (Spans full building width)
    const tieBeamGeo = new THREE.BoxGeometry(trussBeamWidth, trussBeamDepth, width - 0.2);
    const tieBeam = new THREE.Mesh(tieBeamGeo, materials.wood);
    tieBeam.position.set(0, wallTopY + trussBeamDepth / 2, 0);
    tieBeam.castShadow = true;
    singleTruss.add(tieBeam);

    // B. King Post (Central vertical column to ridge)
    const kingPostHeight = ridgeRise - 0.1;
    const kingPostGeo = new THREE.BoxGeometry(trussBeamWidth, kingPostHeight, 0.12);
    const kingPost = new THREE.Mesh(kingPostGeo, materials.wood);
    kingPost.position.set(0, wallTopY + trussBeamDepth + kingPostHeight / 2, 0);
    kingPost.castShadow = true;
    singleTruss.add(kingPost);

    // C. Principal Rafters (South & North slopes)
    const rafterGeo = new THREE.BoxGeometry(trussBeamWidth, trussBeamDepth, slopeLength);
    
    // South rafter
    const rafterSouth = new THREE.Mesh(rafterGeo, materials.wood);
    const midZ_S = roofHalfWidth / 2;
    const midY_S = ridgeY - midZ_S * Math.tan(pitchRad);
    rafterSouth.position.set(0, midY_S - 0.08, midZ_S - eavesOverhang / 2);
    rafterSouth.rotation.x = pitchRad;
    rafterSouth.castShadow = true;
    singleTruss.add(rafterSouth);

    // North rafter
    const rafterNorth = new THREE.Mesh(rafterGeo, materials.wood);
    const midZ_N = -roofHalfWidth / 2;
    const midY_N = ridgeY - (-midZ_N) * Math.tan(pitchRad);
    rafterNorth.position.set(0, midY_N - 0.08, midZ_N + eavesOverhang / 2);
    rafterNorth.rotation.x = -pitchRad;
    rafterNorth.castShadow = true;
    singleTruss.add(rafterNorth);

    // D. Diagonal Struts (Web members)
    const strutLen = Math.sqrt((halfW * 0.5) ** 2 + (ridgeRise * 0.4) ** 2);
    const strutGeo = new THREE.BoxGeometry(0.10, 0.10, strutLen);
    
    const strutS = new THREE.Mesh(strutGeo, materials.wood);
    strutS.position.set(0, wallTopY + ridgeRise * 0.35, halfW * 0.35);
    strutS.rotation.x = -pitchRad * 0.7;
    strutS.castShadow = true;
    singleTruss.add(strutS);

    const strutN = new THREE.Mesh(strutGeo, materials.wood);
    strutN.position.set(0, wallTopY + ridgeRise * 0.35, -halfW * 0.35);
    strutN.rotation.x = pitchRad * 0.7;
    strutN.castShadow = true;
    singleTruss.add(strutN);

    // Metal gusset plate connector details at joints
    const gussetGeo = new THREE.BoxGeometry(trussBeamWidth + 0.02, 0.14, 0.14);
    const gusset = new THREE.Mesh(gussetGeo, materials.metal);
    gusset.position.set(0, ridgeY - 0.12, 0);
    singleTruss.add(gusset);

    trussGroup.add(singleTruss);
  });

  // Longitudinal Timber Purlins (5 lines per roof slope)
  const purlinLevels = [0.2, 0.4, 0.6, 0.8, 0.98];
  const purlinGeo = new THREE.BoxGeometry(roofLength - 0.1, 0.08, 0.08);

  purlinLevels.forEach((pct) => {
    const zOffset = roofHalfWidth * pct;
    const yOffset = ridgeY - zOffset * Math.tan(pitchRad);

    // South purlin
    const purlinS = new THREE.Mesh(purlinGeo, materials.darkWood);
    purlinS.position.set(0, yOffset - 0.04, zOffset);
    purlinS.rotation.x = pitchRad;
    purlinS.castShadow = true;
    trussGroup.add(purlinS);

    // North purlin
    const purlinN = new THREE.Mesh(purlinGeo, materials.darkWood);
    purlinN.position.set(0, yOffset - 0.04, -zOffset);
    purlinN.rotation.x = -pitchRad;
    purlinN.castShadow = true;
    trussGroup.add(purlinN);
  });

  // Ridge Beam (running along the top apex)
  const ridgeBeamGeo = new THREE.BoxGeometry(roofLength, 0.18, 0.10);
  const ridgeBeam = new THREE.Mesh(ridgeBeamGeo, materials.wood);
  ridgeBeam.position.set(0, ridgeY - 0.09, 0);
  ridgeBeam.castShadow = true;
  trussGroup.add(ridgeBeam);

  // Exposed Rafter Tails along Eaves (16 rafter tails per side with decorative 45° cut)
  const rafterTailCount = 18;
  const tailGeo = new THREE.BoxGeometry(0.06, 0.12, eavesOverhang + 0.2);
  const eavesY = wallTopY - 0.02;

  for (let i = 0; i < rafterTailCount; i++) {
    const x = -halfL + (i / (rafterTailCount - 1)) * length;

    // South rafter tail
    const tailS = new THREE.Mesh(tailGeo, materials.wood);
    tailS.position.set(x, eavesY, halfW + (eavesOverhang - 0.2) / 2);
    tailS.rotation.x = pitchRad;
    tailS.castShadow = true;
    trussGroup.add(tailS);

    // North rafter tail
    const tailN = new THREE.Mesh(tailGeo, materials.wood);
    tailN.position.set(x, eavesY, -halfW - (eavesOverhang - 0.2) / 2);
    tailN.rotation.x = -pitchRad;
    tailN.castShadow = true;
    trussGroup.add(tailN);
  }

  // 2. VERANDA / ENTRANCE PORCH POSTS & BRACKETS
  const verandaGroup = new THREE.Group();
  verandaGroup.name = 'Entrance_Veranda_Structure';

  const postSpacing = 1.30;
  const postPositions = [-postSpacing / 2, postSpacing / 2];
  const postHeight = 2.10;
  const postZ = halfW + 0.40;

  postPositions.forEach((xPos) => {
    // Carved stone plinth base for post
    const postBaseGeo = new THREE.BoxGeometry(0.20, 0.20, 0.20);
    const postBase = new THREE.Mesh(postBaseGeo, materials.stone);
    postBase.position.set(xPos, plinthHeight + 0.10, postZ);
    postBase.castShadow = true;
    verandaGroup.add(postBase);

    // Teak column
    const postGeo = new THREE.BoxGeometry(0.10, postHeight - 0.20, 0.10);
    const post = new THREE.Mesh(postGeo, materials.wood);
    post.position.set(xPos, plinthHeight + 0.20 + (postHeight - 0.20) / 2, postZ);
    post.castShadow = true;
    verandaGroup.add(post);

    // Decorative diagonal wooden bracket
    const bracketGeo = new THREE.BoxGeometry(0.08, 0.25, 0.25);
    const bracket = new THREE.Mesh(bracketGeo, materials.darkWood);
    bracket.position.set(xPos, plinthHeight + postHeight - 0.10, postZ - 0.10);
    bracket.rotation.x = Math.PI / 4;
    bracket.castShadow = true;
    verandaGroup.add(bracket);
  });

  // Veranda Header Beam
  const headerBeamGeo = new THREE.BoxGeometry(postSpacing + 0.40, 0.12, 0.12);
  const headerBeam = new THREE.Mesh(headerBeamGeo, materials.wood);
  headerBeam.position.set(0, plinthHeight + postHeight + 0.06, postZ);
  headerBeam.castShadow = true;
  verandaGroup.add(headerBeam);

  // 3. RAINWATER HARVESTING GUTTERS & DOWNSPOUTS
  const drainageGroup = new THREE.Group();
  drainageGroup.name = 'Rainwater_Drainage_Harvesting';

  const gutterRadius = 0.06;
  const gutterGeo = new THREE.CylinderGeometry(gutterRadius, gutterRadius, roofLength, 12, 1, false, 0, Math.PI);
  const gutterY = ridgeY - roofHalfWidth * Math.tan(pitchRad) - 0.02;

  // South Gutter
  const gutterS = new THREE.Mesh(gutterGeo, materials.copperGutter);
  gutterS.rotation.z = Math.PI / 2;
  gutterS.rotation.x = Math.PI;
  gutterS.position.set(0, gutterY, roofHalfWidth + 0.04);
  gutterS.castShadow = true;
  drainageGroup.add(gutterS);

  // North Gutter
  const gutterN = new THREE.Mesh(gutterGeo, materials.copperGutter);
  gutterN.rotation.z = Math.PI / 2;
  gutterN.position.set(0, gutterY, -roofHalfWidth - 0.04);
  gutterN.castShadow = true;
  drainageGroup.add(gutterN);

  // Downspout Pipes at South-West and South-East corners
  const downspoutCorners = [
    { x: -halfL - 0.20, z: halfW + 0.15 },
    { x: halfL + 0.20, z: halfW + 0.15 },
    { x: -halfL - 0.20, z: -halfW - 0.15 },
    { x: halfL + 0.20, z: -halfW - 0.15 },
  ];

  downspoutCorners.forEach((pt) => {
    const pipeHeight = gutterY - plinthHeight;
    const pipeGeo = new THREE.CylinderGeometry(0.04, 0.04, pipeHeight, 10);
    const pipe = new THREE.Mesh(pipeGeo, materials.copperGutter);
    pipe.position.set(pt.x, plinthHeight + pipeHeight / 2, pt.z);
    pipe.castShadow = true;
    drainageGroup.add(pipe);

    // Stone Filtration Catchment Basin at ground
    const basinGeo = new THREE.BoxGeometry(0.40, 0.25, 0.40);
    const basin = new THREE.Mesh(basinGeo, materials.stone);
    basin.position.set(pt.x, 0.125, pt.z);
    basin.castShadow = true;
    drainageGroup.add(basin);

    // Gravel infill
    const gravelGeo = new THREE.BoxGeometry(0.32, 0.05, 0.32);
    const gravel = new THREE.Mesh(gravelGeo, materials.darkWood);
    gravel.position.set(pt.x, 0.22, pt.z);
    drainageGroup.add(gravel);
  });

  // 4. TIMBER LINTELS OVER OPENINGS
  const lintelsGroup = new THREE.Group();
  lintelsGroup.name = 'Structural_Timber_Lintels';

  const addLintel = (x: number, y: number, z: number, w: number, d: number) => {
    const lintelGeo = new THREE.BoxGeometry(w + 0.30, 0.15, d + 0.04);
    const lintel = new THREE.Mesh(lintelGeo, materials.wood);
    lintel.position.set(x, y, z);
    lintel.castShadow = true;
    lintelsGroup.add(lintel);
  };

  const t = wallThickness;
  const lintelY = plinthHeight + 2.35; // Above 2.10m openings & windows

  // South Front Window Lintels
  addLintel(-2.75, lintelY, halfW - t / 2, 1.80, t);
  addLintel(2.75, lintelY, halfW - t / 2, 1.80, t);
  addLintel(0.00, plinthHeight + 2.18, halfW - t / 2, 0.90, t); // Main Door Lintel

  // North Rear Window Lintels
  addLintel(-2.50, lintelY, -halfW + t / 2, 1.40, t);
  addLintel(2.50, lintelY, -halfW + t / 2, 1.40, t);

  // West Left Window Lintels
  addLintel(-halfL + t / 2, lintelY, 1.60, t, 1.20);
  addLintel(-halfL + t / 2, lintelY, -1.60, t, 1.20);

  // East Right Window Lintels
  addLintel(halfL - t / 2, lintelY, 1.60, t, 1.20);
  addLintel(halfL - t / 2, lintelY, -1.60, t, 1.20);

  // 5. PERIMETER PAVED STONE APRON WALKWAY (Plinth Protection Band)
  const apronGroup = new THREE.Group();
  apronGroup.name = 'Perimeter_Paved_Apron';

  const apronWidth = 0.80;
  const apronThick = 0.06;

  const apronGeo = new THREE.BoxGeometry(length + 2 * apronWidth, apronThick, width + 2 * apronWidth);
  const apronMesh = new THREE.Mesh(apronGeo, materials.stone);
  apronMesh.position.set(0, apronThick / 2, 0);
  apronMesh.receiveShadow = true;
  apronGroup.add(apronMesh);

  return {
    trussGroup,
    verandaGroup,
    drainageGroup,
    lintelsGroup,
    apronGroup,
  };
}

