import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import type { Mesh } from 'three';

interface WaterSurfaceProps {
  size?: number;
}

export function WaterSurface({ size = 28 }: WaterSurfaceProps) {
  const meshRef = useRef<Mesh>(null);

  useFrame((state) => {
    const mesh = meshRef.current;
    if (!mesh) return;

    const geometry = mesh.geometry;
    const positions = geometry.getAttribute('position');
    const time = state.clock.getElapsedTime();

    for (let i = 0; i < positions.count; i += 1) {
      const x = positions.getX(i);
      const y = positions.getY(i);
      const wave =
        Math.sin(x * 0.3 + time * 1.4) * 0.08 +
        Math.cos(y * 0.25 + time * 1.1) * 0.08;
      positions.setZ(i, wave);
    }
    positions.needsUpdate = true;
    geometry.computeVertexNormals();
  });

  return (
    <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[size, size, 72, 72]} />
      <meshStandardMaterial
        color="#0b4a8b"
        roughness={0.7}
        metalness={0.08}
        transparent
        opacity={0.9}
      />
    </mesh>
  );
}

export default WaterSurface;
