/**
 * General helper utilities
 */

import { STORAGE_KEYS } from '../constants/index.ts';
import type { HighScoreEntry, Difficulty } from '../types/index.ts';

// ============================================================================
// Time Formatting
// ============================================================================

/** Format seconds to MM:SS display */
export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/** Format milliseconds to seconds with decimal */
export function formatMs(ms: number): string {
  return (ms / 1000).toFixed(1);
}

// ============================================================================
// Local Storage
// ============================================================================

/** Get high score from local storage */
export function getHighScore(): number {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.highScore);
    return stored ? parseInt(stored, 10) : 0;
  } catch {
    return 0;
  }
}

/** Save high score to local storage */
export function saveHighScore(score: number): void {
  try {
    const current = getHighScore();
    if (score > current) {
      localStorage.setItem(STORAGE_KEYS.highScore, score.toString());
    }
  } catch {
    // Storage not available
  }
}

/** Get high scores list from local storage */
export function getHighScores(): HighScoreEntry[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.highScores);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

/** Save high score entry to list */
export function saveHighScoreEntry(entry: HighScoreEntry): void {
  try {
    const scores = getHighScores();
    scores.push(entry);
    // Keep top 10 scores
    scores.sort((a, b) => b.score - a.score);
    const topScores = scores.slice(0, 10);
    localStorage.setItem(STORAGE_KEYS.highScores, JSON.stringify(topScores));
  } catch {
    // Storage not available
  }
}

// ============================================================================
// Audio Utilities (Web Audio API)
// ============================================================================

/** Audio context singleton */
let audioContext: AudioContext | null = null;

/** Get or create audio context */
function getAudioContext(): AudioContext | null {
  if (!audioContext) {
    try {
      audioContext = new AudioContext();
    } catch {
      return null;
    }
  }
  return audioContext;
}

/** Resume audio context (needed after user interaction) */
export function resumeAudio(): void {
  const ctx = getAudioContext();
  if (ctx && ctx.state === 'suspended') {
    ctx.resume();
  }
}

/** Play a simple synthesized tone */
export function playTone(
  frequency: number,
  duration: number,
  type: OscillatorType = 'sine',
  volume: number = 0.3
): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);

    // Envelope for smooth sound
    gainNode.gain.setValueAtTime(0, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(volume, ctx.currentTime + 0.01);
    gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + duration);

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + duration);
  } catch {
    // Audio not available
  }
}

/** Play "Marco" call sound */
export function playMarcoSound(): void {
  playTone(440, 0.15, 'sine', 0.3);
  setTimeout(() => playTone(554, 0.15, 'sine', 0.3), 150);
  setTimeout(() => playTone(440, 0.2, 'sine', 0.25), 300);
}

/** Play "Polo" response sound */
export function playPoloSound(): void {
  playTone(523, 0.1, 'sine', 0.2);
  setTimeout(() => playTone(659, 0.15, 'sine', 0.2), 100);
}

/** Play catch sound */
export function playCatchSound(): void {
  playTone(523, 0.05, 'square', 0.2);
  playTone(659, 0.05, 'square', 0.2);
  setTimeout(() => playTone(784, 0.1, 'square', 0.2), 50);
  setTimeout(() => playTone(1047, 0.15, 'square', 0.15), 100);
}

/** Play wall bump sound */
export function playBumpSound(): void {
  playTone(150, 0.1, 'sawtooth', 0.15);
}

/** Play game over sound */
export function playGameOverSound(): void {
  playTone(392, 0.2, 'sine', 0.3);
  setTimeout(() => playTone(330, 0.2, 'sine', 0.3), 200);
  setTimeout(() => playTone(262, 0.4, 'sine', 0.3), 400);
}

/** Play victory sound */
export function playVictorySound(): void {
  playTone(523, 0.1, 'sine', 0.3);
  setTimeout(() => playTone(659, 0.1, 'sine', 0.3), 100);
  setTimeout(() => playTone(784, 0.1, 'sine', 0.3), 200);
  setTimeout(() => playTone(1047, 0.3, 'sine', 0.3), 300);
}

// ============================================================================
// Canvas Utilities
// ============================================================================

/** Get device pixel ratio for sharp rendering */
export function getDevicePixelRatio(): number {
  return window.devicePixelRatio || 1;
}

/** Setup canvas for high DPI displays */
export function setupHighDPICanvas(
  canvas: HTMLCanvasElement,
  width: number,
  height: number
): CanvasRenderingContext2D | null {
  const dpr = getDevicePixelRatio();
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;

  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.scale(dpr, dpr);
  }
  return ctx;
}

// ============================================================================
// Difficulty Helpers
// ============================================================================

/** Get human-readable difficulty name */
export function getDifficultyName(difficulty: Difficulty): string {
  const names: Record<Difficulty, string> = {
    easy: 'Easy',
    medium: 'Medium',
    hard: 'Hard',
  };
  return names[difficulty];
}

/** Get difficulty color */
export function getDifficultyColor(difficulty: Difficulty): string {
  const colors: Record<Difficulty, string> = {
    easy: '#44ff44',
    medium: '#ffaa00',
    hard: '#ff4444',
  };
  return colors[difficulty];
}

// ============================================================================
// Performance Utilities
// ============================================================================

/** Throttle function calls */
export function throttle<T extends (...args: unknown[]) => void>(
  func: T,
  limit: number
): T {
  let inThrottle = false;
  return function (this: unknown, ...args: Parameters<T>) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  } as T;
}

/** Debounce function calls */
export function debounce<T extends (...args: unknown[]) => void>(
  func: T,
  wait: number
): T {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  return function (this: unknown, ...args: Parameters<T>) {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  } as T;
}
