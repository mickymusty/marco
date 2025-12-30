/**
 * Collision Detection System
 * Handles all collision checks in the game
 */

import type { PlayerState, FishState, Vector2D } from '../../types/index.ts';
import { circlesCollide, vecDistance } from '../../utils/math.ts';

/**
 * Check collision between player and a single fish
 */
export function checkPlayerFishCollision(
  player: PlayerState,
  fish: FishState
): boolean {
  if (!fish.isActive || fish.isCaught) return false;

  return circlesCollide(
    { x: player.position.x, y: player.position.y, radius: player.radius },
    { x: fish.position.x, y: fish.position.y, radius: fish.radius }
  );
}

/**
 * Get all fish within a certain radius of a position
 */
export function getFishInRadius(
  fishArray: FishState[],
  center: Vector2D,
  radius: number
): FishState[] {
  return fishArray.filter((fish) => {
    if (!fish.isActive || fish.isCaught) return false;
    return vecDistance(fish.position, center) <= radius;
  });
}

