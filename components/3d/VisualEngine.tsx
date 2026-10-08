'use client';
import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Sparkles, MeshTransmissionMaterial, ContactShadows, Environment, Lightformer } from '@react-three/drei';
import * as THREE from 'three';

function CoreObject() {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.2;
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3) * 0.1;
    }
  });

  return (
    <Float speed={1.5} rotationIntensity={0.5} floatIntensity={1}>
      <mesh ref={meshRef} position={[0, 0, 0]}>
        <icosahedronGeometry args={[1.5, 0]} />
        <MeshTransmissionMaterial 
          backside 
          samples={4} 
          thickness={0.5} 
          chromaticAberration={1} 
          anisotropy={0.3} 
          distortion={0.5} 
          distortionScale={0.5} 
          temporalDistortion={0.1} 
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

function Particles() {
  return (
    <Sparkles count={150} scale={12} size={1.5} speed={0.4} opacity={0.3} color="#00ffff" />
  );
}

export default function VisualEngine() {
  return (
    <div className="absolute inset-0 w-full h-full -z-10 bg-black overflow-hidden pointer-events-none">
      <Canvas camera={{ position: [0, 0, 5], fov: 45 }} dpr={[1, 2]}>
        <color attach="background" args={['#000000']} />
        
        {/* Cinematic Lighting */}
        <ambientLight intensity={0.2} />
        <spotLight position={[5, 5, 5]} angle={0.2} penumbra={1} intensity={2} color="#00ffff" />
        <spotLight position={[-5, -5, -5]} angle={0.2} penumbra={1} intensity={1.5} color="#a855f7" />
        
        <CoreObject />
        <Particles />
        
        <Environment resolution={256}>
          <group rotation={[-Math.PI / 4, -0.3, 0]}>
            <Lightformer intensity={4} rotation-x={Math.PI / 2} position={[0, 5, -9]} scale={[10, 10, 1]} />
            <Lightformer intensity={2} rotation-y={Math.PI / 2} position={[-5, 1, -1]} scale={[50, 2, 1]} />
            <Lightformer intensity={2} rotation-y={Math.PI / 2} position={[5, -1, -1]} scale={[50, 2, 1]} />
            <Lightformer intensity={2} rotation-y={-Math.PI / 2} position={[10, 1, 0]} scale={[50, 2, 1]} color="#00ffff" />
          </group>
        </Environment>
        
        <ContactShadows resolution={512} scale={20} blur={2} opacity={0.5} far={10} color="#00ffff" />
      </Canvas>
    </div>
  );
}
