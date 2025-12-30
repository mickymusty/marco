/**
 * Visual Effects System
 * Manages all visual effects in the game
 */

import type {
  Effects,
  SoundWave,
  PoloBubble,
  Particle,
  Ripple,
  ScorePopup,
  Vector2D,
} from '../../types/index.ts';
import { EFFECTS, COLORS } from '../../constants/index.ts';
import {
  generateId,
  randomRange,
  randomAngle,
  vecFromAngle,
  randomElement,
} from '../../utils/math.ts';

/**
 * Create empty effects state
 */
export function createEffects(): Effects {
  return {
    soundWaves: [],
    poloBubbles: [],
    particles: [],
    ripples: [],
    scorePopups: [],
  };
}

/**
 * Create a new sound wave from Marco call
 */
export function createSoundWave(
  origin: Vector2D,
  maxRadius: number,
  timestamp: number
): SoundWave {
  return {
    id: generateId(),
    origin: { ...origin },
    currentRadius: 0,
    maxRadius,
    opacity: 0.8,
    color: COLORS.waveColor,
    startTime: timestamp,
  };
}

/**
 * Create a Polo bubble (fish response)
 */
export function createPoloBubble(
  position: Vector2D,
  timestamp: number
): PoloBubble {
  return {
    id: generateId(),
    position: { ...position },
    text: 'POLO!',
    opacity: 1,
    offsetY: 0,
    startTime: timestamp,
  };
}

/**
 * Create particles for catch effect
 */
export function createCatchParticles(position: Vector2D): Particle[] {
  const particles: Particle[] = [];
  const count = Math.floor(
    randomRange(EFFECTS.particle.count.min, EFFECTS.particle.count.max)
  );

  for (let i = 0; i < count; i++) {
    const angle = randomAngle();
    const speed = randomRange(EFFECTS.particle.speed.min, EFFECTS.particle.speed.max);
    const velocity = vecFromAngle(angle, speed);

    particles.push({
      id: generateId(),
      position: { ...position },
      velocity,
      color: randomElement([...COLORS.particleColors]),
      size: randomRange(EFFECTS.particle.size.min, EFFECTS.particle.size.max),
      life: 1,
      decay: randomRange(EFFECTS.particle.decay.min, EFFECTS.particle.decay.max),
    });
  }

  return particles;
}

/**
 * Create ripple effect
 */
export function createRipple(position: Vector2D, timestamp: number): Ripple {
  return {
    id: generateId(),
    position: { ...position },
    radius: 5,
    maxRadius: EFFECTS.ripple.maxRadius,
    opacity: 0.6,
    startTime: timestamp,
  };
}

/**
 * Update all effects
 */
export function updateEffects(
  effects: Effects,
  deltaTime: number,
  timestamp: number
): Effects {
  return {
    soundWaves: updateSoundWaves(effects.soundWaves, deltaTime),
    poloBubbles: updatePoloBubbles(effects.poloBubbles, deltaTime, timestamp),
    particles: updateParticles(effects.particles, deltaTime),
    ripples: updateRipples(effects.ripples, deltaTime, timestamp),
    scorePopups: updateScorePopups(effects.scorePopups, deltaTime, timestamp),
  };
}

/**
 * Update sound waves
 */
function updateSoundWaves(waves: SoundWave[], deltaTime: number): SoundWave[] {
  return waves
    .map((wave) => {
      const newRadius = wave.currentRadius + EFFECTS.soundWave.expansionSpeed * deltaTime;
      const progress = newRadius / wave.maxRadius;

      // Calculate opacity (fade out near the end)
      let opacity = wave.opacity;
      if (progress > EFFECTS.soundWave.fadeStartPercent) {
        const fadeProgress =
          (progress - EFFECTS.soundWave.fadeStartPercent) /
          (1 - EFFECTS.soundWave.fadeStartPercent);
        opacity = wave.opacity * (1 - fadeProgress);
      }

      return {
        ...wave,
        currentRadius: newRadius,
        opacity,
      };
    })
    .filter((wave) => wave.currentRadius < wave.maxRadius);
}

/**
 * Update polo bubbles
 */
function updatePoloBubbles(
  bubbles: PoloBubble[],
  deltaTime: number,
  timestamp: number
): PoloBubble[] {
  return bubbles
    .map((bubble) => {
      const elapsed = timestamp - bubble.startTime;
      const progress = elapsed / EFFECTS.poloBubble.duration;

      return {
        ...bubble,
        offsetY: bubble.offsetY - EFFECTS.poloBubble.floatSpeed * deltaTime,
        opacity: 1 - progress,
      };
    })
    .filter((bubble) => {
      const elapsed = timestamp - bubble.startTime;
      return elapsed < EFFECTS.poloBubble.duration;
    });
}

/**
 * Update particles
 */
function updateParticles(particles: Particle[], deltaTime: number): Particle[] {
  return particles
    .map((particle) => {
      // Apply gravity
      const gravity = 200;
      const newVelocity = {
        x: particle.velocity.x * 0.99,
        y: particle.velocity.y + gravity * deltaTime,
      };

      return {
        ...particle,
        position: {
          x: particle.position.x + particle.velocity.x * deltaTime,
          y: particle.position.y + particle.velocity.y * deltaTime,
        },
        velocity: newVelocity,
        life: particle.life - particle.decay * deltaTime,
        size: particle.size * (0.98 + particle.life * 0.02),
      };
    })
    .filter((particle) => particle.life > 0);
}

/**
 * Update ripples
 */
function updateRipples(
  ripples: Ripple[],
  deltaTime: number,
  timestamp: number
): Ripple[] {
  return ripples
    .map((ripple) => {
      const elapsed = timestamp - ripple.startTime;
      const progress = elapsed / EFFECTS.ripple.duration;

      return {
        ...ripple,
        radius: ripple.radius + EFFECTS.ripple.expansionSpeed * deltaTime,
        opacity: 0.6 * (1 - progress),
      };
    })
    .filter((ripple) => {
      const elapsed = timestamp - ripple.startTime;
      return elapsed < EFFECTS.ripple.duration;
    });
}

/**
 * Create score popup
 */
export function createScorePopup(
  position: Vector2D,
  points: number,
  timestamp: number
): ScorePopup {
  return {
    id: generateId(),
    position: { ...position },
    points,
    opacity: 1,
    offsetY: 0,
    scale: 1.5, // Start bigger for pop effect
    startTime: timestamp,
  };
}

/**
 * Update score popups
 */
function updateScorePopups(
  popups: ScorePopup[],
  _deltaTime: number,
  timestamp: number
): ScorePopup[] {
  const duration = 1200; // ms
  return popups
    .map((popup) => {
      const elapsed = timestamp - popup.startTime;
      const progress = elapsed / duration;

      // Ease out for smooth animation
      const easeOut = 1 - Math.pow(1 - progress, 3);

      return {
        ...popup,
        offsetY: -60 * easeOut, // Float up
        opacity: 1 - progress,
        scale: 1.5 - 0.5 * easeOut, // Shrink slightly
      };
    })
    .filter((popup) => {
      const elapsed = timestamp - popup.startTime;
      return elapsed < duration;
    });
}

/**
 * Add sound wave to effects
 */
export function addSoundWave(
  effects: Effects,
  origin: Vector2D,
  maxRadius: number,
  timestamp: number
): Effects {
  return {
    ...effects,
    soundWaves: [...effects.soundWaves, createSoundWave(origin, maxRadius, timestamp)],
  };
}

/**
 * Add polo bubble to effects
 */
export function addPoloBubble(
  effects: Effects,
  position: Vector2D,
  timestamp: number
): Effects {
  return {
    ...effects,
    poloBubbles: [...effects.poloBubbles, createPoloBubble(position, timestamp)],
  };
}

/**
 * Add catch particles to effects
 */
export function addCatchParticles(effects: Effects, position: Vector2D): Effects {
  return {
    ...effects,
    particles: [...effects.particles, ...createCatchParticles(position)],
  };
}

/**
 * Add ripple to effects
 */
export function addRipple(
  effects: Effects,
  position: Vector2D,
  timestamp: number
): Effects {
  return {
    ...effects,
    ripples: [...effects.ripples, createRipple(position, timestamp)],
  };
}

/**
 * Add score popup to effects
 */
export function addScorePopup(
  effects: Effects,
  position: Vector2D,
  points: number,
  timestamp: number
): Effects {
  return {
    ...effects,
    scorePopups: [...effects.scorePopups, createScorePopup(position, points, timestamp)],
  };
}

