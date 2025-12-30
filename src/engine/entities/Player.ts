/**
 * Player Entity
 * Represents the "Marco" seeker in the game
 */

import type { PlayerState, Vector2D, KeyboardState, GameConfig } from '../../types/index.ts';
import { PLAYER, GAME_BOUNDS, CANVAS_WIDTH, CANVAS_HEIGHT } from '../../constants/index.ts';
import {
  vec,
  vecAdd,
  vecScale,
  vecNormalize,
  vecMagnitude,
  vecAngle,
  generateId,
} from '../../utils/math.ts';

/**
 * Create a new player state
 */
export function createPlayer(): PlayerState {
  return {
    id: generateId(),
    position: { ...PLAYER.startPosition },
    velocity: vec(0, 0),
    radius: PLAYER.radius,
    isActive: true,
    isCalling: false,
    callCooldownRemaining: 0,
    lastCallTime: 0,
    facingAngle: 0,
  };
}

/**
 * Reset player to initial state
 */
export function resetPlayer(player: PlayerState): PlayerState {
  return {
    ...player,
    position: { x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT / 2 },
    velocity: vec(0, 0),
    isCalling: false,
    callCooldownRemaining: 0,
    lastCallTime: 0,
    facingAngle: 0,
  };
}

/**
 * Update player based on input
 */
export function updatePlayer(
  player: PlayerState,
  keys: KeyboardState,
  config: GameConfig,
  deltaTime: number,
  timestamp: number
): PlayerState {
  // Calculate movement direction from input
  let moveDir = vec(0, 0);

  if (keys.up) moveDir.y -= 1;
  if (keys.down) moveDir.y += 1;
  if (keys.left) moveDir.x -= 1;
  if (keys.right) moveDir.x += 1;

  // Normalize diagonal movement
  if (vecMagnitude(moveDir) > 0) {
    moveDir = vecNormalize(moveDir);
  }

  // Apply movement
  const speed = config.playerSpeed;
  const targetVelocity = vecScale(moveDir, speed);

  // Smooth velocity change (lerp)
  const velocityLerp = 0.15;
  const newVelocity = vec(
    player.velocity.x + (targetVelocity.x - player.velocity.x) * velocityLerp,
    player.velocity.y + (targetVelocity.y - player.velocity.y) * velocityLerp
  );

  // Update position
  let newPosition = vecAdd(
    player.position,
    vecScale(newVelocity, deltaTime)
  );

  // Handle wall collisions
  let hitWall = false;
  const finalVelocity = { ...newVelocity };

  if (newPosition.x - player.radius < GAME_BOUNDS.minX) {
    newPosition.x = GAME_BOUNDS.minX + player.radius;
    finalVelocity.x = -newVelocity.x * PLAYER.collisionDamping;
    hitWall = true;
  } else if (newPosition.x + player.radius > GAME_BOUNDS.maxX) {
    newPosition.x = GAME_BOUNDS.maxX - player.radius;
    finalVelocity.x = -newVelocity.x * PLAYER.collisionDamping;
    hitWall = true;
  }

  if (newPosition.y - player.radius < GAME_BOUNDS.minY) {
    newPosition.y = GAME_BOUNDS.minY + player.radius;
    finalVelocity.y = -newVelocity.y * PLAYER.collisionDamping;
    hitWall = true;
  } else if (newPosition.y + player.radius > GAME_BOUNDS.maxY) {
    newPosition.y = GAME_BOUNDS.maxY - player.radius;
    finalVelocity.y = -newVelocity.y * PLAYER.collisionDamping;
    hitWall = true;
  }

  // Update facing angle based on movement
  let newFacingAngle = player.facingAngle;
  if (vecMagnitude(newVelocity) > 10) {
    newFacingAngle = vecAngle(newVelocity);
  }

  // Update Marco call cooldown
  let newCooldown = Math.max(0, player.callCooldownRemaining - deltaTime * 1000);

  // Check if calling animation is done
  const callDuration = 500; // Marco call animation duration
  const isCalling = player.isCalling && (timestamp - player.lastCallTime < callDuration);

  return {
    ...player,
    position: newPosition,
    velocity: hitWall ? finalVelocity : newVelocity,
    facingAngle: newFacingAngle,
    callCooldownRemaining: newCooldown,
    isCalling,
  };
}

/**
 * Check if player can call Marco
 */
export function canCallMarco(
  player: PlayerState,
  marcoCallsRemaining: number
): boolean {
  return (
    !player.isCalling &&
    player.callCooldownRemaining <= 0 &&
    marcoCallsRemaining > 0
  );
}

/**
 * Trigger Marco call
 */
export function triggerMarcoCall(
  player: PlayerState,
  config: GameConfig,
  timestamp: number
): PlayerState {
  return {
    ...player,
    isCalling: true,
    lastCallTime: timestamp,
    callCooldownRemaining: config.marcoCooldown,
  };
}

/**
 * Get player circle for collision detection
 */
export function getPlayerCircle(player: PlayerState): {
  x: number;
  y: number;
  radius: number;
} {
  return {
    x: player.position.x,
    y: player.position.y,
    radius: player.radius,
  };
}

/**
 * Check if player hit a wall this frame
 */
export function checkWallCollision(
  position: Vector2D,
  radius: number
): { hit: boolean; normal: Vector2D } {
  let hit = false;
  const normal = vec(0, 0);

  if (position.x - radius < GAME_BOUNDS.minX) {
    hit = true;
    normal.x = 1;
  } else if (position.x + radius > GAME_BOUNDS.maxX) {
    hit = true;
    normal.x = -1;
  }

  if (position.y - radius < GAME_BOUNDS.minY) {
    hit = true;
    normal.y = 1;
  } else if (position.y + radius > GAME_BOUNDS.maxY) {
    hit = true;
    normal.y = -1;
  }

  return { hit, normal };
}
