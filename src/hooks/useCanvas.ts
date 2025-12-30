/**
 * Canvas Hook
 * Manages canvas context and setup
 */

import { useRef, useEffect, useCallback, useState } from 'react';
import { setupHighDPICanvas, getDevicePixelRatio } from '../utils/helpers.ts';

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

/**
 * Hook for handling canvas resize with responsive sizing
 */
export function useResponsiveCanvas(
  baseWidth: number,
  baseHeight: number,
  maxScale: number = 1.5,
  minScale: number = 0.5
) {
  const [dimensions, setDimensions] = useState({
    width: baseWidth,
    height: baseHeight,
    scale: 1,
  });

  useEffect(() => {
    const calculateDimensions = () => {
      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;

      // Calculate scale to fit in window with padding
      const padding = 40;
      const availableWidth = windowWidth - padding * 2;
      const availableHeight = windowHeight - padding * 2 - 100; // Extra space for HUD

      const scaleX = availableWidth / baseWidth;
      const scaleY = availableHeight / baseHeight;
      const scale = Math.min(scaleX, scaleY, maxScale);
      const clampedScale = Math.max(scale, minScale);

      setDimensions({
        width: Math.floor(baseWidth * clampedScale),
        height: Math.floor(baseHeight * clampedScale),
        scale: clampedScale,
      });
    };

    calculateDimensions();
    window.addEventListener('resize', calculateDimensions);

    return () => window.removeEventListener('resize', calculateDimensions);
  }, [baseWidth, baseHeight, maxScale, minScale]);

  return dimensions;
}

/**
 * Hook for canvas mouse position tracking
 */
export function useCanvasMousePosition(canvasRef: React.RefObject<HTMLCanvasElement | null>) {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleMouseMove = (event: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const dpr = getDevicePixelRatio();
      const scaleX = canvas.width / dpr / rect.width;
      const scaleY = canvas.height / dpr / rect.height;

      setPosition({
        x: (event.clientX - rect.left) * scaleX,
        y: (event.clientY - rect.top) * scaleY,
      });
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    return () => canvas.removeEventListener('mousemove', handleMouseMove);
  }, [canvasRef]);

  return position;
}

export default useCanvas;
