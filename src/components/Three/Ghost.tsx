import { useEffect, useRef } from 'react';
import type { Group } from 'three';
import type { GhostState } from '../../types/threeGame.ts';
import { FRIGHTENED_COLOR } from '../../constants/index.ts';

interface GhostProps {
  ghost: GhostState;
}

export function Ghost({ ghost }: GhostProps) {
  const groupRef = useRef<Group>(null);

  useEffect(() => {
    ghost.group = groupRef;
    if (groupRef.current) {
      groupRef.current.position.copy(ghost.position);
    }
  }, [ghost]);

  if (!ghost.isActive || ghost.mode === 'eaten') return null;

  const displayColor = ghost.mode === 'frightened' ? FRIGHTENED_COLOR : ghost.color;

  return (
    <group ref={groupRef}>
      {/* Ghost body */}
      <mesh castShadow position={[0, 0, 0]}>
        <capsuleGeometry args={[ghost.radius * 0.7, ghost.radius * 0.6, 8, 16]} />
        <meshStandardMaterial
          color={displayColor}
          emissive={displayColor}
          emissiveIntensity={0.3}
          roughness={0.4}
          metalness={0.1}
        />
      </mesh>

      {/* Eyes - positioned relative to ghost body */}
      <mesh position={[-0.2, 0.2, 0.4]}>
        <sphereGeometry args={[0.12, 8, 8]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
      <mesh position={[0.2, 0.2, 0.4]}>
        <sphereGeometry args={[0.12, 8, 8]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>

      {/* Pupils */}
      <mesh position={[-0.2, 0.2, 0.5]}>
        <sphereGeometry args={[0.06, 8, 8]} />
        <meshBasicMaterial color={ghost.mode === 'frightened' ? '#ffffff' : '#000000'} />
      </mesh>
      <mesh position={[0.2, 0.2, 0.5]}>
        <sphereGeometry args={[0.06, 8, 8]} />
        <meshBasicMaterial color={ghost.mode === 'frightened' ? '#ffffff' : '#000000'} />
      </mesh>

      {/* Simple glow light */}
      <pointLight
        position={[0, 0.3, 0]}
        intensity={0.6}
        distance={3}
        color={displayColor}
      />
    </group>
  );
}

export default Ghost;
