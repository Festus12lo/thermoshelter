import * as THREE from 'three';

/**
 * Creates high-fidelity procedural PBR textures for the Emergency Shelter asset.
 * Runs completely in-browser with HTML5 Canvas, ensuring crisp 2048x2048 / 1024x1024 textures.
 */

// Helper to create a canvas
function createCanvas(width: number, height: number): { canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D } {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;
  return { canvas, ctx };
}

// Simple deterministic noise
function pseudoNoise(x: number, y: number): number {
  const n = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
  return n - Math.floor(n);
}

/**
 * Generate Corrugated Steel Roof PBR Textures
 */
export function generateCorrugatedRoofTextures(weathering = 0.2) {
  const size = 1024;
  const periods = 24; // Number of corrugation waves along width

  // 1. Albedo (Galvanized Steel with Zinc Spangles and subtle weathering)
  const { canvas: albedoCanvas, ctx: albedoCtx } = createCanvas(size, size);
  
  // Base metal gradient
  const baseGrad = albedoCtx.createLinearGradient(0, 0, size, 0);
  for (let i = 0; i <= periods; i++) {
    const t = i / periods;
    baseGrad.addColorStop(Math.max(0, t - 0.02), '#9aa2aa');
    baseGrad.addColorStop(t, '#cfd6dd');
    baseGrad.addColorStop(Math.min(1, t + 0.02), '#858d95');
  }
  albedoCtx.fillStyle = baseGrad;
  albedoCtx.fillRect(0, 0, size, size);

  // Add Galvanized Zinc Spangles (crystals)
  const imgData = albedoCtx.getImageData(0, 0, size, size);
  const data = imgData.data;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (y * size + x) * 4;
      const wave = Math.sin((x / size) * Math.PI * 2 * periods);
      
      // Spangle pattern using Voronoi-like noise
      const cellX = Math.floor(x / 16);
      const cellY = Math.floor(y / 16);
      const spangle = pseudoNoise(cellX * 3.1, cellY * 7.7) * 40 - 20;
      const grain = (pseudoNoise(x, y) - 0.5) * 15;
      
      // Shadow in corrugated valleys
      const valleyShadow = wave < -0.3 ? (wave + 0.3) * 35 : 0;
      // Dirt accumulation in valleys based on weathering
      const dirt = (wave < 0 ? Math.abs(wave) * weathering * 45 : 0) + (y / size) * weathering * 20;

      let r = data[idx] + spangle + grain + valleyShadow - dirt * 0.8;
      let g = data[idx + 1] + spangle + grain + valleyShadow - dirt * 0.9;
      let b = data[idx + 2] + spangle + grain + valleyShadow - dirt * 1.0;

      // Weathering rust spots
      if (weathering > 0.3 && pseudoNoise(x * 0.1, y * 0.1) > 0.92) {
        r += 30 * weathering;
        g -= 20 * weathering;
        b -= 30 * weathering;
      }

      data[idx] = Math.min(255, Math.max(0, r));
      data[idx + 1] = Math.min(255, Math.max(0, g));
      data[idx + 2] = Math.min(255, Math.max(0, b));
    }
  }
  albedoCtx.putImageData(imgData, 0, 0);

  // Add subtle fastener / screw lines across purlin spans
  albedoCtx.fillStyle = '#444c53';
  for (let py = 100; py < size; py += 300) {
    for (let px = 0; px < periods; px++) {
      const sx = (px + 0.5) * (size / periods);
      albedoCtx.beginPath();
      albedoCtx.arc(sx, py, 4, 0, Math.PI * 2);
      albedoCtx.fill();
      // Screw head highlight
      albedoCtx.fillStyle = '#b0b8c0';
      albedoCtx.beginPath();
      albedoCtx.arc(sx - 1, py - 1, 2, 0, Math.PI * 2);
      albedoCtx.fill();
      albedoCtx.fillStyle = '#444c53';
    }
  }

  // 2. Normal Map (Precise corrugation curvature + micro-bump)
  const { canvas: normCanvas, ctx: normCtx } = createCanvas(size, size);
  const normData = normCtx.createImageData(size, size);
  const nData = normData.data;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (y * size + x) * 4;
      const angle = (x / size) * Math.PI * 2 * periods;
      // Derivative of sin(angle) gives the slope in X
      const slopeX = Math.cos(angle) * 1.2;
      const slopeY = (pseudoNoise(x * 2, y * 2) - 0.5) * 0.1;

      // Normal vector = normalize([-slopeX, -slopeY, 1])
      const len = Math.sqrt(slopeX * slopeX + slopeY * slopeY + 1.0);
      const nx = (-slopeX / len) * 0.5 + 0.5;
      const ny = (-slopeY / len) * 0.5 + 0.5;
      const nz = (1.0 / len) * 0.5 + 0.5;

      nData[idx] = Math.floor(nx * 255);
      nData[idx + 1] = Math.floor(ny * 255);
      nData[idx + 2] = Math.floor(nz * 255);
      nData[idx + 3] = 255;
    }
  }
  normCtx.putImageData(normData, 0, 0);

  // 3. Roughness Map
  const { canvas: roughCanvas, ctx: roughCtx } = createCanvas(size, size);
  const roughData = roughCtx.createImageData(size, size);
  const rData = roughData.data;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (y * size + x) * 4;
      const wave = Math.sin((x / size) * Math.PI * 2 * periods);
      // Tops of ridges are smoother (shinier/lower roughness: ~0.35), valleys are rougher (~0.65)
      let r = 0.35 + (1 - (wave * 0.5 + 0.5)) * 0.3 + weathering * 0.25;
      r += (pseudoNoise(x * 0.5, y * 0.5) - 0.5) * 0.1;
      const val = Math.min(255, Math.max(0, Math.floor(r * 255)));

      rData[idx] = val;
      rData[idx + 1] = val;
      rData[idx + 2] = val;
      rData[idx + 3] = 255;
    }
  }
  roughCtx.putImageData(roughData, 0, 0);

  // 4. Metalness Map (Galvanized steel is high metallic ~0.92, dust reduces it)
  const { canvas: metalCanvas, ctx: metalCtx } = createCanvas(size, size);
  const metalData = metalCtx.createImageData(size, size);
  const mData = metalData.data;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (y * size + x) * 4;
      let m = 0.95 - weathering * 0.3;
      const val = Math.min(255, Math.max(0, Math.floor(m * 255)));
      mData[idx] = val;
      mData[idx + 1] = val;
      mData[idx + 2] = val;
      mData[idx + 3] = 255;
    }
  }
  metalCtx.putImageData(metalData, 0, 0);

  const albedoTexture = new THREE.CanvasTexture(albedoCanvas);
  albedoTexture.wrapS = THREE.RepeatWrapping;
  albedoTexture.wrapT = THREE.RepeatWrapping;

  const normalTexture = new THREE.CanvasTexture(normCanvas);
  normalTexture.wrapS = THREE.RepeatWrapping;
  normalTexture.wrapT = THREE.RepeatWrapping;

  const roughnessTexture = new THREE.CanvasTexture(roughCanvas);
  roughnessTexture.wrapS = THREE.RepeatWrapping;
  roughnessTexture.wrapT = THREE.RepeatWrapping;

  const metalnessTexture = new THREE.CanvasTexture(metalCanvas);
  metalnessTexture.wrapS = THREE.RepeatWrapping;
  metalnessTexture.wrapT = THREE.RepeatWrapping;

  return { albedo: albedoTexture, normal: normalTexture, roughness: roughnessTexture, metalness: metalnessTexture };
}

/**
 * Generate Modular Insulated Sandwich Wall Panel PBR Textures
 */
export function generateWallPanelTextures(baseHex = '#c8c2b7', weathering = 0.15) {
  const size = 1024;
  const { canvas: albedoCanvas, ctx: albedoCtx } = createCanvas(size, size);

  // Base neutral matte coat
  albedoCtx.fillStyle = baseHex;
  albedoCtx.fillRect(0, 0, size, size);

  // Sub-panel division lines (Modular vertical sandwich cassettes every 256px)
  const panelWidth = size / 4;

  for (let p = 0; p < 4; p++) {
    const px = p * panelWidth;

    // Panel seam shadow
    albedoCtx.fillStyle = 'rgba(0, 0, 0, 0.28)';
    albedoCtx.fillRect(px, 0, 3, size);

    // Panel seam bevel highlight
    albedoCtx.fillStyle = 'rgba(255, 255, 255, 0.15)';
    albedoCtx.fillRect(px + 3, 0, 2, size);

    // Weatherproof black gasket seal in the core gap
    albedoCtx.fillStyle = '#222629';
    albedoCtx.fillRect(px + 1, 0, 2, size);

    // Stamped structural stiffener grooves (shallow horizontal rib lines)
    for (let gy = 60; gy < size; gy += 120) {
      albedoCtx.fillStyle = 'rgba(0, 0, 0, 0.12)';
      albedoCtx.fillRect(px + 10, gy, panelWidth - 20, 2);
      albedoCtx.fillStyle = 'rgba(255, 255, 255, 0.08)';
      albedoCtx.fillRect(px + 10, gy + 2, panelWidth - 20, 1);
    }

    // Rivet / fastener points along top and bottom structural battens
    const rivetYs = [24, 48, size - 48, size - 24];
    for (const ry of rivetYs) {
      for (let rx = px + 24; rx < px + panelWidth - 10; rx += 48) {
        // Rivet base
        albedoCtx.fillStyle = '#3a3f44';
        albedoCtx.beginPath();
        albedoCtx.arc(rx, ry, 3.5, 0, Math.PI * 2);
        albedoCtx.fill();
        // Rivet highlight
        albedoCtx.fillStyle = '#e8edf2';
        albedoCtx.beginPath();
        albedoCtx.arc(rx - 1, ry - 1, 1.5, 0, Math.PI * 2);
        albedoCtx.fill();
      }
    }
  }

  // Micro-texture noise for powder-coated matte finish
  const imgData = albedoCtx.getImageData(0, 0, size, size);
  const data = imgData.data;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (y * size + x) * 4;
      const noise = (pseudoNoise(x, y) - 0.5) * 8;
      // Ambient dirt gradient near the bottom base chassis
      const baseDirt = Math.pow(y / size, 3) * weathering * 45;

      data[idx] = Math.min(255, Math.max(0, data[idx] + noise - baseDirt * 0.9));
      data[idx + 1] = Math.min(255, Math.max(0, data[idx + 1] + noise - baseDirt * 0.95));
      data[idx + 2] = Math.min(255, Math.max(0, data[idx + 2] + noise - baseDirt));
    }
  }
  albedoCtx.putImageData(imgData, 0, 0);

  // Technical label / modular panel identifier stencil
  albedoCtx.font = 'bold 12px "Courier New", monospace';
  albedoCtx.fillStyle = 'rgba(40, 45, 50, 0.45)';
  albedoCtx.fillText('MOD-SHELTER // ISO-PIR-80 // THERMAL CLASS A', 40, size - 70);
  albedoCtx.fillText('EXPEDITED DEPLOYMENT UNIT #04', 40, size - 54);

  // 2. Normal Map for Wall Panels (Bevels, seams, stiffeners, rivets)
  const { canvas: normCanvas, ctx: normCtx } = createCanvas(size, size);
  normCtx.fillStyle = '#8080ff'; // Flat normal
  normCtx.fillRect(0, 0, size, size);

  const nImgData = normCtx.getImageData(0, 0, size, size);
  const nd = nImgData.data;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (y * size + x) * 4;
      const localX = x % panelWidth;
      let nx = 0.5;
      let ny = 0.5;

      // Vertical seam bevels
      if (localX < 3) {
        nx = 0.25;
      } else if (localX < 6) {
        nx = 0.75;
      }

      // Micro orange peel noise
      const micro = (pseudoNoise(x * 3, y * 3) - 0.5) * 0.08;
      nx += micro;
      ny += micro;

      nd[idx] = Math.floor(Math.min(1, Math.max(0, nx)) * 255);
      nd[idx + 1] = Math.floor(Math.min(1, Math.max(0, ny)) * 255);
      nd[idx + 2] = 255;
      nd[idx + 3] = 255;
    }
  }
  normCtx.putImageData(nImgData, 0, 0);

  // 3. Roughness Map (Matte ~0.8, glossy rivets and dark rubber seals ~0.95)
  const { canvas: roughCanvas, ctx: roughCtx } = createCanvas(size, size);
  roughCtx.fillStyle = '#c0c0c0'; // ~0.75 roughness
  roughCtx.fillRect(0, 0, size, size);

  // 4. Metallic Map (Powder coat is non-metallic ~0.05, exposed rivets ~0.9)
  const { canvas: metalCanvas, ctx: metalCtx } = createCanvas(size, size);
  metalCtx.fillStyle = '#101010'; // non-metal
  metalCtx.fillRect(0, 0, size, size);

  const albedoTexture = new THREE.CanvasTexture(albedoCanvas);
  const normalTexture = new THREE.CanvasTexture(normCanvas);
  const roughnessTexture = new THREE.CanvasTexture(roughCanvas);
  const metalnessTexture = new THREE.CanvasTexture(metalCanvas);

  return { albedo: albedoTexture, normal: normalTexture, roughness: roughnessTexture, metalness: metalnessTexture };
}

/**
 * Utilitarian Steel Door Texture (Industrial slam latch, hazard markings, kickplate)
 */
export function generateDoorTexture() {
  const size = 1024;
  const { canvas, ctx } = createCanvas(size, size);

  // Heavy steel door base
  ctx.fillStyle = '#4a5259';
  ctx.fillRect(0, 0, size, size);

  // Perimeter steel frame bevel
  ctx.lineWidth = 16;
  ctx.strokeStyle = '#32373c';
  ctx.strokeRect(8, 8, size - 16, size - 16);

  // Inner perimeter rubber weather-seal
  ctx.lineWidth = 6;
  ctx.strokeStyle = '#181b1d';
  ctx.strokeRect(20, 20, size - 40, size - 40);

  // Lower diamond-plate steel kick plate
  ctx.fillStyle = '#3a4046';
  ctx.fillRect(24, size - 260, size - 48, 230);
  ctx.strokeStyle = '#282c30';
  ctx.lineWidth = 2;
  ctx.strokeRect(24, size - 260, size - 48, 230);

  // Diamond plate tread pattern on kickplate
  ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
  for (let dy = size - 250; dy < size - 40; dy += 20) {
    for (let dx = 40; dx < size - 40; dx += 24) {
      ctx.beginPath();
      ctx.ellipse(dx, dy, 6, 2, Math.PI / 4, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Emergency safety hazard stripe header
  const stripeH = 40;
  const stripeY = 32;
  ctx.save();
  ctx.beginPath();
  ctx.rect(32, stripeY, size - 64, stripeH);
  ctx.clip();
  ctx.fillStyle = '#e5a50a'; // Hazard Yellow
  ctx.fillRect(32, stripeY, size - 64, stripeH);

  ctx.fillStyle = '#1e2124'; // Hazard Black
  for (let sx = -50; sx < size + 50; sx += 36) {
    ctx.beginPath();
    ctx.moveTo(sx, stripeY);
    ctx.lineTo(sx + 24, stripeY);
    ctx.lineTo(sx + 24 - stripeH, stripeY + stripeH);
    ctx.lineTo(sx - stripeH, stripeY + stripeH);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();

  // Utilitarian Door Plaque / Inspection Label
  ctx.fillStyle = '#ded6c8';
  ctx.fillRect(60, 100, 260, 140);
  ctx.lineWidth = 2;
  ctx.strokeStyle = '#222';
  ctx.strokeRect(60, 100, 260, 140);

  ctx.fillStyle = '#111';
  ctx.font = 'bold 16px sans-serif';
  ctx.fillText('EMERGENCY SHELTER', 72, 130);
  ctx.font = '12px "Courier New", monospace';
  ctx.fillText('MAX CAPACITY: 4-6 PERS', 72, 155);
  ctx.fillText('PRESSURE SEAL: ACTIVE', 72, 175);
  ctx.fillText('RAPID EGRESS PUSH BAR', 72, 195);
  ctx.fillStyle = '#c5221f';
  ctx.fillRect(72, 205, 236, 20);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 11px sans-serif';
  ctx.fillText('EMERGENCY EXIT ONLY', 115, 219);

  // Heavy steel door handle / lock assembly box plate
  ctx.fillStyle = '#22262a';
  ctx.fillRect(size - 180, size * 0.45, 120, 180);
  ctx.strokeStyle = '#111315';
  ctx.lineWidth = 4;
  ctx.strokeRect(size - 180, size * 0.45, 120, 180);

  // Keyhole / Lever mount
  ctx.fillStyle = '#8f9aa3';
  ctx.beginPath();
  ctx.arc(size - 120, size * 0.45 + 50, 18, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#222';
  ctx.beginPath();
  ctx.arc(size - 120, size * 0.45 + 50, 8, 0, Math.PI * 2);
  ctx.fill();

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

/**
 * Reinforced Window Glass & Security Mesh Grid
 */
export function generateReinforcedWindowTexture() {
  const size = 512;
  const { canvas, ctx } = createCanvas(size, size);

  // Tinted impact-resistant double-pane glass background
  const grad = ctx.createLinearGradient(0, 0, size, size);
  grad.addColorStop(0, '#3a505e');
  grad.addColorStop(0.5, '#283842');
  grad.addColorStop(1, '#1b262d');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);

  // Inner embedded high-tensile steel wire mesh (cross-hatch grid)
  ctx.strokeStyle = 'rgba(220, 230, 240, 0.45)';
  ctx.lineWidth = 2;

  const step = 28;
  for (let i = 0; i < size * 2; i += step) {
    // 45 degree grid lines
    ctx.beginPath();
    ctx.moveTo(i - size, 0);
    ctx.lineTo(i, size);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i - size, size);
    ctx.stroke();
  }

  // Security perimeter frame gasket
  ctx.lineWidth = 14;
  ctx.strokeStyle = '#151719';
  ctx.strokeRect(7, 7, size - 14, size - 14);

  // Subtle glass reflection highlight
  ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(size * 0.7, 0);
  ctx.lineTo(size * 0.3, size);
  ctx.lineTo(0, size);
  ctx.closePath();
  ctx.fill();

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

/**
 * Ground Base & Compacted Gravel / Deployment Pad Texture
 */
export function generateGroundTexture() {
  const size = 1024;
  const { canvas, ctx } = createCanvas(size, size);

  // Neutral terrain / concrete pad
  ctx.fillStyle = '#6e7379';
  ctx.fillRect(0, 0, size, size);

  const imgData = ctx.getImageData(0, 0, size, size);
  const d = imgData.data;

  for (let i = 0; i < d.length; i += 4) {
    const noise = (Math.random() - 0.5) * 35;
    d[i] = Math.min(255, Math.max(0, d[i] + noise));
    d[i + 1] = Math.min(255, Math.max(0, d[i + 1] + noise));
    d[i + 2] = Math.min(255, Math.max(0, d[i + 2] + noise));
  }
  ctx.putImageData(imgData, 0, 0);

  // Deployment markings / safety boundary lines
  ctx.strokeStyle = 'rgba(220, 180, 40, 0.4)';
  ctx.lineWidth = 8;
  ctx.setLineDash([40, 20]);
  ctx.strokeRect(120, 120, size - 240, size - 240);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(4, 4);
  return texture;
}
