// @ts-nocheck
import * as THREE from 'three';
import type {} from '../types';

export interface InteriorMaterials {
  wood: THREE.Material;
  darkWood: THREE.Material;
  fabricCream: THREE.Material;
  fabricRust: THREE.Material;
  fabricTeal: THREE.Material;
  granite: THREE.Material;
  brass: THREE.Material;
  ceramicWhite: THREE.Material;
  glassMirror: THREE.Material;
  juteRug: THREE.Material;
  caneWoven: THREE.Material;
  plantGreen: THREE.Material;
  terracottaClay: THREE.Material;
}

/**
 * Builds a highly detailed, realistic, culturally grounded interior layout
 * for a 70m² 4-6 person passive residential house in India.
 */
export function buildRealisticInterior(
  dims: BuildingDimensions,
  materials: InteriorMaterials
): THREE.Group {
  const root = new THREE.Group();
  root.name = 'Complete_Realistic_Interior';

  const { plinthHeight } = dims;
  const floorY = plinthHeight; // 0.30m

  // ==========================================
  // 1. LIVING & DINING ROOM (East / Central Front: ~24.2m²)
  // ==========================================
  const livingGroup = new THREE.Group();
  livingGroup.name = 'Interior_Living_Dining';

  // A. Handcrafted Teak Dining Table (X = 2.40, Z = 1.60)
  const diningGroup = new THREE.Group();
  diningGroup.position.set(2.40, floorY, 1.60);

  // Tabletop (1.60m x 0.90m x 0.04m, height = 0.76m)
  const tableTop = new THREE.Mesh(
    new THREE.BoxGeometry(1.60, 0.04, 0.90),
    materials.wood
  );
  tableTop.position.set(0, 0.74, 0);
  tableTop.castShadow = true;
  tableTop.receiveShadow = true;
  diningGroup.add(tableTop);

  // 4 Table Legs
  const legGeo = new THREE.BoxGeometry(0.06, 0.72, 0.06);
  const legOffsets = [
    { x: -0.72, z: -0.38 },
    { x: 0.72, z: -0.38 },
    { x: -0.72, z: 0.38 },
    { x: 0.72, z: 0.38 },
  ];
  legOffsets.forEach((off) => {
    const leg = new THREE.Mesh(legGeo, materials.wood);
    leg.position.set(off.x, 0.36, off.z);
    leg.castShadow = true;
    diningGroup.add(leg);
  });

  // Table Runner / Centerpiece
  const runner = new THREE.Mesh(
    new THREE.BoxGeometry(1.40, 0.005, 0.30),
    materials.fabricCream
  );
  runner.position.set(0, 0.763, 0);
  diningGroup.add(runner);

  // Terracotta Ceramic Bowl on Dining Table
  const bowl = new THREE.Mesh(
    new THREE.CylinderGeometry(0.12, 0.06, 0.08, 16),
    materials.terracottaClay
  );
  bowl.position.set(0, 0.80, 0);
  bowl.castShadow = true;
  diningGroup.add(bowl);

  // 4 Dining Chairs with Cane Backrests
  const createChair = (x: number, z: number, rotY: number) => {
    const chair = new THREE.Group();
    chair.position.set(x, 0, z);
    chair.rotation.y = rotY;

    // Seat
    const seat = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.04, 0.42), materials.caneWoven);
    seat.position.set(0, 0.44, 0);
    seat.castShadow = true;
    chair.add(seat);

    // Cushion
    const cushion = new THREE.Mesh(new THREE.BoxGeometry(0.40, 0.03, 0.40), materials.fabricTeal);
    cushion.position.set(0, 0.47, 0);
    chair.add(cushion);

    // 4 Chair Legs
    const chairLegGeo = new THREE.BoxGeometry(0.035, 0.44, 0.035);
    const chairLegs = [
      { x: -0.17, z: -0.17 },
      { x: 0.17, z: -0.17 },
      { x: -0.17, z: 0.17 },
      { x: 0.17, z: 0.17 },
    ];
    chairLegs.forEach((co) => {
      const cl = new THREE.Mesh(chairLegGeo, materials.wood);
      cl.position.set(co.x, 0.22, co.z);
      cl.castShadow = true;
      chair.add(cl);
    });

    // Chair Backrest
    const backPostGeo = new THREE.BoxGeometry(0.035, 0.46, 0.035);
    const bpL = new THREE.Mesh(backPostGeo, materials.wood);
    bpL.position.set(-0.17, 0.69, -0.17);
    chair.add(bpL);
    const bpR = new THREE.Mesh(backPostGeo, materials.wood);
    bpR.position.set(0.17, 0.69, -0.17);
    chair.add(bpR);

    const backCane = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.36, 0.02), materials.caneWoven);
    backCane.position.set(0, 0.70, -0.17);
    chair.add(backCane);

    return chair;
  };

  diningGroup.add(createChair(-0.45, -0.65, 0));
  diningGroup.add(createChair(0.45, -0.65, 0));
  diningGroup.add(createChair(-0.45, 0.65, Math.PI));
  diningGroup.add(createChair(0.45, 0.65, Math.PI));

  // Pendant Light fixture above dining table
  const pendantCord = new THREE.Mesh(
    new THREE.CylinderGeometry(0.008, 0.008, 1.20, 8),
    materials.darkWood
  );
  pendantCord.position.set(0, 2.30, 0);
  diningGroup.add(pendantCord);

  const pendantShade = new THREE.Mesh(
    new THREE.ConeGeometry(0.22, 0.18, 16, 1, true),
    materials.terracottaClay
  );
  pendantShade.position.set(0, 1.70, 0);
  pendantShade.rotation.x = Math.PI;
  diningGroup.add(pendantShade);

  livingGroup.add(diningGroup);

  // B. Traditional Baithak / Daybed Sofa Lounge (X = 0.20, Z = 1.80)
  const loungeGroup = new THREE.Group();
  loungeGroup.position.set(0.20, floorY, 1.80);

  // Woven Jute Circular Rug (Diameter = 2.40m)
  const juteRug = new THREE.Mesh(
    new THREE.CylinderGeometry(1.20, 1.20, 0.015, 32),
    materials.juteRug
  );
  juteRug.position.set(0, 0.008, 0);
  juteRug.receiveShadow = true;
  loungeGroup.add(juteRug);

  // Low-Profile Solid Teak Daybed / Diwan (2.00m x 0.90m)
  const diwanBase = new THREE.Mesh(
    new THREE.BoxGeometry(2.00, 0.20, 0.90),
    materials.wood
  );
  diwanBase.position.set(0, 0.10, -0.60);
  diwanBase.castShadow = true;
  loungeGroup.add(diwanBase);

  // Comfortable Thick Mattress
  const diwanMattress = new THREE.Mesh(
    new THREE.BoxGeometry(1.96, 0.16, 0.86),
    materials.fabricCream
  );
  diwanMattress.position.set(0, 0.28, -0.60);
  diwanMattress.castShadow = true;
  loungeGroup.add(diwanMattress);

  // 2 Cylindrical Bolster Pillows (Indian Gaddi style)
  const bolsterGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.78, 16);
  
  const bolsterL = new THREE.Mesh(bolsterGeo, materials.fabricRust);
  bolsterL.rotation.x = Math.PI / 2;
  bolsterL.position.set(-0.85, 0.44, -0.60);
  bolsterL.castShadow = true;
  loungeGroup.add(bolsterL);

  const bolsterR = new THREE.Mesh(bolsterGeo, materials.fabricRust);
  bolsterR.rotation.x = Math.PI / 2;
  bolsterR.position.set(0.85, 0.44, -0.60);
  bolsterR.castShadow = true;
  loungeGroup.add(bolsterR);

  // Throw Pillows
  const pillowGeo = new THREE.BoxGeometry(0.38, 0.28, 0.14);
  const pil1 = new THREE.Mesh(pillowGeo, materials.fabricTeal);
  pil1.position.set(-0.35, 0.44, -0.85);
  pil1.rotation.x = 0.2;
  loungeGroup.add(pil1);

  const pil2 = new THREE.Mesh(pillowGeo, materials.fabricRust);
  pil2.position.set(0.35, 0.44, -0.85);
  pil2.rotation.x = 0.2;
  loungeGroup.add(pil2);

  // Low Teak Coffee Table
  const coffeeTable = new THREE.Mesh(
    new THREE.BoxGeometry(0.90, 0.25, 0.55),
    materials.darkWood
  );
  coffeeTable.position.set(0, 0.125, 0.20);
  coffeeTable.castShadow = true;
  loungeGroup.add(coffeeTable);

  // Books and Brass Vase on coffee table
  const book = new THREE.Mesh(
    new THREE.BoxGeometry(0.24, 0.03, 0.18),
    materials.fabricTeal
  );
  book.position.set(-0.20, 0.265, 0.20);
  loungeGroup.add(book);

  const brassVase = new THREE.Mesh(
    new THREE.CylinderGeometry(0.06, 0.08, 0.14, 12),
    materials.brass
  );
  brassVase.position.set(0.20, 0.32, 0.20);
  loungeGroup.add(brassVase);

  livingGroup.add(loungeGroup);

  // C. Bookshelf & Pottery Credenza against Central Partition
  const credenza = new THREE.Mesh(
    new THREE.BoxGeometry(1.60, 0.85, 0.35),
    materials.wood
  );
  credenza.position.set(-0.80, floorY + 0.425, -0.30);
  credenza.castShadow = true;
  livingGroup.add(credenza);

  // Potted Biophilic Air-Purifying Indoor Plants (Areca Palm & Snake Plant)
  const potGeo = new THREE.CylinderGeometry(0.18, 0.14, 0.35, 16);
  const potMesh = new THREE.Mesh(potGeo, materials.terracottaClay);
  potMesh.position.set(4.30, floorY + 0.175, 2.70);
  potMesh.castShadow = true;
  livingGroup.add(potMesh);

  // Foliage Fronds
  for (let i = 0; i < 7; i++) {
    const angle = (i / 7) * Math.PI * 2;
    const leafGeo = new THREE.BoxGeometry(0.08, 0.70, 0.02);
    const leaf = new THREE.Mesh(leafGeo, materials.plantGreen);
    leaf.position.set(
      4.30 + Math.cos(angle) * 0.12,
      floorY + 0.35 + 0.35,
      2.70 + Math.sin(angle) * 0.12
    );
    leaf.rotation.z = Math.cos(angle) * 0.35;
    leaf.rotation.x = Math.sin(angle) * 0.35;
    leaf.castShadow = true;
    livingGroup.add(leaf);
  }

  root.add(livingGroup);

  // ==========================================
  // 2. KITCHEN & UTILITY AREA (East Rear: ~8.0m²)
  // ==========================================
  const kitchenGroup = new THREE.Group();
  kitchenGroup.name = 'Interior_Kitchen_Zone';

  // L-Shaped Polished Granite Kitchen Counter (Z = -2.75, X from 0.80 to 4.70)
  const counterHeight = 0.86;
  const counterDepth = 0.65;

  // Main Counter Base Cabinets
  const mainCab = new THREE.Mesh(
    new THREE.BoxGeometry(3.60, counterHeight - 0.04, counterDepth),
    materials.wood
  );
  mainCab.position.set(2.80, floorY + (counterHeight - 0.04) / 2, -2.75);
  mainCab.castShadow = true;
  kitchenGroup.add(mainCab);

  // Polished Black Granite Top
  const graniteTop = new THREE.Mesh(
    new THREE.BoxGeometry(3.70, 0.04, counterDepth + 0.05),
    materials.granite
  );
  graniteTop.position.set(2.80, floorY + counterHeight - 0.02, -2.75);
  graniteTop.castShadow = true;
  kitchenGroup.add(graniteTop);

  // Stainless Steel Undermount Double Sink
  const sinkRim = new THREE.Mesh(
    new THREE.BoxGeometry(0.80, 0.02, 0.45),
    materials.granite
  );
  sinkRim.position.set(3.40, floorY + counterHeight + 0.01, -2.75);
  kitchenGroup.add(sinkRim);

  const sinkBowl = new THREE.Mesh(
    new THREE.BoxGeometry(0.70, 0.18, 0.38),
    materials.ceramicWhite
  );
  sinkBowl.position.set(3.40, floorY + counterHeight - 0.08, -2.75);
  kitchenGroup.add(sinkBowl);

  // Gooseneck Faucet
  const faucetGeo = new THREE.CylinderGeometry(0.015, 0.015, 0.28, 8);
  const faucet = new THREE.Mesh(faucetGeo, materials.brass);
  faucet.position.set(3.40, floorY + counterHeight + 0.14, -2.90);
  faucet.castShadow = true;
  kitchenGroup.add(faucet);

  // 3-Burner Gas Cooktop
  const cooktop = new THREE.Mesh(
    new THREE.BoxGeometry(0.75, 0.03, 0.42),
    materials.granite
  );
  cooktop.position.set(1.60, floorY + counterHeight + 0.015, -2.75);
  kitchenGroup.add(cooktop);

  // 3 Cast Iron Burners
  const burnerOffsets = [-0.22, 0.0, 0.22];
  burnerOffsets.forEach((bx) => {
    const burner = new THREE.Mesh(
      new THREE.CylinderGeometry(0.07, 0.07, 0.02, 12),
      materials.darkWood
    );
    burner.position.set(1.60 + bx, floorY + counterHeight + 0.035, -2.75);
    kitchenGroup.add(burner);
  });

  // Traditional Clay Water Pot (Matka) on Timber Stand
  const matkaStand = new THREE.Mesh(
    new THREE.BoxGeometry(0.35, 0.50, 0.35),
    materials.wood
  );
  matkaStand.position.set(4.45, floorY + 0.25, -2.00);
  matkaStand.castShadow = true;
  kitchenGroup.add(matkaStand);

  const matkaPot = new THREE.Mesh(
    new THREE.SphereGeometry(0.18, 16, 16),
    materials.terracottaClay
  );
  matkaPot.position.set(4.45, floorY + 0.50 + 0.18, -2.00);
  matkaPot.castShadow = true;
  kitchenGroup.add(matkaPot);

  // Floating Overhead Spice & Utensil Shelf
  const spiceShelf = new THREE.Mesh(
    new THREE.BoxGeometry(2.40, 0.03, 0.25),
    materials.wood
  );
  spiceShelf.position.set(2.40, floorY + 1.80, -3.10);
  spiceShelf.castShadow = true;
  kitchenGroup.add(spiceShelf);

  root.add(kitchenGroup);

  // ==========================================
  // 3. MASTER BEDROOM (West Rear: ~12.1m²)
  // ==========================================
  const masterGroup = new THREE.Group();
  masterGroup.name = 'Interior_Master_Bedroom';

  // King Size Low Platform Teak Bed (1.90m x 2.00m)
  const bedBase = new THREE.Mesh(
    new THREE.BoxGeometry(1.90, 0.24, 2.00),
    materials.wood
  );
  bedBase.position.set(-3.60, floorY + 0.12, -2.00);
  bedBase.castShadow = true;
  masterGroup.add(bedBase);

  // Slatted Wooden Headboard
  const headboard = new THREE.Mesh(
    new THREE.BoxGeometry(2.00, 0.90, 0.08),
    materials.wood
  );
  headboard.position.set(-3.60, floorY + 0.45, -3.00);
  headboard.castShadow = true;
  masterGroup.add(headboard);

  // Comfortable Multi-Layer Foam Mattress
  const mattress = new THREE.Mesh(
    new THREE.BoxGeometry(1.82, 0.22, 1.92),
    materials.fabricCream
  );
  mattress.position.set(-3.60, floorY + 0.35, -1.98);
  mattress.castShadow = true;
  masterGroup.add(mattress);

  // Duvet Runner (Teal / Warm Earth tone)
  const duvet = new THREE.Mesh(
    new THREE.BoxGeometry(1.84, 0.04, 1.20),
    materials.fabricTeal
  );
  duvet.position.set(-3.60, floorY + 0.46, -1.55);
  masterGroup.add(duvet);

  // 2 Master Sleeping Pillows
  const pillowMGeo = new THREE.BoxGeometry(0.65, 0.12, 0.42);
  const pillowML = new THREE.Mesh(pillowMGeo, materials.fabricCream);
  pillowML.position.set(-4.05, floorY + 0.48, -2.65);
  pillowML.rotation.x = 0.15;
  masterGroup.add(pillowML);

  const pillowMR = new THREE.Mesh(pillowMGeo, materials.fabricCream);
  pillowMR.position.set(-3.15, floorY + 0.48, -2.65);
  pillowMR.rotation.x = 0.15;
  masterGroup.add(pillowMR);

  // Dual Bedside Nightstands with Glowing Lamps
  const nightstandOffsets = [-4.70, -2.50];
  nightstandOffsets.forEach((nx) => {
    const ns = new THREE.Mesh(
      new THREE.BoxGeometry(0.42, 0.45, 0.40),
      materials.darkWood
    );
    ns.position.set(nx, floorY + 0.225, -2.85);
    ns.castShadow = true;
    masterGroup.add(ns);

    // Bedside Lamp Base
    const lampBase = new THREE.Mesh(
      new THREE.CylinderGeometry(0.06, 0.08, 0.15, 12),
      materials.brass
    );
    lampBase.position.set(nx, floorY + 0.45 + 0.075, -2.85);
    masterGroup.add(lampBase);

    // Bedside Lamp Shade
    const lampShade = new THREE.Mesh(
      new THREE.ConeGeometry(0.12, 0.16, 16),
      materials.fabricCream
    );
    lampShade.position.set(nx, floorY + 0.65, -2.85);
    masterGroup.add(lampShade);
  });

  // 3-Door Louvered Teak Wardrobe (2.00m x 2.20m x 0.60m)
  const wardrobe = new THREE.Mesh(
    new THREE.BoxGeometry(1.80, 2.20, 0.58),
    materials.wood
  );
  wardrobe.position.set(-3.60, floorY + 1.10, -0.65);
  wardrobe.castShadow = true;
  masterGroup.add(wardrobe);

  root.add(masterGroup);

  // ==========================================
  // 4. SECONDARY BEDROOM / STUDY (West Front: ~10.8m²)
  // ==========================================
  const bed2Group = new THREE.Group();
  bed2Group.name = 'Interior_Secondary_Bedroom';

  // Queen Platform Bed (1.50m x 2.00m)
  const bed2Base = new THREE.Mesh(
    new THREE.BoxGeometry(1.50, 0.22, 2.00),
    materials.wood
  );
  bed2Base.position.set(-3.60, floorY + 0.11, 2.10);
  bed2Base.castShadow = true;
  bed2Group.add(bed2Base);

  const bed2Mattress = new THREE.Mesh(
    new THREE.BoxGeometry(1.44, 0.20, 1.94),
    materials.fabricCream
  );
  bed2Mattress.position.set(-3.60, floorY + 0.31, 2.10);
  bed2Mattress.castShadow = true;
  bed2Group.add(bed2Mattress);

  const bed2Duvet = new THREE.Mesh(
    new THREE.BoxGeometry(1.46, 0.04, 1.10),
    materials.fabricRust
  );
  bed2Duvet.position.set(-3.60, floorY + 0.42, 1.70);
  bed2Group.add(bed2Duvet);

  const bed2Pillow = new THREE.Mesh(pillowMGeo, materials.fabricCream);
  bed2Pillow.position.set(-3.60, floorY + 0.44, 2.75);
  bed2Pillow.rotation.x = -0.15;
  bed2Group.add(bed2Pillow);

  // Study / Work Desk (1.10m x 0.55m x 0.74m)
  const desk = new THREE.Mesh(
    new THREE.BoxGeometry(1.10, 0.04, 0.55),
    materials.darkWood
  );
  desk.position.set(-4.10, floorY + 0.72, 0.70);
  desk.castShadow = true;
  bed2Group.add(desk);

  // Desk Legs
  const deskLegGeo = new THREE.BoxGeometry(0.04, 0.70, 0.04);
  const dl1 = new THREE.Mesh(deskLegGeo, materials.darkWood);
  dl1.position.set(-4.58, floorY + 0.35, 0.48);
  bed2Group.add(dl1);
  const dl2 = new THREE.Mesh(deskLegGeo, materials.darkWood);
  dl2.position.set(-3.62, floorY + 0.35, 0.48);
  bed2Group.add(dl2);

  // Laptop / Study Book on Desk
  const laptop = new THREE.Mesh(
    new THREE.BoxGeometry(0.30, 0.015, 0.22),
    materials.granite
  );
  laptop.position.set(-4.10, floorY + 0.75, 0.70);
  bed2Group.add(laptop);

  root.add(bed2Group);

  // ==========================================
  // 5. BATHROOM / WET CORE (Central West: ~5.1m²)
  // ==========================================
  const bathGroup = new THREE.Group();
  bathGroup.name = 'Interior_Bathroom_WetCore';

  // Polished Stone Vanity Counter (1.00m x 0.50m)
  const vanity = new THREE.Mesh(
    new THREE.BoxGeometry(0.90, 0.82, 0.48),
    materials.granite
  );
  vanity.position.set(-1.30, floorY + 0.41, -1.50);
  vanity.castShadow = true;
  bathGroup.add(vanity);

  // Ceramic Basin Bowl
  const basin = new THREE.Mesh(
    new THREE.CylinderGeometry(0.18, 0.14, 0.12, 16),
    materials.ceramicWhite
  );
  basin.position.set(-1.30, floorY + 0.88, -1.50);
  basin.castShadow = true;
  bathGroup.add(basin);

  // Vanity Mirror with Frame
  const mirror = new THREE.Mesh(
    new THREE.BoxGeometry(0.60, 0.80, 0.02),
    materials.glassMirror
  );
  mirror.position.set(-1.30, floorY + 1.60, -1.78);
  bathGroup.add(mirror);

  // Water Closet Toilet (WC)
  const wcBase = new THREE.Mesh(
    new THREE.BoxGeometry(0.40, 0.42, 0.55),
    materials.ceramicWhite
  );
  wcBase.position.set(-0.40, floorY + 0.21, -2.60);
  wcBase.castShadow = true;
  bathGroup.add(wcBase);

  const wcCistern = new THREE.Mesh(
    new THREE.BoxGeometry(0.40, 0.45, 0.20),
    materials.ceramicWhite
  );
  wcCistern.position.set(-0.40, floorY + 0.60, -2.85);
  bathGroup.add(wcCistern);

  // Shower Stall Drain Grid & Rain Showerhead
  const drainGrid = new THREE.Mesh(
    new THREE.BoxGeometry(0.80, 0.01, 0.80),
    materials.granite
  );
  drainGrid.position.set(-1.30, floorY + 0.005, -2.60);
  bathGroup.add(drainGrid);

  const showerArm = new THREE.Mesh(
    new THREE.CylinderGeometry(0.012, 0.012, 0.35, 8),
    materials.brass
  );
  showerArm.position.set(-1.30, floorY + 2.20, -2.90);
  showerArm.rotation.x = Math.PI / 2;
  bathGroup.add(showerArm);

  const showerHead = new THREE.Mesh(
    new THREE.CylinderGeometry(0.10, 0.10, 0.02, 16),
    materials.brass
  );
  showerHead.position.set(-1.30, floorY + 2.15, -2.75);
  bathGroup.add(showerHead);

  root.add(bathGroup);

  // ==========================================
  // 6. FRAMED TIMBER INTERNAL DOORS (3 Doors)
  // ==========================================
  const internalDoorsGroup = new THREE.Group();
  internalDoorsGroup.name = 'Interior_Doors_Assembly';

  const createInternalDoor = (x: number, z: number, rotY: number, label: string) => {
    const doorUnit = new THREE.Group();
    doorUnit.position.set(x, floorY, z);
    doorUnit.rotation.y = rotY;

    // Door Frame
    const dw = 0.85;
    const dh = 2.10;
    const frameThick = 0.08;

    const leaf = new THREE.Mesh(
      new THREE.BoxGeometry(dw - 0.08, dh - 0.04, 0.04),
      materials.wood
    );
    leaf.position.set(0, dh / 2, 0);
    leaf.castShadow = true;
    doorUnit.add(leaf);

    // Brass Lever Handle
    const handle = new THREE.Mesh(
      new THREE.BoxGeometry(0.12, 0.03, 0.05),
      materials.brass
    );
    handle.position.set(dw / 2 - 0.14, 1.00, 0.03);
    doorUnit.add(handle);

    return doorUnit;
  };

  // Master Bedroom Entry Door
  internalDoorsGroup.add(createInternalDoor(-1.80, -0.60, Math.PI / 2, 'Master Bedroom'));
  // Secondary Bedroom Entry Door
  internalDoorsGroup.add(createInternalDoor(-2.00, 0.60, Math.PI / 2, 'Secondary Bedroom'));
  // Bathroom Entry Door
  internalDoorsGroup.add(createInternalDoor(-1.00, -1.00, 0, 'Bathroom'));

  root.add(internalDoorsGroup);

  // ==========================================
  // 7. EXPOSED CEILING TIMBER JOISTS (Visible from inside)
  // ==========================================
  const ceilingJoistsGroup = new THREE.Group();
  ceilingJoistsGroup.name = 'Interior_Ceiling_Joists';

  const joistCount = 14;
  const joistGeo = new THREE.BoxGeometry(0.08, 0.12, 6.40);
  const joistY = floorY + dims.wallHeight - 0.06;

  for (let i = 0; i < joistCount; i++) {
    const jx = -4.50 + (i / (joistCount - 1)) * 9.00;
    const joist = new THREE.Mesh(joistGeo, materials.darkWood);
    joist.position.set(jx, joistY, 0);
    joist.castShadow = true;
    ceilingJoistsGroup.add(joist);
  }

  root.add(ceilingJoistsGroup);

  return root;
}

