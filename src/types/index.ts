/**
 * Core type definitions for Pac-Man 3D
 */

/** Keyboard input state */
export interface KeyboardState {
  up: boolean;
  down: boolean;
  left: boolean;
  right: boolean;
  space: boolean;
  escape: boolean;
  enter: boolean;
}

/** Key bindings configuration */
export interface KeyBindings {
  up: string[];
  down: string[];
  left: string[];
  right: string[];
  pause: string[];
  confirm: string[];
}
