// @ts-nocheck
import React, { useEffect, useRef, useCallback } from 'react';
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { DuplexModel } from './DuplexModel';
import type { RenderMode, SolarSettings } from '../../types';

interface ThreeCanvasProps {
  viewPreset: 'isometric' | 'front' | 'rear' | 'left' | 'right' | 'top' | 'interior';
  renderMode: RenderMode;
  solarSettings: SolarSettings;
  layers: {
    terrace: boolean;
    upper: boolean;
    ground: boolean;
  };
  activeRoof?: any;
  activeWall?: any;
}

export const ThreeCanvas: React.FC<ThreeCanvasProps> = ({
  viewPreset,
  renderMode,
  solarSettings,
  layers,
  activeRoof,
  activeWall
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const modelRef = useRef<DuplexModel | null>(null);
  const sunLightRef = useRef<THREE.DirectionalLight | null>(null);
  const ambientLightRef = useRef<THREE.AmbientLight | null>(null);
  const hemiLightRef = useRef<THREE.HemisphereLight | null>(null);
  const sunGizmoRef = useRef<THREE.Mesh | null>(null);
  const groundMeshRef = useRef<THREE.Mesh | null>(null);
  const composerRef = useRef<EffectComposer | null>(null);
  const bloomPassRef = useRef<UnrealBloomPass | null>(null);

  const isDraggingRef = useRef(false);
  const isPanningRef = useRef(false);
  const previousMousePositionRef = useRef({ x: 0, y: 0 });
  const cameraTargetRef = useRef<THREE.Vector3>(new THREE.Vector3(0, 3.2, 0));
  const sphericalRef = useRef<{ radius: number; theta: number; phi: number }>({
    radius: 22,
    theta: Math.PI / 4,
    phi: Math.PI / 3,
  });

  const targetSphericalRef = useRef<{ radius: number; theta: number; phi: number; target: THREE.Vector3 }>({
    radius: 22,
    theta: Math.PI / 4,
    phi: Math.PI / 3,
    target: new THREE.Vector3(0, 3.2, 0),
  });

  const updateSunPosition = useCallback((settings: SolarSettings) => {
    const { timeOfDay, shadowSoftness, shadowIntensity } = settings;
    if (!sunLightRef.current || !sunGizmoRef.current) return;
    const bloom = bloomPassRef.current;

    const hourAngle = ((timeOfDay - 12) / 12) * Math.PI;
    const maxAltitudeRad = (75 * Math.PI) / 180;
    const altitude = Math.cos(hourAngle) * maxAltitudeRad;
    const azimuth = -Math.sin(hourAngle) * (Math.PI / 1.8);

    const sunDistance = 40;
    const sunY = Math.max(0.6, Math.sin(altitude) * sunDistance);
    const groundProj = Math.cos(altitude) * sunDistance;
    const sunZ = Math.cos(azimuth) * groundProj;
    const sunX = Math.sin(azimuth) * groundProj;

    sunLightRef.current.position.set(sunX, sunY, sunZ);
    sunGizmoRef.current.position.set(sunX, sunY, sunZ);

    let sunColor = timeOfDay < 8 || timeOfDay > 16 ? 0xffb366 : 0xfffcf2;
    let sunInt = 2.4 * shadowIntensity;
    let isNight = false;

    let skyBgColor = 0xf1f3f5;
    let hemiSkyColor = 0xe8f0f8;
    let hemiGroundColor = 0x8d7a65;
    let groundColor = 0xe5e7eb;
    let ambientIntensity = 0.65;
    let hemiIntensity = 0.55;
    let ambientColor = 0xffffff;
    let shadowRadius = 1.0 + shadowSoftness * 3.5;
    let fogDensity = 0.01;

    switch (settings.weather) {
      case 'clear':
        sunColor = timeOfDay < 8 || timeOfDay > 16 ? 0xffb366 : 0xfffcf2;
        sunInt = 2.4 * shadowIntensity;
        ambientIntensity = 0.5;
        shadowRadius = 1.0 + shadowSoftness * 3.5;
        skyBgColor = 0xebf3f9;
        groundColor = 0xe5e7eb;
        fogDensity = 0.01;
        break;
      case 'partlyCloudy':
        sunColor = 0xfff1dc;
        sunInt = 1.8 * shadowIntensity;
        ambientIntensity = 0.7;
        shadowRadius = 3.5 + shadowSoftness * 5.0;
        skyBgColor = 0xdde5ee;
        groundColor = 0xdfe3e8;
        fogDensity = 0.012;
        break;
      case 'overcast':
        sunColor = 0xd6e0ea;
        sunInt = 0.55 * shadowIntensity;
        ambientIntensity = 1.15;
        hemiIntensity = 0.9;
        shadowRadius = 8.5; 
        skyBgColor = 0xc5cdd4;
        groundColor = 0xcfd6dc;
        fogDensity = 0.018;
        break;
      case 'monsoon':
        sunColor = 0x93a8b8;
        sunInt = 0.65 * shadowIntensity;
        ambientIntensity = 0.95;
        hemiSkyColor = 0x6e8498;
        hemiGroundColor = 0x3d4954;
        shadowRadius = 7.0;
        skyBgColor = 0x7c8996;
        groundColor = 0x646e78;
        fogDensity = 0.024;
        break;
      case 'goldenHour':
        sunColor = 0xff8c38;
        sunInt = 2.2 * shadowIntensity;
        ambientColor = 0xffa050;
        ambientIntensity = 0.6;
        hemiSkyColor = 0xf87171;
        hemiGroundColor = 0x451a03;
        shadowRadius = 2.0 + shadowSoftness * 4.0;
        skyBgColor = 0xfbcfe8;
        groundColor = 0xdcc7b0;
        fogDensity = 0.013;
        break;
      case 'heatwave':
        sunColor = 0xfffff0;
        sunInt = 2.8 * shadowIntensity;
        ambientColor = 0xffedd5;
        ambientIntensity = 0.65;
        hemiSkyColor = 0xfef08a;
        hemiGroundColor = 0x854d0e;
        shadowRadius = 0.6;
        skyBgColor = 0xfef9c3;
        groundColor = 0xecd9be;
        fogDensity = 0.015;
        break;
      case 'night':
        fogDensity = 0.02;
        break;
    }

    if (sunY <= 0.6 || solarSettings.weather === 'night') {
      sunInt = 0; // Night
      isNight = true;
      skyBgColor = 0x050812;
      hemiSkyColor = 0x101525;
      hemiGroundColor = 0x050510;
      groundColor = 0x10141a;
      ambientIntensity = 0.05;
      hemiIntensity = 0.2;
      ambientColor = 0x405060;
    }

    sunLightRef.current.color.setHex(sunColor);
    sunLightRef.current.intensity = sunInt;
    sunLightRef.current.shadow.radius = shadowRadius;

    if (ambientLightRef.current) {
      ambientLightRef.current.color.setHex(ambientColor);
      ambientLightRef.current.intensity = ambientIntensity;
    }
    if (hemiLightRef.current) {
      hemiLightRef.current.color.setHex(hemiSkyColor);
      hemiLightRef.current.groundColor.setHex(hemiGroundColor);
      hemiLightRef.current.intensity = hemiIntensity;
    }
    if (sceneRef.current) {
      sceneRef.current.background = new THREE.Color(skyBgColor);
      if (sceneRef.current.fog instanceof THREE.FogExp2) {
        sceneRef.current.fog.color.setHex(skyBgColor);
        sceneRef.current.fog.density = fogDensity;
      }
    }
    if (groundMeshRef.current && groundMeshRef.current.material instanceof THREE.MeshStandardMaterial) {
      groundMeshRef.current.material.color.setHex(groundColor);
      groundMeshRef.current.material.needsUpdate = true;
    }

    if (bloom) {
      bloom.strength = isNight ? 0.8 : 0.15;
      bloom.threshold = isNight ? 0.4 : 0.95;
    }

    if (modelRef.current) {
      modelRef.current.rootGroup.traverse((child) => {
        if (child instanceof THREE.Mesh && child.name === 'windowGlass') {
          const mat = child.material as THREE.MeshPhysicalMaterial;
          if (isNight) {
            mat.emissive.setHex(0xffa500); // Warm amber glow
            mat.emissiveIntensity = 0.5;
          } else {
            mat.emissive.setHex(0x000000);
            mat.emissiveIntensity = 0.0;
          }
          mat.needsUpdate = true;
        }
      });
    }
  }, []);

  useEffect(() => {
    switch (viewPreset) {
      case 'front':
        targetSphericalRef.current = { radius: 20, theta: 0, phi: Math.PI / 2.05, target: new THREE.Vector3(0, 3.2, 0) }; break;
      case 'rear':
        targetSphericalRef.current = { radius: 20, theta: Math.PI, phi: Math.PI / 2.05, target: new THREE.Vector3(0, 3.2, 0) }; break;
      case 'top':
        targetSphericalRef.current = { radius: 24, theta: 0, phi: 0.05, target: new THREE.Vector3(0, 0, 0) }; break;
      case 'interior':
        targetSphericalRef.current = { radius: 5, theta: 0.2, phi: Math.PI / 2.1, target: new THREE.Vector3(0, 1.5, 0) }; break;
      case 'isometric':
      default:
        targetSphericalRef.current = { radius: 22, theta: Math.PI / 4, phi: Math.PI / 3.2, target: new THREE.Vector3(0, 3.2, 0) }; break;
    }
  }, [viewPreset]);

  useEffect(() => {
    if (modelRef.current) {
      modelRef.current.setRenderMode(renderMode);
      modelRef.current.toggleLayer('terrace', layers.terrace);
      modelRef.current.toggleLayer('upper', layers.upper);
      modelRef.current.toggleLayer('ground', layers.ground);
    }
  }, [renderMode, layers]);

  useEffect(() => {
    if (modelRef.current) {
      if (activeWall) modelRef.current.applyWallMaterial(activeWall);
      if (activeRoof) modelRef.current.applyRoofMaterial(activeRoof);
    }
  }, [activeWall, activeRoof]);

  useEffect(() => {
    updateSunPosition(solarSettings);
  }, [solarSettings, updateSunPosition]);

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf1f3f5);
    scene.fog = new THREE.FogExp2(0xf1f3f5, 0.01);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);
    camera.position.set(15, 15, 15);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const composer = new EffectComposer(renderer);
    const renderPass = new RenderPass(scene, camera);
    composer.addPass(renderPass);
    const bloomPass = new UnrealBloomPass(new THREE.Vector2(width, height), 1.5, 0.4, 0.85);
    composer.addPass(bloomPass);
    composerRef.current = composer;
    bloomPassRef.current = bloomPass;

    const ambient = new THREE.AmbientLight(0xffffff, 0.65);
    scene.add(ambient);
    ambientLightRef.current = ambient;

    const hemiLight = new THREE.HemisphereLight(0xe8f0f8, 0x8d7a65, 0.55);
    hemiLight.position.set(0, 50, 0);
    scene.add(hemiLight);
    hemiLightRef.current = hemiLight;

    const sunLight = new THREE.DirectionalLight(0xfff5ea, 2.2);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 60;
    sunLight.shadow.camera.left = -16;
    sunLight.shadow.camera.right = 16;
    sunLight.shadow.camera.top = 16;
    sunLight.shadow.camera.bottom = -16;
    sunLight.shadow.bias = -0.0003;
    scene.add(sunLight);
    sunLightRef.current = sunLight;

    const sunGeo = new THREE.SphereGeometry(0.8, 16, 16);
    const sunMat = new THREE.MeshBasicMaterial({ color: 0xffd166 });
    const sunGizmo = new THREE.Mesh(sunGeo, sunMat);
    scene.add(sunGizmo);
    sunGizmoRef.current = sunGizmo;

    const groundGeo = new THREE.PlaneGeometry(80, 80);
    const groundMat = new THREE.MeshStandardMaterial({ color: 0xe5e7eb, roughness: 0.92 });
    const groundMesh = new THREE.Mesh(groundGeo, groundMat);
    groundMesh.rotation.x = -Math.PI / 2;
    groundMesh.receiveShadow = true;
    scene.add(groundMesh);
    groundMeshRef.current = groundMesh;

    // const grid = new THREE.GridHelper(50, 50, 0x94a3b8, 0xd1d5db);
    // grid.position.y = 0.02;
    // scene.add(grid);

    const building = new DuplexModel();
    scene.add(building.rootGroup);
    modelRef.current = building;

    updateSunPosition(solarSettings);

    const handleResize = () => {
      if (!containerRef.current || !renderer || !camera) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      composerRef.current?.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);

      const current = sphericalRef.current;
      const target = targetSphericalRef.current;
      const lerpFactor = 0.08;

      current.radius += (target.radius - current.radius) * lerpFactor;
      current.theta += (target.theta - current.theta) * lerpFactor;
      current.phi += (target.phi - current.phi) * lerpFactor;

      cameraTargetRef.current.lerp(target.target, lerpFactor);

      const x = current.radius * Math.sin(current.phi) * Math.sin(current.theta);
      const y = current.radius * Math.cos(current.phi);
      const z = current.radius * Math.sin(current.phi) * Math.cos(current.theta);

      camera.position.set(
        cameraTargetRef.current.x + x,
        cameraTargetRef.current.y + y,
        cameraTargetRef.current.z + z
      );
      camera.lookAt(cameraTargetRef.current);

      if (composerRef.current) {
        composerRef.current.render();
      } else {
        renderer.render(scene, camera);
      }
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      if (composerRef.current) composerRef.current.dispose();
      renderer.dispose();
      building.cleanup();
    };
  }, [updateSunPosition]);

  const handlePointerDown = (e: React.PointerEvent) => {
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    if (e.button === 2 || e.shiftKey) {
      isPanningRef.current = true;
    } else {
      isDraggingRef.current = true;
    }
    previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    const deltaX = e.clientX - previousMousePositionRef.current.x;
    const deltaY = e.clientY - previousMousePositionRef.current.y;
    previousMousePositionRef.current = { x: e.clientX, y: e.clientY };

    if (isDraggingRef.current) {
      const speed = 0.006;
      targetSphericalRef.current.theta -= deltaX * speed;
      targetSphericalRef.current.phi = Math.max(0.05, Math.min(Math.PI / 2 - 0.02, targetSphericalRef.current.phi - deltaY * speed));
    } else if (isPanningRef.current) {
      const panSpeed = 0.015;
      const cam = cameraRef.current;
      if (cam) {
        const right = new THREE.Vector3();
        cam.getWorldDirection(right);
        right.cross(cam.up).normalize();
        targetSphericalRef.current.target.addScaledVector(right, -deltaX * panSpeed);
        targetSphericalRef.current.target.y += deltaY * panSpeed;
      }
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    try { (e.target as HTMLElement).releasePointerCapture(e.pointerId); } catch {}
    isDraggingRef.current = false;
    isPanningRef.current = false;
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomSpeed = 0.02;
    targetSphericalRef.current.radius = Math.max(2, Math.min(60, targetSphericalRef.current.radius + e.deltaY * zoomSpeed));
  };

  return (
    <div 
      ref={containerRef} 
      className="w-full h-full cursor-grab active:cursor-grabbing"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onWheel={handleWheel}
      onContextMenu={(e) => e.preventDefault()}
      style={{ touchAction: 'none' }}
    />
  );
};
