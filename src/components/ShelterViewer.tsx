import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import type {
  ShelterConfig,
  RenderMode,
  EnvironmentPreset,
  CameraPreset,
  Hotspot,
  ModelStats,
} from '../types';
import {
  buildEmergencyShelter,
  HOTSPOTS_DATA,
  SHELTER_DIMENSIONS,
} from '../utils/modelBuilder';
import type { BuiltShelterModel } from '../utils/modelBuilder';
import { generateGroundTexture } from '../utils/textureGenerator';

interface ShelterViewerProps {
  config: ShelterConfig;
  renderMode: RenderMode;
  environment: EnvironmentPreset;
  cameraPreset: CameraPreset;
  selectedHotspot: Hotspot | null;
  autoRotate: boolean;
  onSelectHotspot: (hotspot: Hotspot | null) => void;
  onStatsCalculated?: (stats: ModelStats) => void;
  rendererRefOut?: (renderer: THREE.WebGLRenderer | null, root: THREE.Object3D | null) => void;
}

export const ShelterViewer: React.FC<ShelterViewerProps> = ({
  config,
  renderMode,
  environment,
  cameraPreset,
  selectedHotspot,
  autoRotate,
  onSelectHotspot,
  onStatsCalculated,
  rendererRefOut,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const shelterModelRef = useRef<BuiltShelterModel | null>(null);
  const lightsGroupRef = useRef<THREE.Group | null>(null);
  const groundMeshRef = useRef<THREE.Mesh | null>(null);

  // Screen projected positions for 3D hotspots
  const [screenHotspots, setScreenHotspots] = useState<
    { hotspot: Hotspot; x: number; y: number; visible: boolean }[]
  >([]);

  // Camera animation target
  const targetCamPos = useRef<THREE.Vector3 | null>(null);
  const targetLookAt = useRef<THREE.Vector3 | null>(null);

  // 1. Initialize Scene, Camera, Renderer, Controls
  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#0d1117');
    scene.fog = new THREE.FogExp2('#0d1117', 0.025);
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
    camera.position.set(6.5, 4.2, 7.5);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      preserveDrawingBuffer: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.maxPolarAngle = Math.PI / 2 - 0.02; // Don't go below ground
    controls.minDistance = 2.0;
    controls.maxDistance = 22.0;
    controls.target.set(0, 1.4, 0);
    controlsRef.current = controls;

    // Lights group
    const lightsGroup = new THREE.Group();
    scene.add(lightsGroup);
    lightsGroupRef.current = lightsGroup;

    // Ground Deployment Pad
    const groundGeo = new THREE.PlaneGeometry(30, 30);
    const groundTex = generateGroundTexture();
    const groundMat = new THREE.MeshStandardMaterial({
      map: groundTex,
      roughness: 0.85,
      metalness: 0.1,
    });
    const groundMesh = new THREE.Mesh(groundGeo, groundMat);
    groundMesh.rotation.x = -Math.PI / 2;
    groundMesh.position.y = 0;
    groundMesh.receiveShadow = true;
    scene.add(groundMesh);
    groundMeshRef.current = groundMesh;

    // Build Shelter 3D Model
    const shelter = buildEmergencyShelter(config);
    scene.add(shelter.root);
    shelterModelRef.current = shelter;

    if (rendererRefOut) {
      rendererRefOut(renderer, shelter.root);
    }

    // Calculate Model Stats
    let triCount = 0;
    let vertCount = 0;
    let matCount = 0;
    const mats = new Set<string>();

    shelter.root.traverse((obj) => {
      if ((obj as THREE.Mesh).isMesh) {
        const m = obj as THREE.Mesh;
        if (m.geometry) {
          const index = m.geometry.getIndex();
          if (index) {
            triCount += index.count / 3;
          } else if (m.geometry.attributes.position) {
            triCount += m.geometry.attributes.position.count / 3;
          }
          if (m.geometry.attributes.position) {
            vertCount += m.geometry.attributes.position.count;
          }
        }
        if (m.material) {
          if (Array.isArray(m.material)) {
            m.material.forEach((mat) => mats.add(mat.uuid));
          } else {
            mats.add(m.material.uuid);
          }
        }
      }
    });
    matCount = mats.size;

    if (onStatsCalculated) {
      onStatsCalculated({
        triangles: Math.round(triCount),
        vertices: Math.round(vertCount),
        materials: matCount,
        drawCalls: 18,
        dimensions: {
          length: SHELTER_DIMENSIONS.length,
          width: SHELTER_DIMENSIONS.width,
          heightFront: SHELTER_DIMENSIONS.heightFront,
          heightBack: SHELTER_DIMENSIONS.heightBack,
          floorArea: SHELTER_DIMENSIONS.floorArea,
        },
      });
    }

    // Resize Handler
    const handleResize = () => {
      if (!containerRef.current || !cameraRef.current || !rendererRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    // Animation Render Loop
    let animationFrameId: number;
    const tempVec = new THREE.Vector3();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      // Camera lerping to target preset
      if (targetCamPos.current && targetLookAt.current && cameraRef.current && controlsRef.current) {
        cameraRef.current.position.lerp(targetCamPos.current, 0.05);
        controlsRef.current.target.lerp(targetLookAt.current, 0.05);

        if (cameraRef.current.position.distanceTo(targetCamPos.current) < 0.05) {
          targetCamPos.current = null;
          targetLookAt.current = null;
        }
      }

      // Auto-rotation
      if (autoRotate && controlsRef.current && !targetCamPos.current) {
        controlsRef.current.autoRotate = true;
        controlsRef.current.autoRotateSpeed = 1.2;
      } else if (controlsRef.current) {
        controlsRef.current.autoRotate = false;
      }

      controlsRef.current?.update();

      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);

        // Project Hotspots to 2D screen coordinates
        if (config.showHotspots) {
          const currentCam = cameraRef.current;
          const w = container.clientWidth;
          const h = container.clientHeight;

          const updatedHotspots = HOTSPOTS_DATA.map((hp) => {
            tempVec.set(...hp.position);
            tempVec.project(currentCam);

            // Behind camera check
            const isBehind = tempVec.z > 1;
            const x = (tempVec.x * 0.5 + 0.5) * w;
            const y = (-(tempVec.y * 0.5) + 0.5) * h;

            return {
              hotspot: hp,
              x,
              y,
              visible: !isBehind && x >= 0 && x <= w && y >= 0 && y <= h,
            };
          });

          setScreenHotspots(updatedHotspots);
        } else {
          setScreenHotspots([]);
        }
      }
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      if (rendererRef.current?.domElement && container.contains(rendererRef.current.domElement)) {
        container.removeChild(rendererRef.current.domElement);
      }
      shelter.dispose();
      renderer.dispose();
    };
  }, []);

  // 2. Update Model Config
  useEffect(() => {
    if (shelterModelRef.current) {
      shelterModelRef.current.updateConfig(config);
    }
  }, [config]);

  // 3. Environment & Lighting Presets
  const updateEnvironmentLighting = useCallback(() => {
    const scene = sceneRef.current;
    const lightsGroup = lightsGroupRef.current;
    const ground = groundMeshRef.current;
    if (!scene || !lightsGroup) return;

    // Clear previous lights
    while (lightsGroup.children.length > 0) {
      lightsGroup.remove(lightsGroup.children[0]);
    }

    switch (environment) {
      case 'day': {
        scene.background = new THREE.Color('#87a0b8');
        scene.fog = new THREE.FogExp2('#87a0b8', 0.015);
        if (ground) (ground.material as THREE.MeshStandardMaterial).color.set('#6a737d');

        const hemiLight = new THREE.HemisphereLight('#cbe0f5', '#495244', 0.8);
        lightsGroup.add(hemiLight);

        const sun = new THREE.DirectionalLight('#fff9e6', 2.8);
        sun.position.set(8, 12, 6);
        sun.castShadow = true;
        sun.shadow.mapSize.width = 2048;
        sun.shadow.mapSize.height = 2048;
        sun.shadow.camera.near = 0.5;
        sun.shadow.camera.far = 35;
        sun.shadow.camera.left = -6;
        sun.shadow.camera.right = 6;
        sun.shadow.camera.top = 6;
        sun.shadow.camera.bottom = -6;
        sun.shadow.bias = -0.0004;
        lightsGroup.add(sun);

        const fill = new THREE.DirectionalLight('#89a8c7', 0.6);
        fill.position.set(-6, 4, -6);
        lightsGroup.add(fill);
        break;
      }
      case 'golden': {
        scene.background = new THREE.Color('#382823');
        scene.fog = new THREE.FogExp2('#382823', 0.02);
        if (ground) (ground.material as THREE.MeshStandardMaterial).color.set('#523d34');

        const hemiLight = new THREE.HemisphereLight('#ffab73', '#241b17', 0.6);
        lightsGroup.add(hemiLight);

        const sun = new THREE.DirectionalLight('#ff933b', 3.6);
        sun.position.set(12, 3.5, 7);
        sun.castShadow = true;
        sun.shadow.mapSize.width = 2048;
        sun.shadow.mapSize.height = 2048;
        sun.shadow.bias = -0.0004;
        lightsGroup.add(sun);

        const rim = new THREE.DirectionalLight('#a3c5e8', 0.8);
        rim.position.set(-8, 5, -8);
        lightsGroup.add(rim);
        break;
      }
      case 'night': {
        scene.background = new THREE.Color('#080c12');
        scene.fog = new THREE.FogExp2('#080c12', 0.035);
        if (ground) (ground.material as THREE.MeshStandardMaterial).color.set('#1a2029');

        const hemiLight = new THREE.HemisphereLight('#152336', '#05070a', 0.35);
        lightsGroup.add(hemiLight);

        const moon = new THREE.DirectionalLight('#486b96', 0.6);
        moon.position.set(-8, 10, -6);
        moon.castShadow = true;
        lightsGroup.add(moon);

        // Emergency floodlight tripod near corner
        const flood = new THREE.SpotLight('#fff0d4', 6.0, 14, Math.PI / 4, 0.4);
        flood.position.set(4.5, 3.5, 4.5);
        flood.target.position.set(0, 1.2, 0);
        flood.castShadow = true;
        lightsGroup.add(flood);
        lightsGroup.add(flood.target);
        break;
      }
      case 'overcast': {
        scene.background = new THREE.Color('#434950');
        scene.fog = new THREE.FogExp2('#434950', 0.022);
        if (ground) (ground.material as THREE.MeshStandardMaterial).color.set('#3a3f45');

        const hemiLight = new THREE.HemisphereLight('#88949f', '#2a2f33', 1.2);
        lightsGroup.add(hemiLight);

        const main = new THREE.DirectionalLight('#dfe5eb', 1.4);
        main.position.set(3, 10, 3);
        main.castShadow = true;
        main.shadow.bias = -0.0005;
        lightsGroup.add(main);
        break;
      }
      case 'desert': {
        scene.background = new THREE.Color('#a8947c');
        scene.fog = new THREE.FogExp2('#a8947c', 0.018);
        if (ground) (ground.material as THREE.MeshStandardMaterial).color.set('#8c775e');

        const hemiLight = new THREE.HemisphereLight('#ffeedb', '#6b543d', 1.0);
        lightsGroup.add(hemiLight);

        const sun = new THREE.DirectionalLight('#fff0cf', 3.8);
        sun.position.set(6, 14, 5);
        sun.castShadow = true;
        sun.shadow.mapSize.width = 2048;
        sun.shadow.mapSize.height = 2048;
        lightsGroup.add(sun);
        break;
      }
      case 'arctic': {
        scene.background = new THREE.Color('#c5d4e2');
        scene.fog = new THREE.FogExp2('#c5d4e2', 0.025);
        if (ground) (ground.material as THREE.MeshStandardMaterial).color.set('#b8c9da');

        const hemiLight = new THREE.HemisphereLight('#e4f0fa', '#8ca1b5', 1.4);
        lightsGroup.add(hemiLight);

        const sun = new THREE.DirectionalLight('#f0f7ff', 2.6);
        sun.position.set(7, 8, 8);
        sun.castShadow = true;
        lightsGroup.add(sun);
        break;
      }
    }
  }, [environment]);

  useEffect(() => {
    updateEnvironmentLighting();
  }, [updateEnvironmentLighting]);

  // 4. Render Mode / Texture Channel Inspection
  useEffect(() => {
    const shelter = shelterModelRef.current;
    if (!shelter) return;

    shelter.root.traverse((obj) => {
      if ((obj as THREE.Mesh).isMesh) {
        const mesh = obj as THREE.Mesh;
        const origMat = mesh.material;

        if (renderMode === 'wireframe') {
          if (Array.isArray(origMat)) {
            origMat.forEach((m) => {
              (m as THREE.MeshStandardMaterial).wireframe = true;
            });
          } else if (origMat) {
            (origMat as THREE.MeshStandardMaterial).wireframe = true;
          }
        } else {
          if (Array.isArray(origMat)) {
            origMat.forEach((m) => {
              (m as THREE.MeshStandardMaterial).wireframe = false;
            });
          } else if (origMat) {
            (origMat as THREE.MeshStandardMaterial).wireframe = false;
          }
        }

        // Custom channel view simulations
        if (origMat && (origMat as THREE.MeshStandardMaterial).isMeshStandardMaterial) {
          const stdMat = origMat as THREE.MeshStandardMaterial;

          if (renderMode === 'albedo') {
            stdMat.roughness = 1.0;
            stdMat.metalness = 0.0;
          } else if (renderMode === 'roughness') {
            stdMat.roughness = 0.5;
            stdMat.metalness = 0.0;
          } else if (renderMode === 'metallic') {
            stdMat.roughness = 0.1;
            stdMat.metalness = 1.0;
          } else if (renderMode === 'xray') {
            stdMat.transparent = true;
            stdMat.opacity = 0.35;
            stdMat.depthWrite = false;
          } else {
            // Restore default lit state
            stdMat.transparent = false;
            stdMat.opacity = 1.0;
            stdMat.depthWrite = true;
            if (mesh.name === 'Roof_Mesh') {
              stdMat.roughness = 0.45;
              stdMat.metalness = 0.9;
            } else if (mesh.name.includes('Wall')) {
              stdMat.roughness = 0.8;
              stdMat.metalness = 0.1;
            }
          }
        }
      }
    });
  }, [renderMode]);

  // 5. Camera Presets
  const applyCameraPreset = useCallback((preset: CameraPreset) => {
    let targetPos: [number, number, number] = [6.5, 4.2, 7.5];
    let lookAt: [number, number, number] = [0, 1.4, 0];

    switch (preset) {
      case 'hero': // 3/4 Isometric game asset view
        targetPos = [5.5, 3.8, 6.0];
        lookAt = [0, 1.3, 0];
        break;
      case 'front': // Front elevation (Door & window)
        targetPos = [0, 1.8, 6.2];
        lookAt = [0, 1.4, 0];
        break;
      case 'side': // Side profile (Shed roof slope)
        targetPos = [-6.4, 2.2, 0];
        lookAt = [0, 1.4, 0];
        break;
      case 'roof': // Top-down corrugated steel view
        targetPos = [0, 8.2, 0.5];
        lookAt = [0, 1.4, 0];
        break;
      case 'door': // Close-up on utilitarian metal door
        targetPos = [1.8, 1.5, 3.2];
        lookAt = [1.3, 1.2, 1.2];
        break;
      case 'window': // Close-up on reinforced window
        targetPos = [-1.2, 1.8, 2.6];
        lookAt = [-1.2, 1.6, 1.2];
        break;
      case 'interior': // Interior view
        targetPos = [0, 1.4, 0.2];
        lookAt = [-1.2, 1.2, -0.6];
        break;
      case 'ortho': // Top angle overview
        targetPos = [7.5, 7.5, 7.5];
        lookAt = [0, 1.0, 0];
        break;
    }

    targetCamPos.current = new THREE.Vector3(...targetPos);
    targetLookAt.current = new THREE.Vector3(...lookAt);
  }, []);

  useEffect(() => {
    applyCameraPreset(cameraPreset);
  }, [cameraPreset, applyCameraPreset]);

  // When hotspot is clicked
  useEffect(() => {
    if (selectedHotspot) {
      targetCamPos.current = new THREE.Vector3(...selectedHotspot.cameraPosition);
      targetLookAt.current = new THREE.Vector3(...selectedHotspot.cameraTarget);
    }
  }, [selectedHotspot]);

  return (
    <div className="relative w-full h-full select-none overflow-hidden" id="shelter-3d-viewport">
      {/* Three.js Container */}
      <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* 3D Hotspot Screen Pins */}
      {config.showHotspots &&
        screenHotspots.map(({ hotspot, x, y, visible }) => {
          if (!visible) return null;
          const isSelected = selectedHotspot?.id === hotspot.id;

          return (
            <div
              key={hotspot.id}
              className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-auto z-10 transition-transform duration-150"
              style={{ left: `${x}px`, top: `${y}px` }}
            >
              <button
                type="button"
                id={`hotspot-btn-${hotspot.id}`}
                onClick={() => onSelectHotspot(isSelected ? null : hotspot)}
                className={`group flex items-center gap-1.5 px-2.5 py-1 rounded-full backdrop-blur-md shadow-lg transition-all ${
                  isSelected
                    ? 'bg-amber-500 text-slate-950 font-semibold ring-2 ring-amber-300 ring-offset-2 ring-offset-slate-900 scale-110'
                    : 'bg-slate-900/85 text-slate-200 hover:bg-slate-800 hover:text-white border border-slate-700/80 hover:border-slate-500'
                }`}
              >
                <span
                  className={`w-2.5 h-2.5 rounded-full animate-pulse ${
                    isSelected ? 'bg-slate-950' : 'bg-amber-400'
                  }`}
                />
                <span className="text-xs tracking-tight whitespace-nowrap">{hotspot.title}</span>
              </button>
            </div>
          );
        })}
    </div>
  );
};
