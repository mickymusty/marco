/**
 * Collision Detection System
 * Handles all collision checks in the game
 */

import type { PlayerState, FishState, Vector2D } from '../../types/index.ts';
import { circlesCollide, vecDistance } from '../../utils/math.ts';

/** Collision result between player and fish */
export interface PlayerFishCollision {
  collided: boolean;
  fishId: string;
  fish: FishState;
}

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
 * Check collisions between player and all fish
 * Returns array of caught fish
 */
export function checkAllPlayerFishCollisions(
  player: PlayerState,
  fishArray: FishState[]
): FishState[] {
  const caughtFish: FishState[] = [];

  for (const fish of fishArray) {
    if (checkPlayerFishCollision(player, fish)) {
      caughtFish.push(fish);
    }
  }

  return caughtFish;
}

/**
 * Check if a position is within the Marco wave radius
 */
export function isWithinWaveRadius(
  targetPosition: Vector2D,
  waveOrigin: Vector2D,
  currentRadius: number
): boolean {
  const distance = vecDistance(targetPosition, waveOrigin);
  // Check if target is at the wave edge (within a small tolerance)
  const tolerance = 30;
  return Math.abs(distance - currentRadius) < tolerance;
}

/**
 * Check if position is inside expanding wave
 */
export function isInsideWave(
  targetPosition: Vector2D,
  waveOrigin: Vector2D,
  currentRadius: number
): boolean {
  return vecDistance(targetPosition, waveOrigin) <= currentRadius;
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

/**
 * Get closest fish to a position
 */
export function getClosestFish(
  fishArray: FishState[],
  position: Vector2D
): FishState | null {
  let closest: FishState | null = null;
  let closestDist = Infinity;

  for (const fish of fishArray) {
    if (!fish.isActive || fish.isCaught) continue;

    const dist = vecDistance(fish.position, position);
    if (dist < closestDist) {
      closestDist = dist;
      closest = fish;
    }
  }

  return closest;
}

/**
 * Spatial hash grid for efficient collision detection
 * (Optimization for larger numbers of entities)
 */
export class SpatialGrid {
  private cellSize: number;
  private cells: Map<string, FishState[]>;

  constructor(cellSize: number = 100) {
    this.cellSize = cellSize;
    this.cells = new Map();
  }

  /** Clear all cells */
  clear(): void {
    this.cells.clear();
  }

  /** Get cell key for a position */
  private getCellKey(x: number, y: number): string {
    const cellX = Math.floor(x / this.cellSize);
    const cellY = Math.floor(y / this.cellSize);
    return `${cellX},${cellY}`;
  }

  /** Add fish to grid */
  addFish(fish: FishState): void {
    const key = this.getCellKey(fish.position.x, fish.position.y);
    if (!this.cells.has(key)) {
      this.cells.set(key, []);
    }
    this.cells.get(key)!.push(fish);
  }

  /** Add multiple fish to grid */
  addFishArray(fishArray: FishState[]): void {
    for (const fish of fishArray) {
      if (fish.isActive && !fish.isCaught) {
        this.addFish(fish);
      }
    }
  }

  /** Get nearby fish for collision checking */
  getNearbyFish(x: number, y: number, radius: number): FishState[] {
    const nearby: FishState[] = [];
    const minCellX = Math.floor((x - radius) / this.cellSize);
    const maxCellX = Math.floor((x + radius) / this.cellSize);
    const minCellY = Math.floor((y - radius) / this.cellSize);
    const maxCellY = Math.floor((y + radius) / this.cellSize);

    for (let cx = minCellX; cx <= maxCellX; cx++) {
      for (let cy = minCellY; cy <= maxCellY; cy++) {
        const key = `${cx},${cy}`;
        const cellFish = this.cells.get(key);
        if (cellFish) {
          nearby.push(...cellFish);
        }
      }
    }

    return nearby;
  }

  /** Check collision with player using spatial grid */
  checkPlayerCollision(player: PlayerState): FishState[] {
    const nearby = this.getNearbyFish(
      player.position.x,
      player.position.y,
      player.radius + 30 // Max fish radius + buffer
    );

    return nearby.filter((fish) => checkPlayerFishCollision(player, fish));
  }
}
