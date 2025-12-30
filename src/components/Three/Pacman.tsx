import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import type { Mesh } from 'three';
import type { PacmanState } from '../../types/threeGame.ts';
import { PACMAN_COLOR } from '../../constants/index.ts';

interface PacmanProps {
  pacmanState: PacmanState;
}

export function Pacman({ pacmanState }: PacmanProps) {
  const meshRef = useRef<Mesh>(null);

  useEffect(() => {
    pacmanState.mesh = meshRef;
    if (meshRef.current) {
      meshRef.current.position.copy(pacmanState.position);
    }
  }, [pacmanState]);

  return (
    <group>
      {/* Main Pac-Man body */}
      <mesh ref={meshRef} castShadow>
        <sphereGeometry args={[pacmanState.radius, 24, 24]} />
        <meshStandardMaterial
          color={PACMAN_COLOR}
          emissive={pacmanState.isPoweredUp ? '#ffff66' : '#333300'}
          emissiveIntensity={pacmanState.isPoweredUp ? 0.5 : 0.2}
          roughness={0.3}
          metalness={0.1}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Eye */}
      <mesh position={[0, pacmanState.radius * 0.35, pacmanState.radius * 0.65]}>
        <sphereGeometry args={[0.1, 10, 10]} />
        <meshBasicMaterial color="#000000" />
      </mesh>

      {/* Light */}
      <pointLight
        position={[0, pacmanState.radius + 0.2, 0]}
        intensity={pacmanState.isPoweredUp ? 1.5 : 0.8}
        distance={pacmanState.isPoweredUp ? 6 : 4}
        color={PACMAN_COLOR}
      />
    </group>
  );
}

export default Pacman;
