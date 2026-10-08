'use client';

import { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Sparkles, MeshTransmissionMaterial, ContactShadows, Environment, Lightformer } from '@react-three/drei';
import * as THREE from 'three';

function CoreObject({ reducedMotion }: { reducedMotion: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current && !reducedMotion) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.15;
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.2) * 0.1;
    }
  });

  return (
    <Float speed={reducedMotion ? 0 : 1.5} rotationIntensity={reducedMotion ? 0 : 0.5} floatIntensity={reducedMotion ? 0 : 1}>
      <mesh ref={meshRef} position={[0, 0, 0]}>
        <icosahedronGeometry args={[1.5, 0]} />
        <MeshTransmissionMaterial 
          backside 
          samples={2} 
          thickness={0.5} 
          chromaticAberration={1} 
          anisotropy={0.3} 
          distortion={reducedMotion ? 0 : 0.5} 
          distortionScale={0.5} 
          temporalDistortion={reducedMotion ? 0 : 0.1} 
          color="#00ffff"
          attenuationDistance={2}
          attenuationColor="#ffffff"
        />
      </mesh>
      
      {/* Internal core */}
      <mesh>
        <octahedronGeometry args={[0.8, 0]} />
        <meshBasicMaterial color="#a855f7" wireframe />
      </mesh>
    </Float>
  );
}

function Particles({ reducedMotion }: { reducedMotion: boolean }) {
  if (reducedMotion) return null; // Simplify on reduced motion
  return (
    <Sparkles count={100} scale={12} size={1.5} speed={0.3} opacity={0.3} color="#00ffff" />
  );
}

export default function VisualEngine() {
  const [mounted, setMounted] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [webGLSupported, setWebGLSupported] = useState(true);

  useEffect(() => {
    // Capability detection
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) setWebGLSupported(false);

    const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mql.matches);
    
    const handleMql = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mql.addEventListener('change', handleMql);

    setIsMobile(window.innerWidth < 768);
    setMounted(true);

    return () => mql.removeEventListener('change', handleMql);
  }, []);

  if (!mounted) return <div className="absolute inset-0 w-full h-full -z-10 bg-black" />;

  if (!webGLSupported) {
    return (
      <div className="absolute inset-0 w-full h-full -z-10 bg-black flex items-center justify-center overflow-hidden">
        <div className="absolute w-[80vw] h-[80vw] md:w-[40vw] md:h-[40vw] bg-cyan-900/20 blur-[100px] rounded-full" />
        <div className="absolute w-[60vw] h-[60vw] md:w-[30vw] md:h-[30vw] bg-violet-900/20 blur-[100px] rounded-full mix-blend-screen" />
      </div>
    );
  }

  return (
    <div className="absolute inset-0 w-full h-full -z-10 bg-black overflow-hidden pointer-events-none">
      <Canvas 
        camera={{ position: [0, 0, 5], fov: 45 }} 
        dpr={isMobile ? 1 : [1, 2]}
        gl={{ powerPreference: 'high-performance', antialias: !isMobile }}
      >
        <color attach="background" args={['#000000']} />
        
        {/* Cinematic Lighting */}
        <ambientLight intensity={0.2} />
        <spotLight position={[5, 5, 5]} angle={0.2} penumbra={1} intensity={2} color="#00ffff" />
        <spotLight position={[-5, -5, -5]} angle={0.2} penumbra={1} intensity={1.5} color="#a855f7" />
        
        <CoreObject reducedMotion={reducedMotion} />
        <Particles reducedMotion={reducedMotion} />
        
        <Environment resolution={isMobile ? 128 : 256}>
          <group rotation={[-Math.PI / 4, -0.3, 0]}>
            <Lightformer intensity={4} rotation-x={Math.PI / 2} position={[0, 5, -9]} scale={[10, 10, 1]} />
            <Lightformer intensity={2} rotation-y={Math.PI / 2} position={[-5, 1, -1]} scale={[50, 2, 1]} />
            <Lightformer intensity={2} rotation-y={Math.PI / 2} position={[5, -1, -1]} scale={[50, 2, 1]} />
            <Lightformer intensity={2} rotation-y={-Math.PI / 2} position={[10, 1, 0]} scale={[50, 2, 1]} color="#00ffff" />
          </group>
        </Environment>
        
        {!reducedMotion && !isMobile && (
          <ContactShadows resolution={256} scale={20} blur={2} opacity={0.5} far={10} color="#00ffff" />
        )}
      </Canvas>
    </div>
  );
}
