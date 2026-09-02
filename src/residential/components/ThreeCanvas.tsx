// @ts-nocheck
import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { BuildingModel, WINDOW_SPECS, DOOR_SPECS } from './BuildingModel';
import type {} from '../types';
import { THERMAL_SPECS, ENVELOPE_THERMAL_SUMMARY } from '../data/thermalSpecs';
import { createCloudShadowTexture } from '../utils/textureGenerator';
import { 
  Flame, 
  Layers, 
  Info, 
  Activity, 
  Eye, 
  ShieldCheck, 
  ChevronRight, 
  Sparkles,
  Gauge,
  Sun,
  CloudSun,
  Cloud,
  CloudRain,
  Sunset,
  Zap,
  Wind,
  Compass,
  ThermometerSun
} from 'lucide-react';
import type { MaterialOption } from './MaterialsPanel';

interface ThreeCanvasProps {
  viewPreset: ViewPreset;
  renderMode: RenderMode;
  solarSettings: SolarSettings;
  layers: InspectionLayers;
  setLayers?: React.Dispatch<React.SetStateAction<InspectionLayers>>;
  onSelectComponent?: (info: { 
    title: string; 
    desc: string; 
    metrics: string[];
    thermalData?: {
      rValueSI: number;
      rValueImperial: number;
      uValueSI: number;
      thicknessMm: number;
      conductivityK: number;
      materialsLayers: string[];
    }
  } | null) => void;
  activeRoof?: MaterialOption;
  activeWall?: MaterialOption;
}

export const ThreeCanvas: React.FC<ThreeCanvasProps> = ({
  viewPreset,
  renderMode,
  solarSettings,
  layers,
  setLayers,
  onSelectComponent,
  activeRoof,
  activeWall
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const modelRef = useRef<BuildingModel | null>(null);
  const sunLightRef = useRef<THREE.DirectionalLight | null>(null);
  const ambientLightRef = useRef<THREE.AmbientLight | null>(null);
  const hemiLightRef = useRef<THREE.HemisphereLight | null>(null);
  const sunGizmoRef = useRef<THREE.Mesh | null>(null);
  const airParticlesRef = useRef<THREE.Points | null>(null);
  const rainParticlesRef = useRef<THREE.Points | null>(null);
  const groundMeshRef = useRef<THREE.Mesh | null>(null);
  const cloudShadowMeshRef = useRef<THREE.Mesh | null>(null);
  const cloudTextureRef = useRef<THREE.CanvasTexture | null>(null);
  const composerRef = useRef<EffectComposer | null>(null);
  const bloomPassRef = useRef<UnrealBloomPass | null>(null);

  // Orbit controls state
  const isDraggingRef = useRef(false);
  const isPanningRef = useRef(false);
  const previousMousePositionRef = useRef({ x: 0, y: 0 });
  const cameraTargetRef = useRef<THREE.Vector3>(new THREE.Vector3(0, 1.8, 0));
  const sphericalRef = useRef<{ radius: number; theta: number; phi: number }>({
    radius: 18,
    theta: Math.PI / 4,
    phi: Math.PI / 3,
  });

  const [thermalUnit, setThermalUnit] = useState<ThermalUnit>('SI');
  const [activeLegendFilter, setActiveLegendFilter] = useState<string | null>(null);
  const [liveShadowMetrics, setLiveShadowMetrics] = useState<{
    altitudeDeg: number;
    azimuthDeg: number;
    wallShadowLengthM: number;
    ridgeShadowLengthM: number;
    solarIrradiance: number;
    shadingStatus: string;
    weatherLabel: string;
  }>({
    altitudeDeg: 45,
    azimuthDeg: 15,
    wallShadowLengthM: 3.0,
    ridgeShadowLengthM: 4.93,
    solarIrradiance: 850,
    shadingStatus: 'Balanced Solar Ingress',
    weatherLabel: 'Clear Sky',
  });

  // Smooth camera destination target
  const targetSphericalRef = useRef<{ radius: number; theta: number; phi: number; target: THREE.Vector3 }>({
    radius: 18,
    theta: Math.PI / 4,
    phi: Math.PI / 3,
    target: new THREE.Vector3(0, 1.8, 0),
  });

  // Calculate sun position & dynamic outside shadows from time, season & weather
  const updateSunPosition = useCallback((settings: SolarSettings) => {
    const { timeOfDay, season, weather, shadowSoftness, shadowIntensity, isLiveMode, liveLocation, liveSolarIntensity, liveTemp } = settings;
    if (!sunLightRef.current || !sunGizmoRef.current) return;
    const bloom = bloomPassRef.current;

    let altitude: number;
    let azimuth: number;

    if (isLiveMode && liveLocation) {
      const LATITUDES: Record<string, number> = {
        leh: 34.15, shimla: 31.10, jaipur: 26.91, karur: 10.96, cherrapunji: 25.27, 
        jaisalmer: 26.91, kanyakumari: 8.08, dras: 34.43, mumbai: 19.07, delhi: 28.61
      };
      const lat = LATITUDES[liveLocation] || 20;
      const latRad = (lat * Math.PI) / 180;
      const declination = 0; // Equinox approximation for neutral comparison
      const hourAngle = ((timeOfDay - 12) * 15 * Math.PI) / 180;

      altitude = Math.asin(Math.sin(latRad) * Math.sin(declination) + Math.cos(latRad) * Math.cos(declination) * Math.cos(hourAngle));
      const cosAz = (Math.sin(declination) - Math.sin(latRad) * Math.sin(altitude)) / (Math.cos(latRad) * Math.cos(altitude));
      azimuth = Math.acos(Math.max(-1, Math.min(1, cosAz)));
      if (hourAngle > 0) azimuth = 2 * Math.PI - azimuth;
      azimuth = azimuth - Math.PI; // Match +Z South
    } else {
      const hourAngle = ((timeOfDay - 12) / 12) * Math.PI;
      let peakAltitudeDeg = 75; // Summer
      if (season === 'equinox') peakAltitudeDeg = 65;
      if (season === 'winter') peakAltitudeDeg = 45;

      const maxAltitudeRad = (peakAltitudeDeg * Math.PI) / 180;
      altitude = Math.cos(hourAngle) * maxAltitudeRad;
      azimuth = -Math.sin(hourAngle) * (Math.PI / 1.8);
    }

    const sunDistance = 30;
    const sunY = Math.max(0.6, Math.sin(altitude) * sunDistance);
    const groundProj = Math.cos(altitude) * sunDistance;
    const sunZ = Math.cos(azimuth) * groundProj;
    const sunX = Math.sin(azimuth) * groundProj;

    sunLightRef.current.position.set(sunX, sunY, sunZ);
    sunGizmoRef.current.position.set(sunX, sunY, sunZ);

    const altDeg = Math.round((Math.asin(sunY / sunDistance) * 180) / Math.PI);
    const azDeg = Math.round((azimuth * 180) / Math.PI);
    const tanAlt = Math.max(0.08, Math.tan((altDeg * Math.PI) / 180));
    const wallShadow = +(3.0 / tanAlt).toFixed(2);
    const ridgeShadow = +(4.93 / tanAlt).toFixed(2);

    // Weather-Specific Outdoor Shadow & Lighting Physics
    let sunColor = 0xfff5ea;
    let sunIntensity = 2.2;
    let ambientColor = 0xffffff;
    let ambientIntensity = 0.55;
    let hemiSkyColor = 0x90b8f8;
    let hemiGroundColor = 0x8d7a65;
    let hemiIntensity = 0.55;
    let shadowRadius = Math.max(0.5, shadowSoftness * 8 + 0.5);
    let skyBgColor = 0xebf2f8;
    let fogDensity = 0.01;
    let groundRoughness = 0.92;
    let groundMetalness = 0.04;
    let groundColor = 0xe5e7eb;
    let cloudShadowOpacity = 0.0;
    let directIrradiance = 980;
    let weatherTitle = 'Clear Sky';

    if (isLiveMode && liveSolarIntensity !== undefined) {
      sunIntensity = (liveSolarIntensity / 1000) * 2.5; // Scale max 1000 W/m2 to ~2.5 intensity
      sunIntensity = Math.max(0, sunIntensity);
      if (sunY <= 0.6) sunIntensity = 0; // Night
      
      ambientIntensity = 0.4 + (sunIntensity * 0.1);
      hemiIntensity = 0.4 + (sunIntensity * 0.1);
      directIrradiance = liveSolarIntensity;
      weatherTitle = `Live Data (Temp: ${liveTemp ?? '--'}°C)`;

      if (liveSolarIntensity < 200 && sunY > 10) { // Cloudy daytime
        shadowRadius = 8; // Diffuse shadow
        skyBgColor = 0xd0d5da; // Greyish
        hemiSkyColor = 0xc0c8d0;
        cloudShadowOpacity = 0.3;
      }
    } else {
      switch (weather) {
        case 'clear':
          weatherTitle = 'Clear Sky (Crisp Outdoor Shadows)';
          directIrradiance = season === 'summer' ? 1020 : 890;
          sunColor = timeOfDay < 8 || timeOfDay > 16 ? 0xffb366 : 0xfffcf2;
          sunIntensity = 2.4 * shadowIntensity;
          ambientIntensity = 0.5;
          shadowRadius = 1.0 + shadowSoftness * 3.5;
          cloudShadowOpacity = 0.0;
          skyBgColor = 0xebf3f9;
          groundColor = 0xe5e7eb;
          groundRoughness = 0.92;
          break;
        case 'partlyCloudy':
          weatherTitle = 'Partly Cloudy (Drifting Cloud Shadows)';
          directIrradiance = 640;
          sunColor = 0xfff1dc;
          sunIntensity = 1.8 * shadowIntensity;
          ambientIntensity = 0.7;
          shadowRadius = 3.5 + shadowSoftness * 5.0;
          cloudShadowOpacity = 0.55 * shadowIntensity;
          skyBgColor = 0xdde5ee;
          groundColor = 0xdfe3e8;
          groundRoughness = 0.88;
          break;
        case 'overcast':
          weatherTitle = 'Overcast (Soft Diffuse Contact Shadows)';
          directIrradiance = 210;
          sunColor = 0xd6e0ea;
          sunIntensity = 0.55 * shadowIntensity;
          ambientIntensity = 1.15;
          hemiIntensity = 0.9;
          shadowRadius = 8.5; 
          cloudShadowOpacity = 0.25 * shadowIntensity;
          skyBgColor = 0xc5cdd4;
          fogDensity = 0.018;
          groundColor = 0xcfd6dc;
          groundRoughness = 0.96;
          break;
        case 'monsoon':
          weatherTitle = 'Monsoon Rain (Wet Reflections & Storm Shadows)';
          directIrradiance = 160;
          sunColor = 0x93a8b8;
          sunIntensity = 0.65 * shadowIntensity;
          ambientIntensity = 0.95;
          hemiSkyColor = 0x6e8498;
          hemiGroundColor = 0x3d4954;
          shadowRadius = 7.0;
          cloudShadowOpacity = 0.7 * shadowIntensity;
          skyBgColor = 0x7c8996;
          fogDensity = 0.024;
          groundColor = 0x646e78;
          groundRoughness = 0.12;
          groundMetalness = 0.42;
          break;
        case 'goldenHour':
          weatherTitle = 'Golden Hour (Elongated Amber Shadows)';
          directIrradiance = 720;
          sunColor = 0xff8c38;
          sunIntensity = 2.2 * shadowIntensity;
          ambientColor = 0xffa050;
          ambientIntensity = 0.6;
          hemiSkyColor = 0xf87171;
          hemiGroundColor = 0x451a03;
          shadowRadius = 2.0 + shadowSoftness * 4.0;
          cloudShadowOpacity = 0.35 * shadowIntensity;
          skyBgColor = 0xfbcfe8;
          fogDensity = 0.013;
          groundColor = 0xdcc7b0;
          groundRoughness = 0.82;
          groundMetalness = 0.08;
          break;
        case 'heatwave':
          weatherTitle = 'Hot Arid Heatwave (Intense Harsh Glare)';
          directIrradiance = 1120;
          sunColor = 0xfffff0;
          sunIntensity = 2.8 * shadowIntensity;
          ambientColor = 0xffedd5;
          ambientIntensity = 0.65;
          hemiSkyColor = 0xfef08a;
          hemiGroundColor = 0x854d0e;
          shadowRadius = 0.6; // Razor sharp black shadows
          cloudShadowOpacity = 0.0;
          skyBgColor = 0xfef9c3;
          fogDensity = 0.015;
          groundColor = 0xecd9be;
          groundRoughness = 0.98;
          groundMetalness = 0.02;
          break;
        case 'night':
          weatherTitle = 'Night Ops (Pitch Black Environment)';
          break;
      }
    }

    if (sunY <= 0.6 || weather === 'night') {
      sunIntensity = 0;
      skyBgColor = 0x050812;
      hemiSkyColor = 0x101525;
      hemiGroundColor = 0x050510;
      groundColor = 0x10141a;
      ambientIntensity = 0.05;
      hemiIntensity = 0.2;
      ambientColor = 0x405060;
    }

    // Apply to Directional Sun Light
    sunLightRef.current.color.setHex(sunColor);
    sunLightRef.current.intensity = sunIntensity;
    sunLightRef.current.shadow.radius = shadowRadius;
    sunLightRef.current.shadow.bias = -0.0003;

    // Apply to Ambient and Hemisphere
    if (ambientLightRef.current) {
      ambientLightRef.current.color.setHex(ambientColor);
      ambientLightRef.current.intensity = ambientIntensity;
    }
    if (hemiLightRef.current) {
      hemiLightRef.current.color.setHex(hemiSkyColor);
      hemiLightRef.current.groundColor.setHex(hemiGroundColor);
      hemiLightRef.current.intensity = hemiIntensity;
    }

    // Apply to Scene Atmosphere
    if (sceneRef.current) {
      sceneRef.current.background = new THREE.Color(skyBgColor);
      if (sceneRef.current.fog) {
        sceneRef.current.fog.color.setHex(skyBgColor);
        (sceneRef.current.fog as THREE.FogExp2).density = fogDensity;
      }
    }

    // Apply to Ground Plane
    if (groundMeshRef.current && groundMeshRef.current.material instanceof THREE.MeshStandardMaterial) {
      groundMeshRef.current.material.color.setHex(groundColor);
      groundMeshRef.current.material.roughness = groundRoughness;
      groundMeshRef.current.material.metalness = groundMetalness;
      groundMeshRef.current.material.needsUpdate = true;
    }

    // Apply Bloom Logic based on Night vs Day
    if (bloom) {
      if (sunY <= 0.6) { // Night
        bloom.strength = 0.8;
        bloom.threshold = 0.4;
      } else { // Day
        bloom.strength = 0.15;
        bloom.threshold = 0.95;
      }
    }

    // Apply to Cloud Shadow Plane
    if (cloudShadowMeshRef.current && cloudShadowMeshRef.current.material instanceof THREE.MeshBasicMaterial) {
      cloudShadowMeshRef.current.visible = cloudShadowOpacity > 0.05;
      cloudShadowMeshRef.current.material.opacity = cloudShadowOpacity;
      cloudShadowMeshRef.current.material.needsUpdate = true;
    }

    // Toggle Rain Particles
    if (rainParticlesRef.current) {
      rainParticlesRef.current.visible = weather === 'monsoon';
    }

    // Toggle Emissive Window Glass at Night
    if (modelRef.current) {
      const isNight = sunY <= 0.6 || weather === 'night';
      modelRef.current.windowsGroup.traverse((child) => {
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

    // Shading Status Analysis
    let shadingStatus = 'Balanced Solar Ingress';
    if (altDeg > 60) {
      shadingStatus = '100% South Glazing Shaded by 0.45m Eaves Overhang';
    } else if (altDeg < 48 && timeOfDay >= 10 && timeOfDay <= 15) {
      shadingStatus = 'Active Winter Sun Penetration Warming Interior Floor Mass';
    } else if (altDeg < 25) {
      shadingStatus = 'Low Angle Glare (Protected by Vertical Reveal & Lintels)';
    }

    setLiveShadowMetrics({
      altitudeDeg: altDeg,
      azimuthDeg: azDeg,
      wallShadowLengthM: wallShadow,
      ridgeShadowLengthM: ridgeShadow,
      solarIrradiance: directIrradiance,
      shadingStatus,
      weatherLabel: weatherTitle,
    });
  }, []);

  // Update Camera Target Preset
  useEffect(() => {
    switch (viewPreset) {
      case 'front': // South Elevation
        targetSphericalRef.current = {
          radius: 17,
          theta: 0,
          phi: Math.PI / 2.05,
          target: new THREE.Vector3(0, 1.8, 0),
        };
        break;
      case 'rear': // North Elevation
        targetSphericalRef.current = {
          radius: 17,
          theta: Math.PI,
          phi: Math.PI / 2.05,
          target: new THREE.Vector3(0, 1.8, 0),
        };
        break;
      case 'left': // West Elevation
        targetSphericalRef.current = {
          radius: 16,
          theta: -Math.PI / 2,
          phi: Math.PI / 2.05,
          target: new THREE.Vector3(0, 1.8, 0),
        };
        break;
      case 'right': // East Elevation
        targetSphericalRef.current = {
          radius: 16,
          theta: Math.PI / 2,
          phi: Math.PI / 2.05,
          target: new THREE.Vector3(0, 1.8, 0),
        };
        break;
      case 'top': // Roof Plan / Ortho Plan
        targetSphericalRef.current = {
          radius: 20,
          theta: 0,
          phi: 0.05,
          target: new THREE.Vector3(0, 0, 0),
        };
        break;
      case 'interior': // Eye-level Living Room
        targetSphericalRef.current = {
          radius: 4.5,
          theta: 0.2,
          phi: Math.PI / 2.1,
          target: new THREE.Vector3(0, 1.2, 0.5),
        };
        break;
      case 'isometric':
      default:
        targetSphericalRef.current = {
          radius: 18,
          theta: Math.PI / 4,
          phi: Math.PI / 3.2,
          target: new THREE.Vector3(0, 1.8, 0),
        };
        break;
    }
  }, [viewPreset]);

  // Sync Layers, Render Mode, and R-Value Heatmap
  useEffect(() => {
    if (!modelRef.current) return;
    modelRef.current.setRenderMode(renderMode);
    modelRef.current.setRValueHeatmap(layers.rValueHeatmap);
    modelRef.current.setRoofLift(layers.roofLift);
    modelRef.current.setLayerVisibility({
      roof: layers.roof,
      walls: layers.walls,
      windows: layers.windows,
      interior: layers.interior,
      foundation: layers.foundation,
      dimensions: layers.dimensions,
      thermalVectors: layers.ventilationFlow,
      rValueLabels: layers.rValueLabels,
      rValueHeatmap: layers.rValueHeatmap,
    });
    if (airParticlesRef.current) {
      airParticlesRef.current.visible = layers.ventilationFlow;
    }
  }, [renderMode, layers]);

  useEffect(() => {
    if (modelRef.current) {
      modelRef.current.applyCustomMaterials(
        activeWall?.threeMaterialId, 
        activeRoof?.threeMaterialId
      );
    }
  }, [activeWall, activeRoof]);

  // Sync Solar Settings
  useEffect(() => {
    updateSunPosition(solarSettings);
  }, [solarSettings, updateSunPosition]);

  // Initialize Three.js Scene
  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf1f3f5);
    scene.fog = new THREE.FogExp2(0xf1f3f5, 0.012);
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);
    camera.position.set(14, 12, 14);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
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

    // Lighting
    const ambient = new THREE.AmbientLight(0xffffff, 0.65);
    scene.add(ambient);
    ambientLightRef.current = ambient;

    const hemiLight = new THREE.HemisphereLight(0xe8f0f8, 0x8d7a65, 0.55);
    hemiLight.position.set(0, 50, 0);
    scene.add(hemiLight);
    hemiLightRef.current = hemiLight;

    // Directional Sun Light
    const sunLight = new THREE.DirectionalLight(0xfff5ea, 2.2);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 60;
    sunLight.shadow.camera.left = -14;
    sunLight.shadow.camera.right = 14;
    sunLight.shadow.camera.top = 14;
    sunLight.shadow.camera.bottom = -14;
    sunLight.shadow.bias = -0.0003;
    sunLight.shadow.radius = 1.5;
    scene.add(sunLight);
    sunLightRef.current = sunLight;

    // Warm Interior Ambient & Task Lighting
    const livingLight = new THREE.PointLight(0xffecd1, 1.4, 9);
    livingLight.position.set(0.5, 2.4, 1.5);
    scene.add(livingLight);

    const bed1Light = new THREE.PointLight(0xffe4cc, 1.0, 7);
    bed1Light.position.set(-3.6, 2.3, -2.0);
    scene.add(bed1Light);

    const kitchenLight = new THREE.PointLight(0xfff5ea, 1.1, 7);
    kitchenLight.position.set(2.8, 2.3, -2.2);
    scene.add(kitchenLight);

    // Sun Visual Sphere Gizmo
    const sunGeo = new THREE.SphereGeometry(0.6, 16, 16);
    const sunMat = new THREE.MeshBasicMaterial({ color: 0xffd166 });
    const sunGizmo = new THREE.Mesh(sunGeo, sunMat);
    scene.add(sunGizmo);
    sunGizmoRef.current = sunGizmo;

    // Ground Plane with Compass and 1m Grid
    const groundGeo = new THREE.PlaneGeometry(70, 70);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0xe5e7eb,
      roughness: 0.92,
      metalness: 0.04,
    });
    const groundMesh = new THREE.Mesh(groundGeo, groundMat);
    groundMesh.rotation.x = -Math.PI / 2;
    groundMesh.receiveShadow = true;
    scene.add(groundMesh);
    groundMeshRef.current = groundMesh;

    // Dynamic Cloud Shadow Overlay Mesh
    const cloudTexture = createCloudShadowTexture();
    cloudTextureRef.current = cloudTexture;
    const cloudShadowGeo = new THREE.PlaneGeometry(70, 70);
    const cloudShadowMat = new THREE.MeshBasicMaterial({
      map: cloudTexture,
      transparent: true,
      opacity: 0.0,
      blending: THREE.MultiplyBlending,
      depthWrite: false,
    });
    const cloudShadowMesh = new THREE.Mesh(cloudShadowGeo, cloudShadowMat);
    cloudShadowMesh.rotation.x = -Math.PI / 2;
    cloudShadowMesh.position.y = 0.015;
    cloudShadowMesh.visible = false;
    scene.add(cloudShadowMesh);
    cloudShadowMeshRef.current = cloudShadowMesh;

    // Architectural Grid (1.0m minor, 5.0m major)
    // const grid = new THREE.GridHelper(40, 40, 0x94a3b8, 0xd1d5db);
    // grid.position.y = 0.02;
    // scene.add(grid);

    // North Compass Arrow Indicator on Ground Plane
    const compassGroup = new THREE.Group();
    compassGroup.position.set(-8.5, 0.05, -6.0);

    const compassRingGeo = new THREE.RingGeometry(1.2, 1.35, 32);
    const compassRingMat = new THREE.MeshBasicMaterial({ color: 0x64748b, side: THREE.DoubleSide });
    const compassRing = new THREE.Mesh(compassRingGeo, compassRingMat);
    compassRing.rotation.x = -Math.PI / 2;
    compassGroup.add(compassRing);

    // North Needle (Pointing to -Z)
    const needleGeo = new THREE.ConeGeometry(0.35, 1.2, 4);
    const needleMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
    const needle = new THREE.Mesh(needleGeo, needleMat);
    needle.rotation.x = -Math.PI / 2;
    needle.position.set(0, 0.02, -0.6);
    compassGroup.add(needle);

    // South Needle (Pointing to +Z)
    const needleSouthGeo = new THREE.ConeGeometry(0.35, 1.2, 4);
    const needleSouthMat = new THREE.MeshBasicMaterial({ color: 0x94a3b8 });
    const needleSouth = new THREE.Mesh(needleSouthGeo, needleSouthMat);
    needleSouth.rotation.x = Math.PI / 2;
    needleSouth.position.set(0, 0.02, 0.6);
    compassGroup.add(needleSouth);

    scene.add(compassGroup);

    // Building Model Instance
    const building = new BuildingModel();
    scene.add(building.rootGroup);
    modelRef.current = building;

    // Cross-Ventilation Airflow Particle System
    const particleCount = 200;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleVelocities: THREE.Vector3[] = [];

    for (let i = 0; i < particleCount; i++) {
      // Spawn near West windows (-5.0, 1.5, random Z)
      particlePositions[i * 3] = -6.0 + Math.random() * 2.0;
      particlePositions[i * 3 + 1] = 1.0 + Math.random() * 1.5;
      particlePositions[i * 3 + 2] = -2.5 + Math.random() * 5.0;

      particleVelocities.push(
        new THREE.Vector3(
          0.04 + Math.random() * 0.03, // Moving West to East (+X)
          (Math.random() - 0.5) * 0.01,
          (Math.random() - 0.5) * 0.015
        )
      );
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0x38bdf8,
      size: 0.14,
      transparent: true,
      opacity: 0.85,
    });
    const airParticles = new THREE.Points(particleGeo, particleMat);
    airParticles.visible = false;
    scene.add(airParticles);
    airParticlesRef.current = airParticles;

    // Monsoon Rain Particle System
    const rainCount = 400;
    const rainGeo = new THREE.BufferGeometry();
    const rainPositions = new Float32Array(rainCount * 3);
    for (let i = 0; i < rainCount; i++) {
      rainPositions[i * 3] = (Math.random() - 0.5) * 36;
      rainPositions[i * 3 + 1] = Math.random() * 16;
      rainPositions[i * 3 + 2] = (Math.random() - 0.5) * 36;
    }
    rainGeo.setAttribute('position', new THREE.BufferAttribute(rainPositions, 3));
    const rainMat = new THREE.PointsMaterial({
      color: 0x93c5fd,
      size: 0.18,
      transparent: true,
      opacity: 0.75,
    });
    const rainParticles = new THREE.Points(rainGeo, rainMat);
    rainParticles.visible = false;
    scene.add(rainParticles);
    rainParticlesRef.current = rainParticles;

    // Initial weather sync
    updateSunPosition(solarSettings);

    // Resize Handler
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

    // Animation Render Loop
    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);

      // Smooth camera interpolation
      const current = sphericalRef.current;
      const target = targetSphericalRef.current;
      const lerpFactor = 0.08;

      current.radius += (target.radius - current.radius) * lerpFactor;
      current.theta += (target.theta - current.theta) * lerpFactor;
      current.phi += (target.phi - current.phi) * lerpFactor;

      cameraTargetRef.current.lerp(target.target, lerpFactor);

      // Spherical to Cartesian Coordinates
      const x = current.radius * Math.sin(current.phi) * Math.sin(current.theta);
      const y = current.radius * Math.cos(current.phi);
      const z = current.radius * Math.sin(current.phi) * Math.cos(current.theta);

      camera.position.set(
        cameraTargetRef.current.x + x,
        cameraTargetRef.current.y + y,
        cameraTargetRef.current.z + z
      );
      camera.lookAt(cameraTargetRef.current);

      // Animate Ventilation Air Particles
      if (airParticlesRef.current && airParticlesRef.current.visible) {
        const positions = airParticlesRef.current.geometry.attributes.position.array as Float32Array;
        for (let i = 0; i < particleCount; i++) {
          positions[i * 3] += particleVelocities[i].x;
          positions[i * 3 + 1] += particleVelocities[i].y;
          positions[i * 3 + 2] += particleVelocities[i].z;

          // Recycle particles that cross through East side (+X > 6.0)
          if (positions[i * 3] > 6.5) {
            positions[i * 3] = -6.0;
            positions[i * 3 + 1] = 1.0 + Math.random() * 1.5;
            positions[i * 3 + 2] = -2.5 + Math.random() * 5.0;
          }
        }
        airParticlesRef.current.geometry.attributes.position.needsUpdate = true;
      }

      // Animate Dynamic Cloud Shadows Drift across Ground
      if (cloudTextureRef.current && cloudShadowMeshRef.current?.visible) {
        const driftSpeed = (solarSettings.cloudDriftSpeed || 1.0) * 0.0006;
        cloudTextureRef.current.offset.x = (cloudTextureRef.current.offset.x + driftSpeed) % 1.0;
        cloudTextureRef.current.offset.y = (cloudTextureRef.current.offset.y + driftSpeed * 0.5) % 1.0;
      }

      // Animate Monsoon Rain Particles
      if (rainParticlesRef.current && rainParticlesRef.current.visible) {
        const rainPos = rainParticlesRef.current.geometry.attributes.position.array as Float32Array;
        for (let i = 0; i < rainCount; i++) {
          rainPos[i * 3 + 1] -= 0.42; // Falling down
          rainPos[i * 3] += 0.06; // Wind angle
          if (rainPos[i * 3 + 1] < 0) {
            rainPos[i * 3 + 1] = 15 + Math.random() * 3;
            rainPos[i * 3] = (Math.random() - 0.5) * 36;
            rainPos[i * 3 + 2] = (Math.random() - 0.5) * 36;
          }
        }
        rainParticlesRef.current.geometry.attributes.position.needsUpdate = true;
      }

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
    };
  }, [updateSunPosition]);

  // Pointer Interaction Handlers (Mouse & Touch)
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
      targetSphericalRef.current.phi = Math.max(
        0.05,
        Math.min(Math.PI / 2 - 0.02, targetSphericalRef.current.phi - deltaY * speed)
      );
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
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }
    isDraggingRef.current = false;
    isPanningRef.current = false;
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = e.deltaY * 0.015;
    targetSphericalRef.current.radius = Math.max(
      3.0,
      Math.min(35.0, targetSphericalRef.current.radius + zoomFactor)
    );
  };

  // Inspect Component by ID
  const selectComponentById = (componentId: string) => {
    const spec = THERMAL_SPECS[componentId];
    if (!spec) return;

    onSelectComponent?.({
      title: spec.name,
      desc: spec.description,
      metrics: [
        `Thermal Resistance: R-${spec.rValueSI.toFixed(2)} m²·K/W (${spec.rValueImperial.toFixed(1)} hr·ft²·°F/BTU)`,
        `Thermal Transmittance: U = ${spec.uValueSI.toFixed(3)} W/m²·K`,
        `Assembly Thickness: ${spec.thicknessMm} mm`,
        `Thermal Conductivity: k = ${spec.conductivityK.toFixed(3)} W/m·K`,
        `Color Spectrum: ${spec.colorHex.toUpperCase()}`
      ],
      thermalData: {
        rValueSI: spec.rValueSI,
        rValueImperial: spec.rValueImperial,
        uValueSI: spec.uValueSI,
        thicknessMm: spec.thicknessMm,
        conductivityK: spec.conductivityK,
        materialsLayers: spec.materialsLayers
      }
    });
  };

  // Raycast click for component inspection
  const handleClick = (e: React.MouseEvent) => {
    if (!containerRef.current || !cameraRef.current || !sceneRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(new THREE.Vector2(x, y), cameraRef.current);

    const intersects = raycaster.intersectObjects(sceneRef.current.children, true);
    if (intersects.length > 0) {
      const hit = intersects[0].object;
      const componentId = hit.userData?.componentId;

      if (componentId && THERMAL_SPECS[componentId]) {
        selectComponentById(componentId);
        return;
      }

      // Fallback matching by object/group name
      let parent = hit.parent;
      while (parent && !parent.name.includes('_') && parent.parent) {
        parent = parent.parent;
      }
      const hitName = parent ? parent.name : hit.name;

      if (hitName.includes('Roof')) {
        selectComponentById('roof');
      } else if (hitName.includes('Walls') || hitName.includes('Thermal')) {
        selectComponentById('walls');
      } else if (hitName.includes('Window') || hitName.includes('Glazing')) {
        selectComponentById('glazing');
      } else if (hitName.includes('Door')) {
        selectComponentById('door');
      } else if (hitName.includes('Foundation') || hitName.includes('Plinth')) {
        selectComponentById('foundation');
      } else if (hitName.includes('Interior') || hitName.includes('Partition')) {
        selectComponentById('interior');
      } else {
        onSelectComponent?.(null);
      }
    }
  };

  const isThermalActive = layers.rValueHeatmap || renderMode === 'thermal';

  return (
    <div
      ref={containerRef}
      id="thermoshelter-webgl-canvas"
      className="w-full h-full cursor-grab active:cursor-grabbing select-none relative"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onWheel={handleWheel}
      onClick={handleClick}
      onContextMenu={e => e.preventDefault()}
    >
      {/* On-Canvas Coordinate & Massing HUD Badge (Top Left) */}
      <div className="absolute top-4 left-4 pointer-events-none bg-stone-900/90 backdrop-blur-md text-stone-200 px-3.5 py-2.5 rounded-xl text-xs font-mono border border-stone-700/80 shadow-xl z-10">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-teal-400 animate-pulse"></span>
          <span className="font-semibold text-white">10.00m × 7.00m × 3.00m</span>
          <span className="text-stone-400">| 70.0 m² Gross</span>
        </div>
        <div className="text-[11px] text-stone-400 mt-1 flex items-center gap-2">
          <span>Ridge Height: 4.93m (25° Gable)</span>
          <span>•</span>
          <span>Rammed Earth: 300mm</span>
        </div>
      </div>

      {/* Real-time Outside Climate & Shadow Diagnostics HUD (Top Right) */}
      <div className="absolute top-4 right-4 pointer-events-none bg-stone-900/90 backdrop-blur-md text-stone-200 p-3 rounded-xl text-xs font-mono border border-stone-700/80 shadow-2xl z-10 max-w-xs w-full hidden md:block">
        <div className="flex items-center justify-between border-b border-stone-800 pb-2 mb-2">
          <div className="flex items-center gap-2">
            {solarSettings.weather === 'clear' && <Sun className="w-4 h-4 text-amber-400 animate-spin" style={{ animationDuration: '18s' }} />}
            {solarSettings.weather === 'partlyCloudy' && <CloudSun className="w-4 h-4 text-sky-400" />}
            {solarSettings.weather === 'overcast' && <Cloud className="w-4 h-4 text-stone-400" />}
            {solarSettings.weather === 'monsoon' && <CloudRain className="w-4 h-4 text-blue-400 animate-bounce" />}
            {solarSettings.weather === 'goldenHour' && <Sunset className="w-4 h-4 text-orange-400" />}
            {solarSettings.weather === 'heatwave' && <ThermometerSun className="w-4 h-4 text-rose-500 animate-pulse" />}
            <span className="font-bold text-white text-[11px] uppercase tracking-wider">
              {solarSettings.weather}
            </span>
          </div>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-stone-800 text-stone-300 border border-stone-700">
            {liveShadowMetrics.solarIrradiance} W/m²
          </span>
        </div>

        {/* Live Ground Shadow Length Metrics */}
        <div className="space-y-1.5 text-[11px]">
          <div className="flex items-center justify-between">
            <span className="text-stone-400">Sun Altitude / Azimuth:</span>
            <span className="text-amber-300 font-bold">
              {liveShadowMetrics.altitudeDeg}° / {liveShadowMetrics.azimuthDeg > 0 ? `+${liveShadowMetrics.azimuthDeg}°` : `${liveShadowMetrics.azimuthDeg}°`}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-stone-400">3.0m Wall Shadow Cast:</span>
            <span className="text-teal-300 font-bold">
              {liveShadowMetrics.wallShadowLengthM} m
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-stone-400">4.93m Roof Ridge Shadow:</span>
            <span className="text-cyan-300 font-bold">
              {liveShadowMetrics.ridgeShadowLengthM} m
            </span>
          </div>
          <div className="pt-1.5 border-t border-stone-800/80 text-[10px] text-stone-300 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-400 shrink-0" />
            <span className="truncate">{liveShadowMetrics.shadingStatus}</span>
          </div>
        </div>
      </div>

      {/* R-VALUE THERMAL RESISTANCE HEATMAP SPECTRUM HUD (Bottom Center / Left) */}
      {isThermalActive && (
        <div className="absolute bottom-16 left-4 z-20 pointer-events-auto bg-stone-900/95 backdrop-blur-md border border-teal-500/70 p-3.5 rounded-xl shadow-2xl text-stone-200 max-w-md w-full animate-in fade-in slide-in-from-bottom-3">
          {/* Header & Unit Switcher */}
          <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-stone-800">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-teal-400 animate-ping" />
              <Flame className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-white">
                R-Value Thermal Resistance Heatmap
              </span>
            </div>
            
            {/* SI / Imperial Units Toggle */}
            <div className="flex items-center bg-stone-950 p-0.5 rounded-lg border border-stone-800 text-[10px] font-mono">
              <button
                id="btn-unit-si"
                onClick={() => setThermalUnit('SI')}
                className={`px-2 py-0.5 rounded transition-all font-medium ${
                  thermalUnit === 'SI'
                    ? 'bg-teal-600 text-white font-bold'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                m²·K/W (SI)
              </button>
              <button
                id="btn-unit-imperial"
                onClick={() => setThermalUnit('Imperial')}
                className={`px-2 py-0.5 rounded transition-all font-medium ${
                  thermalUnit === 'Imperial'
                    ? 'bg-teal-600 text-white font-bold'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                hr·ft²·°F/BTU
              </button>
            </div>
          </div>

          {/* Continuous Thermal Color Gradient Bar */}
          <div className="mb-2">
            <div className="h-3 w-full rounded-full shadow-inner border border-stone-700 relative overflow-hidden bg-gradient-to-r from-[#ef4444] via-[#f97316] via-[#eab308] via-[#84cc16] via-[#0d9488] to-[#4f46e5]" />
            <div className="flex justify-between text-[10px] text-stone-400 mt-1 font-mono">
              <span>{thermalUnit === 'SI' ? '0.0 (Low R)' : '0.0'}</span>
              <span>{thermalUnit === 'SI' ? '1.0' : '5.7'}</span>
              <span>{thermalUnit === 'SI' ? '2.1' : '11.9'}</span>
              <span>{thermalUnit === 'SI' ? '3.0' : '17.0'}</span>
              <span>{thermalUnit === 'SI' ? '4.5+ (High R)' : '25.5+'}</span>
            </div>
          </div>

          {/* Interactive Component Chips List */}
          <div className="grid grid-cols-3 gap-1.5 text-[11px] mb-2 font-mono">
            {Object.values(THERMAL_SPECS).map((spec) => {
              const rValFormatted = thermalUnit === 'SI' 
                ? `R-${spec.rValueSI.toFixed(2)}` 
                : `R-${spec.rValueImperial.toFixed(1)}`;

              return (
                <button
                  key={spec.id}
                  id={`btn-inspect-chip-${spec.id}`}
                  onClick={() => selectComponentById(spec.id)}
                  title={`Inspect ${spec.name} details`}
                  className="flex items-center justify-between p-1.5 rounded-lg bg-stone-950/70 hover:bg-stone-800 border border-stone-800 hover:border-teal-500 transition-all text-left group"
                >
                  <div className="flex items-center gap-1.5 truncate">
                    <span 
                      className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm" 
                      style={{ backgroundColor: spec.colorHex }}
                    />
                    <span className="text-stone-300 group-hover:text-white truncate capitalize">
                      {spec.category}
                    </span>
                  </div>
                  <span className="font-bold text-white shrink-0 text-[10px]">
                    {rValFormatted}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Envelope Summary Footer */}
          <div className="flex items-center justify-between text-[11px] bg-stone-950 p-2 rounded-lg border border-stone-800/80 font-mono">
            <span className="text-stone-400">Envelope Weighted Average:</span>
            <span className="text-teal-300 font-bold">
              {thermalUnit === 'SI'
                ? `R-${ENVELOPE_THERMAL_SUMMARY.averageEnvelopeRValueSI.toFixed(2)} m²·K/W (U=${ENVELOPE_THERMAL_SUMMARY.averageEnvelopeUValueSI.toFixed(2)})`
                : `R-${ENVELOPE_THERMAL_SUMMARY.averageEnvelopeRValueImperial.toFixed(1)} hr·ft²·°F/BTU`}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

