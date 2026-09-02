// @ts-nocheck
import * as THREE from 'three';

/**
 * Generates photorealistic, high-resolution procedural textures
 * for architectural visualization without relying on external network assets.
 */

// Rammed Earth wall texture with subtle geological sedimentary strata
export function createConcreteTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#e2e8f0';
  ctx.fillRect(0, 0, 1024, 1024);

  const imgData = ctx.getImageData(0, 0, 1024, 1024);
  const data = imgData.data;
  for (let i = 0; i < data.length; i += 4) {
    const noise = (Math.random() - 0.5) * 35; // increased for ultra-realism
    data[i] = Math.min(255, Math.max(0, data[i] + noise));
    data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise));
    data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise));
  }
  ctx.putImageData(imgData, 0, 0);

  // Add subtle plaster streaks
  ctx.strokeStyle = 'rgba(255,255,255,0.05)';
  ctx.lineWidth = 4;
  for (let i=0; i<100; i++) {
    ctx.beginPath();
    ctx.moveTo(Math.random()*1024, Math.random()*1024);
    ctx.lineTo(Math.random()*1024, Math.random()*1024);
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(4, 4);
  return texture;
}

export function createRammedEarthTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d')!;

  // Base earth sand warm neutral
  ctx.fillStyle = '#d4be9f';
  ctx.fillRect(0, 0, 1024, 1024);

  // Stratification bands
  const bands = 36;
  const bandHeight = 1024 / bands;

  const earthPalette = [
    '#cfb594', '#d9c2a7', '#c9ad88', '#decbbb', '#c4a67f',
    '#d6bfa3', '#caa984', '#e2d0be', '#c2a17b', '#d0b798'
  ];

  for (let i = 0; i < bands; i++) {
    const y = i * bandHeight;
    const color = earthPalette[i % earthPalette.length];
    ctx.fillStyle = color;
    
    ctx.beginPath();
    ctx.moveTo(0, y);
    for (let x = 0; x <= 1024; x += 64) {
      const wave = Math.sin((x + i * 40) * 0.015) * 4 + (Math.random() - 0.5) * 2;
      ctx.lineTo(x, y + wave);
    }
    ctx.lineTo(1024, y + bandHeight + 3);
    ctx.lineTo(0, y + bandHeight + 3);
    ctx.closePath();
    ctx.fill();

    if (i % 3 === 0) {
      ctx.strokeStyle = 'rgba(140, 110, 80, 0.18)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(0, y + bandHeight);
      ctx.lineTo(1024, y + bandHeight);
      ctx.stroke();
    }
  }

  const imgData = ctx.getImageData(0, 0, 1024, 1024);
  const data = imgData.data;
  for (let i = 0; i < data.length; i += 4) {
    const noise = (Math.random() - 0.5) * 45; // increased for ultra-realism
    data[i] = Math.min(255, Math.max(0, data[i] + noise));
    data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise));
    data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise));
  }
  ctx.putImageData(imgData, 0, 0);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(3, 2);
  return texture;
}

// Dark Grey Slate / Insulated Passive Roof Tile Texture
export function createRoofSlateTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#2d3339';
  ctx.fillRect(0, 0, 1024, 1024);

  const rows = 24;
  const cols = 12;
  const rh = 1024 / rows;
  const cw = 1024 / cols;

  for (let r = 0; r < rows; r++) {
    const y = r * rh;
    const xOffset = (r % 2) * (cw / 2);

    for (let c = -1; c <= cols + 1; c++) {
      const x = c * cw + xOffset;
      const slateVar = Math.floor(Math.random() * 18) - 9;
      const red = Math.min(255, Math.max(0, 45 + slateVar));
      const green = Math.min(255, Math.max(0, 51 + slateVar));
      const blue = Math.min(255, Math.max(0, 58 + slateVar));

      ctx.fillStyle = `rgb(${red}, ${green}, ${blue})`;
      ctx.fillRect(x + 1, y + 1, cw - 2, rh - 2);

      ctx.fillStyle = 'rgba(15, 18, 22, 0.4)';
      ctx.fillRect(x, y + rh - 3, cw, 3);

      ctx.fillStyle = 'rgba(140, 155, 170, 0.15)';
      ctx.fillRect(x + 1, y + 1, cw - 2, 1);
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(2, 2);
  return texture;
}

// Dressed Stone Foundation Plinth Texture
export function createPlinthStoneTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#8c867a';
  ctx.fillRect(0, 0, 512, 256);

  const rows = 4;
  const cols = 6;
  const rh = 256 / rows;
  const cw = 512 / cols;

  for (let r = 0; r < rows; r++) {
    const y = r * rh;
    const offset = (r % 2) * (cw / 2);
    for (let c = -1; c <= cols + 1; c++) {
      const x = c * cw + offset;
      const tone = Math.floor(Math.random() * 16) - 8;
      ctx.fillStyle = `rgb(${140 + tone}, ${134 + tone}, ${122 + tone})`;
      ctx.fillRect(x + 1, y + 1, cw - 2, rh - 2);

      ctx.strokeStyle = '#5a544a';
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, cw, rh);
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(4, 1);
  return texture;
}

// Natural Teak / Hardwood Texture for Doors and Trims
export function createWoodTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#5c3a21';
  ctx.fillRect(0, 0, 512, 512);

  for (let x = 0; x < 512; x += 3) {
    const darkness = Math.random() * 0.25;
    ctx.strokeStyle = `rgba(40, 22, 10, ${darkness})`;
    ctx.lineWidth = 1 + Math.random() * 2;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.bezierCurveTo(
      x + (Math.random() - 0.5) * 8, 170,
      x + (Math.random() - 0.5) * 8, 340,
      x, 512
    );
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

// Interior Earth Terracotta Floor Tile Texture
export function createFloorTileTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#ab684a';
  ctx.fillRect(0, 0, 512, 512);

  const tiles = 8;
  const sz = 512 / tiles;
  for (let r = 0; r < tiles; r++) {
    for (let c = 0; c < tiles; c++) {
      const v = (Math.random() - 0.5) * 14;
      ctx.fillStyle = `rgb(${171 + v}, ${104 + v}, ${74 + v})`;
      ctx.fillRect(c * sz + 1, r * sz + 1, sz - 2, sz - 2);

      ctx.strokeStyle = 'rgba(70, 30, 15, 0.4)';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(c * sz, r * sz, sz, sz);
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(5, 4);
  return texture;
}

// Polished Kota Stone / Kitchen Granite Countertop Texture
export function createGraniteTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#1c2421';
  ctx.fillRect(0, 0, 512, 512);

  const imgData = ctx.getImageData(0, 0, 512, 512);
  const d = imgData.data;
  for (let i = 0; i < d.length; i += 4) {
    const speckle = Math.random();
    if (speckle > 0.85) {
      // Quartz/mica white flake
      d[i] = 180 + Math.random() * 60;
      d[i + 1] = 190 + Math.random() * 50;
      d[i + 2] = 180 + Math.random() * 50;
    } else if (speckle > 0.6) {
      // Deep green/slate mineral
      d[i] = 30 + Math.random() * 20;
      d[i + 1] = 50 + Math.random() * 30;
      d[i + 2] = 45 + Math.random() * 25;
    } else {
      // Dark base
      const v = Math.random() * 25;
      d[i] = 20 + v;
      d[i + 1] = 28 + v;
      d[i + 2] = 26 + v;
    }
  }
  ctx.putImageData(imgData, 0, 0);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(2, 2);
  return texture;
}

// Natural Linen / Cotton Bedding & Cushion Fabric Texture
export function createFabricTexture(baseColor = '#f5f0eb'): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = baseColor;
  ctx.fillRect(0, 0, 256, 256);

  // Weave grid
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.06)';
  ctx.lineWidth = 1;
  for (let i = 0; i < 256; i += 4) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i, 256);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, i);
    ctx.lineTo(256, i);
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(4, 4);
  return texture;
}

// Woven Cane / Rattan Texture for Furniture
export function createWovenCaneTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#d9b982';
  ctx.fillRect(0, 0, 256, 256);

  const cellSize = 16;
  ctx.strokeStyle = '#a6804a';
  ctx.lineWidth = 2;

  for (let x = 0; x < 256; x += cellSize) {
    for (let y = 0; y < 256; y += cellSize) {
      ctx.strokeRect(x, y, cellSize, cellSize);
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + cellSize, y + cellSize);
      ctx.stroke();
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(4, 4);
  return texture;
}

// Dynamic Cloud Shadow Alpha Texture (Soft Organic Cloud Patches)
export function createCloudShadowTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Transparent base
  ctx.fillStyle = 'rgba(0, 0, 0, 0)';
  ctx.fillRect(0, 0, 512, 512);

  // Generate soft blurred overlapping cumulus cloud blobs
  const cloudCenters = [
    { x: 120, y: 140, r: 90, alpha: 0.65 },
    { x: 200, y: 160, r: 120, alpha: 0.8 },
    { x: 270, y: 130, r: 100, alpha: 0.7 },
    { x: 380, y: 340, r: 110, alpha: 0.75 },
    { x: 440, y: 380, r: 85, alpha: 0.6 },
    { x: 160, y: 400, r: 95, alpha: 0.65 },
    { x: 220, y: 370, r: 115, alpha: 0.75 },
    { x: 340, y: 180, r: 80, alpha: 0.5 },
  ];

  cloudCenters.forEach((c) => {
    const grad = ctx.createRadialGradient(c.x, c.y, c.r * 0.1, c.x, c.y, c.r);
    grad.addColorStop(0, `rgba(10, 15, 20, ${c.alpha})`);
    grad.addColorStop(0.5, `rgba(15, 20, 25, ${c.alpha * 0.6})`);
    grad.addColorStop(1, 'rgba(20, 25, 30, 0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2);
    ctx.fill();
  });

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(2, 2);
  return texture;
}

// Indian Jute Rug Texture
export function createJuteRugTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#cbb28b';
  ctx.fillRect(0, 0, 512, 512);

  // Concentric woven bands
  ctx.strokeStyle = '#9e8156';
  ctx.lineWidth = 4;
  for (let r = 20; r < 250; r += 16) {
    ctx.beginPath();
    ctx.arc(256, 256, r, 0, Math.PI * 2);
    ctx.stroke();
  }

  const tex = new THREE.CanvasTexture(canvas);
  return tex;
}


