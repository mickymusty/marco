/**
 * Game constants and configuration
 */

import type { GameConfig, Difficulty, KeyBindings } from '../types/index.ts';

// ============================================================================
// Canvas and Display
// ============================================================================

/** Default canvas dimensions */
export const CANVAS_WIDTH = 800;
export const CANVAS_HEIGHT = 600;

/** Colors used throughout the game */
export const COLORS = {
  // Water and environment
  waterDeep: '#0a1628',
  waterMedium: '#0f2847',
  waterLight: '#1a4a7a',
  waterSurface: '#2d6da8',

  // Player
  playerBody: '#ffcc00',
  playerBlindfold: '#333333',
  playerGlow: 'rgba(255, 204, 0, 0.3)',

  // Fish
  fishColors: [
    '#ff6b6b',  // Red
    '#4ecdc4',  // Teal
    '#45b7d1',  // Blue
    '#96ceb4',  // Green
    '#ffeaa7',  // Yellow
    '#dfe6e9',  // Silver
    '#fd79a8',  // Pink
    '#a29bfe',  // Purple
  ],

  // Effects
  waveColor: 'rgba(255, 255, 255, 0.5)',
  poloBubble: 'rgba(255, 255, 255, 0.9)',
  particleColors: ['#ffffff', '#87ceeb', '#add8e6', '#b0e0e6'],

  // UI
  uiBackground: 'rgba(0, 0, 0, 0.7)',
  uiText: '#ffffff',
  uiAccent: '#ffd700',
  uiDanger: '#ff4444',
  uiSuccess: '#44ff44',

  // Fog of war
  fogColor: 'rgba(10, 22, 40, 0.95)',
} as const;

// ============================================================================
// Game Configuration by Difficulty
// ============================================================================

export const DIFFICULTY_CONFIG: Record<Difficulty, GameConfig> = {
  easy: {
    gameDuration: 90,           // 1.5 minutes
    fishCount: 5,
    playerSpeed: 180,
    fishSpeed: 60,
    visionRadius: 120,
    marcoWaveRadius: 300,
    marcoWaveDuration: 2000,
    marcoCooldown: 2000,
    maxMarcoCalls: 15,
    fishFleeSpeed: 100,
    fishFleeDistance: 150,
  },
  medium: {
    gameDuration: 75,           // 1.25 minutes
    fishCount: 7,
    playerSpeed: 160,
    fishSpeed: 80,
    visionRadius: 100,
    marcoWaveRadius: 250,
    marcoWaveDuration: 1500,
    marcoCooldown: 2500,
    maxMarcoCalls: 12,
    fishFleeSpeed: 120,
    fishFleeDistance: 180,
  },
  hard: {
    gameDuration: 60,           // 1 minute
    fishCount: 10,
    playerSpeed: 140,
    fishSpeed: 100,
    visionRadius: 80,
    marcoWaveRadius: 200,
    marcoWaveDuration: 1000,
    marcoCooldown: 3000,
    maxMarcoCalls: 10,
    fishFleeSpeed: 150,
    fishFleeDistance: 220,
  },
} as const;

// ============================================================================
// Key Bindings
// ============================================================================

export const DEFAULT_KEY_BINDINGS: KeyBindings = {
  up: ['ArrowUp', 'KeyW'],
  down: ['ArrowDown', 'KeyS'],
  left: ['ArrowLeft', 'KeyA'],
  right: ['ArrowRight', 'KeyD'],
  marco: ['Space'],
  pause: ['Escape', 'KeyP'],
  confirm: ['Enter', 'Space'],
} as const;

// ============================================================================
// Entity Constants
// ============================================================================

/** Player configuration */
export const PLAYER = {
  radius: 20,
  startPosition: { x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT / 2 },
  collisionDamping: 0.5,        // Bounce back factor on wall collision
} as const;

/** Fish configuration */
export const FISH = {
  sizes: {
    small: { radius: 12, points: 150 },
    medium: { radius: 16, points: 100 },
    large: { radius: 22, points: 75 },
  },
  behaviorChangeInterval: { min: 1000, max: 3000 },  // ms
  swimDirectionChangeChance: 0.02,  // per frame
  idleChance: 0.3,                   // Chance to go idle when changing behavior
  wallAvoidanceDistance: 50,
  wallAvoidanceForce: 1.5,
} as const;

// ============================================================================
// Effect Constants
// ============================================================================

export const EFFECTS = {
  // Sound wave
  soundWave: {
    expansionSpeed: 400,        // pixels per second
    fadeStartPercent: 0.6,      // Start fading at 60% of max radius
    lineWidth: 3,
  },

  // Polo bubble
  poloBubble: {
    duration: 1500,             // ms
    floatSpeed: 30,             // pixels per second upward
    fontSize: 18,
  },

  // Particles
  particle: {
    count: { min: 5, max: 12 },
    speed: { min: 50, max: 150 },
    size: { min: 2, max: 6 },
    decay: { min: 0.5, max: 1.5 },
  },

  // Ripples
  ripple: {
    expansionSpeed: 80,
    maxRadius: 60,
    duration: 800,
  },
} as const;

// ============================================================================
// Animation Constants
// ============================================================================

export const ANIMATION = {
  playerBob: {
    amplitude: 2,               // pixels
    frequency: 2,               // Hz
  },
  fishSwim: {
    tailWagSpeed: 8,            // Hz
    tailWagAmplitude: 0.3,      // radians
  },
  waterShimmer: {
    frequency: 0.5,
    amplitude: 0.1,
  },
} as const;

// ============================================================================
// Scoring
// ============================================================================

export const SCORING = {
  basePointsPerFish: 100,
  speedBonusMultiplier: 2,      // Points multiplied by (timeRemaining / totalTime)
  comboMultiplier: 0.5,         // Each consecutive catch adds 50% bonus
  maxComboMultiplier: 3,        // Cap at 3x
  comboDuration: 5000,          // ms before combo resets
  wallPenalty: 10,              // Points lost for hitting wall
} as const;

// ============================================================================
// Local Storage Keys
// ============================================================================

export const STORAGE_KEYS = {
  highScore: 'marco_polo_high_score',
  highScores: 'marco_polo_high_scores',
  settings: 'marco_polo_settings',
} as const;

// ============================================================================
// Audio (Web Audio API frequencies for synthesized sounds)
// ============================================================================

export const AUDIO = {
  marcoCall: {
    frequency: 440,             // A4
    duration: 0.5,
    type: 'sine' as OscillatorType,
  },
  poloResponse: {
    frequency: 523,             // C5
    duration: 0.3,
    type: 'sine' as OscillatorType,
  },
  catch: {
    frequency: 880,             // A5
    duration: 0.2,
    type: 'square' as OscillatorType,
  },
  wallBump: {
    frequency: 150,
    duration: 0.1,
    type: 'sawtooth' as OscillatorType,
  },
} as const;

// ============================================================================
// Game Boundaries
// ============================================================================

export const BOUNDARY_PADDING = 10;  // Pixels from edge before wall collision

export const GAME_BOUNDS = {
  minX: BOUNDARY_PADDING,
  minY: BOUNDARY_PADDING,
  maxX: CANVAS_WIDTH - BOUNDARY_PADDING,
  maxY: CANVAS_HEIGHT - BOUNDARY_PADDING,
} as const;
