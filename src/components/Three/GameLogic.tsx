import { useFrame } from '@react-three/fiber';
import { useMemo } from 'react';
import { Vector3 } from 'three';
import type { RefObject } from 'react';
import type { KeyboardState } from '../../types/index.ts';
import type {
  Bounds3D,
  GameStatus,
  GhostState,
  PacmanState,
  PelletState,
  PowerPelletState,
} from '../../types/threeGame.ts';

interface GameLogicProps {
  keys: KeyboardState;
  pacmanState: PacmanState;
  pelletsRef: RefObject<PelletState[]>;
  powerPelletsRef: RefObject<PowerPelletState[]>;
  ghostsRef: RefObject<GhostState[]>;
  bounds: Bounds3D;
  gameStatus: GameStatus;
  gameStartTime: number;
  onPelletEaten: (pelletId: string) => void;
  onPowerPelletEaten: (powerPelletId: string) => void;
  onGhostEaten: (ghostId: string) => void;
  onPlayerHit: () => void;
}

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);
const randomBetween = (min: number, max: number) => Math.random() * (max - min) + min;

// Ghost personalities (like classic Pac-Man)
// Blinky (red): Direct chaser - always targets player
// Pinky (pink): Ambusher - targets ahead of player
// Inky (cyan): Unpredictable - flanker
// Clyde (orange): Random - chases when far, scatters when close

function getGhostTargetPosition(
  ghost: GhostState,
  ghostIndex: number,
  pacmanPos: Vector3,
  pacmanVel: Vector3,
  bounds: Bounds3D,
  helpers: { target: Vector3 }
): Vector3 {
  const personality = ghostIndex % 4;

  switch (personality) {
    case 0: // Blinky - Direct chase
      return helpers.target.copy(pacmanPos);

    case 1: // Pinky - Ambush (target 4 units ahead of player)
      helpers.target.copy(pacmanPos);
      if (pacmanVel.lengthSq() > 0.01) {
        const ahead = pacmanVel.clone().normalize().multiplyScalar(4);
        helpers.target.add(ahead);
      }
      return helpers.target;

    case 2: // Inky - Flanker (tries to cut off from the side)
      helpers.target.copy(pacmanPos);
      const perpendicular = new Vector3(-pacmanVel.z, 0, pacmanVel.x).normalize().multiplyScalar(3);
      helpers.target.add(perpendicular);
      return helpers.target;

    case 3: // Clyde - Shy (chases when far, runs when close)
      const distToPlayer = ghost.position.distanceTo(pacmanPos);
      if (distToPlayer > 8) {
        return helpers.target.copy(pacmanPos);
      } else {
        // Run to corner
        const cornerX = ghost.position.x > 0 ? bounds.x - 2 : -bounds.x + 2;
        const cornerZ = ghost.position.z > 0 ? bounds.z - 2 : -bounds.z + 2;
        return helpers.target.set(cornerX, 0.6, cornerZ);
      }

    default:
      return helpers.target.copy(pacmanPos);
  }
}

export function GameLogic({
  keys,
  pacmanState,
  pelletsRef,
  powerPelletsRef,
  ghostsRef,
  bounds,
  gameStatus,
  gameStartTime,
  onPelletEaten,
  onPowerPelletEaten,
  onGhostEaten,
  onPlayerHit,
}: GameLogicProps) {
  const helpers = useMemo(
    () => ({
      move: new Vector3(),
      toPlayer: new Vector3(),
      wander: new Vector3(),
      target: new Vector3(),
    }),
    []
  );

  useFrame((state, delta) => {
    // Don't update when paused or not playing
    if (gameStatus !== 'playing') return;

    const dt = Math.min(delta, 0.05);
    const now = Date.now();
    const elapsed = now - gameStartTime;

    // Check power-up expiration
    if (pacmanState.isPoweredUp && now > pacmanState.powerUpEndTime) {
      pacmanState.isPoweredUp = false;
      // Reset ghost modes
      ghostsRef.current?.forEach((ghost) => {
        if (ghost.mode === 'frightened') {
          ghost.mode = 'chase';
          ghost.speed = ghost.baseSpeed;
        }
      });
    }

    // === PACMAN MOVEMENT ===
    helpers.move.set(
      (keys.right ? 1 : 0) - (keys.left ? 1 : 0),
      0,
      (keys.down ? 1 : 0) - (keys.up ? 1 : 0)
    );

    if (helpers.move.lengthSq() > 0) {
      helpers.move.normalize().multiplyScalar(pacmanState.speed);
    }

    pacmanState.velocity.lerp(helpers.move, 0.2);
    pacmanState.position.addScaledVector(pacmanState.velocity, dt);

    // Clamp to bounds
    pacmanState.position.x = clamp(
      pacmanState.position.x,
      -bounds.x + pacmanState.radius,
      bounds.x - pacmanState.radius
    );
    pacmanState.position.z = clamp(
      pacmanState.position.z,
      -bounds.z + pacmanState.radius,
      bounds.z - pacmanState.radius
    );

    // Update mesh
    if (pacmanState.mesh?.current) {
      pacmanState.mesh.current.position.copy(pacmanState.position);
      if (pacmanState.velocity.lengthSq() > 0.01) {
        pacmanState.mesh.current.rotation.y = Math.atan2(
          pacmanState.velocity.x,
          pacmanState.velocity.z
        );
      }
    }

    // === PELLET COLLISION ===
    pelletsRef.current?.forEach((pellet) => {
      if (pellet.isEaten) return;
      const dist = Math.hypot(
        pellet.position.x - pacmanState.position.x,
        pellet.position.z - pacmanState.position.z
      );
      if (dist < pacmanState.radius + 0.2) {
        onPelletEaten(pellet.id);
      }
    });

    // === POWER PELLET COLLISION ===
    powerPelletsRef.current?.forEach((powerPellet) => {
      if (powerPellet.isEaten) return;
      const dist = Math.hypot(
        powerPellet.position.x - pacmanState.position.x,
        powerPellet.position.z - pacmanState.position.z
      );
      if (dist < pacmanState.radius + 0.4) {
        onPowerPelletEaten(powerPellet.id);
      }
    });

    // === GHOST AI AND COLLISION ===
    ghostsRef.current?.forEach((ghost, index) => {
      // Check spawn delay
      if (!ghost.isActive && elapsed > ghost.spawnDelay) {
        ghost.isActive = true;
      }
      if (!ghost.isActive || ghost.mode === 'eaten') return;

      // Direction change timer - smarter ghosts change direction more often
      ghost.directionTimer -= dt;
      const shouldUpdateDirection = ghost.directionTimer <= 0;

      if (shouldUpdateDirection) {
        // Faster direction updates for more responsive AI
        ghost.directionTimer = randomBetween(0.8, 1.5);

        if (ghost.mode === 'chase') {
          // Use personality-based targeting
          const targetPos = getGhostTargetPosition(
            ghost,
            index,
            pacmanState.position,
            pacmanState.velocity,
            bounds,
            helpers
          );

          helpers.toPlayer
            .copy(targetPos)
            .sub(ghost.position)
            .normalize()
            .multiplyScalar(ghost.speed);

          // Add slight randomness for unpredictability
          helpers.toPlayer.x += randomBetween(-0.3, 0.3);
          helpers.toPlayer.z += randomBetween(-0.3, 0.3);
          ghost.velocity.copy(helpers.toPlayer);

        } else if (ghost.mode === 'scatter') {
          // Move to assigned corner based on ghost index
          const corners = [
            { x: bounds.x - 2, z: -bounds.z + 2 },   // Top right
            { x: -bounds.x + 2, z: -bounds.z + 2 },  // Top left
            { x: bounds.x - 2, z: bounds.z - 2 },    // Bottom right
            { x: -bounds.x + 2, z: bounds.z - 2 },   // Bottom left
          ];
          const corner = corners[index % 4];

          helpers.toPlayer
            .set(corner.x - ghost.position.x, 0, corner.z - ghost.position.z)
            .normalize()
            .multiplyScalar(ghost.speed);

          ghost.velocity.copy(helpers.toPlayer);

        } else if (ghost.mode === 'frightened') {
          // Run away from player more aggressively
          helpers.toPlayer
            .copy(ghost.position)
            .sub(pacmanState.position)
            .normalize()
            .multiplyScalar(ghost.speed * 0.6);

          // More erratic movement when frightened
          helpers.toPlayer.x += randomBetween(-1.5, 1.5);
          helpers.toPlayer.z += randomBetween(-1.5, 1.5);
          ghost.velocity.copy(helpers.toPlayer);
        }
      }

      // Smoother wandering with personality
      helpers.wander.copy(ghost.velocity);
      const wanderStrength = ghost.mode === 'frightened' ? 0.5 : 0.2;
      helpers.wander.x += Math.sin(state.clock.elapsedTime * 2.5 + index * 1.7) * wanderStrength;
      helpers.wander.z += Math.cos(state.clock.elapsedTime * 2 + index * 1.3) * wanderStrength;

      // Boundary avoidance - turn smoothly
      const boundaryBuffer = 2;
      if (ghost.position.x > bounds.x - boundaryBuffer) {
        helpers.wander.x -= (ghost.position.x - (bounds.x - boundaryBuffer)) * 0.5;
      }
      if (ghost.position.x < -bounds.x + boundaryBuffer) {
        helpers.wander.x -= (ghost.position.x - (-bounds.x + boundaryBuffer)) * 0.5;
      }
      if (ghost.position.z > bounds.z - boundaryBuffer) {
        helpers.wander.z -= (ghost.position.z - (bounds.z - boundaryBuffer)) * 0.5;
      }
      if (ghost.position.z < -bounds.z + boundaryBuffer) {
        helpers.wander.z -= (ghost.position.z - (-bounds.z + boundaryBuffer)) * 0.5;
      }

      helpers.wander.y = 0;
      helpers.wander.clampLength(ghost.speed * 0.5, ghost.speed);

      // Smoother movement interpolation
      const lerpFactor = ghost.mode === 'frightened' ? 0.15 : 0.12;
      ghost.velocity.lerp(helpers.wander, lerpFactor);
      ghost.position.addScaledVector(ghost.velocity, dt);

      // Clamp ghost position
      ghost.position.x = clamp(ghost.position.x, -bounds.x + ghost.radius, bounds.x - ghost.radius);
      ghost.position.z = clamp(ghost.position.z, -bounds.z + ghost.radius, bounds.z - ghost.radius);

      // Update group position and rotation
      if (ghost.group?.current) {
        ghost.group.current.position.copy(ghost.position);
        ghost.group.current.rotation.y = Math.atan2(ghost.velocity.x, ghost.velocity.z);
      }

      // === GHOST-PACMAN COLLISION ===
      const collisionDist = pacmanState.radius + ghost.radius - 0.1;
      const distToPlayer = Math.hypot(
        ghost.position.x - pacmanState.position.x,
        ghost.position.z - pacmanState.position.z
      );

      if (distToPlayer < collisionDist) {
        if (ghost.mode === 'frightened') {
          onGhostEaten(ghost.id);
        } else {
          onPlayerHit();
        }
      }

      // Switch between scatter and chase periodically (classic Pac-Man pattern)
      // Scatter for 7s, Chase for 20s, then shorter scatter periods
      if (ghost.mode !== 'frightened') {
        const cycleTime = elapsed / 1000;
        if (cycleTime < 7) {
          ghost.mode = 'scatter';
        } else if (cycleTime < 27) {
          ghost.mode = 'chase';
        } else if (cycleTime < 34) {
          ghost.mode = 'scatter';
        } else if (cycleTime < 54) {
          ghost.mode = 'chase';
        } else if (cycleTime < 59) {
          ghost.mode = 'scatter';
        } else {
          // After initial pattern, mostly chase with brief scatters
          const laterCycle = (cycleTime - 59) % 25;
          ghost.mode = laterCycle < 5 ? 'scatter' : 'chase';
        }
      }
    });
  });

  return null;
}

export default GameLogic;
