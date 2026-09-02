// @ts-nocheck
import * as THREE from 'three';
import { 
  createConcreteTexture,
  createRammedEarthTexture, 
  createRoofSlateTexture, 
  createPlinthStoneTexture, 
  createWoodTexture, 
  createFloorTileTexture,
  createGraniteTexture
} from '../../residential/utils/textureGenerator';
import type { BuildingDimensions, RenderMode } from '../../types';

export const DEFAULT_DUPLEX_DIMENSIONS: BuildingDimensions = {
  length: 12.00,
  width: 8.00,
  wallHeight: 3.20,
  plinthHeight: 0.40,
  wallThickness: 0.30,
  roofPitchDeg: 0, // Flat terrace
  eavesOverhang: 0.50,
  gableOverhang: 0.50,
};

export class DuplexModel {
  public rootGroup: THREE.Group;
  public foundationGroup: THREE.Group;
  public groundFloorGroup: THREE.Group;
  public slabGroup: THREE.Group;
  public upperFloorGroup: THREE.Group;
  public terraceGroup: THREE.Group;
  public stairsGroup: THREE.Group;
  public rValueBadgesGroup: THREE.Group;

  private materials: Record<string, THREE.Material> = {};
  private renderMode: RenderMode = 'realistic';
  private dimensions: BuildingDimensions;

  private activeWallMaterial?: THREE.Material;
  private activeTerraceMaterial?: THREE.Material;

  constructor(dims: BuildingDimensions = DEFAULT_DUPLEX_DIMENSIONS) {
    this.dimensions = dims;
    this.rootGroup = new THREE.Group();
    this.rootGroup.name = 'Duplex_Building';

    this.foundationGroup = new THREE.Group();
    this.groundFloorGroup = new THREE.Group();
    this.slabGroup = new THREE.Group();
    this.upperFloorGroup = new THREE.Group();
    this.terraceGroup = new THREE.Group();
    this.stairsGroup = new THREE.Group();
    this.rValueBadgesGroup = new THREE.Group();

    this.initMaterials();
    this.buildGeometry();

    this.rootGroup.add(this.foundationGroup);
    this.rootGroup.add(this.groundFloorGroup);
    this.rootGroup.add(this.slabGroup);
    this.rootGroup.add(this.upperFloorGroup);
    this.rootGroup.add(this.terraceGroup);
    this.rootGroup.add(this.stairsGroup);
    this.rootGroup.add(this.rValueBadgesGroup);
  }

  private initMaterials() {
    const plinthStoneTex = createPlinthStoneTexture();
    const floorTileTex = createFloorTileTexture();
    const woodTex = createWoodTexture();
    const concreteTex = createConcreteTexture();

    // PBR Materials
    this.materials['concreteWall'] = new THREE.MeshStandardMaterial({
      map: concreteTex,
      roughnessMap: concreteTex,
      bumpMap: concreteTex,
      bumpScale: 0.15,
      color: 0xe2e8f0,
      roughness: 0.85,
      metalness: 0.02,
    });

    this.materials['terrace'] = new THREE.MeshStandardMaterial({
      map: floorTileTex,
      roughnessMap: floorTileTex,
      bumpMap: floorTileTex,
      bumpScale: 0.08,
      color: 0x94a3b8,
      roughness: 0.9,
      metalness: 0.02,
    });

    this.materials['wood'] = new THREE.MeshStandardMaterial({
      map: woodTex,
      roughness: 0.7,
      metalness: 0.08,
      color: 0x6e472a,
    });

    this.materials['plinth'] = new THREE.MeshStandardMaterial({
      map: plinthStoneTex,
      roughnessMap: plinthStoneTex,
      bumpMap: plinthStoneTex,
      bumpScale: 0.12,
      roughness: 0.9,
      metalness: 0.05,
      color: 0x9e988c,
    });

    this.materials['floor'] = new THREE.MeshStandardMaterial({
      map: floorTileTex,
      roughness: 0.7,
      metalness: 0.05,
      color: 0xbf7854,
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
    });

    // Heatmap / R-Value Materials
    this.materials['rValueWall'] = new THREE.MeshStandardMaterial({ color: 0x0d9488, emissive: 0x042f2e, emissiveIntensity: 0.2 });
    this.materials['rValueRoof'] = new THREE.MeshStandardMaterial({ color: 0x4f46e5, emissive: 0x1e1b4b, emissiveIntensity: 0.2 });
    this.materials['rValueGlazing'] = new THREE.MeshPhysicalMaterial({ color: 0xef4444, transparent: true, opacity: 0.75, transmission: 0.25 });
  }

  private buildGeometry() {
    const { length, width, wallHeight, plinthHeight, wallThickness } = this.dimensions;
    const halfL = length / 2;
    const halfW = width / 2;
    const t = wallThickness;

    // Y elevations
    const yGroundFloor = plinthHeight;
    const ySlab = yGroundFloor + wallHeight;
    const slabThickness = 0.25;
    const yUpperFloor = ySlab + slabThickness;
    const yTerrace = yUpperFloor + wallHeight;
    const terraceThickness = 0.25;
    const parapetHeight = 1.10;

    // --- 1. FOUNDATION ---
    const plinthGeo = new THREE.BoxGeometry(length, plinthHeight, width);
    const plinthMesh = new THREE.Mesh(plinthGeo, this.materials['plinth']);
    plinthMesh.position.set(0, plinthHeight / 2, 0);
    plinthMesh.castShadow = true;
    plinthMesh.receiveShadow = true;
    this.foundationGroup.add(plinthMesh);

    // Ground Floor Interior
    const gfFloorGeo = new THREE.BoxGeometry(length - 2*t, 0.02, width - 2*t);
    const gfFloorMesh = new THREE.Mesh(gfFloorGeo, this.materials['floor']);
    gfFloorMesh.position.set(0, yGroundFloor + 0.01, 0);
    gfFloorMesh.receiveShadow = true;
    this.foundationGroup.add(gfFloorMesh);

    // --- HELPER TO BUILD WALLS WITH HOLES ---
    // Instead of CSG, we just build pieces to form walls around windows.
    // To keep it simple but "perfect", we'll use a Shape + ExtrudeGeometry with holes for windows.
    
    const buildWallWithHoles = (
      w: number, h: number, depth: number, 
      holes: {x: number, y: number, hw: number, hh: number}[],
      isXAxis: boolean, 
      pos: THREE.Vector3
    ) => {
      const shape = new THREE.Shape();
      shape.moveTo(-w/2, 0);
      shape.lineTo(w/2, 0);
      shape.lineTo(w/2, h);
      shape.lineTo(-w/2, h);
      shape.lineTo(-w/2, 0);

      holes.forEach(hole => {
        const path = new THREE.Path();
        path.moveTo(hole.x - hole.hw, hole.y - hole.hh);
        path.lineTo(hole.x + hole.hw, hole.y - hole.hh);
        path.lineTo(hole.x + hole.hw, hole.y + hole.hh);
        path.lineTo(hole.x - hole.hw, hole.y + hole.hh);
        path.lineTo(hole.x - hole.hw, hole.y - hole.hh);
        shape.holes.push(path);
      });

      const extrudeSettings = { steps: 1, depth: depth, bevelEnabled: false };
      const geo = new THREE.ExtrudeGeometry(shape, extrudeSettings);
      geo.center(); // Center the geometry

      const mesh = new THREE.Mesh(geo, this.activeWallMaterial || this.materials['concreteWall']);
      mesh.position.copy(pos);
      if (isXAxis) {
        mesh.rotation.y = 0; // Front/Rear
      } else {
        mesh.rotation.y = Math.PI / 2; // Left/Right
      }
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      mesh.userData = { componentId: 'walls' };
      return mesh;
    };

    // --- 2. GROUND FLOOR WALLS ---
    // Front Wall (Length, Z = +width/2 - t/2)
    // Add large main entrance (0, 0, 1.0w, 2.2h) and living room window (-3, 1.2, 2w, 1.5h)
    const gfFrontHoles = [
      {x: 0, y: 1.1, hw: 1.0, hh: 1.1}, // Door
      {x: -3, y: 1.5, hw: 1.0, hh: 0.75}, // Window
      {x: 3, y: 1.5, hw: 1.0, hh: 0.75}  // Window
    ];
    this.groundFloorGroup.add(buildWallWithHoles(length, wallHeight, t, gfFrontHoles, true, new THREE.Vector3(0, yGroundFloor + wallHeight/2, halfW - t/2)));
    
    // Rear Wall
    const gfRearHoles = [{x: -3, y: 1.5, hw: 1.0, hh: 0.75}, {x: 3, y: 1.5, hw: 1.0, hh: 0.75}];
    this.groundFloorGroup.add(buildWallWithHoles(length, wallHeight, t, gfRearHoles, true, new THREE.Vector3(0, yGroundFloor + wallHeight/2, -halfW + t/2)));
    
    // Left Wall
    this.groundFloorGroup.add(buildWallWithHoles(width - 2*t, wallHeight, t, [], false, new THREE.Vector3(-halfL + t/2, yGroundFloor + wallHeight/2, 0)));
    
    // Right Wall
    this.groundFloorGroup.add(buildWallWithHoles(width - 2*t, wallHeight, t, [], false, new THREE.Vector3(halfL - t/2, yGroundFloor + wallHeight/2, 0)));


    // --- 3. FIRST FLOOR SLAB ---
    const slabGeo = new THREE.BoxGeometry(length, slabThickness, width);
    const slabMesh = new THREE.Mesh(slabGeo, this.materials['concreteWall']);
    slabMesh.position.set(0, ySlab + slabThickness/2, 0);
    slabMesh.castShadow = true;
    slabMesh.receiveShadow = true;
    this.slabGroup.add(slabMesh);

    const ufFloorGeo = new THREE.BoxGeometry(length - 2*t, 0.02, width - 2*t);
    const ufFloorMesh = new THREE.Mesh(ufFloorGeo, this.materials['wood']);
    ufFloorMesh.position.set(0, yUpperFloor + 0.01, 0);
    ufFloorMesh.receiveShadow = true;
    this.slabGroup.add(ufFloorMesh);


    // --- 4. UPPER FLOOR WALLS ---
    const ufFrontHoles = [
      {x: -3, y: 1.5, hw: 1.0, hh: 0.75}, // Balcony Door/Window
      {x: 3, y: 1.5, hw: 1.0, hh: 0.75},
      {x: 0, y: 1.5, hw: 0.5, hh: 0.5}   // Staircase Window
    ];
    this.upperFloorGroup.add(buildWallWithHoles(length, wallHeight, t, ufFrontHoles, true, new THREE.Vector3(0, yUpperFloor + wallHeight/2, halfW - t/2)));
    
    // Rear Wall
    const ufRearHoles = [{x: -3, y: 1.5, hw: 1.0, hh: 0.75}, {x: 3, y: 1.5, hw: 1.0, hh: 0.75}];
    this.upperFloorGroup.add(buildWallWithHoles(length, wallHeight, t, ufRearHoles, true, new THREE.Vector3(0, yUpperFloor + wallHeight/2, -halfW + t/2)));
    
    // Left Wall
    this.upperFloorGroup.add(buildWallWithHoles(width - 2*t, wallHeight, t, [{x: 0, y: 1.5, hw: 0.6, hh: 0.6}], false, new THREE.Vector3(-halfL + t/2, yUpperFloor + wallHeight/2, 0)));
    
    // Right Wall
    this.upperFloorGroup.add(buildWallWithHoles(width - 2*t, wallHeight, t, [{x: 0, y: 1.5, hw: 0.6, hh: 0.6}], false, new THREE.Vector3(halfL - t/2, yUpperFloor + wallHeight/2, 0)));


    // --- 5. TERRACE (FLAT ROOF) ---
    const terraceSlabGeo = new THREE.BoxGeometry(length + 0.4, terraceThickness, width + 0.4); // Overhang 0.2m
    const terraceSlabMesh = new THREE.Mesh(terraceSlabGeo, this.activeTerraceMaterial || this.materials['terrace']);
    terraceSlabMesh.position.set(0, yTerrace + terraceThickness/2, 0);
    terraceSlabMesh.castShadow = true;
    terraceSlabMesh.receiveShadow = true;
    terraceSlabMesh.userData = { componentId: 'roof' };
    this.terraceGroup.add(terraceSlabMesh);

    // Parapet Walls
    const buildParapet = (w: number, d: number, x: number, z: number, isXAxis: boolean) => {
      const geo = new THREE.BoxGeometry(w, parapetHeight, d);
      const mesh = new THREE.Mesh(geo, this.activeWallMaterial || this.materials['concreteWall']);
      mesh.position.set(x, yTerrace + terraceThickness + parapetHeight/2, z);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      mesh.userData = { componentId: 'walls' };
      this.terraceGroup.add(mesh);
    };

    const pT = 0.2; // Parapet thickness
    buildParapet(length, pT, 0, halfW - pT/2, true); // Front
    buildParapet(length, pT, 0, -halfW + pT/2, true); // Rear
    buildParapet(pT, width - 2*pT, -halfL + pT/2, 0, false); // Left
    buildParapet(pT, width - 2*pT, halfL - pT/2, 0, false); // Right

    // --- 6. WINDOWS & DOORS ---
    const addWindow = (x: number, y: number, z: number, w: number, h: number, isXAxis: boolean, group: THREE.Group) => {
      const frameT = 0.06;
      const groupObj = new THREE.Group();
      groupObj.position.set(x, y, z);
      
      const top = new THREE.Mesh(new THREE.BoxGeometry(isXAxis ? w : frameT, frameT, isXAxis ? frameT : w), this.materials['frame']);
      top.position.y = h/2 - frameT/2;
      top.userData = { componentId: 'windowFrame' };
      groupObj.add(top);
      
      const bot = new THREE.Mesh(new THREE.BoxGeometry(isXAxis ? w : frameT, frameT, isXAxis ? frameT : w), this.materials['frame']);
      bot.position.y = -h/2 + frameT/2;
      bot.userData = { componentId: 'windowFrame' };
      groupObj.add(bot);
      
      const sideH = h - 2*frameT;
      const sideGeo = new THREE.BoxGeometry(frameT, sideH, frameT);
      const left = new THREE.Mesh(sideGeo, this.materials['frame']);
      if (isXAxis) left.position.x = -w/2 + frameT/2;
      else left.position.z = -w/2 + frameT/2;
      left.userData = { componentId: 'windowFrame' };
      groupObj.add(left);
      
      const right = new THREE.Mesh(sideGeo, this.materials['frame']);
      if (isXAxis) right.position.x = w/2 - frameT/2;
      else right.position.z = w/2 - frameT/2;
      right.userData = { componentId: 'windowFrame' };
      groupObj.add(right);
      
      const gW = isXAxis ? w - 2*frameT : 0.02;
      const gH = h - 2*frameT;
      const gD = isXAxis ? 0.02 : w - 2*frameT;
      const glass = new THREE.Mesh(new THREE.BoxGeometry(gW, gH, gD), this.materials['glass']);
      glass.name = 'windowGlass';
      glass.userData = { componentId: 'windowGlazing' };
      groupObj.add(glass);
      
      group.add(groupObj);
    };

    const addDoor = (x: number, y: number, z: number, w: number, h: number, isXAxis: boolean, group: THREE.Group) => {
      const frameT = 0.08;
      const groupObj = new THREE.Group();
      groupObj.position.set(x, y, z);
      
      const top = new THREE.Mesh(new THREE.BoxGeometry(isXAxis ? w : frameT, frameT, isXAxis ? frameT : w), this.materials['frame']);
      top.position.y = h/2 - frameT/2;
      top.userData = { componentId: 'windowFrame' };
      groupObj.add(top);
      
      const sideH = h - frameT;
      const sideGeo = new THREE.BoxGeometry(frameT, sideH, frameT);
      const left = new THREE.Mesh(sideGeo, this.materials['frame']);
      left.position.y = -frameT/2;
      if (isXAxis) left.position.x = -w/2 + frameT/2;
      else left.position.z = -w/2 + frameT/2;
      left.userData = { componentId: 'windowFrame' };
      groupObj.add(left);
      
      const right = new THREE.Mesh(sideGeo, this.materials['frame']);
      right.position.y = -frameT/2;
      if (isXAxis) right.position.x = w/2 - frameT/2;
      else right.position.z = w/2 - frameT/2;
      right.userData = { componentId: 'windowFrame' };
      groupObj.add(right);
      
      const dW = isXAxis ? w - 2*frameT : 0.06;
      const dH = h - frameT;
      const dD = isXAxis ? 0.06 : w - 2*frameT;
      const door = new THREE.Mesh(new THREE.BoxGeometry(dW, dH, dD), this.materials['wood']);
      door.position.y = -frameT/2;
      if (isXAxis) door.position.z = -0.02;
      else door.position.x = -0.02;
      door.userData = { componentId: 'door' };
      groupObj.add(door);
      
      group.add(groupObj);
    };

    // Ground Floor Windows & Door
    addDoor(0, yGroundFloor + 1.1, halfW - t/2, 2.0, 2.2, true, this.groundFloorGroup);
    addWindow(-3, yGroundFloor + 1.5, halfW - t/2, 2.0, 1.5, true, this.groundFloorGroup);
    addWindow(3, yGroundFloor + 1.5, halfW - t/2, 2.0, 1.5, true, this.groundFloorGroup);
    addWindow(-3, yGroundFloor + 1.5, -halfW + t/2, 2.0, 1.5, true, this.groundFloorGroup);
    addWindow(3, yGroundFloor + 1.5, -halfW + t/2, 2.0, 1.5, true, this.groundFloorGroup);

    // Upper Floor Windows
    addWindow(-3, yUpperFloor + 1.5, halfW - t/2, 2.0, 1.5, true, this.upperFloorGroup);
    addWindow(3, yUpperFloor + 1.5, halfW - t/2, 2.0, 1.5, true, this.upperFloorGroup);
    addWindow(0, yUpperFloor + 1.5, halfW - t/2, 1.0, 1.0, true, this.upperFloorGroup); // Stair
    addWindow(-3, yUpperFloor + 1.5, -halfW + t/2, 2.0, 1.5, true, this.upperFloorGroup);
    addWindow(3, yUpperFloor + 1.5, -halfW + t/2, 2.0, 1.5, true, this.upperFloorGroup);
    addWindow(-halfL + t/2, yUpperFloor + 1.5, 0, 1.2, 1.2, false, this.upperFloorGroup);
    addWindow(halfL - t/2, yUpperFloor + 1.5, 0, 1.2, 1.2, false, this.upperFloorGroup);

    // --- 7. STAIRS ---
    const stepH = 0.2;
    const stepD = 0.28;
    const stairW = 1.0;
    const numSteps1 = 8;
    const numSteps2 = 8;
    
    // Flight 1 (Ground to Landing)
    for (let i = 0; i < numSteps1; i++) {
      const stepGeo = new THREE.BoxGeometry(stairW, stepH, stepD);
      const stepMesh = new THREE.Mesh(stepGeo, this.materials['wood']);
      // Start near left wall, go backwards towards rear
      stepMesh.position.set(-halfL + t + stairW/2 + 0.1, yGroundFloor + (i+0.5)*stepH, t + i*stepD);
      stepMesh.castShadow = true;
      stepMesh.receiveShadow = true;
      this.stairsGroup.add(stepMesh);
    }
    
    // Landing
    const landingElev = yGroundFloor + numSteps1*stepH;
    const landingGeo = new THREE.BoxGeometry(stairW*2 + 0.2, stepH, stairW);
    const landingMesh = new THREE.Mesh(landingGeo, this.materials['wood']);
    landingMesh.position.set(-halfL + t + stairW + 0.15, landingElev - stepH/2, t + numSteps1*stepD + stairW/2);
    landingMesh.castShadow = true;
    landingMesh.receiveShadow = true;
    this.stairsGroup.add(landingMesh);

    // Flight 2 (Landing to Upper Floor)
    for (let i = 0; i < numSteps2; i++) {
      const stepGeo = new THREE.BoxGeometry(stairW, stepH, stepD);
      const stepMesh = new THREE.Mesh(stepGeo, this.materials['wood']);
      stepMesh.position.set(-halfL + t + stairW*1.5 + 0.2, landingElev + (i+0.5)*stepH, t + numSteps1*stepD - i*stepD);
      stepMesh.castShadow = true;
      stepMesh.receiveShadow = true;
      this.stairsGroup.add(stepMesh);
    }
  }

  public setRenderMode(mode: RenderMode) {
    this.renderMode = mode;
    this.rootGroup.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        const componentId = child.userData.componentId;
        if (!componentId) return;

        if (mode === 'thermal') {
          if (componentId === 'walls') child.material = this.materials['rValueWall'];
          else if (componentId === 'roof') child.material = this.materials['rValueRoof'];
          else if (componentId === 'windowGlazing') child.material = this.materials['rValueGlazing'];
          else if (componentId === 'windowFrame') child.material = this.materials['rValueFrame'];
          else child.material = this.materials['concreteWall'];
        } else if (mode === 'wireframe') {
          if (!child.userData.wireframeMaterial) {
            child.userData.wireframeMaterial = new THREE.MeshBasicMaterial({ color: 0x06b6d4, wireframe: true, transparent: true, opacity: 0.3 });
          }
          child.material = child.userData.wireframeMaterial;
        } else {
          // realistic
          if (componentId === 'walls') child.material = this.activeWallMaterial || this.materials['concreteWall'];
          else if (componentId === 'roof') child.material = this.activeTerraceMaterial || this.materials['terrace'];
          else if (componentId === 'windowGlazing') child.material = this.materials['glass'];
          else if (componentId === 'windowFrame') child.material = this.materials['frame'];
          else if (componentId === 'foundation') child.material = this.materials['plinth'];
          else if (componentId === 'door') child.material = this.materials['wood'];
        }
      }
    });
  }

  public applyWallMaterial(materialDef: any) {
    if (!materialDef.hex) return;
    const newMat = this.materials['concreteWall'].clone() as THREE.MeshStandardMaterial;
    newMat.color.setHex(parseInt(materialDef.hex.replace('#', '0x')));
    if (materialDef.id === 'earthWall' || materialDef.id === 'brick') {
      newMat.map = createRammedEarthTexture(); // Or map to a brick texture
    }
    this.activeWallMaterial = newMat;
    if (this.renderMode === 'realistic') this.setRenderMode('realistic');
  }

  public applyRoofMaterial(materialDef: any) {
    if (!materialDef.hex) return;
    const newMat = this.materials['terrace'].clone() as THREE.MeshStandardMaterial;
    newMat.color.setHex(parseInt(materialDef.hex.replace('#', '0x')));
    this.activeTerraceMaterial = newMat;
    if (this.renderMode === 'realistic') this.setRenderMode('realistic');
  }

  public toggleLayer(layer: 'terrace' | 'upper' | 'ground', visible: boolean) {
    if (layer === 'terrace') this.terraceGroup.visible = visible;
    if (layer === 'upper') {
      this.upperFloorGroup.visible = visible;
      this.slabGroup.visible = visible;
    }
    if (layer === 'ground') {
      this.groundFloorGroup.visible = visible;
      this.foundationGroup.visible = visible;
    }
  }

  public cleanup() {
    Object.values(this.materials).forEach(mat => mat.dispose());
  }
}
