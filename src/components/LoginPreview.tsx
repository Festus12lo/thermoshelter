import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, MeshDistortMaterial, Stars, Float } from '@react-three/drei';
import { Lock, User, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import * as THREE from 'three';

// Procedural VFX Hologram Component
const Hologram = () => {
  const meshRef = useRef<THREE.Mesh>(null);
  const wireframeRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.2;
      meshRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.5) * 0.2;
    }
    if (wireframeRef.current) {
      wireframeRef.current.rotation.y = state.clock.elapsedTime * 0.2;
      wireframeRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.5) * 0.2;
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={2}>
      {/* Core Energy */}
      <Sphere ref={meshRef} args={[1.8, 64, 64]}>
        <MeshDistortMaterial 
          color="#00f0ff" 
          emissive="#00f0ff"
          emissiveIntensity={2}
          transparent 
          opacity={0.3} 
          distort={0.4} 
          speed={3} 
          toneMapped={false}
        />
      </Sphere>
      
      {/* Holographic Wireframe Shell */}
      <Sphere ref={wireframeRef} args={[2, 32, 32]}>
        <meshStandardMaterial 
          color="#06b6d4" 
          emissive="#06b6d4"
          emissiveIntensity={1.5}
          wireframe 
          transparent 
          opacity={0.4} 
          blending={THREE.AdditiveBlending}
          toneMapped={false}
        />
      </Sphere>
    </Float>
  );
};

export const LoginPreview = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <div className="flex min-h-screen w-full bg-slate-50 font-sans selection:bg-cyan-500/30 overflow-hidden">
      
      {/* Left Pane - Procedural VFX (Three.js) */}
      <div className="relative hidden lg:flex flex-1 bg-slate-950 overflow-hidden items-center justify-center">
        {/* Background Gradients */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-cyan-900/40 via-slate-950 to-slate-950"></div>
        <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-cyan-500/10 to-transparent"></div>
        
        {/* Three.js Canvas */}
        <div className="absolute inset-0">
          <Canvas camera={{ position: [0, 0, 6], fov: 45 }}>
            <ambientLight intensity={0.2} />
            <pointLight position={[10, 10, 10]} intensity={1.5} color="#00f0ff" />
            <Stars radius={100} depth={50} count={3000} factor={4} saturation={0} fade speed={1} />
            <Hologram />
            <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.5} />
          </Canvas>
        </div>

        {/* Overlay Branding */}
        <div className="absolute bottom-12 left-12 z-10">
          <div className="w-12 h-12 mb-4 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-[0_0_30px_rgba(6,182,212,0.6)]">
            <span className="text-white font-black text-xl leading-none">TS</span>
          </div>
          <h2 className="text-3xl font-black text-white tracking-tighter mb-2">ThermoShelter</h2>
          <p className="text-cyan-400 font-mono text-sm tracking-widest uppercase">Climate Resilience Grid</p>
        </div>
      </div>

      {/* Right Pane - Minimalist Form */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 sm:px-16 lg:px-24 bg-white relative">
        <motion.div 
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
          className="w-full max-w-sm"
        >
          <div className="mb-10 text-center lg:text-left">
            <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-3">
              Welcome to<br/>ThermoShelter
            </h1>
            <p className="text-slate-500 font-medium leading-relaxed">
              Secure your access to resilience monitoring and AI synthesis engines.
            </p>
          </div>

          <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User className="w-5 h-5 text-slate-400" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl py-3.5 pl-11 pr-4 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all placeholder:text-slate-400"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="w-5 h-5 text-slate-400" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl py-3.5 pl-11 pr-4 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all placeholder:text-slate-400"
                />
              </div>
              <div className="flex justify-end pt-1">
                <button type="button" className="text-sm font-semibold text-cyan-600 hover:text-cyan-700 transition-colors">
                  Forgot Password?
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full mt-8 bg-cyan-500 hover:bg-cyan-600 active:bg-cyan-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/40 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
            >
              Sign In
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-slate-100 flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-slate-500">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>End-to-end encrypted</span>
            </div>
            <button type="button" className="font-semibold text-slate-700 hover:text-slate-900 transition-colors">
              Sign up for access
            </button>
          </div>
        </motion.div>
      </div>
      
    </div>
  );
};
