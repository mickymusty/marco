import { useEffect, useRef } from 'react';
import type { Mesh } from 'three';
import type { PelletState } from '../../types/threeGame.ts';
import { PELLET_COLOR } from '../../constants/index.ts';

interface PelletProps {
  pellet: PelletState;
}

export function Pellet({ pellet }: PelletProps) {
  const meshRef = useRef<Mesh>(null);

  useEffect(() => {
    pellet.mesh = meshRef;
    if (meshRef.current) {
      meshRef.current.position.copy(pellet.position);
    }
  }, [pellet]);

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[0.18, 10, 10]} />
      <meshStandardMaterial
        color={PELLET_COLOR}
        emissive={PELLET_COLOR}
        emissiveIntensity={0.4}
        roughness={0.3}
      />
    </mesh>
  );
}

export default Pellet;
