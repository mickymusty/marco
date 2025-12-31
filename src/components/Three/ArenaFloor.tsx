import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import type { Mesh } from 'three';
import type { Bounds3D } from '../../types/threeGame.ts';

interface ArenaFloorProps {
  size?: number;
  bounds: Bounds3D;
}

export function ArenaFloor({ size = 50, bounds }: ArenaFloorProps) {
  const gridRef = useRef<Mesh>(null);

  useFrame((state) => {
    if (gridRef.current) {
      // Subtle pulsing effect
      const pulse = Math.sin(state.clock.elapsedTime * 0.5) * 0.02 + 1;
      gridRef.current.scale.setScalar(pulse);
    }
  });

  return (
    <group>
      {/* Main floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry args={[size, size]} />
        <meshStandardMaterial
          color="#0a0a20"
          roughness={0.9}
          metalness={0.1}
        />
      </mesh>

      {/* Grid pattern */}
      <mesh ref={gridRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[bounds.x * 2, bounds.z * 2, bounds.x * 2, bounds.z * 2]} />
        <meshBasicMaterial
          color="#1a1a40"
          wireframe
          transparent
          opacity={0.3}
        />
      </mesh>

      {/* Arena boundary glow */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <ringGeometry args={[Math.max(bounds.x, bounds.z) - 0.5, Math.max(bounds.x, bounds.z) + 0.5, 64]} />
        <meshBasicMaterial
          color="#ffff00"
          transparent
          opacity={0.15}
        />
      </mesh>

      {/* Corner markers */}
      {[
        [-bounds.x + 1, -bounds.z + 1],
        [bounds.x - 1, -bounds.z + 1],
        [-bounds.x + 1, bounds.z - 1],
        [bounds.x - 1, bounds.z - 1],
      ].map(([x, z], i) => (
        <mesh key={i} position={[x, 0.05, z]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.8, 16]} />
          <meshBasicMaterial color="#ffaa00" transparent opacity={0.4} />
        </mesh>
      ))}
    </group>
  );
}

export default ArenaFloor;
