/**
 * Keyboard Input Hook
 * Handles keyboard state for game controls
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import type { KeyboardState } from '../types/index.ts';
import { DEFAULT_KEY_BINDINGS } from '../constants/index.ts';

/**
 * Initial keyboard state
 */
const initialKeyboardState: KeyboardState = {
  up: false,
  down: false,
  left: false,
  right: false,
  space: false,
  escape: false,
  enter: false,
};

/**
 * Hook for handling keyboard input
 * @param enabled - Whether keyboard input should be processed
 */
export function useKeyboard(enabled: boolean = true) {
  const [keys, setKeys] = useState<KeyboardState>(initialKeyboardState);
  const keysRef = useRef<KeyboardState>(initialKeyboardState);

  // Track which keys are currently pressed (by code)
  const pressedKeys = useRef<Set<string>>(new Set());

  /**
   * Map key code to keyboard state property
   */
  const getKeyAction = useCallback((code: string): keyof KeyboardState | null => {
    if (DEFAULT_KEY_BINDINGS.up.includes(code)) return 'up';
    if (DEFAULT_KEY_BINDINGS.down.includes(code)) return 'down';
    if (DEFAULT_KEY_BINDINGS.left.includes(code)) return 'left';
    if (DEFAULT_KEY_BINDINGS.right.includes(code)) return 'right';
    if (DEFAULT_KEY_BINDINGS.marco.includes(code)) return 'space';
    if (DEFAULT_KEY_BINDINGS.pause.includes(code)) return 'escape';
    if (DEFAULT_KEY_BINDINGS.confirm.includes(code)) return 'enter';
    return null;
  }, []);

  /**
   * Handle key down event
   */
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return;

      // Prevent default for game keys to avoid scrolling, etc.
      const action = getKeyAction(event.code);
      if (action) {
        event.preventDefault();

        // Only update if key wasn't already pressed (avoid key repeat)
        if (!pressedKeys.current.has(event.code)) {
          pressedKeys.current.add(event.code);

          const newState = {
            ...keysRef.current,
            [action]: true,
          };
          keysRef.current = newState;
          setKeys(newState);
        }
      }
    },
    [enabled, getKeyAction]
  );

  /**
   * Handle key up event
   */
  const handleKeyUp = useCallback(
    (event: KeyboardEvent) => {
      const action = getKeyAction(event.code);
      if (action) {
        pressedKeys.current.delete(event.code);

        const newState = {
          ...keysRef.current,
          [action]: false,
        };
        keysRef.current = newState;
        setKeys(newState);
      }
    },
    [getKeyAction]
  );

  /**
   * Handle window blur - reset all keys
   */
  const handleBlur = useCallback(() => {
    pressedKeys.current.clear();
    keysRef.current = initialKeyboardState;
    setKeys(initialKeyboardState);
  }, []);

  /**
   * Reset all keys to unpressed state
   */
  const resetKeys = useCallback(() => {
    pressedKeys.current.clear();
    keysRef.current = initialKeyboardState;
    setKeys(initialKeyboardState);
  }, []);

  /**
   * Set up event listeners
   */
  useEffect(() => {
    if (!enabled) {
      resetKeys();
      return;
    }

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', handleBlur);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', handleBlur);
    };
  }, [enabled, handleKeyDown, handleKeyUp, handleBlur, resetKeys]);

  return {
    keys,
    resetKeys,
    keysRef,
  };
}

/**
 * Hook for single key press detection (for menus)
 */
export function useKeyPress(targetKey: string, callback: () => void, enabled: boolean = true) {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code === targetKey || event.key === targetKey) {
        event.preventDefault();
        callback();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [targetKey, callback, enabled]);
}

/**
 * Hook for detecting any key press (for "press any key" screens)
 */
export function useAnyKeyPress(callback: () => void, enabled: boolean = true) {
  const hasPressed = useRef(false);

  useEffect(() => {
    if (!enabled) {
      hasPressed.current = false;
      return;
    }

    const handleKeyDown = () => {
      if (!hasPressed.current) {
        hasPressed.current = true;
        callback();
      }
    };

    const handleClick = () => {
      if (!hasPressed.current) {
        hasPressed.current = true;
        callback();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('click', handleClick);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('click', handleClick);
    };
  }, [callback, enabled]);
}

export default useKeyboard;
