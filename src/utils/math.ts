/**
 * Math utilities for vector operations and game calculations
 */

import type { Vector2D, Circle, Bounds, EasingFunction } from '../types/index.ts';

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

/** Dot product of two vectors */
export function vecDot(a: Vector2D, b: Vector2D): number {
  return a.x * b.x + a.y * b.y;
}

/** Linear interpolation between two vectors */
export function vecLerp(a: Vector2D, b: Vector2D, t: number): Vector2D {
  return {
    x: a.x + (b.x - a.x) * t,
    y: a.y + (b.y - a.y) * t,
  };
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

/** Rotate vector by angle (radians) */
export function vecRotate(v: Vector2D, angle: number): Vector2D {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  return {
    x: v.x * cos - v.y * sin,
    y: v.x * sin + v.y * cos,
  };
}

/** Clamp vector magnitude to max value */
export function vecClampMagnitude(v: Vector2D, maxMag: number): Vector2D {
  const magSq = vecMagnitudeSq(v);
  if (magSq > maxMag * maxMag) {
    const mag = Math.sqrt(magSq);
    return vecScale(v, maxMag / mag);
  }
  return v;
}

/** Get perpendicular vector (90 degrees counterclockwise) */
export function vecPerpendicular(v: Vector2D): Vector2D {
  return { x: -v.y, y: v.x };
}

/** Reflect vector off surface with given normal */
export function vecReflect(v: Vector2D, normal: Vector2D): Vector2D {
  const dot = vecDot(v, normal);
  return vecSub(v, vecScale(normal, 2 * dot));
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

/** Check if point is inside circle */
export function pointInCircle(point: Vector2D, circle: Circle): boolean {
  const distSq = vecDistanceSq(point, { x: circle.x, y: circle.y });
  return distSq <= circle.radius * circle.radius;
}

/** Check if point is inside rectangle */
export function pointInRect(point: Vector2D, rect: Bounds): boolean {
  return (
    point.x >= rect.x &&
    point.x <= rect.x + rect.width &&
    point.y >= rect.y &&
    point.y <= rect.y + rect.height
  );
}

/** Check if circle is colliding with rectangle */
export function circleRectCollide(circle: Circle, rect: Bounds): boolean {
  // Find closest point on rectangle to circle center
  const closestX = clamp(circle.x, rect.x, rect.x + rect.width);
  const closestY = clamp(circle.y, rect.y, rect.y + rect.height);

  const distSq = vecDistanceSq(
    { x: circle.x, y: circle.y },
    { x: closestX, y: closestY }
  );

  return distSq <= circle.radius * circle.radius;
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

/** Map value from one range to another */
export function mapRange(
  value: number,
  inMin: number,
  inMax: number,
  outMin: number,
  outMax: number
): number {
  return ((value - inMin) / (inMax - inMin)) * (outMax - outMin) + outMin;
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

/** Check if value is approximately equal to target */
export function approxEqual(a: number, b: number, epsilon: number = 0.0001): boolean {
  return Math.abs(a - b) < epsilon;
}

/** Normalize angle to -PI to PI range */
export function normalizeAngle(angle: number): number {
  while (angle > Math.PI) angle -= Math.PI * 2;
  while (angle < -Math.PI) angle += Math.PI * 2;
  return angle;
}

/** Get shortest angle difference between two angles */
export function angleDifference(from: number, to: number): number {
  return normalizeAngle(to - from);
}

// ============================================================================
// Easing Functions
// ============================================================================

/** Linear easing (no easing) */
export const easeLinear: EasingFunction = (t) => t;

/** Ease in quadratic */
export const easeInQuad: EasingFunction = (t) => t * t;

/** Ease out quadratic */
export const easeOutQuad: EasingFunction = (t) => t * (2 - t);

/** Ease in-out quadratic */
export const easeInOutQuad: EasingFunction = (t) =>
  t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;

/** Ease out cubic */
export const easeOutCubic: EasingFunction = (t) => {
  const t1 = t - 1;
  return t1 * t1 * t1 + 1;
};

/** Ease out elastic */
export const easeOutElastic: EasingFunction = (t) => {
  if (t === 0 || t === 1) return t;
  return Math.pow(2, -10 * t) * Math.sin((t - 0.1) * 5 * Math.PI) + 1;
};

/** Ease out bounce */
export const easeOutBounce: EasingFunction = (t) => {
  if (t < 1 / 2.75) {
    return 7.5625 * t * t;
  } else if (t < 2 / 2.75) {
    const t1 = t - 1.5 / 2.75;
    return 7.5625 * t1 * t1 + 0.75;
  } else if (t < 2.5 / 2.75) {
    const t1 = t - 2.25 / 2.75;
    return 7.5625 * t1 * t1 + 0.9375;
  } else {
    const t1 = t - 2.625 / 2.75;
    return 7.5625 * t1 * t1 + 0.984375;
  }
};

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

/** Shuffle array in place (Fisher-Yates) */
export function shuffleArray<T>(array: T[]): T[] {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

/** Calculate smooth approach to target value */
export function smoothApproach(
  current: number,
  target: number,
  smoothness: number,
  deltaTime: number
): number {
  const factor = 1 - Math.pow(smoothness, deltaTime);
  return lerp(current, target, factor);
}
