/**
 * Keyboard Input Hook
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import type { KeyboardState } from '../types/index.ts';
import { DEFAULT_KEY_BINDINGS } from '../constants/index.ts';

const initialKeyboardState: KeyboardState = {
  up: false,
  down: false,
  left: false,
  right: false,
  space: false,
  escape: false,
  enter: false,
};

export function useKeyboard(enabled: boolean = true) {
  const [keys, setKeys] = useState<KeyboardState>(initialKeyboardState);
  const keysRef = useRef<KeyboardState>(initialKeyboardState);
  const pressedKeys = useRef<Set<string>>(new Set());

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

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return;
      const action = getKeyAction(event.code);
      if (action) {
        event.preventDefault();
        if (!pressedKeys.current.has(event.code)) {
          pressedKeys.current.add(event.code);
          const newState = { ...keysRef.current, [action]: true };
          keysRef.current = newState;
          setKeys(newState);
        }
      }
    },
    [enabled, getKeyAction]
  );

  const handleKeyUp = useCallback(
    (event: KeyboardEvent) => {
      const action = getKeyAction(event.code);
      if (action) {
        pressedKeys.current.delete(event.code);
        const newState = { ...keysRef.current, [action]: false };
        keysRef.current = newState;
        setKeys(newState);
      }
    },
    [getKeyAction]
  );

  const handleBlur = useCallback(() => {
    pressedKeys.current.clear();
    keysRef.current = initialKeyboardState;
    setKeys(initialKeyboardState);
  }, []);

  const resetKeys = useCallback(() => {
    pressedKeys.current.clear();
    keysRef.current = initialKeyboardState;
    setKeys(initialKeyboardState);
  }, []);

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

  return { keys, resetKeys, keysRef };
}

export default useKeyboard;
