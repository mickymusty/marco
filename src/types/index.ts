/**
 * Core type definitions for the Marco Polo game
 */

// ============================================================================
// Vector and Position Types
// ============================================================================

/** 2D Vector representing position or direction */
export interface Vector2D {
  x: number;
  y: number;
}

/** Rectangle bounds for collision detection and rendering */
export interface Bounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** Circle for collision detection */
export interface Circle {
  x: number;
  y: number;
  radius: number;
}

// ============================================================================
// Game State Types
// ============================================================================

/** Possible game screen states */
export type GameScreen = 'menu' | 'playing' | 'paused' | 'gameOver';

/** Game difficulty levels */
export type Difficulty = 'easy' | 'medium' | 'hard';

/** Main game state interface */
export interface GameState {
  screen: GameScreen;
  score: number;
  highScore: number;
  timeRemaining: number;
  fishCaught: number;
  totalFish: number;
  marcoCallsRemaining: number;
  difficulty: Difficulty;
  isPaused: boolean;
}

/** Game configuration based on difficulty */
export interface GameConfig {
  gameDuration: number;         // Total game time in seconds
  fishCount: number;            // Number of fish to catch
  playerSpeed: number;          // Player movement speed
  fishSpeed: number;            // Base fish movement speed
  visionRadius: number;         // Player's base vision radius
  marcoWaveRadius: number;      // How far the "Marco" call reaches
  marcoWaveDuration: number;    // How long fish are revealed (ms)
  marcoCooldown: number;        // Cooldown between Marco calls (ms)
  maxMarcoCalls: number;        // Maximum Marco calls per game
  fishFleeSpeed: number;        // Speed fish flee when Marco is called
  fishFleeDistance: number;     // How far fish flee from player
}

// ============================================================================
// Entity Types
// ============================================================================

/** Base entity interface for all game objects */
export interface Entity {
  id: string;
  position: Vector2D;
  velocity: Vector2D;
  radius: number;
  isActive: boolean;
}

/** Player entity state */
export interface PlayerState extends Entity {
  isCalling: boolean;           // Currently calling "Marco"
  callCooldownRemaining: number; // Time until next call available
  lastCallTime: number;         // Timestamp of last Marco call
  facingAngle: number;          // Direction player is facing (radians)
}

/** Fish entity state */
export interface FishState extends Entity {
  isCaught: boolean;
  isRevealed: boolean;          // Revealed by Marco call
  revealedUntil: number;        // Timestamp when reveal expires
  baseSpeed: number;
  currentBehavior: FishBehavior;
  behaviorTimer: number;        // Time until behavior change
  targetPosition: Vector2D | null;
  color: string;
  size: 'small' | 'medium' | 'large';
}

/** Fish AI behavior states */
export type FishBehavior = 'idle' | 'swimming' | 'fleeing' | 'responding';

// ============================================================================
// Visual Effect Types
// ============================================================================

/** Sound wave effect from Marco call */
export interface SoundWave {
  id: string;
  origin: Vector2D;
  currentRadius: number;
  maxRadius: number;
  opacity: number;
  color: string;
  startTime: number;
}

/** Polo response bubble from fish */
export interface PoloBubble {
  id: string;
  position: Vector2D;
  text: string;
  opacity: number;
  offsetY: number;              // Float up animation
  startTime: number;
}

/** Particle effect (splash, sparkle, etc.) */
export interface Particle {
  id: string;
  position: Vector2D;
  velocity: Vector2D;
  color: string;
  size: number;
  life: number;                 // 0-1, decreases over time
  decay: number;                // How fast life decreases
}

/** Ripple effect on water surface */
export interface Ripple {
  id: string;
  position: Vector2D;
  radius: number;
  maxRadius: number;
  opacity: number;
  startTime: number;
}

/** Collection of all active effects */
export interface Effects {
  soundWaves: SoundWave[];
  poloBubbles: PoloBubble[];
  particles: Particle[];
  ripples: Ripple[];
}

// ============================================================================
// Input Types
// ============================================================================

/** Keyboard input state */
export interface KeyboardState {
  up: boolean;
  down: boolean;
  left: boolean;
  right: boolean;
  space: boolean;               // Marco call
  escape: boolean;              // Pause
  enter: boolean;               // Confirm
}

/** Key bindings configuration */
export interface KeyBindings {
  up: string[];
  down: string[];
  left: string[];
  right: string[];
  marco: string[];
  pause: string[];
  confirm: string[];
}

// ============================================================================
// Rendering Types
// ============================================================================

/** Canvas rendering context wrapper */
export interface RenderContext {
  ctx: CanvasRenderingContext2D;
  width: number;
  height: number;
  deltaTime: number;
  timestamp: number;
}

/** Camera/viewport for rendering */
export interface Camera {
  x: number;
  y: number;
  zoom: number;
}

// ============================================================================
// Game Events
// ============================================================================

/** Events that can be emitted during gameplay */
export type GameEvent =
  | { type: 'FISH_CAUGHT'; fishId: string; points: number }
  | { type: 'MARCO_CALLED'; position: Vector2D }
  | { type: 'POLO_RESPONSE'; fishId: string; position: Vector2D }
  | { type: 'GAME_OVER'; reason: 'timeout' | 'allCaught' }
  | { type: 'WALL_COLLISION'; position: Vector2D }
  | { type: 'SCORE_UPDATED'; newScore: number };

/** Event listener callback type */
export type GameEventListener = (event: GameEvent) => void;

// ============================================================================
// High Score Types
// ============================================================================

/** High score entry */
export interface HighScoreEntry {
  score: number;
  fishCaught: number;
  difficulty: Difficulty;
  date: number;
}

// ============================================================================
// Animation Types
// ============================================================================

/** Animation frame data */
export interface AnimationFrame {
  frameIndex: number;
  totalFrames: number;
  frameDuration: number;
  elapsedTime: number;
}

/** Easing function type */
export type EasingFunction = (t: number) => number;
