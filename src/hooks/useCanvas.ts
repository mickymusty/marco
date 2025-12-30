/**
 * Canvas Hook
 * Manages canvas context and setup
 */

import { useRef, useEffect, useCallback, useState } from 'react';
import { setupHighDPICanvas } from '../utils/helpers.ts';

/**
 * Hook for managing a canvas element
 * @param width - Canvas width in CSS pixels
 * @param height - Canvas height in CSS pixels
 */
export function useCanvas(width: number, height: number) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const [isReady, setIsReady] = useState(false);

  /**
   * Initialize canvas context
   */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = setupHighDPICanvas(canvas, width, height);
    if (ctx) {
      ctxRef.current = ctx;
      setIsReady(true);
    }
  }, [width, height]);

  /**
   * Get the canvas context
   */
  const getContext = useCallback(() => {
    return ctxRef.current;
  }, []);

  /**
   * Clear the canvas
   */
  const clear = useCallback(() => {
    const ctx = ctxRef.current;
    if (ctx) {
      ctx.clearRect(0, 0, width, height);
    }
  }, [width, height]);

  /**
   * Get canvas element
   */
  const getCanvas = useCallback(() => {
    return canvasRef.current;
  }, []);

  return {
    canvasRef,
    ctxRef,
    isReady,
    getContext,
    clear,
    getCanvas,
  };
}

export default useCanvas;
