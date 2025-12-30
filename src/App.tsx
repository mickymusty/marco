/**
 * Marco Polo - Main App Component
 *
 * A web-based Marco Polo game where you play as a blindfolded seeker
 * trying to catch fish by listening for their "Polo!" responses.
 *
 * Controls:
 * - WASD / Arrow Keys: Move
 * - Space: Call "Marco!" (reveals nearby fish briefly)
 * - Escape / P: Pause
 */

import { useEffect } from 'react';
import { MainMenu } from './components/Menu/MainMenu.tsx';
import { GameOver } from './components/Menu/GameOver.tsx';
import { GameCanvas } from './components/Game/GameCanvas.tsx';
import { GameHUD, GameHUDBottom } from './components/Game/GameHUD.tsx';
import { PauseOverlay } from './components/Game/PauseOverlay.tsx';
import { useGameState } from './hooks/useGameState.ts';
import { useKeyPress } from './hooks/useKeyboard.ts';
import { resumeAudio } from './utils/helpers.ts';

/**
 * Main App Component
 */
function App() {
  const {
    screen,
    gameStats,
    startGame,
    restartGame,
    pauseGame,
    resumeGame,
    returnToMenu,
    updateGame,
    renderGame,
    highScore,
    engineState,
  } = useGameState();

  // Handle keyboard shortcuts for pause/resume
  useKeyPress('Escape', () => {
    if (screen === 'paused') {
      resumeGame();
    }
  }, screen === 'paused');

  useKeyPress('KeyP', () => {
    if (screen === 'paused') {
      resumeGame();
    }
  }, screen === 'paused');

  // Handle Enter/Space to restart from game over
  useKeyPress('Enter', () => {
    if (screen === 'gameOver') {
      restartGame();
    }
  }, screen === 'gameOver');

  useKeyPress('Space', () => {
    if (screen === 'gameOver') {
      restartGame();
    }
  }, screen === 'gameOver');

  // Resume audio on any user interaction
  useEffect(() => {
    const handleInteraction = () => {
      resumeAudio();
    };

    window.addEventListener('click', handleInteraction, { once: true });
    window.addEventListener('keydown', handleInteraction, { once: true });

    return () => {
      window.removeEventListener('click', handleInteraction);
      window.removeEventListener('keydown', handleInteraction);
    };
  }, []);

  // Container styles
  const containerStyle: React.CSSProperties = {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(180deg, #0a1628 0%, #1a3a5c 50%, #0a1628 100%)',
    overflow: 'hidden',
  };

  const gameContainerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '10px',
  };

  // Render based on current screen
  switch (screen) {
    case 'menu':
      return <MainMenu onStartGame={startGame} highScore={highScore} />;

    case 'playing':
    case 'paused':
      return (
        <div style={containerStyle}>
          <div style={gameContainerStyle}>
            {/* HUD - Top */}
            {gameStats && (
              <GameHUD
                score={gameStats.score}
                timeRemaining={gameStats.timeRemaining}
                fishCaught={gameStats.fishCaught}
                totalFish={gameStats.totalFish}
                marcoCallsRemaining={gameStats.marcoCallsRemaining}
                maxMarcoCalls={gameStats.maxMarcoCalls}
                canCallMarco={gameStats.canCallMarco}
                cooldownProgress={gameStats.cooldownProgress}
                comboCount={gameStats.comboCount}
              />
            )}

            {/* Game Canvas */}
            <GameCanvas
              isPlaying={screen === 'playing'}
              onUpdate={updateGame}
              onRender={renderGame}
              onPause={pauseGame}
            />

            {/* HUD - Bottom */}
            <GameHUDBottom />
          </div>

          {/* Pause Overlay */}
          {screen === 'paused' && (
            <PauseOverlay
              onResume={resumeGame}
              onRestart={restartGame}
              onMainMenu={returnToMenu}
            />
          )}
        </div>
      );

    case 'gameOver':
      return (
        <div style={containerStyle}>
          <div style={gameContainerStyle}>
            {/* Keep canvas visible in background */}
            {gameStats && (
              <GameHUD
                score={gameStats.score}
                timeRemaining={gameStats.timeRemaining}
                fishCaught={gameStats.fishCaught}
                totalFish={gameStats.totalFish}
                marcoCallsRemaining={gameStats.marcoCallsRemaining}
                maxMarcoCalls={gameStats.maxMarcoCalls}
                canCallMarco={false}
                cooldownProgress={0}
                comboCount={0}
              />
            )}

            <GameCanvas
              isPlaying={false}
              onUpdate={updateGame}
              onRender={renderGame}
            />
          </div>

          {/* Game Over Screen */}
          {gameStats && engineState && (
            <GameOver
              score={gameStats.score}
              highScore={highScore}
              fishCaught={gameStats.fishCaught}
              totalFish={gameStats.totalFish}
              timeRemaining={gameStats.timeRemaining}
              difficulty={gameStats.difficulty}
              onRestart={restartGame}
              onMainMenu={returnToMenu}
            />
          )}
        </div>
      );

    default:
      return <MainMenu onStartGame={startGame} highScore={highScore} />;
  }
}

export default App;
