/**
 * Pac-Man 3D Game Constants
 */

import type { KeyBindings } from '../types/index.ts';
import type { Difficulty, DifficultyConfig } from '../types/threeGame.ts';

/** Ghost colors - classic Pac-Man style */
export const GHOST_COLORS = {
  blinky: '#ff0000', // Red - aggressive chaser
  pinky: '#ffb8ff',  // Pink - ambusher
  inky: '#00ffff',   // Cyan - unpredictable
  clyde: '#ffb852',  // Orange - random
} as const;

/** Frightened ghost color */
export const FRIGHTENED_COLOR = '#2121ff';

/** Pac-Man yellow */
export const PACMAN_COLOR = '#ffff00';

/** Pellet colors */
export const PELLET_COLOR = '#ffffa0';
export const POWER_PELLET_COLOR = '#ffaa00';

/** Difficulty configurations */
export const DIFFICULTY_CONFIGS: Record<Difficulty, DifficultyConfig> = {
  easy: {
    ghostCount: 2,
    ghostSpeed: 3.5,
    playerSpeed: 5.5,
    pelletCount: 60,
    powerPelletCount: 4,
    frightenedDuration: 10000,
    lives: 5,
    bounds: { x: 18, z: 18 },
    ghostSpawnDelay: 3000,
  },
  medium: {
    ghostCount: 3,
    ghostSpeed: 4.5,
    playerSpeed: 6,
    pelletCount: 80,
    powerPelletCount: 4,
    frightenedDuration: 7000,
    lives: 3,
    bounds: { x: 20, z: 20 },
    ghostSpawnDelay: 2000,
  },
  hard: {
    ghostCount: 4,
    ghostSpeed: 5.5,
    playerSpeed: 6.5,
    pelletCount: 100,
    powerPelletCount: 4,
    frightenedDuration: 5000,
    lives: 3,
    bounds: { x: 22, z: 22 },
    ghostSpawnDelay: 1000,
  },
} as const;

/** Scoring */
export const SCORES = {
  pellet: 10,
  powerPellet: 50,
  ghost: 200,       // Base score, doubles for each ghost eaten in sequence
  levelComplete: 1000,
} as const;

/** Key bindings */
export const DEFAULT_KEY_BINDINGS: KeyBindings = {
  up: ['ArrowUp', 'KeyW'],
  down: ['ArrowDown', 'KeyS'],
  left: ['ArrowLeft', 'KeyA'],
  right: ['ArrowRight', 'KeyD'],
  pause: ['Escape', 'KeyP'],
  confirm: ['Enter', 'Space'],
} as const;
