import React, { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { CameraControls, Environment, ContactShadows, Sky } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
interface ThreeDViewerProps {
  orientationDeg?: number;
  [key: string]: any;
}
type CameraPreset = 'isometric' | 'top' | 'front' | 'rear' | 'left' | 'right' | 'cutaway';

// ─── Procedural Texture Generator ───────────────────────────
function createProceduralTexture(type: string, w = 256, h = 256): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = w; canvas.height = h;
  const ctx = canvas.getContext('2d')!;

  if (type === 'corrugated') {
    ctx.fillStyle = '#475569'; ctx.fillRect(0, 0, w, h);
    ctx.lineWidth = 2;
    for (let x = 0; x < w; x += 10) {
      ctx.strokeStyle = `rgba(0,0,0, ${0.1 + Math.random() * 0.2})`;
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
      ctx.strokeStyle = `rgba(255,255,255, ${0.05 + Math.random() * 0.1})`;
      ctx.beginPath(); ctx.moveTo(x + 2, 0); ctx.lineTo(x + 2, h); ctx.stroke();
    }
  } else {
    // Default sandwich panel (off-white with subtle noise)
    ctx.fillStyle = '#e2e8f0'; ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 400; i++) {
      const x = Math.random() * w; const y = Math.random() * h;
      ctx.fillStyle = `rgba(200, 200, 200, 0.3)`;
      ctx.fillRect(x, y, 1, 1);
    }
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping; tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(2, 2); tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

// ─── Rapid Deployment Blueprint Model ───────────────────────

const RapidDeploymentShelterModel: React.FC<{ cutawayMode: boolean }> = ({ cutawayMode }) => {
  const L = 6.0;  // Length
  const W = 3.0;  // Width
  const H_high = 2.80; // Front height
  const H_low = 2.40;  // Rear height
  const wallThick = 0.10; // 100mm
  const floorThick = 0.12; // 120mm

  const panelTex = useMemo(() => createProceduralTexture('panel'), []);
  const roofTex = useMemo(() => createProceduralTexture('corrugated'), []);

  // Precompute shapes
  const FrontWallGeom = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(-L/2, 0); shape.lineTo(L/2, 0);
    shape.lineTo(L/2, H_high); shape.lineTo(-L/2, H_high);
    shape.closePath();

    // Door: 0.9 x 2.0 (off center to the left)
    const door = new THREE.Path();
    const dx = -0.5, dw = 0.9, dh = 2.0;
    door.moveTo(dx - dw/2, 0); door.lineTo(dx + dw/2, 0);
    door.lineTo(dx + dw/2, dh); door.lineTo(dx - dw/2, dh);
    door.closePath(); shape.holes.push(door);

    // Left Window: 0.8 x 0.8
    const win1 = new THREE.Path();
    const w1x = -2.0, ww = 0.8, wh = 0.8, wy = 1.0;
    win1.moveTo(w1x - ww/2, wy); win1.lineTo(w1x + ww/2, wy);
    win1.lineTo(w1x + ww/2, wy + wh); win1.lineTo(w1x - ww/2, wy + wh);
    win1.closePath(); shape.holes.push(win1);

    // Right Window: 0.8 x 0.8
    const win2 = new THREE.Path();
    const w2x = 1.8;
    win2.moveTo(w2x - ww/2, wy); win2.lineTo(w2x + ww/2, wy);
    win2.lineTo(w2x + ww/2, wy + wh); win2.lineTo(w2x - ww/2, wy + wh);
    win2.closePath(); shape.holes.push(win2);

    return new THREE.ExtrudeGeometry(shape, { steps: 1, depth: wallThick, bevelEnabled: false });
  }, []);

  const RearWallGeom = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(-L/2, 0); shape.lineTo(L/2, 0);
    shape.lineTo(L/2, H_low); shape.lineTo(-L/2, H_low);
    shape.closePath();
    return new THREE.ExtrudeGeometry(shape, { steps: 1, depth: wallThick, bevelEnabled: false });
  }, []);

  const SideWallGeom = useMemo(() => {
    // Trapezoid shape for left and right walls
    const shape = new THREE.Shape();
    shape.moveTo(-W/2 + wallThick, 0); shape.lineTo(W/2 - wallThick, 0);
    shape.lineTo(W/2 - wallThick, H_high); // Front is high
    shape.lineTo(-W/2 + wallThick, H_low); // Rear is low
    shape.closePath();
    return new THREE.ExtrudeGeometry(shape, { steps: 1, depth: wallThick, bevelEnabled: false });
  }, []);

  // Frame Material
  const frameMat = <meshStandardMaterial color="#334155" roughness={0.7} metalness={0.4} />;
  const panelMat = <meshStandardMaterial map={panelTex} roughness={0.9} color="#eef2f6" />;

  const groupRef = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    if (!groupRef.current) return;
    const targetY = cutawayMode ? 4 : 0;
    const targetScale = cutawayMode ? 0.01 : 1;
    groupRef.current.position.y = THREE.MathUtils.damp(groupRef.current.position.y, targetY, 4, delta);
    groupRef.current.scale.setScalar(THREE.MathUtils.damp(groupRef.current.scale.x, targetScale, 4, delta));
  });

  return (
    <group position={[0, floorThick, 0]}>
      {/* 1. Foundation: Concrete Blocks (3x4 grid) */}
      <group position={[0, -floorThick - 0.15, 0]}>
        {[-1, 0, 1].map(zIdx => 
          [-1.5, -0.5, 0.5, 1.5].map(xIdx => (
            <mesh key={`block-${xIdx}-${zIdx}`} position={[xIdx * (L/3 - 0.2), 0, zIdx * (W/2 - 0.2)]} castShadow receiveShadow>
              <boxGeometry args={[0.4, 0.3, 0.4]} />
              <meshStandardMaterial color="#64748b" roughness={0.9} />
            </mesh>
          ))
        )}
      </group>

      {/* 2. Floor Slab (120mm) */}
      <mesh position={[0, -floorThick/2, 0]} castShadow receiveShadow>
        <boxGeometry args={[L, floorThick, W]} />
        <meshStandardMaterial color="#475569" roughness={0.8} />
      </mesh>
      {/* Galvanized Frame around Floor */}
      <mesh position={[0, -floorThick/2, W/2]}><boxGeometry args={[L+0.1, floorThick, 0.1]} />{frameMat}</mesh>
      <mesh position={[0, -floorThick/2, -W/2]}><boxGeometry args={[L+0.1, floorThick, 0.1]} />{frameMat}</mesh>
      <mesh position={[L/2, -floorThick/2, 0]}><boxGeometry args={[0.1, floorThick, W+0.1]} />{frameMat}</mesh>
      <mesh position={[-L/2, -floorThick/2, 0]}><boxGeometry args={[0.1, floorThick, W+0.1]} />{frameMat}</mesh>

      {/* 3. Walls (Sandwich Panels) */}
      <group>
        {/* Front Wall (South) */}
        <group position={[0, 0, W/2 - wallThick]}>
          {cutawayMode ? (
             <group ref={groupRef}>
               <mesh geometry={FrontWallGeom} castShadow receiveShadow>{panelMat}</mesh>
             </group>
          ) : (
             <mesh geometry={FrontWallGeom} castShadow receiveShadow>{panelMat}</mesh>
          )}
        </group>
        
        {/* Rear Wall (North) */}
        <mesh position={[0, 0, -W/2]} geometry={RearWallGeom} castShadow receiveShadow>{panelMat}</mesh>
        
        {/* Left Wall (West) */}
        <mesh position={[-L/2, 0, 0]} rotation={[0, Math.PI/2, 0]} geometry={SideWallGeom} castShadow receiveShadow>{panelMat}</mesh>
        
        {/* Right Wall (East) */}
        <mesh position={[L/2 - wallThick, 0, 0]} rotation={[0, Math.PI/2, 0]} geometry={SideWallGeom} castShadow receiveShadow>{panelMat}</mesh>
      </group>

      {/* Corner Steel Frames */}
      <mesh position={[-L/2, H_high/2, W/2]}><boxGeometry args={[0.1, H_high, 0.1]} />{frameMat}</mesh>
      <mesh position={[L/2, H_high/2, W/2]}><boxGeometry args={[0.1, H_high, 0.1]} />{frameMat}</mesh>
      <mesh position={[-L/2, H_low/2, -W/2]}><boxGeometry args={[0.1, H_low, 0.1]} />{frameMat}</mesh>
      <mesh position={[L/2, H_low/2, -W/2]}><boxGeometry args={[0.1, H_low, 0.1]} />{frameMat}</mesh>

      {/* Windows & Doors (Static) */}
      <group position={[0, 0, W/2 - wallThick/2]}>
        {/* Door */}
        <mesh position={[-0.5, 1.0, 0]}><boxGeometry args={[0.9, 2.0, 0.05]} /><meshStandardMaterial color="#475569" roughness={0.5} metalness={0.2} /></mesh>
        {/* Door Frame */}
        <mesh position={[-0.5, 1.0, 0.05]}><boxGeometry args={[0.96, 2.06, 0.05]} /><meshStandardMaterial color="#1e293b" /></mesh>
        
        {/* Windows */}
        {[-2.0, 1.8].map(wx => (
          <group key={wx} position={[wx, 1.4, 0]}>
            {/* Window Frame */}
            <mesh position={[0,0,0]}><boxGeometry args={[0.86, 0.86, 0.12]} /><meshStandardMaterial color="#1e293b" /></mesh>
            {/* Glass */}
            <mesh position={[0,0,0]}><boxGeometry args={[0.8, 0.8, 0.13]} /><meshPhysicalMaterial color="#3b82f6" transparent opacity={0.4} transmission={0.9} roughness={0.1} /></mesh>
          </group>
        ))}
      </group>

      {/* 4. Shed Roof (7 degree slope) */}
      {/* 
        Roof Overhangs: 
        Front = +0.3m
        Back = -0.2m
        Sides = 0.2m 
        Total L = 6.0 + 0.4 = 6.4m
        Total W = 3.0 + 0.5 = 3.5m
        Roof pivots around the center. Slope is approx 7.6 degrees.
      */}
      <group position={[0, (H_high + H_low)/2, 0]} rotation={[Math.PI * (7.6/180), 0, 0]}>
        <mesh position={[0, 0, 0.05]} castShadow receiveShadow>
          <boxGeometry args={[6.4, 0.05, 3.5]} />
          <meshStandardMaterial map={roofTex} color="#334155" roughness={0.6} metalness={0.3} />
        </mesh>
        {/* Roof Trim */}
        <mesh position={[0, -0.02, 3.5/2]}><boxGeometry args={[6.4, 0.1, 0.05]} />{frameMat}</mesh>
        <mesh position={[0, -0.02, -3.5/2]}><boxGeometry args={[6.4, 0.1, 0.05]} />{frameMat}</mesh>
      </group>
    </group>
  );
};


// ─── Auto-Rotating Camera Controller ───────────────────────
const CinematicCameraController: React.FC<{ activePreset: CameraPreset; isInteracting: boolean }> = ({ activePreset, isInteracting }) => {
  const cameraControlsRef = useRef<CameraControls>(null);
  const idleTimer = useRef<number>(0);
  const [hasDoneEntrance, setHasDoneEntrance] = useState(false);

  useEffect(() => {
    if (!cameraControlsRef.current) return;
    const radius = 15;
    const targetY = 2.0;
    
    if (!hasDoneEntrance) {
      cameraControlsRef.current.setLookAt(radius * 1.2, radius * 1.2, radius * 1.2, 0, targetY, 0, false);
      setHasDoneEntrance(true);
    }
    
    let theta = Math.PI / 4, phi = Math.PI / 3.2;
    switch (activePreset) {
      case 'isometric': theta = Math.PI / 4; phi = Math.PI / 3.2; break;
      case 'top': theta = 0; phi = 0.05; break;
      case 'front': theta = 0; phi = Math.PI / 2 - 0.05; break;
      case 'rear': theta = Math.PI; phi = Math.PI / 2 - 0.05; break;
      case 'left': theta = -Math.PI / 2; phi = Math.PI / 2 - 0.05; break;
      case 'right': theta = Math.PI / 2; phi = Math.PI / 2 - 0.05; break;
      case 'cutaway': theta = Math.PI / 5; phi = Math.PI / 3.5; break;
    }
    
    const px = radius * Math.sin(phi) * Math.sin(theta);
    const py = radius * Math.cos(phi) + targetY;
    const pz = radius * Math.sin(phi) * Math.cos(theta);
    
    cameraControlsRef.current.setLookAt(px, py, pz, 0, targetY, 0, true);
  }, [activePreset, hasDoneEntrance]);

  useFrame((_, delta) => {
    if (!cameraControlsRef.current) return;
    if (isInteracting || activePreset !== 'isometric') {
      idleTimer.current = 0;
      return;
    }
    idleTimer.current += delta;
    if (idleTimer.current > 3.0) {
      cameraControlsRef.current.azimuthAngle -= delta * 0.05; // Slow idle pan
    }
  });

  return <CameraControls ref={cameraControlsRef} makeDefault />;
};


// ─── Main Wrapper Component ─────────────────────────────────
export const ThreeDViewer: React.FC<ThreeDViewerProps> = (props) => {
  const [activePreset, setActivePreset] = useState<CameraPreset>('isometric');
  const [isInteracting, setIsInteracting] = useState(false);
  const orientationDeg = props.orientationDeg ?? 180;

  const presets: { key: CameraPreset; label: string; icon: string }[] = [
    { key: 'isometric', label: 'Iso', icon: '\uD83E\uDDCA' },
    { key: 'top', label: 'Top', icon: '\u2B07' },
    { key: 'front', label: 'Front', icon: '\uD83C\uDFE0' },
    { key: 'rear', label: 'Rear', icon: '\uD83D\uDD19' },
    { key: 'left', label: 'Left', icon: '\u25C0' },
    { key: 'right', label: 'Right', icon: '\u25B6' },
    { key: 'cutaway', label: 'Cutaway', icon: '\u2702\uFE0F' },
  ];

  return (
    <div className="relative w-full h-full bg-[#0a0a0a] overflow-hidden">
      <div className="absolute top-4 right-4 z-10 flex gap-2">
        {presets.map(p => (
          <button key={p.key} type="button" className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${activePreset === p.key ? 'bg-cyan-500 text-white shadow-[0_0_10px_rgba(6,182,212,0.4)]' : 'bg-slate-800/80 text-slate-400 hover:bg-slate-700 hover:text-white'}`} onClick={() => setActivePreset(p.key)}>
            <span>{p.icon}</span> <span>{p.label}</span>
          </button>
        ))}
      </div>
      <div className="w-full h-full" onPointerEnter={() => setIsInteracting(true)} onPointerLeave={() => setIsInteracting(false)}>
        <Canvas shadows camera={{ position: [15, 12, 15], fov: 45 }}>
          <CinematicCameraController activePreset={activePreset} isInteracting={isInteracting} />
          <Environment preset="city" environmentIntensity={0.6} />
          <Sky sunPosition={[Math.sin((180 - orientationDeg) * Math.PI / 180) * 10, 2, Math.cos((180 - orientationDeg) * Math.PI / 180) * 10]} turbidity={0.2} rayleigh={0.3} mieCoefficient={0.005} />
          <directionalLight castShadow position={[Math.sin((180 - orientationDeg) * Math.PI / 180) * 20, 20, Math.cos((180 - orientationDeg) * Math.PI / 180) * 20]} intensity={2.0} shadow-mapSize={[2048, 2048]} />
          <ambientLight intensity={0.3} />
          {/* Ground Plane & Contact Shadows */}
          <ContactShadows resolution={2048} scale={30} blur={1.5} opacity={0.6} far={15} color="#0f172a" position={[0, -0.02, 0]} />
          <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow position={[0, -0.05, 0]}>
            <planeGeometry args={[100, 100]} />
            <shadowMaterial opacity={0.3} />
          </mesh>
          <group rotation={[0, (orientationDeg * Math.PI) / 180, 0]} onPointerDown={() => setIsInteracting(true)} onPointerUp={() => setIsInteracting(false)}>
            <RapidDeploymentShelterModel cutawayMode={activePreset === 'cutaway'} />
          </group>
          <EffectComposer>
            <Bloom luminanceThreshold={1.2} mipmapBlur intensity={0.4} />
            <Vignette eskil={false} offset={0.1} darkness={0.6} />
          </EffectComposer>
        </Canvas>
        <div className="absolute bottom-4 left-4 pointer-events-none">
          <div className="flex items-center gap-2 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-700/50 text-xs font-bold text-slate-300">
            <span style={{ transform: `rotate(${-orientationDeg}deg)` }}>↑</span><span>{orientationDeg.toFixed(0)}° Azimuth</span>
          </div>
        </div>
      </div>
    </div>
  );
};
