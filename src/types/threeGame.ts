import type { RefObject } from 'react';
import type { Group, Mesh, Vector3 } from 'three';

export type Difficulty = 'easy' | 'medium' | 'hard';

export type GameStatus = 'ready' | 'playing' | 'paused' | 'won' | 'lost';

export type GhostMode = 'scatter' | 'chase' | 'frightened' | 'eaten';

export interface Bounds3D {
  x: number;
  z: number;
  y?: number;
}

export interface DifficultyConfig {
  ghostCount: number;
  ghostSpeed: number;
  playerSpeed: number;
  pelletCount: number;
  powerPelletCount: number;
  frightenedDuration: number;
  lives: number;
  bounds: Bounds3D;
  ghostSpawnDelay: number;
}

export interface PacmanState {
  position: Vector3;
  velocity: Vector3;
  speed: number;
  radius: number;
  mouthAngle: number;
  mouthOpen: boolean;
  isPoweredUp: boolean;
  powerUpEndTime: number;
  mesh?: RefObject<Mesh | null>;
}

export interface PelletState {
  id: string;
  position: Vector3;
  isEaten: boolean;
  mesh?: RefObject<Mesh | null>;
}

export interface PowerPelletState {
  id: string;
  position: Vector3;
  isEaten: boolean;
  mesh?: RefObject<Mesh | null>;
}

export interface GhostState {
  id: string;
  position: Vector3;
  velocity: Vector3;
  speed: number;
  baseSpeed: number;
  radius: number;
  color: string;
  mode: GhostMode;
  directionTimer: number;
  spawnDelay: number;
  isActive: boolean;
  group?: RefObject<Group | null>;
}
