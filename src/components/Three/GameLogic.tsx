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
    }),
    []
  );

  useFrame((state, delta) => {
    if (gameStatus !== 'playing') return;

    const dt = Math.min(delta, 0.05);
    const now = Date.now();

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
      const elapsed = now - gameStartTime;
      if (!ghost.isActive && elapsed > ghost.spawnDelay) {
        ghost.isActive = true;
      }
      if (!ghost.isActive || ghost.mode === 'eaten') return;

      // Direction change timer
      ghost.directionTimer -= dt;
      if (ghost.directionTimer <= 0) {
        ghost.directionTimer = randomBetween(1.5, 3);

        if (ghost.mode === 'chase' || ghost.mode === 'scatter') {
          // Chase: move toward player
          if (ghost.mode === 'chase') {
            helpers.toPlayer
              .copy(pacmanState.position)
              .sub(ghost.position)
              .normalize()
              .multiplyScalar(ghost.speed);
            // Add some randomness
            helpers.toPlayer.x += randomBetween(-0.5, 0.5);
            helpers.toPlayer.z += randomBetween(-0.5, 0.5);
            ghost.velocity.copy(helpers.toPlayer);
          } else {
            // Scatter: move randomly
            ghost.velocity
              .set(randomBetween(-1, 1), 0, randomBetween(-1, 1))
              .normalize()
              .multiplyScalar(ghost.speed);
          }
        } else if (ghost.mode === 'frightened') {
          // Run away from player
          helpers.toPlayer
            .copy(ghost.position)
            .sub(pacmanState.position)
            .normalize()
            .multiplyScalar(ghost.speed * 0.5);
          helpers.toPlayer.x += randomBetween(-1, 1);
          helpers.toPlayer.z += randomBetween(-1, 1);
          ghost.velocity.copy(helpers.toPlayer);
        }
      }

      // Add wander behavior
      helpers.wander.copy(ghost.velocity);
      helpers.wander.x += Math.sin(state.clock.elapsedTime * 2 + index) * 0.3;
      helpers.wander.z += Math.cos(state.clock.elapsedTime * 1.5 + index) * 0.3;

      // Boundary avoidance
      if (Math.abs(ghost.position.x) > bounds.x - 1) {
        helpers.wander.x = -Math.sign(ghost.position.x) * Math.abs(helpers.wander.x);
      }
      if (Math.abs(ghost.position.z) > bounds.z - 1) {
        helpers.wander.z = -Math.sign(ghost.position.z) * Math.abs(helpers.wander.z);
      }

      helpers.wander.y = 0;
      helpers.wander.clampLength(ghost.speed * 0.5, ghost.speed);

      ghost.velocity.lerp(helpers.wander, 0.1);
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
          // Pac-Man eats the ghost
          onGhostEaten(ghost.id);
        } else {
          // Ghost kills Pac-Man
          onPlayerHit();
        }
      }

      // Switch between scatter and chase periodically
      if (ghost.mode !== 'frightened') {
        const cycleTime = (elapsed / 1000) % 20;
        ghost.mode = cycleTime < 7 ? 'scatter' : 'chase';
      }
    });
  });

  return null;
}

export default GameLogic;
