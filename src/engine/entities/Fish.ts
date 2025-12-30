/**
 * Fish Entity
 * Represents the "Polo" targets in the game
 */

import type { FishState, Vector2D, GameConfig } from '../../types/index.ts';
import { FISH, COLORS, GAME_BOUNDS, CANVAS_WIDTH, CANVAS_HEIGHT } from '../../constants/index.ts';
import {
  vec,
  vecAdd,
  vecSub,
  vecScale,
  vecNormalize,
  vecMagnitude,
  vecDistance,
  vecFromAngle,
  randomRange,
  randomAngle,
  randomElement,
  generateId,
  clamp,
  lerp,
} from '../../utils/math.ts';

/** Fish size type */
type FishSize = 'small' | 'medium' | 'large';

/**
 * Create a new fish at a random position (away from center/player)
 */
export function createFish(playerPosition: Vector2D): FishState {
  // Determine size randomly with weighted probability
  const sizeRoll = Math.random();
  let size: FishSize;
  if (sizeRoll < 0.4) {
    size = 'small';
  } else if (sizeRoll < 0.8) {
    size = 'medium';
  } else {
    size = 'large';
  }

  const sizeConfig = FISH.sizes[size];

  // Generate position away from player (at least 150px)
  let position: Vector2D;
  const minDistanceFromPlayer = 150;
  const padding = 50;

  do {
    position = {
      x: randomRange(padding, CANVAS_WIDTH - padding),
      y: randomRange(padding, CANVAS_HEIGHT - padding),
    };
  } while (vecDistance(position, playerPosition) < minDistanceFromPlayer);

  return {
    id: generateId(),
    position,
    velocity: vec(0, 0),
    radius: sizeConfig.radius,
    isActive: true,
    isCaught: false,
    isRevealed: false,
    revealedUntil: 0,
    baseSpeed: randomRange(0.8, 1.2), // Speed multiplier variation
    currentBehavior: 'idle',
    behaviorTimer: randomRange(FISH.behaviorChangeInterval.min, FISH.behaviorChangeInterval.max),
    targetPosition: null,
    color: randomElement([...COLORS.fishColors]),
    size,
  };
}

/**
 * Create multiple fish
 */
export function createFishSchool(count: number, playerPosition: Vector2D): FishState[] {
  const fish: FishState[] = [];
  for (let i = 0; i < count; i++) {
    fish.push(createFish(playerPosition));
  }
  return fish;
}

/**
 * Update fish AI and movement
 */
export function updateFish(
  fish: FishState,
  playerPosition: Vector2D,
  config: GameConfig,
  deltaTime: number,
  timestamp: number
): FishState {
  if (fish.isCaught) return fish;

  let newFish = { ...fish };

  // Update reveal state
  if (fish.isRevealed && timestamp > fish.revealedUntil) {
    newFish.isRevealed = false;
  }

  // Update behavior timer
  newFish.behaviorTimer -= deltaTime * 1000;

  // Change behavior if timer expired
  if (newFish.behaviorTimer <= 0) {
    newFish = changeBehavior(newFish, playerPosition);
    newFish.behaviorTimer = randomRange(
      FISH.behaviorChangeInterval.min,
      FISH.behaviorChangeInterval.max
    );
  }

  // Random direction change while swimming
  if (
    newFish.currentBehavior === 'swimming' &&
    Math.random() < FISH.swimDirectionChangeChance
  ) {
    newFish.targetPosition = getRandomSwimTarget(newFish.position);
  }

  // Execute current behavior
  switch (newFish.currentBehavior) {
    case 'idle':
      // Gentle drift
      newFish.velocity = vecScale(newFish.velocity, 0.95);
      break;

    case 'swimming':
      newFish = executeSwimming(newFish, config, deltaTime);
      break;

    case 'fleeing':
      newFish = executeFleeing(newFish, playerPosition, config, deltaTime);
      break;

    case 'responding':
      // Fish is responding to Marco call - stay still briefly
      newFish.velocity = vecScale(newFish.velocity, 0.9);
      break;
  }

  // Apply velocity
  let newPosition = vecAdd(
    newFish.position,
    vecScale(newFish.velocity, deltaTime)
  );

  // Wall avoidance and collision
  newPosition = handleWallCollision(newPosition, newFish.radius, newFish);

  newFish.position = newPosition;

  return newFish;
}

/**
 * Change fish behavior
 */
function changeBehavior(fish: FishState, playerPosition: Vector2D): FishState {
  const distToPlayer = vecDistance(fish.position, playerPosition);
  const newFish = { ...fish };

  // If player is close, more likely to flee
  if (distToPlayer < 100 && Math.random() < 0.5) {
    newFish.currentBehavior = 'fleeing';
    return newFish;
  }

  // Random behavior selection
  if (Math.random() < FISH.idleChance) {
    newFish.currentBehavior = 'idle';
    newFish.targetPosition = null;
  } else {
    newFish.currentBehavior = 'swimming';
    newFish.targetPosition = getRandomSwimTarget(fish.position);
  }

  return newFish;
}

/**
 * Get random swimming target position
 */
function getRandomSwimTarget(currentPosition: Vector2D): Vector2D {
  const angle = randomAngle();
  const distance = randomRange(100, 250);
  const target = vecAdd(currentPosition, vecFromAngle(angle, distance));

  // Clamp to bounds
  const padding = 50;
  return {
    x: clamp(target.x, padding, CANVAS_WIDTH - padding),
    y: clamp(target.y, padding, CANVAS_HEIGHT - padding),
  };
}

/**
 * Execute swimming behavior
 */
function executeSwimming(
  fish: FishState,
  config: GameConfig,
  _deltaTime: number
): FishState {
  if (!fish.targetPosition) {
    return { ...fish, targetPosition: getRandomSwimTarget(fish.position) };
  }

  const toTarget = vecSub(fish.targetPosition, fish.position);
  const distToTarget = vecMagnitude(toTarget);

  // Reached target?
  if (distToTarget < 10) {
    return {
      ...fish,
      currentBehavior: 'idle',
      targetPosition: null,
    };
  }

  // Move toward target
  const direction = vecNormalize(toTarget);
  const speed = config.fishSpeed * fish.baseSpeed;
  const targetVelocity = vecScale(direction, speed);

  // Smooth velocity change
  const newVelocity = vec(
    lerp(fish.velocity.x, targetVelocity.x, 0.1),
    lerp(fish.velocity.y, targetVelocity.y, 0.1)
  );

  return { ...fish, velocity: newVelocity };
}

/**
 * Execute fleeing behavior
 */
function executeFleeing(
  fish: FishState,
  playerPosition: Vector2D,
  config: GameConfig,
  _deltaTime: number
): FishState {
  const awayFromPlayer = vecSub(fish.position, playerPosition);
  const distToPlayer = vecMagnitude(awayFromPlayer);

  // Stop fleeing if far enough
  if (distToPlayer > config.fishFleeDistance) {
    return {
      ...fish,
      currentBehavior: 'swimming',
      targetPosition: getRandomSwimTarget(fish.position),
    };
  }

  // Flee direction
  const fleeDirection = vecNormalize(awayFromPlayer);
  const speed = config.fishFleeSpeed * fish.baseSpeed;
  const targetVelocity = vecScale(fleeDirection, speed);

  // Quick velocity change when fleeing
  const newVelocity = vec(
    lerp(fish.velocity.x, targetVelocity.x, 0.2),
    lerp(fish.velocity.y, targetVelocity.y, 0.2)
  );

  return { ...fish, velocity: newVelocity };
}

/**
 * Handle wall collision for fish
 */
function handleWallCollision(
  position: Vector2D,
  radius: number,
  _fish: FishState
): Vector2D {
  const newPos = { ...position };

  // Hard collision
  if (newPos.x - radius < GAME_BOUNDS.minX) {
    newPos.x = GAME_BOUNDS.minX + radius;
  } else if (newPos.x + radius > GAME_BOUNDS.maxX) {
    newPos.x = GAME_BOUNDS.maxX - radius;
  }

  if (newPos.y - radius < GAME_BOUNDS.minY) {
    newPos.y = GAME_BOUNDS.minY + radius;
  } else if (newPos.y + radius > GAME_BOUNDS.maxY) {
    newPos.y = GAME_BOUNDS.maxY - radius;
  }

  return newPos;
}

/**
 * Trigger fish response to Marco call
 */
export function triggerPoloResponse(
  fish: FishState,
  _playerPosition: Vector2D,
  config: GameConfig,
  timestamp: number
): FishState {
  if (fish.isCaught) return fish;

  // Reveal fish and set response behavior
  return {
    ...fish,
    isRevealed: true,
    revealedUntil: timestamp + config.marcoWaveDuration,
    currentBehavior: 'responding',
    behaviorTimer: 500, // Brief pause before fleeing
  };
}

/**
 * Start fleeing after polo response
 */
export function startFleeing(
  fish: FishState,
  _playerPosition: Vector2D
): FishState {
  return {
    ...fish,
    currentBehavior: 'fleeing',
  };
}

/**
 * Mark fish as caught
 */
export function catchFish(fish: FishState): FishState {
  return {
    ...fish,
    isCaught: true,
    isActive: false,
    velocity: vec(0, 0),
  };
}

/**
 * Get points for catching this fish
 */
export function getFishPoints(fish: FishState): number {
  return FISH.sizes[fish.size].points;
}

/**
 * Get fish circle for collision detection
 */
export function getFishCircle(fish: FishState): {
  x: number;
  y: number;
  radius: number;
} {
  return {
    x: fish.position.x,
    y: fish.position.y,
    radius: fish.radius,
  };
}

/**
 * Check if fish is within Marco wave radius
 */
export function isInMarcoRange(
  fish: FishState,
  playerPosition: Vector2D,
  waveRadius: number
): boolean {
  return vecDistance(fish.position, playerPosition) <= waveRadius;
}
