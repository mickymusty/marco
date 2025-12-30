/**
 * Main Game Engine
 * Orchestrates all game systems and manages game state
 */

import type {
  GameState,
  GameConfig,
  KeyboardState,
  PlayerState,
  FishState,
  Effects,
  Difficulty,
  GameEventListener,
  Vector2D,
} from '../types/index.ts';
import { DIFFICULTY_CONFIG, CANVAS_WIDTH, CANVAS_HEIGHT, SCORING } from '../constants/index.ts';

import {
  createPlayer,
  updatePlayer,
  canCallMarco,
  triggerMarcoCall,
} from './entities/Player.ts';

import {
  createFishSchool,
  updateFish,
  triggerPoloResponse,
  catchFish,
  getFishPoints,
} from './entities/Fish.ts';

import {
  createEffects,
  updateEffects,
  addSoundWave,
  addPoloBubble,
  addCatchParticles,
  addRipple,
  addScorePopup,
} from './systems/effects.ts';

import { checkPlayerFishCollision, getFishInRadius } from './systems/collision.ts';

import {
  clearCanvas,
  renderWaterBackground,
  renderPlayer,
  renderFishArray,
  renderFogOfWar,
  renderEffects,
  renderBorder,
} from './systems/renderer.ts';

import {
  playMarcoSound,
  playPoloSound,
  playCatchSound,
  playBumpSound,
  playGameOverSound,
  playVictorySound,
  resumeAudio,
} from '../utils/helpers.ts';


/**
 * Game Engine State
 */
export interface EngineState {
  gameState: GameState;
  config: GameConfig;
  player: PlayerState;
  fish: FishState[];
  effects: Effects;
  lastTimestamp: number;
  comboCount: number;
  lastCatchTime: number;
  previousPlayerPosition: Vector2D;
}

/**
 * Create initial engine state
 */
export function createEngineState(difficulty: Difficulty): EngineState {
  const config = DIFFICULTY_CONFIG[difficulty];
  const player = createPlayer();

  return {
    gameState: {
      screen: 'playing',
      score: 0,
      highScore: 0,
      timeRemaining: config.gameDuration,
      fishCaught: 0,
      totalFish: config.fishCount,
      marcoCallsRemaining: config.maxMarcoCalls,
      difficulty,
      isPaused: false,
    },
    config,
    player,
    fish: createFishSchool(config.fishCount, player.position),
    effects: createEffects(),
    lastTimestamp: 0,
    comboCount: 0,
    lastCatchTime: 0,
    previousPlayerPosition: { ...player.position },
  };
}

/**
 * Main game update function
 */
export function updateEngine(
  state: EngineState,
  keys: KeyboardState,
  timestamp: number,
  onEvent?: GameEventListener
): EngineState {
  if (state.gameState.isPaused) {
    return { ...state, lastTimestamp: timestamp };
  }

  // Calculate delta time
  const deltaTime = state.lastTimestamp === 0 ? 0.016 : (timestamp - state.lastTimestamp) / 1000;
  const clampedDelta = Math.min(deltaTime, 0.1); // Prevent huge jumps

  let newState = { ...state };

  // Store previous position for wall collision detection
  newState.previousPlayerPosition = { ...state.player.position };

  // Update timer
  newState.gameState = {
    ...newState.gameState,
    timeRemaining: Math.max(0, state.gameState.timeRemaining - clampedDelta),
  };

  // Check for game over conditions
  if (newState.gameState.timeRemaining <= 0) {
    newState.gameState.screen = 'gameOver';
    onEvent?.({ type: 'GAME_OVER', reason: 'timeout' });
    playGameOverSound();
    return { ...newState, lastTimestamp: timestamp };
  }

  // Handle Marco call
  if (keys.space && canCallMarco(state.player, state.gameState.marcoCallsRemaining)) {
    newState = handleMarcoCall(newState, timestamp, onEvent);
  }

  // Update player
  newState.player = updatePlayer(
    newState.player,
    keys,
    newState.config,
    clampedDelta,
    timestamp
  );

  // Check wall collision for sound
  const wasInBounds = isInBounds(state.previousPlayerPosition, state.player.radius);
  const isNowAtEdge = !isInBounds(newState.player.position, newState.player.radius);
  if (wasInBounds && isNowAtEdge) {
    playBumpSound();
    onEvent?.({ type: 'WALL_COLLISION', position: newState.player.position });
    // Deduct points for wall bump
    newState.gameState.score = Math.max(0, newState.gameState.score - SCORING.wallPenalty);
  }

  // Update fish
  newState.fish = newState.fish.map((fish) =>
    updateFish(fish, newState.player.position, newState.config, clampedDelta, timestamp)
  );

  // Check for fish catches
  newState = checkFishCatches(newState, timestamp, onEvent);

  // Check for all fish caught
  const activeFish = newState.fish.filter((f) => !f.isCaught);
  if (activeFish.length === 0) {
    newState.gameState.screen = 'gameOver';
    onEvent?.({ type: 'GAME_OVER', reason: 'allCaught' });
    playVictorySound();
    return { ...newState, lastTimestamp: timestamp };
  }

  // Update effects
  newState.effects = updateEffects(newState.effects, clampedDelta, timestamp);

  // Add movement ripples occasionally
  const playerSpeed = Math.sqrt(
    newState.player.velocity.x ** 2 + newState.player.velocity.y ** 2
  );
  if (playerSpeed > 50 && Math.random() < 0.1) {
    newState.effects = addRipple(newState.effects, newState.player.position, timestamp);
  }

  // Update combo timeout
  if (timestamp - newState.lastCatchTime > SCORING.comboDuration) {
    newState.comboCount = 0;
  }

  newState.lastTimestamp = timestamp;

  return newState;
}

/**
 * Check if position is within game bounds
 */
function isInBounds(position: Vector2D, radius: number): boolean {
  const padding = 10;
  return (
    position.x - radius >= padding &&
    position.x + radius <= CANVAS_WIDTH - padding &&
    position.y - radius >= padding &&
    position.y + radius <= CANVAS_HEIGHT - padding
  );
}

/**
 * Handle Marco call action
 */
function handleMarcoCall(
  state: EngineState,
  timestamp: number,
  onEvent?: GameEventListener
): EngineState {
  resumeAudio();
  playMarcoSound();

  const newPlayer = triggerMarcoCall(state.player, state.config, timestamp);

  // Add sound wave effect
  let newEffects = addSoundWave(
    state.effects,
    state.player.position,
    state.config.marcoWaveRadius,
    timestamp
  );

  // Find fish in range and trigger their response
  const fishInRange = getFishInRadius(
    state.fish,
    state.player.position,
    state.config.marcoWaveRadius
  );

  // Trigger polo responses with staggered timing
  const newFish = state.fish.map((fish) => {
    if (fishInRange.includes(fish)) {
      return triggerPoloResponse(fish, state.player.position, state.config, timestamp);
    }
    return fish;
  });

  // Add polo bubbles for fish in range (with delays for visual effect)
  fishInRange.forEach((_fish, index) => {
    const delay = 200 + index * 100; // Stagger responses
    setTimeout(() => {
      playPoloSound();
    }, delay);
  });

  // Schedule polo bubble effects
  const fishWithBubbles = fishInRange.map((fish) => fish.id);

  // Add bubbles for responding fish
  for (const fish of fishInRange) {
    newEffects = addPoloBubble(newEffects, fish.position, timestamp);
    onEvent?.({ type: 'POLO_RESPONSE', fishId: fish.id, position: fish.position });
  }

  // Schedule fleeing behavior after response
  const updatedFish = newFish.map((fish) => {
    if (fishWithBubbles.includes(fish.id)) {
      // Will start fleeing after brief response animation
      return {
        ...fish,
        behaviorTimer: 500, // Brief pause then flee
      };
    }
    return fish;
  });

  onEvent?.({ type: 'MARCO_CALLED', position: state.player.position });

  return {
    ...state,
    player: newPlayer,
    fish: updatedFish,
    effects: newEffects,
    gameState: {
      ...state.gameState,
      marcoCallsRemaining: state.gameState.marcoCallsRemaining - 1,
    },
  };
}

/**
 * Check for fish catches
 */
function checkFishCatches(
  state: EngineState,
  timestamp: number,
  onEvent?: GameEventListener
): EngineState {
  let newState = { ...state };

  newState.fish = state.fish.map((fish) => {
    if (fish.isCaught) return fish;

    if (checkPlayerFishCollision(state.player, fish)) {
      resumeAudio();
      playCatchSound();

      // Calculate points with combo
      const basePoints = getFishPoints(fish);
      const comboMultiplier = Math.min(
        1 + newState.comboCount * SCORING.comboMultiplier,
        SCORING.maxComboMultiplier
      );
      const timeBonus =
        (state.gameState.timeRemaining / state.config.gameDuration) *
        SCORING.speedBonusMultiplier;
      const points = Math.floor(basePoints * comboMultiplier * (1 + timeBonus));

      newState.gameState = {
        ...newState.gameState,
        score: newState.gameState.score + points,
        fishCaught: newState.gameState.fishCaught + 1,
      };

      newState.comboCount += 1;
      newState.lastCatchTime = timestamp;

      // Add catch effects
      newState.effects = addCatchParticles(newState.effects, fish.position);
      newState.effects = addRipple(newState.effects, fish.position, timestamp);
      newState.effects = addScorePopup(newState.effects, fish.position, points, timestamp);

      onEvent?.({ type: 'FISH_CAUGHT', fishId: fish.id, points });
      onEvent?.({ type: 'SCORE_UPDATED', newScore: newState.gameState.score });

      return catchFish(fish);
    }

    return fish;
  });

  return newState;
}

/**
 * Set pause state
 */
export function setPaused(state: EngineState, paused: boolean): EngineState {
  return {
    ...state,
    gameState: {
      ...state.gameState,
      isPaused: paused,
    },
  };
}

/**
 * Render the current game state
 */
export function renderEngine(
  ctx: CanvasRenderingContext2D,
  state: EngineState,
  timestamp: number
): void {
  // Clear and draw background
  clearCanvas(ctx);
  renderWaterBackground(ctx, timestamp);

  // Render fish (some may be hidden by fog)
  renderFishArray(
    ctx,
    state.fish,
    state.player.position,
    state.config.visionRadius,
    timestamp
  );

  // Render player
  renderPlayer(ctx, state.player, timestamp, state.player.isCalling);

  // Render fog of war
  renderFogOfWar(ctx, state.player.position, state.config.visionRadius);

  // Render effects (on top of fog for visibility)
  renderEffects(ctx, state.effects);

  // Render border
  renderBorder(ctx);
}

/**
 * Get current game statistics for HUD
 */
export function getGameStats(state: EngineState) {
  return {
    score: state.gameState.score,
    timeRemaining: state.gameState.timeRemaining,
    fishCaught: state.gameState.fishCaught,
    totalFish: state.gameState.totalFish,
    marcoCallsRemaining: state.gameState.marcoCallsRemaining,
    maxMarcoCalls: state.config.maxMarcoCalls,
    canCallMarco: canCallMarco(state.player, state.gameState.marcoCallsRemaining),
    cooldownProgress: state.player.callCooldownRemaining / state.config.marcoCooldown,
    comboCount: state.comboCount,
    difficulty: state.gameState.difficulty,
    isPaused: state.gameState.isPaused,
    isGameOver: state.gameState.screen === 'gameOver',
  };
}
