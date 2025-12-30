/**
 * Math utilities for vector operations and game calculations
 */

import type { Vector2D, Circle } from '../types/index.ts';

// ============================================================================
// Vector Operations
// ============================================================================

/** Create a new vector */
export function vec(x: number, y: number): Vector2D {
  return { x, y };
}

/** Add two vectors */
export function vecAdd(a: Vector2D, b: Vector2D): Vector2D {
  return { x: a.x + b.x, y: a.y + b.y };
}

/** Subtract vector b from vector a */
export function vecSub(a: Vector2D, b: Vector2D): Vector2D {
  return { x: a.x - b.x, y: a.y - b.y };
}

/** Multiply vector by scalar */
export function vecScale(v: Vector2D, scalar: number): Vector2D {
  return { x: v.x * scalar, y: v.y * scalar };
}

/** Get vector magnitude (length) */
export function vecMagnitude(v: Vector2D): number {
  return Math.sqrt(v.x * v.x + v.y * v.y);
}

/** Get squared magnitude (faster, avoids sqrt) */
export function vecMagnitudeSq(v: Vector2D): number {
  return v.x * v.x + v.y * v.y;
}

/** Normalize vector to unit length */
export function vecNormalize(v: Vector2D): Vector2D {
  const mag = vecMagnitude(v);
  if (mag === 0) return { x: 0, y: 0 };
  return { x: v.x / mag, y: v.y / mag };
}

/** Calculate distance between two points */
export function vecDistance(a: Vector2D, b: Vector2D): number {
  return vecMagnitude(vecSub(b, a));
}

/** Calculate squared distance (faster) */
export function vecDistanceSq(a: Vector2D, b: Vector2D): number {
  return vecMagnitudeSq(vecSub(b, a));
}

/** Get angle of vector in radians */
export function vecAngle(v: Vector2D): number {
  return Math.atan2(v.y, v.x);
}

/** Create vector from angle and magnitude */
export function vecFromAngle(angle: number, magnitude: number = 1): Vector2D {
  return {
    x: Math.cos(angle) * magnitude,
    y: Math.sin(angle) * magnitude,
  };
}

// ============================================================================
// Collision Detection
// ============================================================================

/** Check if two circles are colliding */
export function circlesCollide(a: Circle, b: Circle): boolean {
  const distSq = vecDistanceSq({ x: a.x, y: a.y }, { x: b.x, y: b.y });
  const radiusSum = a.radius + b.radius;
  return distSq <= radiusSum * radiusSum;
}


// ============================================================================
// Number Utilities
// ============================================================================

/** Clamp value between min and max */
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/** Linear interpolation between two numbers */
export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/** Generate random number between min and max */
export function randomRange(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

/** Generate random integer between min and max (inclusive) */
export function randomInt(min: number, max: number): number {
  return Math.floor(randomRange(min, max + 1));
}

/** Generate random angle in radians (0 to 2*PI) */
export function randomAngle(): number {
  return Math.random() * Math.PI * 2;
}

// ============================================================================
// Utility Functions
// ============================================================================

/** Generate unique ID */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
}

/** Pick random element from array */
export function randomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

