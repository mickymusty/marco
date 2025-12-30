/**
 * Game Loop Hook
 * Manages the requestAnimationFrame game loop
 */

import { useRef, useEffect, useCallback } from 'react';

/**
 * Game loop callback type
 */
type GameLoopCallback = (timestamp: number, deltaTime: number) => void;

/**
 * Hook for running a game loop using requestAnimationFrame
 * @param callback - Function to call each frame
 * @param running - Whether the loop should be running
 */
export function useGameLoop(callback: GameLoopCallback, running: boolean = true) {
  const requestRef = useRef<number | null>(null);
  const previousTimeRef = useRef<number | null>(null);
  const callbackRef = useRef<GameLoopCallback>(callback);

  // Update callback ref when callback changes
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  /**
   * Animation frame handler
   */
  const animate = useCallback((timestamp: number) => {
    if (previousTimeRef.current === null) {
      previousTimeRef.current = timestamp;
    }

    const deltaTime = timestamp - previousTimeRef.current;
    previousTimeRef.current = timestamp;

    // Call the game update function
    callbackRef.current(timestamp, deltaTime);

    // Schedule next frame
    requestRef.current = requestAnimationFrame(animate);
  }, []);

  /**
   * Start/stop loop based on running state
   */
  useEffect(() => {
    if (running) {
      previousTimeRef.current = null;
      requestRef.current = requestAnimationFrame(animate);
    } else {
      if (requestRef.current !== null) {
        cancelAnimationFrame(requestRef.current);
        requestRef.current = null;
      }
    }

    return () => {
      if (requestRef.current !== null) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [running, animate]);

  /**
   * Get current FPS (for debugging)
   */
  const getFPS = useCallback(() => {
    // This is a simple approximation
    return previousTimeRef.current ? Math.round(1000 / 16.67) : 0;
  }, []);

  return { getFPS };
}

export default useGameLoop;
