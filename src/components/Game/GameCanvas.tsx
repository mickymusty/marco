/**
 * Game Canvas Component
 * Main game rendering and loop component
 */

import { useCallback, useRef } from 'react';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../../constants/index.ts';
import { useCanvas } from '../../hooks/useCanvas.ts';
import { useGameLoop } from '../../hooks/useGameLoop.ts';
import { useKeyboard } from '../../hooks/useKeyboard.ts';
import type { KeyboardState } from '../../types/index.ts';

interface GameCanvasProps {
  /** Whether the game is currently running */
  isPlaying: boolean;
  /** Called each frame with keyboard state and timestamp */
  onUpdate: (keys: KeyboardState, timestamp: number) => void;
  /** Called each frame to render the game */
  onRender: (ctx: CanvasRenderingContext2D, timestamp: number) => void;
  /** Called when pause is triggered via keyboard */
  onPause?: () => void;
}

/**
 * Canvas component that handles the game loop
 */
export function GameCanvas({
  isPlaying,
  onUpdate,
  onRender,
  onPause,
}: GameCanvasProps) {
  const { canvasRef, ctxRef, isReady } = useCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
  const { keysRef } = useKeyboard(isPlaying);

  // Track if escape was just pressed to avoid repeat
  const escapeHandled = useRef(false);

  /**
   * Game loop callback
   */
  const gameLoop = useCallback(
    (timestamp: number) => {
      const ctx = ctxRef.current;
      if (!ctx || !isReady) return;

      // Handle pause key (escape)
      if (keysRef.current.escape && !escapeHandled.current) {
        escapeHandled.current = true;
        onPause?.();
        return;
      }

      if (!keysRef.current.escape) {
        escapeHandled.current = false;
      }

      // Update game state
      onUpdate(keysRef.current, timestamp);

      // Render game
      onRender(ctx, timestamp);
    },
    [ctxRef, isReady, keysRef, onUpdate, onRender, onPause]
  );

  // Run game loop when playing
  useGameLoop(gameLoop, isPlaying && isReady);

  // Canvas container styles
  const containerStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  };

  const canvasStyle: React.CSSProperties = {
    border: '2px solid rgba(255, 255, 255, 0.2)',
    borderRadius: '8px',
    boxShadow: '0 0 30px rgba(0, 100, 200, 0.3)',
  };

  return (
    <div style={containerStyle}>
      <canvas
        ref={canvasRef}
        style={canvasStyle}
        tabIndex={0}
        aria-label="Marco Polo Game Canvas"
      />
    </div>
  );
}

export default GameCanvas;
