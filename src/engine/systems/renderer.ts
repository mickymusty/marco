/**
 * Rendering System
 * Handles all drawing operations on the canvas
 */

import type {
  PlayerState,
  FishState,
  Effects,
  Vector2D,
} from '../../types/index.ts';
import {
  COLORS,
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  ANIMATION,
  EFFECTS as EFFECT_CONFIG,
} from '../../constants/index.ts';

/**
 * Clear the canvas
 */
export function clearCanvas(ctx: CanvasRenderingContext2D): void {
  ctx.fillStyle = COLORS.waterDeep;
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
}

/**
 * Render water background with shimmer effect
 */
export function renderWaterBackground(
  ctx: CanvasRenderingContext2D,
  timestamp: number
): void {
  // Base gradient
  const gradient = ctx.createRadialGradient(
    CANVAS_WIDTH / 2,
    CANVAS_HEIGHT / 2,
    0,
    CANVAS_WIDTH / 2,
    CANVAS_HEIGHT / 2,
    CANVAS_WIDTH * 0.7
  );
  gradient.addColorStop(0, COLORS.waterMedium);
  gradient.addColorStop(0.5, COLORS.waterDeep);
  gradient.addColorStop(1, COLORS.waterDeep);

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  // Subtle wave lines
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
  ctx.lineWidth = 2;

  const waveOffset = (timestamp * 0.02) % 50;
  for (let y = -50 + waveOffset; y < CANVAS_HEIGHT + 50; y += 50) {
    ctx.beginPath();
    for (let x = 0; x <= CANVAS_WIDTH; x += 10) {
      const waveY = y + Math.sin((x + timestamp * 0.05) * 0.02) * 5;
      if (x === 0) {
        ctx.moveTo(x, waveY);
      } else {
        ctx.lineTo(x, waveY);
      }
    }
    ctx.stroke();
  }
}

/**
 * Render the player (Marco)
 */
export function renderPlayer(
  ctx: CanvasRenderingContext2D,
  player: PlayerState,
  timestamp: number,
  isCalling: boolean
): void {
  const { position, radius, facingAngle } = player;

  // Bobbing animation
  const bobOffset =
    Math.sin(timestamp * 0.001 * ANIMATION.playerBob.frequency * Math.PI * 2) *
    ANIMATION.playerBob.amplitude;

  const drawY = position.y + bobOffset;

  ctx.save();
  ctx.translate(position.x, drawY);
  ctx.rotate(facingAngle);

  // Glow effect when calling Marco
  if (isCalling) {
    const pulseScale = 1 + Math.sin(timestamp * 0.02) * 0.2;
    const glowGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, radius * 2.5 * pulseScale);
    glowGradient.addColorStop(0, 'rgba(255, 220, 100, 0.4)');
    glowGradient.addColorStop(0.5, 'rgba(255, 200, 50, 0.2)');
    glowGradient.addColorStop(1, 'rgba(255, 200, 50, 0)');
    ctx.fillStyle = glowGradient;
    ctx.beginPath();
    ctx.arc(0, 0, radius * 2.5 * pulseScale, 0, Math.PI * 2);
    ctx.fill();
  }

  // Body (swimming person shape)
  ctx.fillStyle = COLORS.playerBody;

  // Head
  ctx.beginPath();
  ctx.arc(radius * 0.3, 0, radius * 0.5, 0, Math.PI * 2);
  ctx.fill();

  // Body
  ctx.beginPath();
  ctx.ellipse(-radius * 0.2, 0, radius * 0.7, radius * 0.4, 0, 0, Math.PI * 2);
  ctx.fill();

  // Arms (swimming motion)
  const armAngle = Math.sin(timestamp * 0.01) * 0.3;
  ctx.strokeStyle = COLORS.playerBody;
  ctx.lineWidth = 4;
  ctx.lineCap = 'round';

  // Left arm
  ctx.beginPath();
  ctx.moveTo(-radius * 0.1, -radius * 0.3);
  ctx.lineTo(-radius * 0.6, -radius * 0.5 + Math.sin(armAngle) * 10);
  ctx.stroke();

  // Right arm
  ctx.beginPath();
  ctx.moveTo(-radius * 0.1, radius * 0.3);
  ctx.lineTo(-radius * 0.6, radius * 0.5 - Math.sin(armAngle) * 10);
  ctx.stroke();

  // Blindfold
  ctx.fillStyle = COLORS.playerBlindfold;
  ctx.beginPath();
  ctx.ellipse(radius * 0.35, 0, radius * 0.25, radius * 0.15, 0, 0, Math.PI * 2);
  ctx.fill();

  // "MARCO" text when calling
  if (isCalling) {
    ctx.restore();
    ctx.save();
    ctx.translate(position.x, drawY - radius - 25);
    ctx.font = 'bold 20px Arial';
    ctx.fillStyle = COLORS.uiAccent;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Text outline for visibility
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.lineWidth = 3;
    ctx.strokeText('MARCO!', 0, 0);
    ctx.fillText('MARCO!', 0, 0);
  }

  ctx.restore();
}

/**
 * Render a fish
 */
export function renderFish(
  ctx: CanvasRenderingContext2D,
  fish: FishState,
  timestamp: number,
  isVisible: boolean
): void {
  if (fish.isCaught) return;

  const { position, radius, color, velocity } = fish;

  // Calculate facing direction from velocity
  let facingAngle = 0;
  if (Math.abs(velocity.x) > 0.1 || Math.abs(velocity.y) > 0.1) {
    facingAngle = Math.atan2(velocity.y, velocity.x);
  }

  // Tail wag animation - faster when fleeing
  const isFleeing = fish.currentBehavior === 'fleeing';
  const tailSpeed = isFleeing ? ANIMATION.fishSwim.tailWagSpeed * 2 : ANIMATION.fishSwim.tailWagSpeed;
  const tailWag =
    Math.sin(timestamp * tailSpeed * 0.01) *
    ANIMATION.fishSwim.tailWagAmplitude;

  ctx.save();
  ctx.translate(position.x, position.y);
  ctx.rotate(facingAngle);

  // Fish opacity based on visibility
  const opacity = isVisible || fish.isRevealed ? 1 : 0;
  ctx.globalAlpha = opacity;

  // Revealed glow - pulsing effect
  if (fish.isRevealed) {
    const pulseIntensity = 0.3 + Math.sin(timestamp * 0.01) * 0.15;
    const glowGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, radius * 2.5);
    glowGradient.addColorStop(0, `rgba(255, 255, 100, ${pulseIntensity})`);
    glowGradient.addColorStop(0.5, `rgba(255, 200, 50, ${pulseIntensity * 0.5})`);
    glowGradient.addColorStop(1, 'rgba(255, 200, 50, 0)');
    ctx.fillStyle = glowGradient;
    ctx.beginPath();
    ctx.arc(0, 0, radius * 2.5, 0, Math.PI * 2);
    ctx.fill();
  }

  // Fish body
  ctx.fillStyle = color;

  // Main body (ellipse)
  ctx.beginPath();
  ctx.ellipse(0, 0, radius, radius * 0.6, 0, 0, Math.PI * 2);
  ctx.fill();

  // Tail
  ctx.save();
  ctx.translate(-radius * 0.8, 0);
  ctx.rotate(tailWag);
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(-radius * 0.6, -radius * 0.5);
  ctx.lineTo(-radius * 0.6, radius * 0.5);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  // Dorsal fin
  ctx.beginPath();
  ctx.moveTo(-radius * 0.2, -radius * 0.5);
  ctx.lineTo(radius * 0.1, -radius * 0.8);
  ctx.lineTo(radius * 0.3, -radius * 0.5);
  ctx.closePath();
  ctx.fill();

  // Eye
  ctx.fillStyle = 'white';
  ctx.beginPath();
  ctx.arc(radius * 0.4, -radius * 0.1, radius * 0.2, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = 'black';
  ctx.beginPath();
  ctx.arc(radius * 0.45, -radius * 0.1, radius * 0.1, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

/**
 * Render all fish
 */
export function renderFishArray(
  ctx: CanvasRenderingContext2D,
  fishArray: FishState[],
  playerPosition: Vector2D,
  visionRadius: number,
  timestamp: number
): void {
  for (const fish of fishArray) {
    // Check if fish is within player's vision
    const dx = fish.position.x - playerPosition.x;
    const dy = fish.position.y - playerPosition.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const isVisible = distance <= visionRadius;

    renderFish(ctx, fish, timestamp, isVisible || fish.isRevealed);
  }
}

/**
 * Render fog of war (limited visibility)
 */
export function renderFogOfWar(
  ctx: CanvasRenderingContext2D,
  playerPosition: Vector2D,
  visionRadius: number
): void {
  ctx.save();

  // Create a radial gradient for the visibility area
  const gradient = ctx.createRadialGradient(
    playerPosition.x,
    playerPosition.y,
    visionRadius * 0.6,
    playerPosition.x,
    playerPosition.y,
    visionRadius
  );
  gradient.addColorStop(0, 'rgba(10, 22, 40, 0)');
  gradient.addColorStop(0.7, 'rgba(10, 22, 40, 0.7)');
  gradient.addColorStop(1, 'rgba(10, 22, 40, 0.95)');

  // Draw fog everywhere except visibility circle
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  // Additional outer fog
  ctx.fillStyle = COLORS.fogColor;

  // Top
  ctx.fillRect(0, 0, CANVAS_WIDTH, Math.max(0, playerPosition.y - visionRadius));
  // Bottom
  ctx.fillRect(
    0,
    Math.min(CANVAS_HEIGHT, playerPosition.y + visionRadius),
    CANVAS_WIDTH,
    CANVAS_HEIGHT
  );
  // Left
  ctx.fillRect(
    0,
    playerPosition.y - visionRadius,
    Math.max(0, playerPosition.x - visionRadius),
    visionRadius * 2
  );
  // Right
  ctx.fillRect(
    Math.min(CANVAS_WIDTH, playerPosition.x + visionRadius),
    playerPosition.y - visionRadius,
    CANVAS_WIDTH,
    visionRadius * 2
  );

  ctx.restore();
}

/**
 * Render sound waves from Marco call
 */
export function renderSoundWaves(
  ctx: CanvasRenderingContext2D,
  effects: Effects
): void {
  for (const wave of effects.soundWaves) {
    ctx.save();
    ctx.strokeStyle = `rgba(255, 255, 255, ${wave.opacity * 0.6})`;
    ctx.lineWidth = EFFECT_CONFIG.soundWave.lineWidth;
    ctx.setLineDash([10, 10]);

    ctx.beginPath();
    ctx.arc(wave.origin.x, wave.origin.y, wave.currentRadius, 0, Math.PI * 2);
    ctx.stroke();

    // Inner ring
    ctx.strokeStyle = `rgba(255, 220, 100, ${wave.opacity * 0.4})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(wave.origin.x, wave.origin.y, wave.currentRadius * 0.95, 0, Math.PI * 2);
    ctx.stroke();

    ctx.restore();
  }
}

/**
 * Render polo bubbles
 */
export function renderPoloBubbles(
  ctx: CanvasRenderingContext2D,
  effects: Effects
): void {
  for (const bubble of effects.poloBubbles) {
    ctx.save();
    ctx.globalAlpha = bubble.opacity;

    const x = bubble.position.x;
    const y = bubble.position.y + bubble.offsetY - 30;

    // Bubble background
    ctx.fillStyle = COLORS.poloBubble;
    const textWidth = ctx.measureText(bubble.text).width || 50;
    const padding = 8;

    // Rounded rect
    const rectX = x - textWidth / 2 - padding;
    const rectY = y - 12;
    const rectW = textWidth + padding * 2;
    const rectH = 24;
    const radius = 12;

    ctx.beginPath();
    ctx.moveTo(rectX + radius, rectY);
    ctx.lineTo(rectX + rectW - radius, rectY);
    ctx.quadraticCurveTo(rectX + rectW, rectY, rectX + rectW, rectY + radius);
    ctx.lineTo(rectX + rectW, rectY + rectH - radius);
    ctx.quadraticCurveTo(rectX + rectW, rectY + rectH, rectX + rectW - radius, rectY + rectH);
    ctx.lineTo(rectX + radius, rectY + rectH);
    ctx.quadraticCurveTo(rectX, rectY + rectH, rectX, rectY + rectH - radius);
    ctx.lineTo(rectX, rectY + radius);
    ctx.quadraticCurveTo(rectX, rectY, rectX + radius, rectY);
    ctx.closePath();
    ctx.fill();

    // Text
    ctx.fillStyle = COLORS.waterDeep;
    ctx.font = `bold ${EFFECT_CONFIG.poloBubble.fontSize}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(bubble.text, x, y);

    ctx.restore();
  }
}

/**
 * Render particles
 */
export function renderParticles(
  ctx: CanvasRenderingContext2D,
  effects: Effects
): void {
  for (const particle of effects.particles) {
    ctx.save();
    ctx.globalAlpha = particle.life;
    ctx.fillStyle = particle.color;
    ctx.beginPath();
    ctx.arc(
      particle.position.x,
      particle.position.y,
      particle.size,
      0,
      Math.PI * 2
    );
    ctx.fill();
    ctx.restore();
  }
}

/**
 * Render ripples
 */
export function renderRipples(
  ctx: CanvasRenderingContext2D,
  effects: Effects
): void {
  for (const ripple of effects.ripples) {
    ctx.save();
    ctx.strokeStyle = `rgba(255, 255, 255, ${ripple.opacity})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(ripple.position.x, ripple.position.y, ripple.radius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }
}

/**
 * Render score popups
 */
export function renderScorePopups(
  ctx: CanvasRenderingContext2D,
  effects: Effects
): void {
  for (const popup of effects.scorePopups) {
    ctx.save();
    ctx.globalAlpha = popup.opacity;

    const x = popup.position.x;
    const y = popup.position.y + popup.offsetY;

    // Scale animation
    ctx.translate(x, y);
    ctx.scale(popup.scale, popup.scale);

    // Draw score text with glow
    const text = `+${popup.points}`;
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Glow effect
    ctx.shadowColor = '#ffd700';
    ctx.shadowBlur = 10;

    // Outline
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.lineWidth = 4;
    ctx.strokeText(text, 0, 0);

    // Fill with gold color
    ctx.fillStyle = '#ffd700';
    ctx.fillText(text, 0, 0);

    ctx.restore();
  }
}

/**
 * Render all effects
 */
export function renderEffects(
  ctx: CanvasRenderingContext2D,
  effects: Effects
): void {
  renderRipples(ctx, effects);
  renderSoundWaves(ctx, effects);
  renderParticles(ctx, effects);
  renderPoloBubbles(ctx, effects);
  renderScorePopups(ctx, effects);
}

/**
 * Render game border
 */
export function renderBorder(ctx: CanvasRenderingContext2D): void {
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
  ctx.lineWidth = 4;
  ctx.strokeRect(2, 2, CANVAS_WIDTH - 4, CANVAS_HEIGHT - 4);

  // Corner decorations
  const cornerSize = 20;
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
  ctx.lineWidth = 3;

  // Top-left
  ctx.beginPath();
  ctx.moveTo(0, cornerSize);
  ctx.lineTo(0, 0);
  ctx.lineTo(cornerSize, 0);
  ctx.stroke();

  // Top-right
  ctx.beginPath();
  ctx.moveTo(CANVAS_WIDTH - cornerSize, 0);
  ctx.lineTo(CANVAS_WIDTH, 0);
  ctx.lineTo(CANVAS_WIDTH, cornerSize);
  ctx.stroke();

  // Bottom-left
  ctx.beginPath();
  ctx.moveTo(0, CANVAS_HEIGHT - cornerSize);
  ctx.lineTo(0, CANVAS_HEIGHT);
  ctx.lineTo(cornerSize, CANVAS_HEIGHT);
  ctx.stroke();

  // Bottom-right
  ctx.beginPath();
  ctx.moveTo(CANVAS_WIDTH - cornerSize, CANVAS_HEIGHT);
  ctx.lineTo(CANVAS_WIDTH, CANVAS_HEIGHT);
  ctx.lineTo(CANVAS_WIDTH, CANVAS_HEIGHT - cornerSize);
  ctx.stroke();
}
