import { useFrame, useThree } from '@react-three/fiber';
import { useMemo } from 'react';
import { Vector3 } from 'three';
import type { PacmanState } from '../../types/threeGame.ts';

interface CameraRigProps {
  target: PacmanState;
}

export function CameraRig({ target }: CameraRigProps) {
  const { camera } = useThree();

  const helpers = useMemo(
    () => ({
      desired: new Vector3(),
      lookAt: new Vector3(),
      offset: new Vector3(0, 18, 22),
    }),
    []
  );

  useFrame(() => {
    helpers.desired.copy(target.position).add(helpers.offset);
    camera.position.lerp(helpers.desired, 0.06);

    helpers.lookAt.copy(target.position);
    camera.lookAt(helpers.lookAt);
  });

  return null;
}

export default CameraRig;
