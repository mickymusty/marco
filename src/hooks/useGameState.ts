/**
 * Game State Hook
 * Manages overall game state and screen transitions
 */

import { useState, useCallback, useRef } from 'react';
import type { GameScreen, Difficulty, GameEvent } from '../types/index.ts';
import type { EngineState } from '../engine/GameEngine.ts';
import {
  createEngineState,
  updateEngine,
  setPaused,
  renderEngine,
  getGameStats,
} from '../engine/GameEngine.ts';
import { getHighScore, saveHighScore, saveHighScoreEntry, resumeAudio } from '../utils/helpers.ts';

/**
 * Main game state interface
 */
export interface UseGameStateReturn {
  // Screen state
  screen: GameScreen;
  setScreen: (screen: GameScreen) => void;

  // Game engine
  engineState: EngineState | null;
  gameStats: ReturnType<typeof getGameStats> | null;

  // Game actions
  startGame: (difficulty: Difficulty) => void;
  restartGame: () => void;
  pauseGame: () => void;
  resumeGame: () => void;
  togglePauseGame: () => void;
  returnToMenu: () => void;

  // Game update (called each frame)
  updateGame: (keys: import('../types/index.ts').KeyboardState, timestamp: number) => void;
  renderGame: (ctx: CanvasRenderingContext2D, timestamp: number) => void;

  // High score
  highScore: number;

  // Current difficulty
  currentDifficulty: Difficulty;

  // Event handling
  onGameEvent: (event: GameEvent) => void;
}

/**
 * Hook for managing game state
 */
export function useGameState(): UseGameStateReturn {
  const [screen, setScreen] = useState<GameScreen>('menu');
  const [highScore, setHighScore] = useState<number>(() => getHighScore());
  const [currentDifficulty, setCurrentDifficulty] = useState<Difficulty>('medium');

  const engineStateRef = useRef<EngineState | null>(null);
  const [engineState, setEngineState] = useState<EngineState | null>(null);
  const [gameStats, setGameStats] = useState<ReturnType<typeof getGameStats> | null>(null);

  /**
   * Handle game events
   */
  const onGameEvent = useCallback((event: GameEvent) => {
    switch (event.type) {
      case 'GAME_OVER':
        if (engineStateRef.current) {
          const finalScore = engineStateRef.current.gameState.score;

          // Update high score
          if (finalScore > highScore) {
            setHighScore(finalScore);
            saveHighScore(finalScore);
          }

          // Save score entry
          saveHighScoreEntry({
            score: finalScore,
            fishCaught: engineStateRef.current.gameState.fishCaught,
            difficulty: engineStateRef.current.gameState.difficulty,
            date: Date.now(),
          });
        }
        break;

      case 'SCORE_UPDATED':
        // Could add score popup effects here
        break;

      case 'FISH_CAUGHT':
        // Could add UI feedback here
        break;

      default:
        break;
    }
  }, [highScore]);

  /**
   * Start a new game
   */
  const startGame = useCallback((difficulty: Difficulty) => {
    resumeAudio();
    setCurrentDifficulty(difficulty);
    const newState = createEngineState(difficulty);
    newState.gameState.highScore = highScore;
    engineStateRef.current = newState;
    setEngineState(newState);
    setGameStats(getGameStats(newState));
    setScreen('playing');
  }, [highScore]);

  /**
   * Restart the current game
   */
  const restartGame = useCallback(() => {
    resumeAudio();
    const newState = createEngineState(currentDifficulty);
    newState.gameState.highScore = highScore;
    engineStateRef.current = newState;
    setEngineState(newState);
    setGameStats(getGameStats(newState));
    setScreen('playing');
  }, [currentDifficulty, highScore]);

  /**
   * Pause the game
   */
  const pauseGame = useCallback(() => {
    if (engineStateRef.current && screen === 'playing') {
      engineStateRef.current = setPaused(engineStateRef.current, true);
      setEngineState(engineStateRef.current);
      setScreen('paused');
    }
  }, [screen]);

  /**
   * Resume the game
   */
  const resumeGame = useCallback(() => {
    if (engineStateRef.current && screen === 'paused') {
      engineStateRef.current = setPaused(engineStateRef.current, false);
      setEngineState(engineStateRef.current);
      setScreen('playing');
    }
  }, [screen]);

  /**
   * Toggle pause state
   */
  const togglePauseGame = useCallback(() => {
    if (screen === 'playing') {
      pauseGame();
    } else if (screen === 'paused') {
      resumeGame();
    }
  }, [screen, pauseGame, resumeGame]);

  /**
   * Return to main menu
   */
  const returnToMenu = useCallback(() => {
    engineStateRef.current = null;
    setEngineState(null);
    setGameStats(null);
    setScreen('menu');
  }, []);

  /**
   * Update game state (called each frame)
   */
  const updateGame = useCallback((keys: import('../types/index.ts').KeyboardState, timestamp: number) => {
    if (!engineStateRef.current || screen !== 'playing') return;

    // Handle pause key
    if (keys.escape) {
      pauseGame();
      return;
    }

    const newState = updateEngine(engineStateRef.current, keys, timestamp, onGameEvent);
    engineStateRef.current = newState;

    // Check for game over
    if (newState.gameState.screen === 'gameOver') {
      setScreen('gameOver');
    }

    // Update React state for UI
    setEngineState(newState);
    setGameStats(getGameStats(newState));
  }, [screen, pauseGame, onGameEvent]);

  /**
   * Render game to canvas
   */
  const renderGame = useCallback((ctx: CanvasRenderingContext2D, timestamp: number) => {
    if (!engineStateRef.current) return;
    renderEngine(ctx, engineStateRef.current, timestamp);
  }, []);

  return {
    screen,
    setScreen,
    engineState,
    gameStats,
    startGame,
    restartGame,
    pauseGame,
    resumeGame,
    togglePauseGame,
    returnToMenu,
    updateGame,
    renderGame,
    highScore,
    currentDifficulty,
    onGameEvent,
  };
}

export default useGameState;
