import { useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import type { Mesh } from 'three';
import type { PowerPelletState } from '../../types/threeGame.ts';
import { POWER_PELLET_COLOR } from '../../constants/index.ts';

interface PowerPelletProps {
  powerPellet: PowerPelletState;
}

export function PowerPellet({ powerPellet }: PowerPelletProps) {
  const meshRef = useRef<Mesh>(null);

  useEffect(() => {
    powerPellet.mesh = meshRef;
    if (meshRef.current) {
      meshRef.current.position.copy(powerPellet.position);
    }
  }, [powerPellet]);

  useFrame((state) => {
    if (!meshRef.current) return;
    // Gentle pulse only
    const pulse = Math.sin(state.clock.elapsedTime * 2) * 0.1 + 1;
    meshRef.current.scale.setScalar(pulse);
  });

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[0.4, 14, 14]} />
      <meshStandardMaterial
        color={POWER_PELLET_COLOR}
        emissive={POWER_PELLET_COLOR}
        emissiveIntensity={0.6}
        roughness={0.2}
      />
    </mesh>
  );
}

export default PowerPellet;
