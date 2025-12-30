/**
 * Main Menu Component
 * Start screen with difficulty selection
 */

import { useState } from 'react';
import type { Difficulty } from '../../types/index.ts';
import { Button } from '../UI/Button.tsx';
import { getDifficultyName, getDifficultyColor } from '../../utils/helpers.ts';
import { DIFFICULTY_CONFIG } from '../../constants/index.ts';

interface MainMenuProps {
  onStartGame: (difficulty: Difficulty) => void;
  highScore: number;
}

/**
 * Main menu screen
 */
export function MainMenu({ onStartGame, highScore }: MainMenuProps) {
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>('medium');
  const [showInstructions, setShowInstructions] = useState(false);

  const difficulties: Difficulty[] = ['easy', 'medium', 'hard'];
  const config = DIFFICULTY_CONFIG[selectedDifficulty];

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    padding: '20px',
    background: 'linear-gradient(180deg, #0a1628 0%, #1a3a5c 50%, #0a1628 100%)',
    color: '#ffffff',
    fontFamily: 'Arial, sans-serif',
  };

  const titleStyle: React.CSSProperties = {
    fontSize: '64px',
    fontWeight: 'bold',
    marginBottom: '10px',
    textShadow: '0 0 20px rgba(255, 215, 0, 0.5), 0 0 40px rgba(255, 215, 0, 0.3)',
    background: 'linear-gradient(180deg, #ffd700 0%, #ffaa00 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  };

  const subtitleStyle: React.CSSProperties = {
    fontSize: '24px',
    marginBottom: '40px',
    opacity: 0.8,
  };

  const menuBoxStyle: React.CSSProperties = {
    background: 'rgba(0, 0, 0, 0.5)',
    borderRadius: '16px',
    padding: '30px',
    minWidth: '350px',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
  };

  const difficultyButtonStyle = (diff: Difficulty): React.CSSProperties => ({
    padding: '12px 24px',
    margin: '5px',
    border: selectedDifficulty === diff ? '2px solid #ffd700' : '2px solid transparent',
    borderRadius: '8px',
    background: selectedDifficulty === diff
      ? 'rgba(255, 215, 0, 0.2)'
      : 'rgba(255, 255, 255, 0.1)',
    color: getDifficultyColor(diff),
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    fontSize: '16px',
    fontWeight: 'bold',
  });

  const statsStyle: React.CSSProperties = {
    marginTop: '15px',
    padding: '15px',
    background: 'rgba(0, 0, 0, 0.3)',
    borderRadius: '8px',
    fontSize: '14px',
  };

  if (showInstructions) {
    return (
      <div style={containerStyle}>
        <div style={menuBoxStyle}>
          <h2 style={{ marginBottom: '20px', textAlign: 'center' }}>How to Play</h2>

          <div style={{ marginBottom: '20px', lineHeight: '1.8' }}>
            <h3 style={{ color: '#ffd700', marginBottom: '10px' }}>Objective</h3>
            <p>Catch all the fish before time runs out! You're blindfolded, so your vision is limited.</p>

            <h3 style={{ color: '#ffd700', marginTop: '20px', marginBottom: '10px' }}>Controls</h3>
            <ul style={{ paddingLeft: '20px' }}>
              <li><strong>WASD / Arrow Keys</strong> - Move</li>
              <li><strong>Space</strong> - Call "Marco!" (reveals nearby fish)</li>
              <li><strong>Escape / P</strong> - Pause</li>
            </ul>

            <h3 style={{ color: '#ffd700', marginTop: '20px', marginBottom: '10px' }}>Tips</h3>
            <ul style={{ paddingLeft: '20px' }}>
              <li>Use Marco calls wisely - they're limited!</li>
              <li>Fish respond "Polo!" and are briefly revealed</li>
              <li>Catch fish quickly for combo bonuses</li>
              <li>Avoid walls to keep your score high</li>
            </ul>
          </div>

          <Button fullWidth onClick={() => setShowInstructions(false)}>
            Back to Menu
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      {/* Animated water background elements */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
      }}>
        {/* Animated bubbles */}
        {[...Array(10)].map((_, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              width: `${10 + Math.random() * 20}px`,
              height: `${10 + Math.random() * 20}px`,
              background: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '50%',
              left: `${Math.random() * 100}%`,
              bottom: '-20px',
              animation: `rise ${5 + Math.random() * 10}s linear infinite`,
              animationDelay: `${Math.random() * 5}s`,
            }}
          />
        ))}
      </div>

      <h1 style={titleStyle}>MARCO POLO</h1>
      <p style={subtitleStyle}>The Classic Pool Game</p>

      <div style={menuBoxStyle}>
        {/* High Score Display */}
        {highScore > 0 && (
          <div style={{
            textAlign: 'center',
            marginBottom: '20px',
            padding: '10px',
            background: 'rgba(255, 215, 0, 0.1)',
            borderRadius: '8px',
          }}>
            <span style={{ opacity: 0.7 }}>High Score: </span>
            <span style={{ color: '#ffd700', fontSize: '24px', fontWeight: 'bold' }}>
              {highScore.toLocaleString()}
            </span>
          </div>
        )}

        {/* Difficulty Selection */}
        <div style={{ marginBottom: '20px' }}>
          <p style={{ marginBottom: '10px', textAlign: 'center', opacity: 0.7 }}>
            Select Difficulty
          </p>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            {difficulties.map((diff) => (
              <button
                key={diff}
                style={difficultyButtonStyle(diff)}
                onClick={() => setSelectedDifficulty(diff)}
              >
                {getDifficultyName(diff)}
              </button>
            ))}
          </div>

          {/* Difficulty Stats */}
          <div style={statsStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
              <span style={{ opacity: 0.7 }}>Time:</span>
              <span>{config.gameDuration} seconds</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
              <span style={{ opacity: 0.7 }}>Fish:</span>
              <span>{config.fishCount}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
              <span style={{ opacity: 0.7 }}>Marco Calls:</span>
              <span>{config.maxMarcoCalls}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ opacity: 0.7 }}>Vision:</span>
              <span>{config.visionRadius}px</span>
            </div>
          </div>
        </div>

        {/* Start Button */}
        <Button
          fullWidth
          size="large"
          onClick={() => onStartGame(selectedDifficulty)}
          style={{ marginBottom: '15px' }}
        >
          Start Game
        </Button>

        {/* Instructions Button */}
        <Button
          fullWidth
          variant="secondary"
          onClick={() => setShowInstructions(true)}
        >
          How to Play
        </Button>
      </div>

      {/* Footer */}
      <p style={{
        marginTop: '30px',
        opacity: 0.5,
        fontSize: '14px',
      }}>
        Use WASD or Arrow Keys to move. Press Space to call Marco!
      </p>

      {/* CSS for bubble animation */}
      <style>{`
        @keyframes rise {
          0% {
            transform: translateY(0) scale(1);
            opacity: 0.3;
          }
          50% {
            opacity: 0.5;
          }
          100% {
            transform: translateY(-100vh) scale(0.5);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}

export default MainMenu;
